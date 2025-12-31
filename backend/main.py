from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from datetime import datetime
import logging
import os

from config import settings
from database import connect_to_mongo, close_mongo_connection, ping_database
from routers import auth, expenses, income, projects, proposals, documents, dashboard, ai
from auth.middleware import get_current_user
from models.user import UserInDB
from fastapi import Depends

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
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(ai.router)  # AI router without /api/v1 prefix


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


@app.get("/api/v1/files/{file_type}/{filename}")
async def download_file(
    file_type: str,
    filename: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Download uploaded files (proposals, documents, receipts).
    
    - **file_type**: Type of file (proposals, documents, receipts)
    - **filename**: Name of the file to download
    
    Requires authentication. Returns 404 if file not found.
    """
    # Validate file type
    allowed_types = ["proposals", "documents", "receipts"]
    if file_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Must be one of: {', '.join(allowed_types)}"
        )
    
    # Construct file path
    file_path = os.path.join(settings.upload_dir, file_type, filename)
    
    # Check if file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Determine media type based on file extension
    extension = filename.split('.')[-1].lower()
    media_types = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png'
    }
    media_type = media_types.get(extension, 'application/octet-stream')
    
    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=filename
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True if settings.app_env == "development" else False
    )