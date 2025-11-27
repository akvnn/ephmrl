from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

# from starlette.middleware.sessions import SessionMiddleware
from src.database import db_manager
from src.endpoints.system import router as system_router
from src.endpoints.auth import router as auth_router
from src.endpoints.user import router as user_router
from src.endpoints.organization import router as organization_router
from src.endpoints.project import router as project_router
from src.endpoints.llm import router as llm_router
from src.endpoints.listed_llm import router as listed_llm_router
from src.endpoints.admin import router as admin_router
from src.endpoints.plugin import router as plugin_router
from src.endpoints.inference import router as inference_router
from src.configuration import Environment, Settings


def lifecycle_provider(settings: Settings):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Startup
        await db_manager.init(settings.DATABASE_URL)
        logger.info("Database connection pool initialized")

        yield {
            "settings": settings,
            "db": db_manager,
        }

        # Shutdown
        await db_manager.close()
        logger.info("Database connection pool closed")

    return lifespan


def create_app(settings: Settings = None):
    settings = settings or Settings()
    lifespan = lifecycle_provider(settings)

    is_production = settings.ENVIRONMENT == Environment.PRODUCTION

    app = FastAPI(
        lifespan=lifespan,
        title="ephmrl",
        version="0.1.0",
        docs_url="/docs" if not is_production else None,
        redoc_url="/redoc" if not is_production else None,
        openapi_url="/openapi.json" if not is_production else None,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(system_router)
    app.include_router(auth_router)
    app.include_router(user_router)
    app.include_router(organization_router)
    app.include_router(project_router)
    app.include_router(llm_router)
    app.include_router(listed_llm_router)
    app.include_router(admin_router)
    app.include_router(plugin_router)
    app.include_router(inference_router)

    # app.add_middleware(SessionMiddleware, secret_key=config.SESSION_SECRET)
    return app
