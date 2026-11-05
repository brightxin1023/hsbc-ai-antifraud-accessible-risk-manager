from fastapi import APIRouter
from schemas import Question
from services.ai_service import answer_qa_question

router = APIRouter()

@router.post("/qa")
def answer_question(question: Question):
    return {"answer": answer_qa_question(question.query)}