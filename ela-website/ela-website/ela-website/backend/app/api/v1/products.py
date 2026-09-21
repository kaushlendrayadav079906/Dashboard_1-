from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.services.sap.client import SAPClient, SAPServiceError
from app.services.sap.products import SAPProductMapper

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products():
    if not settings.SAP_DEFAULT_WAREHOUSE:
        raise HTTPException(status_code=503, detail="SAP_DEFAULT_WAREHOUSE is not configured")
    if not settings.SAP_DEFAULT_PRICE_LIST:
        raise HTTPException(status_code=503, detail="SAP_DEFAULT_PRICE_LIST is not configured")

    client = SAPClient()
    try:
        items = client.get_items(top=100)
        mapped = SAPProductMapper.map_products(
            items,
            price_list=settings.SAP_DEFAULT_PRICE_LIST,
            warehouse_code=settings.SAP_DEFAULT_WAREHOUSE,
        )
        return mapped
    except SAPServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Unable to fetch products: {str(exc)}") from exc
