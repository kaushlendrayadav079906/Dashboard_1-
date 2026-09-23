from typing import Any, Dict, List, Optional


def _price_from_sap(raw: Dict[str, Any], price_list: str) -> tuple[float, Optional[float]]:
    prices = raw.get("ItemPrices") or []
    if not isinstance(prices, list):
        return 0.0, None

    selected = prices
    if price_list:
        selected = [price for price in prices if str(price.get("PriceList")) == price_list]

    if not selected:
        return 0.0, None

    price_data = selected[0]
    if not isinstance(price_data, dict):
        return 0.0, None

    price = float(price_data.get("Price", 0) or 0)
    original_price = price_data.get("PriceAfterVAT")
    return price, float(original_price) if original_price is not None else None


class SAPProductMapper:
    @staticmethod
    def map_product(raw: Dict[str, Any], price_list: str = "", warehouse_code: str = "") -> Dict[str, Any]:
        price, original_price = _price_from_sap(raw, price_list)

        warehouse_info = raw.get("ItemWarehouseInfoCollection") or []
        stock = None
        if isinstance(warehouse_info, list) and warehouse_code:
            matching_warehouses = [
                warehouse for warehouse in warehouse_info
                if isinstance(warehouse, dict) and warehouse.get("WarehouseCode") == warehouse_code
            ]
            first_wh = matching_warehouses[0] if matching_warehouses else None
            if isinstance(first_wh, dict):
                stock = first_wh.get("InStock") or first_wh.get("Quantity")
                if stock is not None:
                    stock = int(stock)

        sizes = []
        if raw.get("U_Size"):
            sizes = [part.strip() for part in str(raw.get("U_Size")).split(",") if part.strip()]

        colors = []
        if raw.get("U_Colour"):
            colors = [part.strip() for part in str(raw.get("U_Colour")).split(",") if part.strip()]

        image = raw.get("Picture")
        if not isinstance(image, str) or not image.strip():
            image = None

        return {
            "id": str(raw.get("ItemCode") or raw.get("id") or raw.get("ItemName") or "unknown"),
            "name": raw.get("ItemName") or "Unknown product",
            "item_code": raw.get("ItemCode"),
            "barcode": raw.get("BarCode"),
            "price": float(price or 0),
            "original_price": float(original_price) if original_price is not None else None,
            "category": (raw.get("U_Category") or raw.get("U_SUBG") or "uncategorized").lower(),
            "sizes": sizes,
            "colors": colors,
            "image": image,
            "images": [image] if image else [],
            "description": raw.get("ItemName") or "SAP product",
            "fabric": None,
            "care": None,
            "stock": stock,
            "item_group_code": raw.get("ItemsGroupCode"),
        }

    @staticmethod
    def map_products(
        raw_items: List[Dict[str, Any]],
        price_list: str = "",
        warehouse_code: str = "",
    ) -> List[Dict[str, Any]]:
        return [
            SAPProductMapper.map_product(item, price_list, warehouse_code)
            for item in raw_items
            if isinstance(item, dict)
        ]
