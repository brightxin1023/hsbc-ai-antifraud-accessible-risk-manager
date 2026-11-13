"""请求/响应数据模型（Pydantic Schema）。

统一声明各接口入参契约，FastAPI 据此完成请求体校验与自动文档生成。
"""

from pydantic import BaseModel

class Transaction(BaseModel):
    """涉诈剧本/转账文本检测请求体。"""
    text: str

class Question(BaseModel):
    """智能问答请求体。"""
    query: str

class AlertRequest(BaseModel):
    """家属告警请求体（基础字段）。"""
    text: str
    scam_type: str

class RegisterRequest(BaseModel):
    """注册请求体：手机号 + 密码。"""
    phone: str
    password: str

class LoginRequest(BaseModel):
    """登录请求体：手机号 + 密码。"""
    phone: str
    password: str

class AlertRequest(BaseModel):
    """家属告警请求体（完整版，含家属手机号与邮箱）。"""
    text: str
    scam_type: str
    user_phone: str = "未知用户"
    email: str = "2795658007@qq.com"  # 兜底邮箱：前端未传时退回默认测试邮箱，避免告警无人接收
    is_blocked: bool = True