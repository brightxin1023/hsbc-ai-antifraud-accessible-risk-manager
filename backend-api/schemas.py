from pydantic import BaseModel

class Transaction(BaseModel):
    text: str

class Question(BaseModel):
    query: str

class AlertRequest(BaseModel):
    text: str
    scam_type: str