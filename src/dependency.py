from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator, cast
from src.configuration import Settings
from src.database import DatabaseManager


async def get_settings(request: Request) -> Settings:
    """Get settings from lifespan state"""
    settings = cast(Settings, request.state.settings)
    return settings


async def get_db(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Get database session from lifespan state"""
    db = cast(DatabaseManager, request.state.db)
    async for session in db.get_session():
        yield session
