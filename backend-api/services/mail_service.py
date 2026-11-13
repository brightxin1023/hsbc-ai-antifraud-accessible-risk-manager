"""家属告警邮件服务：通过 QQ 邮箱 SMTP(SSL/465) 发送高危拦截或紧急求助通知。"""
import os
import smtplib
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

def send_alert_email(user_text: str, scam_type: str, user_phone: str = "未知用户", receiver_email: str = None, is_blocked: bool = True):
    """按诈骗类型组装告警邮件并发送；缺配置时静默跳过，不抛异常。

    参数:
        user_text: 触发告警的转账附言或求助文本。
        scam_type: 诈骗类型；值为“紧急求助”时走求助模板，否则走高危拦截模板。
        user_phone: 用户手机号，用于脱敏展示。
        receiver_email: 家属邮箱；为空时回退到默认测试邮箱。
        is_blocked: 交易是否被成功阻断，影响邮件文案。
    """
    sender = os.getenv("MAIL_SENDER")
    auth_code = os.getenv("MAIL_AUTH_CODE")

    # 缺任一邮箱配置就静默跳过：告警是尽力而为的旁路，不应因配置缺失抛错中断主流程
    if not sender or not auth_code:
        print("未配置邮箱环境变量，跳过发送。")
        return

    # 如果前端传了邮箱，就发给前端传的；如果没传，再发给默认测试邮箱
    receiver = receiver_email if receiver_email else "2795658007@qq.com"
    
    masked_phone = user_phone if user_phone else "未知"

    # 按告警类型分模板：紧急求助强调人身安全，其余场景强调资金阻断
    if scam_type == "紧急求助":
        subject = "【紧急求助】您的家人通过AI反诈盾发来求助"
        body = f"""【AI反诈盾 - 紧急求助通知】

您好：
您手机号为 {masked_phone} 的家人，刚刚通过AI反诈盾App向您发起了紧急求助。
请立即致电家人，确认其人身及财产安全！
（此为系统自动发送，请勿回复）"""
    else:
        # 核心修复：根据 is_blocked 动态生成标题和动作提示
        if is_blocked:
            subject = "【高危拦截】您的家人可能正在遭遇诈骗"
            action_text = "系统已自动阻断该交易。请立即联系家人，提醒其切勿上当受骗！"
        else:
            subject = "【高危转账】您的家人可能已向骗子转账"
            action_text = "尽管系统发出强力警告，该笔交易已被强制汇出。请立即联系家人，确认其安全并报警！"

        body = f"""【AI反诈盾 - 高危交易预警】

您好：
您的家人（账号尾号：{masked_phone[-4:]}）正在发起一笔转账。
系统检测到该笔交易与【{scam_type}】诈骗特征高度吻合。

【转账附言】：
{user_text if user_text else '无附言'}

{action_text}"""

    message = MIMEText(body, 'plain', 'utf-8')
    # formataddr 必须接收元组 (显示名, 地址)；外层括号不可少，否则会被解包成两个实参
    message['From'] = formataddr(("AI 反诈盾", sender))
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