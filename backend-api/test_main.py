from fastapi.testclient import TestClient
from main import app
from unittest.mock import patch

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

# 使用 Mock 拦截真实的网络请求，绝对正规的单元测试写法
@patch("openai.resources.chat.completions.Completions.create")
def test_detect_fraud_route(mock_create):
    mock_create.return_value.choices = [
        type('obj', (object,), {'message': type('obj', (object,), {'content': '{"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立即拦截"}'})})
    ]
    
    response = client.post(
        "/api/detect",
        json={"text": "测试文本"}
    )
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"