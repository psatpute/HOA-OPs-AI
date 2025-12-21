from datetime import datetime
from typing import Optional, List
from bson import ObjectId

from database import database
from models.document import DocumentCreate, DocumentUpdate, DocumentInDB


async def create_document(
    document_data: DocumentCreate,
    user_id: str,
    file_url: str,
    file_type: str,
    file_size: str
) -> DocumentInDB:
    """
    Create a new document in the database.
    
    Args:
        document_data: Document creation data
        user_id: ID of user creating the document
        file_url: URL to uploaded file
        file_type: File type (e.g., pdf, docx)
        file_size: File size (e.g., "2.4 MB")
        
    Returns:
        Created document from database
    """
    documents_collection = database.documents
    
    document_dict = {
        "title": document_data.title,
        "category": document_data.category,
        "description": document_data.description,
        "fileUrl": file_url,
        "fileType": file_type,
        "fileSize": file_size,
        "uploadedBy": user_id,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "archivedAt": None
    }
    
    result = await documents_collection.insert_one(document_dict)
    document_dict["_id"] = str(result.inserted_id)
    
    return DocumentInDB(**document_dict)


async def get_documents(
    category: Optional[str] = None,
    search: Optional[str] = None,
    archived: bool = False,
    limit: int = 50,
    skip: int = 0
) -> tuple[List[DocumentInDB], int]:
    """
    Get documents with optional filtering.
    
    Args:
        category: Filter by category
        search: Search in title and description (case-insensitive)
        archived: Include archived documents
        limit: Maximum number of results
        skip: Number of results to skip (for pagination)
        
    Returns:
        Tuple of (list of documents, total count)
    """
    documents_collection = database.documents
    
    # Build filter query
    query = {}
    
    # Exclude archived by default
    if not archived:
        query["archivedAt"] = None
    
    if category:
        query["category"] = category
    
    if search:
        # Search in title and description
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await documents_collection.count_documents(query)
    
    # Get documents with pagination, sorted by createdAt descending
    cursor = documents_collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    documents = []
    
    async for document_doc in cursor:
        document_doc["_id"] = str(document_doc["_id"])
        documents.append(DocumentInDB(**document_doc))
    
    return documents, total


async def get_document_by_id(document_id: str) -> Optional[DocumentInDB]:
    """
    Get document by ID.
    
    Args:
        document_id: Document ID
        
    Returns:
        Document if found, None otherwise
    """
    documents_collection = database.documents
    
    try:
        document_doc = await documents_collection.find_one({"_id": ObjectId(document_id)})
        
        if document_doc:
            document_doc["_id"] = str(document_doc["_id"])
            return DocumentInDB(**document_doc)
    except Exception:
        pass
    
    return None


async def update_document(document_id: str, document_data: DocumentUpdate) -> Optional[DocumentInDB]:
    """
    Update document by ID.
    
    Args:
        document_id: Document ID
        document_data: Document update data (partial)
        
    Returns:
        Updated document if found, None otherwise
    """
    documents_collection = database.documents
    
    try:
        # Build update dict with only provided fields
        update_dict = {}
        if document_data.title is not None:
            update_dict["title"] = document_data.title
        if document_data.category is not None:
            update_dict["category"] = document_data.category
        if document_data.description is not None:
            update_dict["description"] = document_data.description
        
        # Always update updatedAt
        update_dict["updatedAt"] = datetime.utcnow()
        
        if not update_dict or len(update_dict) == 1:  # Only updatedAt
            # No fields to update
            return await get_document_by_id(document_id)
        
        result = await documents_collection.find_one_and_update(
            {"_id": ObjectId(document_id)},
            {"$set": update_dict},
            return_document=True
        )
        
        if result:
            result["_id"] = str(result["_id"])
            return DocumentInDB(**result)
    except Exception:
        pass
    
    return None


async def archive_document(document_id: str) -> bool:
    """
    Archive document (soft delete) by setting archivedAt timestamp.
    
    Args:
        document_id: Document ID
        
    Returns:
        True if archived successfully, False otherwise
    """
    documents_collection = database.documents
    
    try:
        result = await documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {"$set": {"archivedAt": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception:
        return False