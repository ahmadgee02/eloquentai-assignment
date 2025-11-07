from typing import Any

import fastapi
from fastapi import APIRouter, Depends, FastAPI
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from .models import *  # noqa: F403
from .config import (
    DatabaseSettings,
    OpenAISettings,
    EnvironmentOption,
    EnvironmentSettings,
    PineconeSettings,
    OllamaSettings
)

# -------------- application --------------
def create_application(
    router: APIRouter,
    settings: (
        DatabaseSettings
        | OpenAISettings
        | EnvironmentSettings
        | PineconeSettings
        | OllamaSettings
    ),
    **kwargs: Any,
) -> FastAPI:
    """Creates and configures a FastAPI application based on the provided settings.

    This function initializes a FastAPI application and configures it with various settings
    and handlers based on the type of the `settings` object provided.

    Parameters
    ----------
    router : APIRouter
        The APIRouter object containing the routes to be included in the FastAPI application.

    settings
        An instance representing the settings for configuring the FastAPI application.
        It determines the configuration applied:

        - AppSettings: Configures basic app metadata like name, description, contact, and license info.
        - DatabaseSettings: Adds event handlers for initializing database tables during startup.
        - EnvironmentSettings: Conditionally sets documentation URLs and integrates custom routes for API documentation
          based on the environment type.

    **kwargs
        Additional keyword arguments passed directly to the FastAPI constructor.

    Returns
    -------
    FastAPI
        A fully configured FastAPI application instance.

    The function configures the FastAPI application with different features and behaviors
    based on the provided settings. It includes setting up database connections, Redis pools
    for caching, queue, and rate limiting, client-side caching, and customizing the API documentation
    based on the environment settings.
    """

    if isinstance(settings, EnvironmentSettings):
        kwargs.update({"docs_url": None, "redoc_url": None, "openapi_url": None})


    application = FastAPI(**kwargs)
    application.include_router(router)

    # Define the origins that are allowed to access the API
    origins = [
        "http://localhost:3000",  # your frontend dev server
        "https://your-frontend.com",  # your deployed frontend
        "*"  # <-- allow all origins (use only in dev)
    ]

    # Add CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,  # list of allowed origins or ["*"]
        allow_credentials=True,
        allow_methods=["*"],    # or restrict to ["GET", "POST", ...]
        allow_headers=["*"],    # or restrict to ["Authorization", "Content-Type", ...]
    )

    if isinstance(settings, EnvironmentSettings):
        if settings.ENVIRONMENT != EnvironmentOption.PRODUCTION:
            docs_router = APIRouter()

            @docs_router.get("/docs", include_in_schema=False)
            async def get_swagger_documentation() -> fastapi.responses.HTMLResponse:
                return get_swagger_ui_html(openapi_url="/openapi.json", title="docs")

            @docs_router.get("/redoc", include_in_schema=False)
            async def get_redoc_documentation() -> fastapi.responses.HTMLResponse:
                return get_redoc_html(openapi_url="/openapi.json", title="docs")

            @docs_router.get("/openapi.json", include_in_schema=False)
            async def openapi() -> dict[str, Any]:
                out: dict = get_openapi(title=application.title, version=application.version, routes=application.routes)
                return out

            application.include_router(docs_router)

    return application