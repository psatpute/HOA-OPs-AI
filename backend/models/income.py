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


class IncomeBase(BaseModel):
    """Base income model with common fields."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    amount: float = Field(..., gt=0, description="Income amount (must be > 0)")
    source: str = Field(..., description="Income source type")
    description: str = Field(..., min_length=1, description="Income description")

    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        """Validate date format and ensure it's not in the future."""
        try:
            income_date = datetime.strptime(v, "%Y-%m-%d").date()
            if income_date > date.today():
                raise ValueError("Date cannot be in the future")
            return v
        except ValueError as e:
            if "does not match format" in str(e):
                raise ValueError("Date must be in YYYY-MM-DD format")
            raise

    @field_validator('source')
    @classmethod
    def validate_source(cls, v):
        """Validate source is from allowed list."""
        allowed_sources = [
            "Dues", "Assessment", "Fine", "Interest", "Other"
        ]
        if v not in allowed_sources:
            raise ValueError(f"Source must be one of: {', '.join(allowed_sources)}")
        return v


class IncomeCreate(IncomeBase):
    """Income model for creation."""
    pass


class IncomeInDB(IncomeBase):
    """Income model as stored in database."""
    id: str = Field(alias="_id")
    createdBy: str = Field(..., description="User ID who created the income")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class IncomeResponse(IncomeBase):
    """Income model for API responses."""
    id: str
    createdBy: str
    createdAt: datetime
    
    class Config:
        from_attributes = True


class IncomeListResponse(BaseModel):
    """Response model for income list endpoint."""
    income: list[IncomeResponse]
    total: int


class ImportResult(BaseModel):
    """Response model for import endpoint."""
    imported: int
    errors: list[dict]