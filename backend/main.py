from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
import logging

from config import settings
from database import connect_to_mongo, close_mongo_connection, ping_database
from routers import auth, expenses, income, projects, proposals, documents

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    logger.info("Starting HOA OpsAI Backend...")
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down HOA OpsAI Backend...")
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title="HOA OpsAI Backend",
    description="Backend API for HOA Operations AI Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api/v1")
app.include_router(income.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(proposals.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")


@app.get("/healthz")
async def health_check():
    """Health check endpoint with database connection status."""
    db_connected = await ping_database()
    
    return {
        "status": "ok",
        "database": "connected" if db_connected else "disconnected",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "HOA OpsAI Backend API",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True if settings.app_env == "development" else False
    )