import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.index import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200

def test_auth_route_exists():
    # 这里只要发空 json 测试路由通了就行，不要去连真实数据库
    response = client.post("/api/auth/register", json={})
    assert response.status_code == 422