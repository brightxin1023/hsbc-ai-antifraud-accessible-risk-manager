import json
import os
from fastapi import APIRouter, HTTPException
from schemas import RegisterRequest, LoginRequest

router = APIRouter()
USERS_FILE = "users.json"

def read_users():
    """读取本地用户表；文件不存在时返回空列表，让注册接口从空表开始而不崩溃。"""
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_users(users):
    """全量落盘用户表；ensure_ascii=False 保留中文可读，indent=4 便于人工排查。"""
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=4)

@router.post("/register")
def register(request: RegisterRequest):
    """注册接口：先查重再落盘，保证手机号唯一、避免重复写入。

    参数:
        request: 校验后的手机号与密码。

    返回:
        dict: 成功时 status=success；手机号已存在时抛 400。
    """
    users = read_users()
    # 先查重：在写入前拦截重复手机号，防止用户表出现多条同号记录
    for u in users:
        if u["phone"] == request.phone:
            raise HTTPException(status_code=400, detail="该手机号已注册")
    
    # 演示环境明文存密码；生产必须改为哈希加盐，此处不做真实鉴权
    users.append({"phone": request.phone, "password": request.password})
    write_users(users)
    return {"status": "success", "message": "注册成功"}

@router.post("/login")
def login(request: LoginRequest):
    """登录接口：把“账号不存在”与“密码错误”拆成不同状态码，便于前端区分提示。

    参数:
        request: 校验后的手机号与密码。

    返回:
        dict: 成功时 status=success；账号不存在抛 404，密码错误抛 401。
    """
    users = read_users()
    
    # 1. 先查账号存在性，避免把“未注册”误判成“密码错误”
    user_exists = any(u["phone"] == request.phone for u in users)
    
    if not user_exists:
        # 生产上“账号是否存在”不应暴露给未登录者；黑客松为演示体验保留 404
        raise HTTPException(status_code=404, detail="该手机号未注册")
        
    # 2. 账号存在后再比对密码，返回 401 表示凭据错误而非账号问题
    for u in users:
        if u["phone"] == request.phone and u["password"] == request.password:
            return {"status": "success", "message": "登录成功"}
            
    raise HTTPException(status_code=401, detail="密码错误，请重试")

@router.get("/voice_hint")
def get_voice_hint(phone: str):
    """语音提示接口：只回显密码片段掩码，帮助用户想起密码但绝不泄露完整密码。

    参数:
        phone: 待提示的手机号。

    返回:
        dict: 掩码后的 hint，例如密码 2003 返回 "20__"。
    """
    users = read_users()
    for u in users:
        if u["phone"] == phone:
            pwd = u["password"]
            # 取末四位作提示（不足四位则全取），只暴露片段、避免泄露完整口令
            last_four = pwd[-4:] if len(pwd) >= 4 else pwd
            
            # 只回显前 1~2 位 + 下划线占位，确保读屏/明码场景下也不完整暴露
            if len(last_four) == 4:
                hint = f"{last_four[:2]}__"
            elif len(last_four) == 3:
                hint = f"{last_four[:1]}__"
            else:
                hint = "__"
                
            return {"hint": hint}
            
    raise HTTPException(status_code=404, detail="该手机号未注册")