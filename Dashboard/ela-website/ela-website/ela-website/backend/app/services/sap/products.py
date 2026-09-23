from typing import Any, Dict, List, Optional


def _price_from_sap(raw: Dict[str, Any], price_list: str) -> tuple[float, Optional[float]]:
    prices = raw.get("ItemPrices") or []
    if not isinstance(prices, list):
        return 0.0, None

    selected = prices
    if price_list:
        selected = [p for p in prices if str(p.get("PriceList")) == price_list]

    if not selected:
        return 0.0, None

    price_data = selected[0]
    if not isinstance(price_data, dict):
        return 0.0, None

    price = float(price_data.get("Price", 0) or 0)
    original_price = price_data.get("PriceAfterVAT")
    return price, float(original_price) if original_price is not None else None


def _get_stock_from_raw(raw: Dict[str, Any], warehouse_code: str) -> Optional[int]:
    """
    Extract live InStock from ItemWarehouseInfoCollection for the configured warehouse.

    SAP InStock can legally be 0.  Do NOT use falsy-or-fallback (`x or y`) because
    that silently converts 0 to None.  Use explicit ``is None`` checks only.
    """
    warehouse_info = raw.get("ItemWarehouseInfoCollection") or []
    if not isinstance(warehouse_info, list) or not warehouse_code:
        return None

    for wh in warehouse_info:
        if isinstance(wh, dict) and wh.get("WarehouseCode") == warehouse_code:
            in_stock = wh.get("InStock")
            if in_stock is None:
                in_stock = wh.get("Quantity")  # fallback field on some SAP versions
            if in_stock is not None:
                return int(float(in_stock))
    return None


def _get_image_count_from_raw(raw: Dict[str, Any], client: Any) -> int:
    """
    Return the total number of images for this SAP item.

    Uses a client helper that accepts the already-fetched raw dict so we avoid
    a second Items() round-trip for each product during list_products().
    """
    if not client:
        return 0
    return client.get_item_images_count_from_raw(raw)


# ---------------------------------------------------------------------------
# Category normalization
# ---------------------------------------------------------------------------
# Maps keywords found in SAP GroupName / U_SUBG / U_Category to the frontend
# category filter IDs used in Shop.tsx:
#   { id: "bras" }  { id: "panties" }  { id: "camisoles" }  { id: "sports" }
#
# Matching is keyword-based (substring, case-insensitive) so it works for any
# SAP group name that contains those words — no hardcoded ItemCode mappings.
# ---------------------------------------------------------------------------
_CATEGORY_KEYWORDS: List[tuple] = [
    # (frontend_id, keywords_that_must_appear_in_sap_value)
    ("sports",    ["sport"]),
    ("bras",      ["bra"]),
    ("panties",   ["pant", "brief", "boy short", "midrise", "mid-rise"]),
    ("camisoles", ["camisole", "cami"]),
]


def _normalize_category(sap_value: str) -> str:
    """
    Map a raw SAP category string (GroupName / U_SUBG / U_Category) to the
    frontend filter ID.  Returns the lowercased SAP value unchanged if no
    keyword matches, so new SAP groups still appear under 'All' without
    breaking the filter.
    """
    if not sap_value:
        return "uncategorized"
    lower = sap_value.strip().lower()
    for frontend_id, keywords in _CATEGORY_KEYWORDS:
        if any(kw in lower for kw in keywords):
            return frontend_id
    return lower


class SAPProductMapper:
    @staticmethod
    def map_product(
        raw: Dict[str, Any],
        price_list: str = "",
        warehouse_code: str = "",
        client: Any = None,
        group_map: Optional[Dict[int, str]] = None,
    ) -> Dict[str, Any]:
        price, original_price = _price_from_sap(raw, price_list)

        # --- Live SAP stock (0 is a valid value) ----------------------------------
        stock = _get_stock_from_raw(raw, warehouse_code)

        # --- Sizes / colours ------------------------------------------------------
        sizes: List[str] = []
        if raw.get("U_Size"):
            seen: set = set()
            for s in str(raw["U_Size"]).split(","):
                s = s.strip()
                if s and s not in seen:
                    sizes.append(s)
                    seen.add(s)

        colors: List[str] = []
        if raw.get("U_Colour"):
            seen_c: set = set()
            for c in str(raw["U_Colour"]).split(","):
                c = c.strip()
                if c and c not in seen_c:
                    colors.append(c)
                    seen_c.add(c)

        item_code = str(
            raw.get("ItemCode") or raw.get("id") or raw.get("ItemName") or "unknown"
        )

        # --- Category: resolve via U_Category → U_SUBG → ItemsGroupCode ----------
        raw_category = (
            raw.get("U_Category")
            or raw.get("U_SUBG")
            or _group_name_from_map(raw.get("ItemsGroupCode"), group_map)
            or ""
        )
        category = _normalize_category(raw_category)

        # --- SAP image proxy URLs -------------------------------------------------
        image_count = _get_image_count_from_raw(raw, client)
        image_proxy_urls = [
            f"/api/v1/products/{item_code}/images/{i}" for i in range(image_count)
        ]
        primary_image = image_proxy_urls[0] if image_proxy_urls else None

        return {
            # --- Identity ---------------------------------------------------------
            "id": item_code,
            "item_code": raw.get("ItemCode"),
            "itemCode": raw.get("ItemCode"),   # camelCase alias consumed by frontend
            "barcode": raw.get("BarCode"),
            # --- Display ----------------------------------------------------------
            "name": raw.get("ItemName") or "Unknown product",
            "description": raw.get("ItemName") or "SAP product",
            "category": category,
            # --- Pricing ----------------------------------------------------------
            "price": float(price or 0),
            "original_price": (
                float(original_price) if original_price is not None else None
            ),
            # --- Variants ---------------------------------------------------------
            "sizes": sizes,
            "color": colors,    # singular alias used by frontend
            "colors": colors,   # plural for backwards compatibility
            # --- Images (SAP proxy) -----------------------------------------------
            "image": primary_image,
            "images": image_proxy_urls,
            # --- Live stock from SAP warehouse ------------------------------------
            "stock": stock,
            # --- Misc -------------------------------------------------------------
            "fabric": None,
            "care": None,
            "item_group_code": raw.get("ItemsGroupCode"),
        }

    @staticmethod
    def map_products(
        raw_items: List[Dict[str, Any]],
        price_list: str = "",
        warehouse_code: str = "",
        client: Any = None,
        group_map: Optional[Dict[int, str]] = None,
    ) -> List[Dict[str, Any]]:
        return [
            SAPProductMapper.map_product(item, price_list, warehouse_code, client, group_map)
            for item in raw_items
            if isinstance(item, dict)
        ]


def _group_name_from_map(group_code: Any, group_map: Optional[Dict[int, str]]) -> str:
    """Safely look up a group name from the pre-fetched ItemGroups map."""
    if not group_map or group_code is None:
        return ""
    try:
        return group_map.get(int(group_code)) or ""
    except (TypeError, ValueError):
        return ""
