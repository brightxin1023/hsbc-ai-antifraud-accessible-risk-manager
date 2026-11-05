import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

@patch("services.ai_service.client.chat.completions.create")
def test_detect_fraud_route(mock_create):
    mock_create.return_value.choices = [
        type('obj', (object,), {'message': type('obj', (object,), {'content': '{"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "拦截"}'})})
    ]
    response = client.post("/api/detect", json={"text": "测试"})
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"