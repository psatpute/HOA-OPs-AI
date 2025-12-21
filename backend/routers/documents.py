from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from typing import Optional
from pathlib import Path

from models.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentListResponse
)
from crud import document as document_crud
from auth.middleware import get_current_user
from models.user import UserInDB
from utils.file_upload import save_file, get_file_extension

router = APIRouter(prefix="/documents", tags=["documents"])


def format_file_size(size_bytes: int) -> str:
    """
    Format file size in bytes to human-readable string.
    
    Args:
        size_bytes: File size in bytes
        
    Returns:
        Formatted file size (e.g., "2.4 MB")
    """
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


@router.post("", response_model=DocumentResponse, status_code=201)
async def create_document(
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Upload a new document with metadata.
    
    Accepts multipart form-data with the following fields:
    - **title**: Document title (required)
    - **category**: Document category (required, options: Contract/Meeting Minutes/Financial Report/Other)
    - **description**: Document description (optional)
    - **file**: Document file (required, max 10MB, PDF/JPG/PNG/DOCX/XLSX)
    
    Returns the created document with file URL.
    """
    try:
        # Handle file upload
        file_url = await save_file(file, subdirectory="documents")
        
        # Get file metadata
        file_extension = get_file_extension(file.filename)
        
        # Calculate file size (read file to get size)
        file_path = Path(file_url.lstrip("/"))
        file_size_bytes = file_path.stat().st_size if file_path.exists() else 0
        file_size = format_file_size(file_size_bytes)
        
        # Create document data
        document_data = DocumentCreate(
            title=title,
            category=category,
            description=description
        )
        
        # Create document in database
        document = await document_crud.create_document(
            document_data,
            current_user.id,
            file_url,
            file_extension,
            file_size
        )
        
        return DocumentResponse(
            id=document.id,
            title=document.title,
            category=document.category,
            description=document.description,
            fileUrl=document.fileUrl,
            fileType=document.fileType,
            fileSize=document.fileSize,
            uploadedBy=document.uploadedBy,
            createdAt=document.createdAt,
            updatedAt=document.updatedAt,
            archivedAt=document.archivedAt
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create document: {str(e)}")


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    archived: bool = Query(False, description="Include archived documents"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    List all documents with optional filtering.
    
    Supports filtering by:
    - **category**: Exact category match
    - **search**: Search in title and description (case-insensitive)
    - **archived**: Include archived documents (default: false)
    
    Results are paginated and sorted by creation date (newest first).
    """
    try:
        documents, total = await document_crud.get_documents(
            category=category,
            search=search,
            archived=archived,
            limit=limit,
            skip=skip
        )
        
        document_responses = [
            DocumentResponse(
                id=doc.id,
                title=doc.title,
                category=doc.category,
                description=doc.description,
                fileUrl=doc.fileUrl,
                fileType=doc.fileType,
                fileSize=doc.fileSize,
                uploadedBy=doc.uploadedBy,
                createdAt=doc.createdAt,
                updatedAt=doc.updatedAt,
                archivedAt=doc.archivedAt
            )
            for doc in documents
        ]
        
        return DocumentListResponse(documents=document_responses, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve documents: {str(e)}")


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Get a single document by ID.
    
    Returns 404 if document not found.
    """
    document = await document_crud.get_document_by_id(document_id)
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentResponse(
        id=document.id,
        title=document.title,
        category=document.category,
        description=document.description,
        fileUrl=document.fileUrl,
        fileType=document.fileType,
        fileSize=document.fileSize,
        uploadedBy=document.uploadedBy,
        createdAt=document.createdAt,
        updatedAt=document.updatedAt,
        archivedAt=document.archivedAt
    )


@router.patch("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: str,
    document_data: DocumentUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Update document metadata.
    
    All fields are optional. Only provided fields will be updated.
    
    - **title**: Document title
    - **category**: Document category (Contract/Meeting Minutes/Financial Report/Other)
    - **description**: Document description
    
    Note: File cannot be updated via this endpoint. To change the file,
    archive this document and create a new one.
    
    Returns 404 if document not found.
    """
    try:
        document = await document_crud.update_document(document_id, document_data)
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return DocumentResponse(
            id=document.id,
            title=document.title,
            category=document.category,
            description=document.description,
            fileUrl=document.fileUrl,
            fileType=document.fileType,
            fileSize=document.fileSize,
            uploadedBy=document.uploadedBy,
            createdAt=document.createdAt,
            updatedAt=document.updatedAt,
            archivedAt=document.archivedAt
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update document: {str(e)}")


@router.delete("/{document_id}")
async def archive_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Archive document (soft delete).
    
    Sets the archivedAt timestamp. Archived documents are excluded from
    default list queries unless explicitly requested.
    
    Returns 404 if document not found.
    """
    success = await document_crud.archive_document(document_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document archived successfully"}