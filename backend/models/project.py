from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, date
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


class ProjectBase(BaseModel):
    """Base project model with common fields."""
    name: str = Field(..., min_length=1, description="Project name")
    description: str = Field(..., min_length=1, description="Project description")
    status: str = Field(..., description="Project status")
    budget: float = Field(..., gt=0, description="Project budget (must be > 0)")
    startDate: str = Field(..., description="Start date in YYYY-MM-DD format")
    endDate: Optional[str] = Field(None, description="Optional end date in YYYY-MM-DD format")
    assignedVendorId: Optional[str] = Field(None, description="Optional assigned vendor ID")

    @field_validator('startDate', 'endDate')
    @classmethod
    def validate_date(cls, v):
        """Validate date format."""
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is from allowed list."""
        allowed_statuses = ["Planned", "In Progress", "Completed"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class ProjectCreate(ProjectBase):
    """Project model for creation."""
    pass


class ProjectUpdate(BaseModel):
    """Project model for updates (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = None
    budget: Optional[float] = Field(None, gt=0)
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    assignedVendorId: Optional[str] = None

    @field_validator('startDate', 'endDate')
    @classmethod
    def validate_date(cls, v):
        """Validate date format."""
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Validate status is from allowed list."""
        if v is None:
            return v
        allowed_statuses = ["Planned", "In Progress", "Completed"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v


class ProjectInDB(ProjectBase):
    """Project model as stored in database."""
    id: str = Field(alias="_id")
    createdBy: str = Field(..., description="User ID who created the project")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    archivedAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ProjectResponse(ProjectBase):
    """Project model for API responses."""
    id: str
    createdBy: str
    createdAt: datetime
    updatedAt: datetime
    archivedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    """Project detail response with aggregations."""
    proposals: list = Field(default_factory=list)
    expenses: list = Field(default_factory=list)
    actualSpent: float = Field(default=0.0)


class ProjectListResponse(BaseModel):
    """Response model for project list endpoint."""
    projects: list[ProjectResponse]
    total: int