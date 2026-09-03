from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user import user_service

router = APIRouter(tags=["users"])

# Temporary mechanism to test endpoints without authentication.
# In the future, company_id should be extracted from the authenticated user's token.

@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create user (development only)."""
    return user_service.create_user(db, user_in)

@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """Get user by ID (development only)."""
    return user_service.get_user(db, user_id)

@router.get("/companies/{company_id}/users", response_model=list[UserRead])
def list_users(company_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List users by company (development only)."""
    return user_service.list_users(db, company_id, skip=skip, limit=limit)

@router.put("/users/{user_id}", response_model=UserRead)
def update_user(user_id: UUID, user_in: UserUpdate, db: Session = Depends(get_db)):
    """Update user (development only)."""
    return user_service.update_user(db, user_id, user_in)
