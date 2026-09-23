import os
import time
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import httpx

from app.core.config import settings

_IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "gif", "bmp", "tif", "tiff"}


class SAPServiceError(RuntimeError):
    pass


class SAPClient:
    def __init__(self):
        self.base_url = settings.SAP_SERVICE_LAYER_URL.rstrip("/")
        self.company_db = settings.SAP_COMPANY_DB
        self.username = settings.SAP_USERNAME
        self.password = settings.SAP_PASSWORD
        self.session_id: Optional[str] = None
        self.session_expires_at: float = 0
        _ssl_verify_raw = os.getenv("SAP_SSL_VERIFY", "True")
        _ssl_verify = _ssl_verify_raw.strip().lower() not in ("false", "0", "no")
        self._http = httpx.Client(
            timeout=max(settings.SAP_HTTP_TIMEOUT / 1000, 1),
            verify=_ssl_verify,
        )
        # In-process caches — keyed by item_code
        # _meta_cache: item_code → {"has_picture": bool, "attachment_entry": int|None, "lines": [...]}
        self._meta_cache: Dict[str, Dict[str, Any]] = {}
        # _image_cache: (item_code, index) → (bytes, content_type)
        self._image_cache: Dict[tuple, tuple] = {}
        # _group_cache: group_number → group_name
        self._group_cache: Optional[Dict[int, str]] = None
        # _warehouse_cache: resolved warehouse code
        self._warehouse_cache: Optional[str] = None

    def _build_headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.session_id:
            headers["Cookie"] = f"B1SESSION={self.session_id}"
        return headers

    def _is_session_valid(self) -> bool:
        return bool(self.session_id) and time.time() < self.session_expires_at

    def login(self) -> str:
        if not self.base_url:
            raise SAPServiceError("SAP_SERVICE_LAYER_URL is not configured")
        if not self.company_db or not self.username or not self.password:
            raise SAPServiceError("SAP credentials are not fully configured")

        try:
            response = self._http.post(
                urljoin(self.base_url + "/", "Login"),
                json={"CompanyDB": self.company_db, "UserName": self.username, "Password": self.password},
                headers={"Content-Type": "application/json", "Accept": "application/json"},
            )
        except httpx.RequestError as exc:
            raise SAPServiceError("SAP Service Layer is unavailable") from exc

        if response.status_code == 401:
            raise SAPServiceError("SAP authentication failed")

        if response.status_code >= 400:
            raise SAPServiceError(f"SAP login failed with status {response.status_code}")

        cookie_header = response.headers.get("Set-Cookie") or response.headers.get("set-cookie") or ""
        if "B1SESSION=" in cookie_header:
            self.session_id = cookie_header.split("B1SESSION=", 1)[1].split(";", 1)[0]
        elif response.json() and isinstance(response.json(), dict):
            payload = response.json()
            self.session_id = payload.get("SessionId") or payload.get("B1SESSION") or payload.get("session_id")

        if not self.session_id:
            raise SAPServiceError("SAP login response did not include a session cookie")

        self.session_expires_at = time.time() + 60 * 45
        return self.session_id

    def ensure_session(self) -> None:
        if not self._is_session_valid():
            if self.session_id:
                self.session_id = None
            self.login()

    def _get(self, path: str, params: Optional[Dict] = None) -> httpx.Response:
        """Single-retry GET with automatic 401 re-login."""
        self.ensure_session()
        url = urljoin(self.base_url + "/", path)
        try:
            resp = self._http.get(url, params=params, headers=self._build_headers())
        except httpx.RequestError as exc:
            raise SAPServiceError("SAP Service Layer is unavailable") from exc
        if resp.status_code == 401:
            self.session_id = None
            self.login()
            try:
                resp = self._http.get(url, params=params, headers=self._build_headers())
            except httpx.RequestError as exc:
                raise SAPServiceError("SAP Service Layer is unavailable") from exc
        return resp

    def get_items(self, top: int = 100) -> List[Dict[str, Any]]:
        resp = self._get("Items", params={"$top": top})
        if resp.status_code >= 400:
            raise SAPServiceError(f"Failed to fetch SAP items with status {resp.status_code}")
        payload = resp.json()
        return payload.get("value", payload if isinstance(payload, list) else [])

    def get_item_by_code(self, item_code: str) -> Optional[Dict[str, Any]]:
        resp = self._get(f"Items('{item_code}')")
        if resp.status_code == 404:
            return None
        if resp.status_code >= 400:
            raise SAPServiceError(f"Failed to fetch SAP item with status {resp.status_code}")
        payload = resp.json()
        return payload if isinstance(payload, dict) else None

    def get_item_groups(self) -> Dict[int, str]:
        """Return {group_number: group_name} from SAP ItemGroups. Cached for session lifetime."""
        if self._group_cache is not None:
            return self._group_cache
        try:
            resp = self._get("ItemGroups", params={"$select": "Number,GroupName"})
            if resp.status_code == 200:
                groups = {}
                for g in resp.json().get("value", []):
                    if isinstance(g, dict) and g.get("Number") is not None:
                        groups[int(g["Number"])] = g.get("GroupName") or ""
                self._group_cache = groups
                return groups
        except Exception:
            pass
        self._group_cache = {}
        return {}

    def resolve_warehouse_code(self, name_or_code: str) -> str:
        """
        Resolve a warehouse name or code to the actual SAP WarehouseCode.
        Checks SAP_DEFAULT_WAREHOUSE_NAME env var first (defaults to 'Jaipur').
        Matches by WarehouseName (case-insensitive) then by WarehouseCode.
        Result is cached for the session lifetime.
        """
        if self._warehouse_cache is not None:
            return self._warehouse_cache

        override_name = os.getenv("SAP_DEFAULT_WAREHOUSE_NAME", "Jaipur").strip()
        lookup = override_name if override_name else (name_or_code or "").strip()
        if not lookup:
            self._warehouse_cache = name_or_code
            return name_or_code
        try:
            resp = self._get("Warehouses", params={"$select": "WarehouseCode,WarehouseName"})
            if resp.status_code == 200:
                warehouses = resp.json().get("value", [])
                needle = lookup.lower()
                for wh in warehouses:
                    if isinstance(wh, dict):
                        if (wh.get("WarehouseName") or "").strip().lower() == needle:
                            self._warehouse_cache = wh["WarehouseCode"]
                            return self._warehouse_cache
                for wh in warehouses:
                    if isinstance(wh, dict):
                        if (wh.get("WarehouseCode") or "").strip().lower() == needle:
                            self._warehouse_cache = wh["WarehouseCode"]
                            return self._warehouse_cache
        except Exception:
            pass
        self._warehouse_cache = name_or_code
        return name_or_code

    def connection_test(self) -> Dict[str, Any]:
        try:
            session_id = self.login()
            return {"connected": True, "message": "SAP Service Layer connection successful", "session_active": bool(session_id)}
        except SAPServiceError as exc:
            return {"connected": False, "message": str(exc), "session_active": False}

    def _get_image_meta(self, item_code: str, raw: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Return image metadata for item_code, using cache.
        Meta dict: {"has_picture": bool, "attachment_entry": int|None, "lines": [...]}
        """
        if item_code in self._meta_cache:
            return self._meta_cache[item_code]

        if raw is None:
            raw = self.get_item_by_code(item_code)
        if not raw:
            meta = {"has_picture": False, "attachment_entry": None, "lines": []}
            self._meta_cache[item_code] = meta
            return meta

        picture_path = raw.get("Picture")
        has_picture = bool(picture_path and isinstance(picture_path, str) and picture_path.strip())

        attachment_entry = raw.get("AttachmentEntry")
        lines: List[Dict[str, Any]] = []
        if attachment_entry is not None:
            try:
                resp = self._get(f"Attachments2({attachment_entry})")
                if resp.status_code == 200:
                    all_lines = resp.json().get("Attachments2_Lines", []) or []
                    for line in all_lines:
                        ext = (line.get("FileExtension") or "").lower().lstrip(".")
                        if ext in _IMAGE_EXTS or not ext:
                            lines.append(line)
            except Exception:
                pass

        meta = {"has_picture": has_picture, "attachment_entry": attachment_entry, "lines": lines}
        self._meta_cache[item_code] = meta
        return meta

    def get_item_images_count_from_raw(self, raw: Dict[str, Any]) -> int:
        """Count images for an already-fetched SAP item dict. Uses metadata cache."""
        item_code = raw.get("ItemCode") or ""
        meta = self._get_image_meta(item_code, raw=raw)
        return (1 if meta["has_picture"] else 0) + len(meta["lines"])

    def get_item_images_count(self, item_code: str) -> int:
        meta = self._get_image_meta(item_code)
        return (1 if meta["has_picture"] else 0) + len(meta["lines"])

    def get_item_image_bytes_by_index(self, item_code: str, index: int) -> Optional[tuple]:
        """
        Return (image_bytes, content_type) for the given image index on item_code.
        Index 0 = SAP Picture field. Index 1+ = Attachments2_Lines image entries.
        Results are cached in-process.
        """
        cache_key = (item_code, index)
        if cache_key in self._image_cache:
            return self._image_cache[cache_key]

        meta = self._get_image_meta(item_code)
        has_picture = meta["has_picture"]
        attachment_entry = meta["attachment_entry"]
        lines = meta["lines"]

        result: Optional[tuple] = None

        if index == 0 and has_picture:
            # Attempt 1: SAP Picture thumbnail endpoint
            try:
                accept_headers = dict(self._build_headers())
                accept_headers["Accept"] = "image/jpeg,image/png,image/webp,image/*,*/*"
                self.ensure_session()
                thumb_url = urljoin(self.base_url + "/", f"Items('{item_code}')/Picture")
                resp = self._http.get(thumb_url, headers=accept_headers)
                if resp.status_code == 401:
                    self.session_id = None
                    self.login()
                    accept_headers["Cookie"] = f"B1SESSION={self.session_id}"
                    resp = self._http.get(thumb_url, headers=accept_headers)
                if resp.status_code == 200 and resp.content:
                    ct = resp.headers.get("content-type", "image/jpeg")
                    if not ct.startswith("image/"):
                        ct = "image/jpeg"
                    result = (resp.content, ct)
            except Exception:
                pass

            # Attempt 2: fallback to first attachment line
            if result is None and lines:
                result = self._fetch_attachment_line(attachment_entry, lines[0])

        else:
            att_idx = (index - 1) if has_picture else index
            if 0 <= att_idx < len(lines):
                result = self._fetch_attachment_line(attachment_entry, lines[att_idx])

        if result is not None:
            self._image_cache[cache_key] = result
        return result

    def _fetch_attachment_line(self, attachment_entry: Any, line: Dict[str, Any]) -> Optional[tuple]:
        """Download bytes for a single Attachments2_Lines entry."""
        try:
            import mimetypes
            self.ensure_session()
            file_name = line.get("FileName") or ""
            file_ext = (line.get("FileExtension") or "").lstrip(".")
            base = urljoin(self.base_url + "/", f"Attachments2({attachment_entry})/$value")
            url = f"{base}?filename='{file_name}.{file_ext}'" if file_name and file_ext else base
            resp = self._http.get(url, headers=self._build_headers())
            if resp.status_code == 401:
                self.session_id = None
                self.login()
                resp = self._http.get(url, headers=self._build_headers())
            if resp.status_code == 200 and resp.content:
                ct = resp.headers.get("content-type", "image/jpeg")
                if not ct.startswith("image/"):
                    guessed, _ = mimetypes.guess_type(f"{file_name}.{file_ext}")
                    ct = guessed if guessed and guessed.startswith("image/") else "image/jpeg"
                return resp.content, ct
        except Exception:
            pass
        return None

    def get_item_image_bytes(self, item_code: str) -> Optional[tuple]:
        return self.get_item_image_bytes_by_index(item_code, 0)


# ---------------------------------------------------------------------------
# Module-level singleton — shared across all requests in the same process.
# This means one SAP login per process lifetime (re-login only on 401/expiry).
# ---------------------------------------------------------------------------
_sap_client: Optional[SAPClient] = None


def get_sap_client() -> SAPClient:
    """Return the process-level SAPClient singleton."""
    global _sap_client
    if _sap_client is None:
        _sap_client = SAPClient()
    return _sap_client
