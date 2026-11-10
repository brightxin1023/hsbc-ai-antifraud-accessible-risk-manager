from pydantic import BaseModel

class Transaction(BaseModel):
    text: str

class Question(BaseModel):
    query: str

class AlertRequest(BaseModel):
    text: str
    scam_type: str

class RegisterRequest(BaseModel):
    phone: str
    password: str

class LoginRequest(BaseModel):
    phone: str
    password: str

class AlertRequest(BaseModel):
    text: str
    scam_type: str
    user_phone: str = "未知用户"
    email: str = "2795658007@qq.com" # 新增：接收前端传来的家属邮箱