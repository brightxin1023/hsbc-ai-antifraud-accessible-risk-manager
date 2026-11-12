import os
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("STORAGE_URL")

if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./local.db"
    connect_args = {}
else:
    # 1. 兼容 postgres:// 和 postgresql:// 前缀，统一转为异步驱动
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

    # 2. 清理 asyncpg 不支持的 libpq 查询参数（如 channel_binding、sslmode）
    parsed = urlparse(DATABASE_URL)
    qs = parse_qs(parsed.query)
    for key in ["sslmode", "channel_binding", "options"]:
        qs.pop(key, None)
    
    new_query = urlencode(qs, doseq=True)
    DATABASE_URL = urlunparse(parsed._replace(query=new_query))

    # 3. 在 connect_args 中单独指定 SSL 要求
    connect_args = {"ssl": "require"}

# 创建异步引擎
engine = create_async_engine(
    DATABASE_URL, 
    echo=False, 
    future=True,
    connect_args=connect_args
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session