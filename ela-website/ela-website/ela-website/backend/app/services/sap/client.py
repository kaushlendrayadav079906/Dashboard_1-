import time
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import httpx

from app.core.config import settings


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
        self._http = httpx.Client(timeout=max(settings.SAP_HTTP_TIMEOUT / 1000, 1))

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

    def get_items(self, top: int = 100) -> List[Dict[str, Any]]:
        self.ensure_session()
        try:
            response = self._http.get(
                urljoin(self.base_url + "/", "Items"),
                params={"$top": top},
                headers=self._build_headers(),
            )
        except httpx.RequestError as exc:
            raise SAPServiceError("SAP Service Layer is unavailable") from exc
        if response.status_code == 401:
            self.session_id = None
            self.login()
            try:
                response = self._http.get(
                    urljoin(self.base_url + "/", "Items"),
                    params={"$top": top},
                    headers=self._build_headers(),
                )
            except httpx.RequestError as exc:
                raise SAPServiceError("SAP Service Layer is unavailable") from exc

        if response.status_code >= 400:
            raise SAPServiceError(f"Failed to fetch SAP items with status {response.status_code}")

        payload = response.json()
        return payload.get("value", payload if isinstance(payload, list) else [])

    def get_item_by_code(self, item_code: str) -> Optional[Dict[str, Any]]:
        self.ensure_session()
        try:
            response = self._http.get(
                urljoin(self.base_url + "/", f"Items('{item_code}')"),
                headers=self._build_headers(),
            )
        except httpx.RequestError as exc:
            raise SAPServiceError("SAP Service Layer is unavailable") from exc
        if response.status_code == 404:
            return None
        if response.status_code == 401:
            self.session_id = None
            self.login()
            try:
                response = self._http.get(
                    urljoin(self.base_url + "/", f"Items('{item_code}')"),
                    headers=self._build_headers(),
                )
            except httpx.RequestError as exc:
                raise SAPServiceError("SAP Service Layer is unavailable") from exc
        if response.status_code >= 400:
            raise SAPServiceError(f"Failed to fetch SAP item with status {response.status_code}")
        payload = response.json()
        return payload if isinstance(payload, dict) else None

    def connection_test(self) -> Dict[str, Any]:
        try:
            session_id = self.login()
            return {"connected": True, "message": "SAP Service Layer connection successful", "session_active": bool(session_id)}
        except SAPServiceError as exc:
            return {"connected": False, "message": str(exc), "session_active": False}
