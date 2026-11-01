from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_suggestions_returns_findings_in_reading_order():
    text = "Call Jane on 07700 900123 or email jane@justice.gov.uk. Address: SW1A 2AA."
    response = client.post("/suggestions", json={"text": text})
    assert response.status_code == 200
    types = [s["type"] for s in response.json()["suggestions"]]
    assert types == ["phone", "email", "postcode"]


def test_missing_text_returns_422():
    response = client.post("/suggestions", json={})
    assert response.status_code == 422


def test_text_without_personal_data_returns_empty_list():
    response = client.post("/suggestions", json={"text": "No personal data here."})
    assert response.status_code == 200
    assert response.json() == {"suggestions": []}