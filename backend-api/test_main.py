import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from api.index import app
from database import get_session

# 模块级复用 TestClient
client = TestClient(app)

mock_session = MagicMock()
mock_session.execute = AsyncMock()

def override_get_session():
    yield mock_session

app.dependency_overrides[get_session] = override_get_session


# ==========================================
# 1. 基础连通性测试
# ==========================================
def test_read_root():
    """测试后端服务是否正常启动 (健康检查)"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


# ==========================================
# 2. 鉴权模块测试 (Auth)
# ==========================================
def test_register_route():
    """测试注册接口：模拟数据库查重与插入"""
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None  # 模拟查无此人
    mock_session.execute.return_value = mock_result

    payload = {"phone": "13800000000", "password": "123456"}
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200

def test_login_route():
    """测试登录接口：模拟传入错误账号密码"""
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None  # 模拟查无此人
    mock_session.execute.return_value = mock_result

    payload = {"phone": "13800000000", "password": "wrong"}
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code in [401, 404]

def test_voice_hint_route():
    """测试语音提示接口：模拟查询用户密码并返回掩码"""
    mock_result = MagicMock()
    mock_user = MagicMock()
    mock_user.password = "037674"
    mock_result.scalars.return_value.first.return_value = mock_user
    mock_session.execute.return_value = mock_result

    response = client.get("/api/auth/voice_hint?phone=13800000000")
    assert response.status_code == 200
    assert response.json()["hint"] == "76__"  # 037674 的后四位 7674 的掩码


# ==========================================
# 3. AI 涉诈检测测试 (Detect)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_detect_fraud_high_risk(mock_create):
    """测试涉诈剧本检测：Mock 掉 DeepSeek API 返回高危结果"""
    mock_create.return_value.choices = [
        type('obj', (object,), {
            'message': type('obj', (object,), {
                'content': '{"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立即停止转账！"}'
            })
        })
    ]
    response = client.post("/api/detect", json={"text": "我是公安局的，你的卡涉嫌洗钱。"})
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"


# ==========================================
# 4. AI 智能问答测试 (QA)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_qa_route(mock_create):
    """测试智能问答接口：Mock 掉大模型文本生成"""
    mock_create.return_value.choices = [
        type('obj', (object,), {'message': type('obj', (object,), {'content': '这是防骗建议：不要转账。'})})
    ]
    response = client.post("/api/qa", json={"query": "有人让我转账怎么办？"})
    assert response.status_code == 200
    assert response.json()["answer"] == "这是防骗建议：不要转账。"


# ==========================================
# 5. 家属告警测试 (Alert)
# ==========================================
@patch("routers.alert.send_alert_email")
def test_alert_family_route(mock_send_email):
    """测试家属告警接口：Mock 掉真实的 SMTP 邮件发送"""
    payload = {
        "text": "测试文本",
        "scam_type": "冒充公检法",
        "user_phone": "13800000000",
        "email": "test@qq.com"
    }
    response = client.post("/api/alert/family", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "已通知家属"
    mock_send_email.assert_called_once()