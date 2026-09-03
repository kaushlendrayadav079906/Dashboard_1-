from uuid import UUID
from pydantic import BaseModel, ConfigDict

class AuthContext(BaseModel):
    """
    Represents the authenticated identity payload for a request.
    This provides a strictly-typed context boundary for authorization rules.
    Does NOT contain passwords or tokens.
    """
    user_id: UUID
    company_id: UUID

    model_config = ConfigDict(
        # Future-proofing: explicitly reject unexpected token/password fields if inadvertently passed
        extra="forbid"
    )

class LoginRequest(BaseModel):
    company_id: UUID
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
