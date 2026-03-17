from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.ingest import router as ingest_router
from app.api.sessions import router as sessions_router
from app.config import get_settings
from app.db.init_db import init_db

settings = get_settings()
app = FastAPI(title=settings.app_name)
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": str(exc), "details": {}}},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException):
    message = exc.detail if isinstance(exc.detail, str) else "Request failed"
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "http_error", "message": message, "details": {}}},
    )


app.include_router(health_router)
app.include_router(sessions_router, prefix=settings.api_prefix)
app.include_router(ingest_router, prefix=settings.api_prefix)
