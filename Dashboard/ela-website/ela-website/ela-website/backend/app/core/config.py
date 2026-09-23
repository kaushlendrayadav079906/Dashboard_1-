import os
from pathlib import Path
from urllib.parse import quote, unquote

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")


def _normalize_database_url(database_url: str) -> str:
    scheme, separator, remainder = database_url.partition("://")
    if not separator:
        return database_url

    authority, path_separator, path = remainder.partition("/")
    userinfo, at_separator, host = authority.rpartition("@")
    if not at_separator or ":" not in userinfo:
        return database_url

    username, password = userinfo.split(":", 1)
    encoded_userinfo = f"{quote(unquote(username), safe='')}:{quote(unquote(password), safe='')}"
    return f"{scheme}://{encoded_userinfo}@{host}{path_separator}{path}"


class Settings:
    APP_NAME = "ELA FastAPI"
    API_V1_PREFIX = "/api/v1"
    PROJECT_ROOT = str(BASE_DIR)

    DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", ""))
    JWT_SECRET = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    SAP_SERVICE_LAYER_URL = os.getenv("SAP_SERVICE_LAYER_URL", "")
    SAP_COMPANY_DB = os.getenv("SAP_COMPANY_DB", "")
    SAP_USERNAME = os.getenv("SAP_USERNAME", "")
    SAP_PASSWORD = os.getenv("SAP_PASSWORD", "")
    SAP_HTTP_TIMEOUT = int(os.getenv("SAP_HTTP_TIMEOUT", "60000"))
    SAP_DEFAULT_PRICE_LIST = os.getenv("SAP_DEFAULT_PRICE_LIST", "")
    SAP_DEFAULT_WAREHOUSE = os.getenv("SAP_DEFAULT_WAREHOUSE", "")

    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")


settings = Settings()
