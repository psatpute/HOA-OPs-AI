import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException

from config import settings


# Allowed file extensions for proposals
ALLOWED_EXTENSIONS = {
    "pdf": "application/pdf",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "doc": "application/msword",
    "xls": "application/vnd.ms-excel"
}


def get_file_extension(filename: str) -> str:
    """
    Extract file extension from filename.
    
    Args:
        filename: Original filename
        
    Returns:
        File extension (lowercase, without dot)
    """
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def validate_file(file: UploadFile) -> None:
    """
    Validate uploaded file size and type.
    
    Args:
        file: Uploaded file
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check if file exists
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Check file extension
    extension = get_file_extension(file.filename)
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS.keys())}"
        )
    
    # Note: File size validation happens during read in save_file function


async def save_file(file: UploadFile, subdirectory: str = "proposals") -> str:
    """
    Save uploaded file to disk and return the file URL.
    
    Args:
        file: Uploaded file
        subdirectory: Subdirectory within upload_dir (e.g., 'proposals', 'documents')
        
    Returns:
        Relative file URL path
        
    Raises:
        HTTPException: If file save fails or exceeds size limit
    """
    # Validate file
    validate_file(file)
    
    # Create upload directory if it doesn't exist
    upload_path = Path(settings.upload_dir) / subdirectory
    upload_path.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}.{extension}"
    file_path = upload_path / unique_filename
    
    # Save file with size validation
    try:
        file_size = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(8192):  # Read in 8KB chunks
                file_size += len(chunk)
                
                # Check if file size exceeds limit
                if file_size > settings.max_file_size:
                    # Remove partial file
                    buffer.close()
                    if file_path.exists():
                        file_path.unlink()
                    raise HTTPException(
                        status_code=400,
                        detail=f"File size exceeds maximum allowed size of {settings.max_file_size / (1024 * 1024):.1f}MB"
                    )
                
                buffer.write(chunk)
        
        # Return relative URL path
        return f"/uploads/{subdirectory}/{unique_filename}"
    
    except HTTPException:
        raise
    except Exception as e:
        # Clean up file if it was created
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")


def delete_file(file_url: str) -> bool:
    """
    Delete a file from disk.
    
    Args:
        file_url: Relative file URL (e.g., '/uploads/proposals/abc123.pdf')
        
    Returns:
        True if file was deleted, False otherwise
    """
    try:
        # Remove leading slash and construct full path
        relative_path = file_url.lstrip("/")
        file_path = Path(relative_path)
        
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return True
    except Exception:
        pass
    
    return False


def get_file_size_mb(file_path: Path) -> float:
    """
    Get file size in megabytes.
    
    Args:
        file_path: Path to file
        
    Returns:
        File size in MB
    """
    if file_path.exists():
        return file_path.stat().st_size / (1024 * 1024)
    return 0.0