from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from database import get_session
from models import User

router = APIRouter(tags=["auth"])

class RegisterRequest(BaseModel):
    phone: str
    password: str

class LoginRequest(BaseModel):
    phone: str
    password: str

@router.post("/register")
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    # 1. 查重
    result = await session.execute(select(User).where(User.phone == data.phone))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="该手机号已被注册")

    # 2. 插入新用户（此处存明文密码，为兼容语音提示提取后四位）
    new_user = User(phone=data.phone, password=data.password)
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
    if not user or user.password != data.password:
        raise HTTPException(status_code=401, detail="手机号或密码错误")

    return {"message": "登录成功", "user_id": user.id}

@router.get("/voice_hint")
async def get_voice_hint(phone: str, session: AsyncSession = Depends(get_session)):
    """语音提示接口：提取密码后四位掩码"""
    result = await session.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="该手机号未注册")
        
    pwd = user.password
    last_four = pwd[-4:] if len(pwd) >= 4 else pwd
    
    # 构造掩码（比如 "2003" 变成 "20__"）
    if len(last_four) == 4:
        hint = f"{last_four[:2]}__"
    elif len(last_four) == 3:
        hint = f"{last_four[:1]}__"
    else:
        hint = "__"
        
    return {"hint": hint}