from fastapi.testclient import TestClient

from app.main import app


def test_health_and_session_contracts():
    client = TestClient(app)

    health = client.get("/health")
    assert health.status_code == 200

    created = client.post("/api/v1/council/sessions", json={"query": "How should we sequence GTM for an AI productivity product?"})
    assert created.status_code == 200
    payload = created.json()

    assert "session_id" in payload
    assert "round_table" in payload
    assert "clash" in payload
    assert "synthesis" in payload

    listed = client.get("/api/v1/council/sessions")
    assert listed.status_code == 200
    assert listed.json()["total"] >= 1

    fetched = client.get(f"/api/v1/council/sessions/{payload['session_id']}")
    assert fetched.status_code == 200
    assert fetched.json()["session_id"] == payload["session_id"]
