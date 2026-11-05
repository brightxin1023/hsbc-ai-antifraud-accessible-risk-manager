from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import detect, qa, alert

app = FastAPI(title="AI 反诈盾后端 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AI 反诈盾后端启动成功！"}

# 挂载路由模块（这就是解耦的精髓）
app.include_router(detect.router, prefix="/api", tags=["检测"])
app.include_router(qa.router, prefix="/api", tags=["问答"])
app.include_router(alert.router, prefix="/api", tags=["告警"])