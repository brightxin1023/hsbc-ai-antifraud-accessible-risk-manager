from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_detect_fraud_route():
    response = client.post(
        "/api/detect",
        json={"text": "测试文本"}
    )
    assert response.status_code == 200