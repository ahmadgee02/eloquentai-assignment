from fastapi import APIRouter

from .auth import router as auth_router
from .chat import router as chat_router
from .health import router as health_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(chat_router)
router.include_router(health_router)