import asyncio
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse

from config import settings
from database import SessionLocal, engine
from models import Base
from routers import (
    accessibility,
    admin,
    airports,
    auth,
    flights,
    identity,
    imu,
    navigation,
    positions,
    push,
    replay,
    sessions,
    touchpoints,
)
from services.push_worker import run_push_worker
from services.flight_simulator import run_flight_simulator


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    push_task = asyncio.create_task(run_push_worker(SessionLocal))
    sim_task = asyncio.create_task(run_flight_simulator(SessionLocal))
    yield
    push_task.cancel()
    sim_task.cancel()


app = FastAPI(title="SkyGuide", version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public routes — no auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# VAPID public key is public (no auth), but lives under /api/push
app.include_router(push.router, prefix="/api", tags=["push"])

# WebSocket route — mounted at root so nginx /ws/ proxy hits /ws/positions/{id}
# Also accessible via /api/ws/positions/{id} for Vite dev proxy
app.include_router(positions.router, tags=["positions"])
app.include_router(positions.router, prefix="/api", tags=["positions"])

# Protected routes — all require valid JWT
for r in [
    airports,
    navigation,
    sessions,
    imu,
    identity,
    touchpoints,
    flights,
    accessibility,
    replay,
    admin,
]:
    app.include_router(r.router, prefix="/api", tags=[r.__name__.split(".")[-1]])

# Serve uploaded map images
_uploads_dir = Path(__file__).resolve().parent / "uploads"
_uploads_dir.mkdir(exist_ok=True)
app.mount("/api/uploads", StaticFiles(directory=str(_uploads_dir)), name="uploads")

# Serve frontend build (when nginx is not available)
_frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if _frontend_dist.is_dir():
    app.mount("/assets", StaticFiles(directory=str(_frontend_dist / "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = _frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(_frontend_dist / "index.html"))
