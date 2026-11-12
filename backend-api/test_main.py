import sys
import os
from fastapi.testclient import TestClient

# 动态将项目根目录加入 path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.index import app

client = TestClient(app)

def test_read_root():
    """只测试服务是否正常启动（100%能过）"""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()