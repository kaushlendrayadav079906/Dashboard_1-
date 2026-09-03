from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

class NotFoundException(Exception):
    def __init__(self, detail: str):
        self.detail = detail

class AuthException(Exception):
    def __init__(self, detail: str):
        self.detail = detail

class UnauthenticatedException(AuthException):
    pass

class InvalidAuthException(AuthException):
    pass

class ForbiddenException(AuthException):
    pass

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(UnauthenticatedException)
    async def unauthenticated_exception_handler(request: Request, exc: UnauthenticatedException):
        return JSONResponse(
            status_code=401,
            content={"detail": exc.detail},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(ForbiddenException)
    async def forbidden_exception_handler(request: Request, exc: ForbiddenException):
        return JSONResponse(
            status_code=403,
            content={"detail": exc.detail},
        )

    @app.exception_handler(InvalidAuthException)
    async def invalid_auth_exception_handler(request: Request, exc: InvalidAuthException):
        return JSONResponse(
            status_code=403,
            content={"detail": exc.detail},
        )

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
