from app.routers.auth import router as auth_router
from app.routers.departments import router as departments_router
from app.routers.patients import router as patients_router
from app.routers.queue import router as queue_router
from app.routers.waiting_time import router as waiting_time_router
from app.routers.priority import router as priority_router
from app.routers.analytics import router as analytics_router
from app.routers.websocket import router as websocket_router

__all__ = [
    "auth_router",
    "departments_router",
    "patients_router",
    "queue_router",
    "waiting_time_router",
    "priority_router",
    "analytics_router",
    "websocket_router",
]
