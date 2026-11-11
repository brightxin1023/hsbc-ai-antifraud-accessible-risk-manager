"""AI 反诈盾后端入口。

应用工厂与路由挂载处：统一以 /api 为前缀暴露检测、问答、告警与鉴权能力；
CORS 全开仅用于黑客松演示阶段的跨域联调，生产环境需收紧 allow_origins。
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import detect, qa, alert
from routers import detect, qa, alert, auth

app = FastAPI(title="AI 反诈盾后端 API")

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

# 路由统一挂载：detect/qa/alert 挂 /api 前缀，auth 挂 /api/auth，
# 与前端 services/api.ts 中 BASE_URL + 路径严格对应，避免真机联调 404
app.include_router(detect.router, prefix="/api", tags=["检测"])
app.include_router(qa.router, prefix="/api", tags=["问答"])
app.include_router(alert.router, prefix="/api", tags=["告警"])
app.include_router(auth.router, prefix="/api/auth", tags=["鉴权"])

from mangum import Mangum
handler = Mangum(app)