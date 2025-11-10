from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.configuration import Settings
from src.endpoints.system import router as system_router
from starlette.middleware.sessions import SessionMiddleware
from src.configuration import config, Environment


def lifecycle_provider(settings: Settings):
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.settings = settings

        yield

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
    app.add_middleware(SessionMiddleware, secret_key=config.SESSION_SECRET)
    return app
