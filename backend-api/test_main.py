"""后端接口集成测试：确保应用能正常启动并响应基础请求。"""
import sys
import os
from fastapi.testclient import TestClient

# 动态将项目根目录加入 path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.index import app

# 模块级复用
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
# 2. 鉴权模块测试 (由于CI没有连数据库，这里仅测试路由是否存在)
# ==========================================
def test_auth_route_exists():
    """测试注册接口是否存在（发空数据，应该返回422参数错误，而不是404找不到）"""
    response = client.post("/api/auth/register", json={})
    assert response.status_code == 422  # 422 Unprocessable Entity 说明路由通了，只是参数没传对