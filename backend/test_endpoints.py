from fastapi.testclient import TestClient
from backend.main import app
import uuid
import sys
import os
from backend.core.database import Base, engine

# Initialize db for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0"}

def test_create_project():
    response = client.post("/api/projects/", json={
        "name": "Test Project",
        "description": "A test project",
        "benchmark_request": "Test request"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["workflow_state"] == "CREATED"
    assert "id" in data
    return data["id"]

def test_get_project(project_id):
    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id

if __name__ == "__main__":
    test_health()
    pid = test_create_project()
    test_get_project(pid)
    print("API Endpoints basic tests passed")
