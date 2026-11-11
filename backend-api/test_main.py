"""后端接口集成测试：覆盖鉴权、涉诈检测、智能问答与家属告警。

通过 TestClient 发起请求，并用 unittest.mock 对 users.json 文件读写以及
AI/邮件等外部依赖打桩，保证测试可离线运行、可重复、不污染真实数据。
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

# 模块级复用同一个 TestClient，避免每个用例重复初始化 ASGI 应用的开销
client = TestClient(app)

# ==========================================
# 1. 基础连通性测试
# ==========================================
def test_read_root():
    """测试后端服务是否正常启动"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

# ==========================================
# 2. 鉴权模块测试 (Auth)
# ==========================================
@patch("routers.auth.write_users")
@patch("routers.auth.read_users")
def test_register_success(mock_read, mock_write):
    """测试注册成功：Mock 掉文件读写"""
    mock_read.return_value = [] 
    response = client.post("/api/auth/register", json={"phone": "13800138000", "password": "123456"})
    
    assert response.status_code == 200
    assert response.json()["message"] == "注册成功"
    mock_write.assert_called_once() 

@patch("routers.auth.read_users")
def test_register_fail_exists(mock_read):
    """测试注册失败：用户已存在"""
    mock_read.return_value = [{"phone": "13800138000", "password": "123456"}]
    response = client.post("/api/auth/register", json={"phone": "13800138000", "password": "123456"})
    
    assert response.status_code == 400
    assert response.json()["detail"] == "该手机号已注册"

@patch("routers.auth.read_users")
def test_login_success(mock_read):
    """测试登录成功"""
    mock_read.return_value = [{"phone": "13800138000", "password": "123456"}]
    response = client.post("/api/auth/login", json={"phone": "13800138000", "password": "123456"})
    
    assert response.status_code == 200
    assert response.json()["message"] == "登录成功"

@patch("routers.auth.read_users")
def test_login_fail_not_registered(mock_read):
    """测试登录失败：账号不存在"""
    mock_read.return_value = []
    response = client.post("/api/auth/login", json={"phone": "13800138000", "password": "123456"})
    
    assert response.status_code == 404
    assert response.json()["detail"] == "该手机号未注册"

@patch("routers.auth.read_users")
def test_voice_hint_success(mock_read):
    """测试语音提示接口"""
    mock_read.return_value = [{"phone": "13800138000", "password": "037674"}]
    response = client.get("/api/auth/voice_hint?phone=13800138000")
    
    assert response.status_code == 200
    # 修复点 1：原密码 037674 的后四位是 7674，前两位是 76
    assert response.json()["hint"] == "76__" 

# ==========================================
# 3. AI 检测模块测试 (Detect)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_detect_fraud_high_risk(mock_create):
    """测试涉诈剧本检测接口"""
    mock_create.return_value.choices = [
        type('obj', (object,), {
            'message': type('obj', (object,), {
                'content': '{"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立即停止转账！"}'
            })
        })
    ]
    
    response = client.post("/api/detect", json={"text": "我是公安局的"})
    
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"

# ==========================================
# 4. AI 问答模块测试 (QA)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_qa_route(mock_create):
    """测试智能问答接口"""
    mock_create.return_value.choices = [
        type('obj', (object,), {
            'message': type('obj', (object,), {
                'content': '这是防骗建议。'
            })
        })
    ]
    
    response = client.post("/api/qa", json={"query": "怎么办？"})
    
    assert response.status_code == 200
    assert response.json()["answer"] == "这是防骗建议。"

# ==========================================
# 5. 家属告警模块测试 (Alert)
# ==========================================
# 修复点 2：必须 Patch 路由模块里引用的函数，而不是原始函数
@patch("routers.alert.send_alert_email")
def test_alert_family_route(mock_send_email):
    """测试家属告警接口"""
    response = client.post("/api/alert/family", json={
        "text": "测试文本",
        "scam_type": "冒充公检法",
        "user_phone": "13800138000",
        "email": "test_family@qq.com"
    })
    
    assert response.status_code == 200
    assert response.json()["message"] == "已通知家属"
    mock_send_email.assert_called_once() 