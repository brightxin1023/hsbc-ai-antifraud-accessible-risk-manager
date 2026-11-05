from fastapi import APIRouter
from schemas import Transaction
from services.ai_service import analyze_fraud_text

router = APIRouter()

@router.post("/detect")
def detect_fraud(transaction: Transaction):
    return analyze_fraud_text(transaction.text)