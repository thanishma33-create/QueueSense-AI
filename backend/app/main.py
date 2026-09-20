from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import engine, Base
from app.utils.logging_config import setup_logging, logger
from app.routers import (
    auth_router,
    departments_router,
    patients_router,
    queue_router,
    waiting_time_router,
    priority_router,
    analytics_router,
    websocket_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifespan handler."""
    setup_logging()
    logger.info("Initializing QueueSense AI database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    yield
    logger.info("QueueSense AI Backend shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Intelligent Hospital Waiting-Time & Patient Flow System Backend API for Government Outpatient Departments. "
        "Hackathon Theme: Tech for a Better Tomorrow. "
        "Clinical Governance Notice: Operational queue flow and transparent estimation only; "
        "clinical priority is strictly governed by authorized medical personnel."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# Configure CORS for React/Vite frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Standardized Consistent Error Responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": f"HTTP_{exc.status_code}",
                "message": exc.detail
            }
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join([str(l) for l in err.get("loc", [])])
        msg = err.get("msg", "Validation error")
        errors.append(f"{loc}: {msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "; ".join(errors),
                "details": exc.errors()
            }
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please check server logs."
            }
        }
    )


# Root Health & Welcome Endpoint
@app.get("/", tags=["Health"])
def root():
    return {
        "project": settings.PROJECT_NAME,
        "status": "online",
        "theme": "Tech for a Better Tomorrow",
        "version": "1.0.0",
        "docs_url": "/docs",
        "api_v1_prefix": settings.API_V1_STR,
        "governance": "Clinical prioritization strictly governed by authorized healthcare professionals.",
    }



# Register API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(departments_router, prefix=settings.API_V1_STR)
app.include_router(patients_router, prefix=settings.API_V1_STR)
app.include_router(queue_router, prefix=settings.API_V1_STR)
app.include_router(waiting_time_router, prefix=settings.API_V1_STR)
app.include_router(priority_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)
