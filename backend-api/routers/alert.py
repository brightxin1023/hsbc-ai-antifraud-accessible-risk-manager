from fastapi import APIRouter, BackgroundTasks
from schemas import AlertRequest
from services.mail_service import send_alert_email

router = APIRouter()

@router.post("/alert/family")
def alert_family(request: AlertRequest, background_tasks: BackgroundTasks):
    """家属告警接口：把发信任务交给 BackgroundTasks，接口立即返回、不阻塞在 SMTP 上。

    参数:
        request: 告警文本、诈骗类型、用户手机号与家属邮箱。
        background_tasks: FastAPI 注入的后台任务队列。

    返回:
        dict: 立即回执 status=success，邮件由后台异步发送。
    """
    background_tasks.add_task(
        send_alert_email, 
        request.text, 
        request.scam_type, 
        request.user_phone,
        request.email
    )
    return {"status": "success", "message": "已通知家属"}