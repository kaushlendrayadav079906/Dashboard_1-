from fastapi import APIRouter, HTTPException

from app.services.sap.client import SAPClient, SAPServiceError

router = APIRouter(prefix="/sap", tags=["sap"])


@router.get("/connection-test")
def connection_test():
    client = SAPClient()
    try:
        return client.connection_test()
    except SAPServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
