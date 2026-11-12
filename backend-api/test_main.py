import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from api.index import app
from database import get_session

client = TestClient(app)

# 全局依赖覆盖
def override_get_session():
    mock_session = MagicMock()
    yield mock_session

app.dependency_overrides[get_session] = override_get_session

# ==========================================
# 1. 基础连通性测试
# ==========================================
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

# ==========================================
# 2. 鉴权模块测试 (Auth)
# ==========================================
@patch("routers.auth.get_session")
def test_register_route(mock_get_session):
    mock_session = MagicMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None # 模拟未注册
    # 关键修复：session.execute 是异步的，必须用 AsyncMock
    mock_session.execute = AsyncMock(return_value=mock_result)
    mock_get_session.return_value = mock_session
    
    response = client.post("/api/auth/register", json={"phone": "13800000000", "password": "123456"})
    assert response.status_code in [200, 400]

@patch("routers.auth.get_session")
def test_login_route(mock_get_session):
    mock_session = MagicMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None # 模拟查不到人
    mock_session.execute = AsyncMock(return_value=mock_result)
    mock_get_session.return_value = mock_session
    
    response = client.post("/api/auth/login", json={"phone": "13800000000", "password": "wrong"})
    assert response.status_code in [401, 404]

@patch("routers.auth.get_session")
def test_voice_hint_route(mock_get_session):
    mock_session = MagicMock()
    mock_result = MagicMock()
    mock_user = MagicMock()
    mock_user.password = "037674"
    mock_result.scalars.return_value.first.return_value = mock_user
    mock_session.execute = AsyncMock(return_value=mock_result)
    mock_get_session.return_value = mock_session
    
    response = client.get("/api/auth/voice_hint?phone=13800000000")
    assert response.status_code == 200
    assert response.json()["hint"] == "76__" # 037674 的后四位 7674 的掩码

# ==========================================
# 3. AI 涉诈检测测试 (Detect)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_detect_fraud_high_risk(mock_create):
    mock_create.return_value.choices = [
        type('obj', (object,), {
            'message': type('obj', (object,), {'content': '{"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立即停止转账！"}'})
        })
    ]
    response = client.post("/api/detect", json={"text": "我是公安局的"})
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"

# ==========================================
# 4. AI 智能问答测试 (QA)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_qa_route(mock_create):
    mock_create.return_value.choices = [
        type('obj', (object,), {'message': type('obj', (object,), {'content': '这是防骗建议'})})
    ]
    response = client.post("/api/qa", json={"query": "有人让我转账怎么办？"})
    assert response.status_code == 200
    assert response.json()["answer"] == "这是防骗建议"

# ==========================================
# 5. 家属告警测试 (Alert)
# ==========================================
@patch("routers.alert.send_alert_email")
def test_alert_family_route(mock_send_email):
    response = client.post("/api/alert/family", json={
        "text": "测试文本", "scam_type": "冒充公检法", "user_phone": "13800000000", "email": "test@qq.com"
    })
    assert response.status_code == 200
    mock_send_email.assert_called_once()