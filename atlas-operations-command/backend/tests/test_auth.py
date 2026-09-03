import pytest
from uuid import uuid4
import jwt
from datetime import datetime, timedelta, timezone

from app.core.config import settings
from app.models.company import Company
from app.models.user import User
from app.models.user_credential import UserCredential
from app.core.security import hash_password

def setup_test_user(db_session):
    company = Company(id=uuid4(), name="JWT Test Company", currency_code="USD", region="NA", fiscal_year_start_month=1)
    db_session.add(company)
    db_session.commit()
    
    user = User(id=uuid4(), company_id=company.id, email="jwt@test.com", full_name="JWT User")
    db_session.add(user)
    db_session.commit()
    
    pwd_hash = hash_password("strongpassword123")
    cred = UserCredential(user_id=user.id, password_hash=pwd_hash)
    db_session.add(cred)
    db_session.commit()
    
    return company, user

def test_login_success(client, db_session):
    company, user = setup_test_user(db_session)
    
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failure(client, db_session):
    company, user = setup_test_user(db_session)
    
    # Wrong password
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    
    # Wrong email
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "wrong@test.com",
        "password": "strongpassword123"
    })
    assert response.status_code == 401
    
    # Wrong company
    wrong_company_id = uuid4()
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(wrong_company_id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    assert response.status_code == 401
    
    # Inactive user
    user.status = "inactive"
    db_session.commit()
    
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    assert response.status_code == 401

def test_jwt_creation_and_validation(client, db_session):
    company, user = setup_test_user(db_session)
    
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    token = response.json()["access_token"]
    
    # Decode and verify manually
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    assert payload["sub"] == str(user.id)
    assert payload["company_id"] == str(company.id)
    assert "exp" in payload
    assert "iat" in payload

def test_jwt_algorithm_security():
    # Attempting to decode with alg=none should fail in PyJWT by default unless explicitly allowed
    payload = {"sub": "123", "company_id": "456"}
    token = jwt.encode(payload, key="", algorithm="none")
    
    with pytest.raises(jwt.InvalidAlgorithmError):
        jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

def test_bearer_authentication_and_me_endpoint(client, db_session):
    company, user = setup_test_user(db_session)
    
    # 1. Successful login
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    token = response.json()["access_token"]
    
    # 2. Access /me with token
    response_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response_me.status_code == 200
    data = response_me.json()
    assert data["user_id"] == str(user.id)
    assert data["company_id"] == str(company.id)
    assert "password" not in data
    assert "password_hash" not in data
    
    # 3. Access without token
    response_no_token = client.get("/api/v1/auth/me")
    assert response_no_token.status_code == 401
    
    # 4. Access with wrong scheme
    response_wrong_scheme = client.get("/api/v1/auth/me", headers={"Authorization": f"Basic {token}"})
    assert response_wrong_scheme.status_code == 401
    
    # 5. Access with bad token
    response_bad_token = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer badtoken"})
    assert response_bad_token.status_code == 401

def test_inactive_user_token_rejection(client, db_session):
    company, user = setup_test_user(db_session)
    
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    token = response.json()["access_token"]
    
    # Deactivate user
    user.status = "inactive"
    db_session.commit()
    
    # Attempt to use the previously valid token
    response_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response_me.status_code == 401
    assert response_me.json()["detail"] == "Inactive user"

def test_tenant_safety_token_manipulation(client, db_session):
    company, user = setup_test_user(db_session)
    company2 = Company(id=uuid4(), name="Other Company", currency_code="USD", region="NA", fiscal_year_start_month=1)
    db_session.add(company2)
    db_session.commit()
    
    response = client.post("/api/v1/auth/login", json={
        "company_id": str(company.id),
        "email": "jwt@test.com",
        "password": "strongpassword123"
    })
    token = response.json()["access_token"]
    
    # Change the user's company in the database to simulate tenant mismatch
    user.company_id = company2.id
    db_session.commit()
    
    response_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response_me.status_code == 401
    assert response_me.json()["detail"] == "Tenant mismatch"
