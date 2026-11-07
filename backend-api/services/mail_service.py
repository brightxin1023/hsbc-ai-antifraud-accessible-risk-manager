import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

def send_alert_email(user_text: str, scam_type: str, user_phone: str = "未知用户"):
    sender = os.getenv("MAIL_SENDER")
    auth_code = os.getenv("MAIL_AUTH_CODE")
    
    if not sender or not auth_code:
        print("未配置邮箱环境变量，跳过发送。")
        return
        
    receiver = sender 
    
    # 隐藏手机号中间四位
    masked_phone = f"{user_phone[:3]}****{user_phone[7:]}" if len(user_phone) == 11 else user_phone

    # 根据 scam_type 判断是哪种告警，动态生成标题和正文
    if scam_type == "紧急求助":
        subject = "🚨【紧急求助】您的家人通过 AI 反诈盾发来求助"
        body = f"""【AI反诈盾 - 紧急求助通知】

您好：
您手机号为 {masked_phone} 的家人，刚刚通过 AI 反诈盾 App 向您发起了紧急求助。

请立即致电家人，确认其人身及财产安全！
（此为系统自动发送，请勿回复）
"""
    else:
        subject = "⚠️【高危拦截】您的家人可能正在遭遇诈骗"
        body = f"""【AI反诈盾 - 高危交易拦截预警】

您好：
您的家人（账号尾号：{masked_phone[-4:]}）正在发起一笔转账。
系统检测到该笔交易与【{scam_type}】诈骗特征高度吻合。

【转账附言】：
{user_text if user_text else '无附言'}

系统已自动阻断该交易。请立即联系家人，提醒其切勿上当受骗！
"""

    message = MIMEText(body, 'plain', 'utf-8')
    message['From'] = formataddr(("AI反诈盾", sender))
    message['To'] = formataddr(("家属", receiver))
    message['Subject'] = Header(subject, 'utf-8')

    try:
        smtp_obj = smtplib.SMTP_SSL("smtp.qq.com", 465)
        smtp_obj.login(sender, auth_code)
        smtp_obj.sendmail(sender, [receiver], message.as_string())
        smtp_obj.quit()
        print(f"✅ 告警邮件已成功发送至家属: {receiver}")
    except Exception as e:
        print(f"❌ 邮件发送失败: {e}")