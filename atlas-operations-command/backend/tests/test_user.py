import pytest
from uuid import uuid4
from fastapi.testclient import TestClient

def test_user_tenant_isolation_and_crud(client: TestClient):
    # 1. Create a company
    comp_resp = client.post("/api/v1/company/settings", json={
        "name": "User Test Company",
        "currency_code": "USD",
        "region": "NA",
        "fiscal_year_start_month": 1,
        "status": "active"
    })
    assert comp_resp.status_code == 201
    company_id = comp_resp.json()["id"]

    # 2. Create User
    user_data = {
        "company_id": company_id,
        "email": "alice@example.com",
        "full_name": "Alice",
        "status": "active"
    }
    create_resp = client.post("/api/v1/users", json=user_data)
    assert create_resp.status_code == 201
    user = create_resp.json()
    assert user["email"] == "alice@example.com"
    user_id = user["id"]
    
    # 6. User belongs to correct Company
    assert user["company_id"] == company_id

    # 3. Retrieve User by ID
    get_resp = client.get(f"/api/v1/users/{user_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == user_id
    
    # Retrieve User by email within company (internal repo test usually, but here we test via creation duplicate)

    # 4. List users by company
    list_resp = client.get(f"/api/v1/companies/{company_id}/users")
    assert list_resp.status_code == 200
    users = list_resp.json()
    assert len(users) == 1
    assert users[0]["id"] == user_id

    # 5. Update User
    update_resp = client.put(f"/api/v1/users/{user_id}", json={
        "full_name": "Updated Alice"
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["full_name"] == "Updated Alice"
    
    # 7. Duplicate email within same company is rejected
    dup_resp = client.post("/api/v1/users", json=user_data)
    assert dup_resp.status_code == 400

    # 8. Same email in different companies is allowed
    comp2_resp = client.post("/api/v1/company/settings", json={
        "name": "User Test Company 2",
        "currency_code": "EUR",
        "region": "EU",
        "fiscal_year_start_month": 1,
        "status": "active"
    })
    assert comp2_resp.status_code == 201
    company2_id = comp2_resp.json()["id"]
    
    user_data2 = {
        "company_id": company2_id,
        "email": "alice@example.com",
        "full_name": "Bob",
        "status": "active"
    }
    create2_resp = client.post("/api/v1/users", json=user_data2)
    assert create2_resp.status_code == 201
    user2_id = create2_resp.json()["id"]

    # 11. Company isolation is respected
    # Listing Company A: -> only Alice
    list_resp_A = client.get(f"/api/v1/companies/{company_id}/users")
    assert len(list_resp_A.json()) == 1
    assert list_resp_A.json()[0]["id"] == user_id

    # Listing Company B: -> only Bob
    list_resp_B = client.get(f"/api/v1/companies/{company2_id}/users")
    assert len(list_resp_B.json()) == 1
    assert list_resp_B.json()[0]["id"] == user2_id
    
    # 9. Missing company is rejected
    invalid_comp_resp = client.post("/api/v1/users", json={
        "company_id": str(uuid4()),
        "email": "new@example.com",
        "full_name": "New User"
    })
    assert invalid_comp_resp.status_code == 404

    # 10. Invalid user status is rejected
    invalid_status_resp = client.post("/api/v1/users", json={
        "company_id": company_id,
        "email": "new2@example.com",
        "full_name": "New User",
        "status": "invalid_status"
    })
    assert invalid_status_resp.status_code == 422
