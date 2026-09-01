from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, engine, Base
import pytest

client = TestClient(app)

# The conftest.py already sets up an in-memory SQLite database and calls Base.metadata.create_all


def test_create_company():
    response = client.post(
        "/api/v1/company/settings",
        json={
            "name": "AtlasOps Demo Company",
            "currency_code": "USD",
            "region": "North America",
            "fiscal_year_start_month": 4,
            "status": "active"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "AtlasOps Demo Company"
    assert "id" in data
    return data["id"]

def test_get_company():
    # First create
    response = client.post(
        "/api/v1/company/settings",
        json={
            "name": "AtlasOps Demo Company 2",
            "currency_code": "INR",
            "region": "Asia",
            "fiscal_year_start_month": 4,
            "status": "active"
        },
    )
    assert response.status_code == 201
    company_id = response.json()["id"]

    # Then get
    response = client.get(f"/api/v1/company/settings/{company_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "AtlasOps Demo Company 2"

def test_update_company():
    # First create
    response = client.post(
        "/api/v1/company/settings",
        json={
            "name": "Update Demo Company",
            "currency_code": "EUR",
            "region": "Europe",
            "fiscal_year_start_month": 1,
            "status": "active"
        },
    )
    assert response.status_code == 201
    company_id = response.json()["id"]

    # Then update
    response = client.put(
        f"/api/v1/company/settings/{company_id}",
        json={"name": "Updated Name", "status": "inactive"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["status"] == "inactive"
    assert data["currency_code"] == "EUR"

def test_company_validation_error():
    # Test invalid fiscal year month
    response = client.post(
        "/api/v1/company/settings",
        json={
            "name": "Invalid Company",
            "currency_code": "USD",
            "region": "North America",
            "fiscal_year_start_month": 13,
            "status": "active"
        },
    )
    assert response.status_code == 422

    # Test invalid currency code
    response = client.post(
        "/api/v1/company/settings",
        json={
            "name": "Invalid Company",
            "currency_code": "US",
            "region": "North America",
            "fiscal_year_start_month": 4,
            "status": "active"
        },
    )
    assert response.status_code == 422
