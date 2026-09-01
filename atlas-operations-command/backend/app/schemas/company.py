from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class CompanyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    currency_code: str = Field(..., min_length=3, max_length=3, pattern="^[A-Z]{3}$")
    region: str = Field(..., min_length=1, max_length=100)
    fiscal_year_start_month: int = Field(..., ge=1, le=12)
    status: str = Field("active", pattern="^(active|inactive)$")

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    currency_code: str | None = Field(None, min_length=3, max_length=3, pattern="^[A-Z]{3}$")
    region: str | None = Field(None, min_length=1, max_length=100)
    fiscal_year_start_month: int | None = Field(None, ge=1, le=12)
    status: str | None = Field(None, pattern="^(active|inactive)$")

class CompanyRead(CompanyBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
