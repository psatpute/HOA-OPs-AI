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


class ProposalBase(BaseModel):
    """Base proposal model with common fields."""
    projectId: str = Field(..., description="Project ID this proposal is for")
    vendorName: str = Field(..., min_length=1, description="Vendor name")
    bidAmount: float = Field(..., gt=0, description="Bid amount (must be > 0)")
    timeline: str = Field(..., min_length=1, description="Project timeline")
    warranty: str = Field(..., min_length=1, description="Warranty information")
    scopeSummary: str = Field(..., min_length=1, description="Scope of work summary")
    status: str = Field(default="Pending", description="Proposal status")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is from allowed list."""
        allowed_statuses = ["Pending", "Accepted", "Rejected"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class ProposalCreate(ProposalBase):
    """Proposal model for creation."""
    pass


class ProposalUpdate(BaseModel):
    """Proposal model for updates (all fields optional)."""
    vendorName: Optional[str] = Field(None, min_length=1)
    bidAmount: Optional[float] = Field(None, gt=0)
    timeline: Optional[str] = Field(None, min_length=1)
    warranty: Optional[str] = Field(None, min_length=1)
    scopeSummary: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is from allowed list."""
        if v is None:
            return v
        allowed_statuses = ["Pending", "Accepted", "Rejected"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class ProposalInDB(ProposalBase):
    """Proposal model as stored in database."""
    id: str = Field(alias="_id")
    fileUrl: Optional[str] = Field(None, description="URL to uploaded proposal file")
    uploadedBy: str = Field(..., description="User ID who uploaded the proposal")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    archivedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ProposalResponse(ProposalBase):
    """Proposal model for API responses."""
    id: str
    fileUrl: Optional[str] = None
    uploadedBy: str
    createdAt: datetime
    updatedAt: datetime
    archivedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProposalListResponse(BaseModel):
    """Response model for proposal list endpoint."""
    proposals: list[ProposalResponse]
    total: int