from fastapi import APIRouter
from schemas import Question
from services.ai_service import answer_qa_question

router = APIRouter()

@router.post("/qa")
def answer_question(question: Question):
    """智能问答接口：把用户提问交给问答服务，统一用 answer 字段返回。

    参数:
        question: 校验后的提问请求体。

    返回:
        dict: 形如 {"answer": str} 的回答。
    """
    return {"answer": answer_qa_question(question.query)}