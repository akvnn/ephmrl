from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker,
    AsyncEngine,
)
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator

Base = declarative_base()


class DatabaseManager:
    def __init__(self):
        self.engine: AsyncEngine | None = None
        self.session_maker: async_sessionmaker | None = None

    async def init(self, database_url: str):
        """Initialize database connection pool"""
        self.engine = create_async_engine(
            database_url,
            echo=False,
            pool_pre_ping=True,
            pool_size=20,
            max_overflow=10,
            pool_recycle=3600,
        )

        self.session_maker = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

    async def close(self):
        """Close database connection pool"""
        if self.engine:
            await self.engine.dispose()

    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        if self.session_maker is None:
            raise Exception("Database not initialized")

        async with self.session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()


db_manager = DatabaseManager()
