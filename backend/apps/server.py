"""
FastAPI application server.
"""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from apps.v1.api.auth.view import router as auth_router
from apps.v1.api.course.view import router as course_router
from apps.v1.api.student.view import router as student_router
from apps.v1.api.credentials.view import credentials_router
from config.cors import get_cors_config
from core.utils import constant_variable

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all incoming requests."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        logger.info(f"📥 Incoming request: {request.method} {request.url.path}")
        logger.info(f"   Query params: {dict(request.query_params)}")
        logger.info(f"   Client: {request.client.host if request.client else 'unknown'}")
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            
            logger.info(
                f"📤 Response: {request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.3f}s"
            )
            
            return response
        except Exception as exc:
            process_time = time.time() - start_time
            logger.error(
                f"❌ Error: {request.method} {request.url.path} - "
                f"Exception: {str(exc)} - "
                f"Time: {process_time:.3f}s",
                exc_info=True
            )
            raise


app = FastAPI(
    title="LMS Use Case Demo",
    description="Created API for the LMS Use Case Pitch",
    version="0.1.0",
)

# Add request logging middleware (before CORS)
app.add_middleware(RequestLoggingMiddleware)

# CORS configuration
cors_config = get_cors_config()
app.add_middleware(CORSMiddleware, **cors_config)

# Include routers
app.include_router(
    auth_router,
    prefix=f"/api{constant_variable.API_V1_PREFIX}/auth",
    tags=["auth"],
)

app.include_router(
    course_router,
    prefix=f"/api{constant_variable.API_V1_PREFIX}/course",
    tags=["course"],
)

app.include_router(
    student_router,
    prefix=f"/api{constant_variable.API_V1_PREFIX}/student",
    tags=["student"],
)

app.include_router(
    credentials_router,
    prefix=f"/api{constant_variable.API_V1_PREFIX}/credentials",
    tags=["credentials"],
)



@app.get("/")
async def root():
    return {"message": "Connected Successfully Backend Server is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
