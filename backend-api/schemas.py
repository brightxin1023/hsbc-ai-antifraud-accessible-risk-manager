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