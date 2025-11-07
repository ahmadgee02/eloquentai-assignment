
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from starlette import status
from ..logger import logging


router = APIRouter(prefix="/health", tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/", summary="Health Check Endpoint")
def health():
    logger.info("Health check endpoint called.")
    
    return JSONResponse(
        {"status": "ok"},
        status_code=status.HTTP_200_OK,
    )