from fastapi import APIRouter
from schemas import Transaction
from services.ai_service import analyze_fraud_text

router = APIRouter()

@router.post("/detect")
def detect_fraud(transaction: Transaction):
    """涉诈剧本检测接口：透传用户文本给 AI 研判，返回风险等级与建议。

    参数:
        transaction: 校验后的文本请求体。

    返回:
        dict: 包含 risk_level、scam_type、suggestion 的研判结果。
    """
    return analyze_fraud_text(transaction.text)