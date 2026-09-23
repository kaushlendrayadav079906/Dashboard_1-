from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.core.config import settings
from app.services.sap.client import get_sap_client, SAPServiceError
from app.services.sap.products import SAPProductMapper

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products():
    if not settings.SAP_DEFAULT_WAREHOUSE:
        raise HTTPException(status_code=503, detail="SAP_DEFAULT_WAREHOUSE is not configured")
    if not settings.SAP_DEFAULT_PRICE_LIST:
        raise HTTPException(status_code=503, detail="SAP_DEFAULT_PRICE_LIST is not configured")

    client = get_sap_client()
    try:
        items = client.get_items(top=100)
        warehouse_code = client.resolve_warehouse_code(settings.SAP_DEFAULT_WAREHOUSE)
        group_map = client.get_item_groups()
        mapped = SAPProductMapper.map_products(
            items,
            price_list=settings.SAP_DEFAULT_PRICE_LIST,
            warehouse_code=warehouse_code,
            client=client,
            group_map=group_map,
        )
        return mapped
    except SAPServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Unable to fetch products: {str(exc)}") from exc


@router.get("/{item_code}/image")
def get_product_image(item_code: str):
    """Serve SAP product image through the ELA FastAPI proxy."""
    if not item_code or not item_code.strip():
        raise HTTPException(status_code=400, detail="item_code is required")

    client = get_sap_client()
    try:
        result = client.get_item_image_bytes(item_code.strip())
    except SAPServiceError as exc:
        raise HTTPException(status_code=503, detail=f"SAP unavailable: {str(exc)}") from exc
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(status_code=500, detail=f"Image retrieval failed: {str(exc)}") from exc

    if result is None:
        raise HTTPException(status_code=404, detail="No image available for this product")

    image_bytes, content_type = result
    return Response(
        content=image_bytes,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.get("/{item_code}/images")
def get_product_images(item_code: str):
    if not item_code or not item_code.strip():
        raise HTTPException(status_code=400, detail="item_code is required")

    client = get_sap_client()
    try:
        count = client.get_item_images_count(item_code.strip())
        images = [f"/api/v1/products/{item_code}/images/{i}" for i in range(count)]
        return {"itemCode": item_code, "images": images}
    except SAPServiceError as exc:
        raise HTTPException(status_code=503, detail=f"SAP unavailable: {str(exc)}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image count retrieval failed: {str(exc)}") from exc


@router.get("/{item_code}/images/{index}")
def get_product_image_by_index(item_code: str, index: int):
    if not item_code or not item_code.strip():
        raise HTTPException(status_code=400, detail="item_code is required")

    client = get_sap_client()
    try:
        result = client.get_item_image_bytes_by_index(item_code.strip(), index)
    except SAPServiceError as exc:
        raise HTTPException(status_code=503, detail=f"SAP unavailable: {str(exc)}") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image retrieval failed: {str(exc)}") from exc

    if result is None:
        raise HTTPException(status_code=404, detail="No image available at this index")

    image_bytes, content_type = result
    return Response(
        content=image_bytes,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=3600",
            "X-Content-Type-Options": "nosniff",
        },
    )
