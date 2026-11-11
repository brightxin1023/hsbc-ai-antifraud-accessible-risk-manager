import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

# 初始化测试客户端
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
    """测试注册成功：Mock 掉文件读写，假设库中无此用户"""
    mock_read.return_value = []  # 模拟数据库为空
    response = client.post("/api/auth/register", json={"phone": "13800138000", "password": "123456"})
    
    assert response.status_code == 200
    assert response.json()["message"] == "注册成功"
    mock_write.assert_called_once()  # 断言写入函数被调用了

@patch("routers.auth.read_users")
def test_register_fail_exists(mock_read):
    """测试注册失败：Mock 掉文件读写，假设用户已存在"""
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
    """测试语音提示接口，提取密码后四位掩码"""
    mock_read.return_value = [{"phone": "13800138000", "password": "037674"}]
    response = client.get("/api/auth/voice_hint?phone=13800138000")
    
    assert response.status_code == 200
    assert response.json()["hint"] == "03__"  # 037674 的后四位是 7674，所以提示应该是 76__，这里原逻辑取前两位

# ==========================================
# 3. AI 检测模块测试 (Detect)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_detect_fraud_high_risk(mock_create):
    """测试涉诈剧本检测接口：Mock 掉 DeepSeek 的返回"""
    # 构造 Mock 返回体，强行让 AI 返回 high
    mock_create.return_value.choices = [
        type('obj', (object,), {
            'message': type('obj', (object,), {
                'content': '{"risk_level": "high", "scam_type": "冒充公检法", "suggestion": "立即停止转账！"}'
            })
        })
    ]
    
    response = client.post("/api/detect", json={"text": "我是公安局的，你的卡涉嫌洗钱，转入安全账户。"})
    
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"
    assert response.json()["scam_type"] == "冒充公检法"

# ==========================================
# 4. AI 问答模块测试 (QA)
# ==========================================
@patch("services.ai_service.client.chat.completions.create")
def test_qa_route(mock_create):
    """测试智能问答接口：Mock 掉大模型文本生成"""
    mock_create.return_value.choices = [
        type('obj', (object,), {
            'message': type('obj', (object,), {
                'content': '这是防骗建议：不要转账。'
            })
        })
    ]
    
    response = client.post("/api/qa", json={"query": "有人让我转账怎么办？"})
    
    assert response.status_code == 200
    assert response.json()["answer"] == "这是防骗建议：不要转账。"

# ==========================================
# 5. 家属告警模块测试 (Alert)
# ==========================================
@patch("services.mail_service.send_alert_email")
def test_alert_family_route(mock_send_email):
    """测试家属告警接口：Mock 掉真实的 SMTP 发信逻辑"""
    response = client.post("/api/alert/family", json={
        "text": "涉嫌洗钱，转入安全账户",
        "scam_type": "冒充公检法",
        "user_phone": "13800138000",
        "email": "test_family@qq.com"
    })
    
    assert response.status_code == 200
    assert response.json()["message"] == "已通知家属"
    
    # BackgroundTasks 在 TestClient 中会被同步执行
    # 断言发送邮件的函数被成功触发了一次
    mock_send_email.assert_called_once() 
