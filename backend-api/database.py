import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# 从 Vercel 环境变量读取数据库地址
# (上面步骤如果选了 Custom Prefix 为 STORAGE，变量名可能是 STORAGE_URL，这里做一个兼容)
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("STORAGE_URL")

if not DATABASE_URL:
    # 本地开发时的备用 sqlite 数据库 (需要 pip install aiosqlite)
    DATABASE_URL = "sqlite+aiosqlite:///./local.db"

# Neon 默认给的是 postgresql:// 开头的连接串，如果是异步驱动，需要改成 postgresql+asyncpg://
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 创建异步引擎
engine = create_async_engine(DATABASE_URL, echo=False, future=True)

# 初始化数据库表
async def init_db():
    async with engine.begin() as conn:
        # 自动根据 models 里的定义创建表
        await conn.run_sync(SQLModel.metadata.create_all)

# 依赖注入用的获取 session 的方法
async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session