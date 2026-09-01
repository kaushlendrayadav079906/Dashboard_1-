from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class NotFoundException(Exception):
    def __init__(self, detail: str):
        self.detail = detail

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(NotFoundException)
    async def not_found_exception_handler(request: Request, exc: NotFoundException):
        return JSONResponse(
            status_code=404,
            content={"detail": exc.detail},
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Global exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"},
        )
