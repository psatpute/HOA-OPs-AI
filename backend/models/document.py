from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class DocumentBase(BaseModel):
    """Base document model with common fields."""
    title: str = Field(..., min_length=1, description="Document title")
    category: str = Field(..., description="Document category")
    description: Optional[str] = Field(None, description="Document description")

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is from allowed list."""
        allowed_categories = ["Contract", "Meeting Minutes", "Financial Report", "Other"]
        if v not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v


class DocumentCreate(DocumentBase):
    """Document model for creation."""
    pass


class DocumentUpdate(BaseModel):
    """Document model for updates (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = None
    description: Optional[str] = None

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is from allowed list."""
        if v is None:
            return v
        allowed_categories = ["Contract", "Meeting Minutes", "Financial Report", "Other"]
        if v not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v


class DocumentInDB(DocumentBase):
    """Document model as stored in database."""
    id: str = Field(alias="_id")
    fileUrl: str = Field(..., description="URL to uploaded document file")
    fileType: str = Field(..., description="File type (e.g., pdf, docx)")
    fileSize: str = Field(..., description="File size (e.g., '2.4 MB')")
    uploadedBy: str = Field(..., description="User ID who uploaded the document")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    archivedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class DocumentResponse(DocumentBase):
    """Document model for API responses."""
    id: str
    fileUrl: str
    fileType: str
    fileSize: str
    uploadedBy: str
    createdAt: datetime
    updatedAt: datetime
    archivedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Response model for document list endpoint."""
    documents: list[DocumentResponse]
    total: int