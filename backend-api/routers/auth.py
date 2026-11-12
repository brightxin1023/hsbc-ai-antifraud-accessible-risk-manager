from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
import hashlib

from database import get_session
from models import User

router = APIRouter(tags=["auth"])

# 前端传过来的数据格式
class RegisterRequest(BaseModel):
    phone: str
    password: str

class LoginRequest(BaseModel):
    phone: str
    password: str

# 简单的密码哈希函数 (用于演示，真实生产建议用 bcrypt)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register")
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    # 1. 查重：看看手机号是否已经注册
    result = await session.execute(select(User).where(User.phone == data.phone))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="该手机号已被注册")

    # 2. 插入新用户到数据库
    new_user = User(
        phone=data.phone, 
        password_hash=hash_password(data.password)
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return {"message": "注册成功", "user_id": new_user.id}

@router.post("/login")
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    # 1. 查库
    result = await session.execute(select(User).where(User.phone == data.phone))
    user = result.scalars().first()

    # 2. 验证密码
    if not user or user.password_hash != hash_password(data.password):
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    return {"message": "登录成功", "user_id": user.id}