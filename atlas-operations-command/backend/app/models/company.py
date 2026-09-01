from sqlalchemy import Column, String, Integer, CheckConstraint
from app.core.database import Base
from app.models.base import UUIDMixin, TimestampMixin

class Company(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "companies"

    name = Column(String(255), nullable=False)
    currency_code = Column(String(3), nullable=False)
    region = Column(String(100), nullable=False)
    fiscal_year_start_month = Column(Integer, nullable=False)
    status = Column(String(50), nullable=False, default="active")

    __table_args__ = (
        CheckConstraint('fiscal_year_start_month BETWEEN 1 AND 12', name='ck_companies_fiscal_year_start_month'),
        CheckConstraint("status IN ('active', 'inactive')", name='ck_companies_status'),
    )
