from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator
from src.configuration import Settings


async def get_settings(request: Request) -> Settings:
    """Get settings from app state"""
    return request.app.state.settings


async def get_db(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Get database session from app state"""
    async for session in request.app.state.db.get_session():
        yield session
