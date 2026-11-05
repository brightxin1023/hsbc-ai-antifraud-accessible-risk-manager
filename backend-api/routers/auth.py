import json
import os
from fastapi import APIRouter, HTTPException
from schemas import RegisterRequest, LoginRequest

router = APIRouter()
USERS_FILE = "users.json"

def read_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def write_users(users):
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, ensure_ascii=False, indent=4)

@router.post("/register")
def register(request: RegisterRequest):
    users = read_users()
    # 检查手机号是否已注册
    for u in users:
        if u["phone"] == request.phone:
            raise HTTPException(status_code=400, detail="该手机号已注册")
    
    # 存入 JSON（注：生产环境密码必须加密，这里为了演示存明文）
    users.append({"phone": request.phone, "password": request.password})
    write_users(users)
    return {"status": "success", "message": "注册成功"}

@router.post("/login")
def login(request: LoginRequest):
    users = read_users()
    
    # 1. 先检查手机号是否存在
    user_exists = any(u["phone"] == request.phone for u in users)
    
    if not user_exists:
        # 如果是黑客，这里返回 404 会暴露信息。但在黑客松里，为了演示体验，我们返回 404
        raise HTTPException(status_code=404, detail="该手机号未注册")
        
    # 2. 手机号存在，检查密码
    for u in users:
        if u["phone"] == request.phone and u["password"] == request.password:
            return {"status": "success", "message": "登录成功"}
            
    raise HTTPException(status_code=401, detail="密码错误，请重试")