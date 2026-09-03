from sqlalchemy.orm import Session
from uuid import UUID

from app.core.exceptions import UnauthenticatedException
from app.repositories.user import user_repository
from app.services.user_credential import UserCredentialService
from app.core.jwt import create_access_token

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_credential_service = UserCredentialService(db)

    def authenticate_user(self, company_id: UUID, email: str, password: str) -> str:
        """
        Authenticates a user based on company_id, email, and password.
        Since email is only unique per company_id, company_id is required to resolve identity.
        Returns the JWT access token upon successful authentication.
        """
        # Generic error to prevent user enumeration
        auth_error = UnauthenticatedException(detail="Incorrect email, password, or company")
        
        # Look up user by email within the specific company context
        user = user_repository.get_by_email_within_company(self.db, company_id, email)
        if not user:
            raise auth_error
            
        # Check active status
        if user.status == "inactive":
            raise auth_error
            
        # Verify credentials
        is_valid = self.user_credential_service.verify_credential(company_id, user.id, password)
        if not is_valid:
            raise auth_error
            
        # Generate JWT access token
        access_token = create_access_token(user_id=user.id, company_id=user.company_id)
        return access_token
