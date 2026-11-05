from fastapi import APIRouter, BackgroundTasks
from schemas import AlertRequest
from services.mail_service import send_alert_email

router = APIRouter()

@router.post("/alert/family")
def alert_family(request: AlertRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_alert_email, request.text, request.scam_type)
    return {"status": "success", "message": "已通知家属"}