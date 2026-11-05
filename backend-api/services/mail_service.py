import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

def send_alert_email(user_text: str, scam_type: str):
    sender = os.getenv("MAIL_SENDER")
    auth_code = os.getenv("MAIL_AUTH_CODE")
    
    if not sender or not auth_code:
        print("⚠️ 未配置邮箱环境变量，跳过发送。")
        return
        
    receiver = sender 
    message = MIMEText(f"【AI反诈盾紧急预警】\n\n可疑文本：{user_text}\n识别类型：{scam_type}\n请立刻联系家人确认安全！", 'plain', 'utf-8')
    message['From'] = formataddr(("AI反诈盾", sender))
    message['To'] = formataddr(("家属", receiver))
    message['Subject'] = Header("⚠️【高危拦截】您的家属可能正在遭遇诈骗", 'utf-8')

    try:
        smtp_obj = smtplib.SMTP_SSL("smtp.qq.com", 465)
        smtp_obj.login(sender, auth_code)
        smtp_obj.sendmail(sender, [receiver], message.as_string())
        smtp_obj.quit()
        print(f"✅ 告警邮件已成功发送至家属: {receiver}")
    except Exception as e:
        print(f"❌ 邮件发送失败: {e}")