from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.company import CompanyCreate, CompanyRead, CompanyUpdate
from app.services.company import company_service

router = APIRouter(prefix="/company", tags=["company"])

# Temporary mechanism to test endpoints without authentication.
# In the future, company_id should be extracted from the authenticated user's token.

@router.post("/settings", response_model=CompanyRead, status_code=status.HTTP_201_CREATED)
def create_company_settings(company_in: CompanyCreate, db: Session = Depends(get_db)):
    """Create company settings."""
    return company_service.create_company(db, company_in)

@router.get("/settings/{company_id}", response_model=CompanyRead)
def get_company_settings(company_id: UUID, db: Session = Depends(get_db)):
    """Get company settings."""
    return company_service.get_company(db, company_id)

@router.put("/settings/{company_id}", response_model=CompanyRead)
def update_company_settings(company_id: UUID, company_in: CompanyUpdate, db: Session = Depends(get_db)):
    """Update company settings."""
    return company_service.update_company(db, company_id, company_in)
