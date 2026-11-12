"""AI 反诈盾后端入口。

应用工厂与路由挂载处：统一以 /api 为前缀暴露检测、问答、告警与鉴权能力；
CORS 全开仅用于黑客松演示阶段的跨域联调，生产环境需收紧 allow_origins。
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from mangum import Mangum

from routers import detect, qa, alert, auth
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动时执行：自动创建数据库表"""
    print("正在初始化数据库...")
    await init_db()
    print("数据库初始化完成。")
    yield

app = FastAPI(title="AI 反诈盾后端 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
@app.get("/")
def read_root():
    """健康检查：确认后端服务已启动。"""
    return {"message": "AI 反诈盾后端启动成功！"}

# 路由统一挂载
app.include_router(detect.router, prefix="/api", tags=["检测"])
app.include_router(qa.router, prefix="/api", tags=["问答"])
app.include_router(alert.router, prefix="/api", tags=["告警"])
app.include_router(auth.router, prefix="/api/auth", tags=["鉴权"])

# Vercel Serverless 入口
handler = Mangum(app)