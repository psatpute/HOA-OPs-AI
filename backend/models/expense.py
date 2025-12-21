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


class ExpenseBase(BaseModel):
    """Base expense model with common fields."""
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    amount: float = Field(..., gt=0, description="Expense amount (must be > 0)")
    category: str = Field(..., description="Expense category")
    vendor: str = Field(..., min_length=1, description="Vendor name")
    description: str = Field(..., min_length=1, description="Expense description")
    projectId: Optional[str] = Field(None, description="Optional project ID")
    receiptUrl: Optional[str] = Field(None, description="Optional receipt URL")

    @field_validator('date')
    @classmethod
    def validate_date(cls, v):
        """Validate date format and ensure it's not in the future."""
        try:
            expense_date = datetime.strptime(v, "%Y-%m-%d").date()
            if expense_date > date.today():
                raise ValueError("Date cannot be in the future")
            return v
        except ValueError as e:
            if "does not match format" in str(e):
                raise ValueError("Date must be in YYYY-MM-DD format")
            raise

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is from allowed list."""
        allowed_categories = [
            "Maintenance", "Utilities", "Insurance", 
            "Landscaping", "Repairs", "Administrative", "Other"
        ]
        if v not in allowed_categories:
            raise ValueError(f"Category must be one of: {', '.join(allowed_categories)}")
        return v


class ExpenseCreate(ExpenseBase):
    """Expense model for creation."""
    pass


class ExpenseInDB(ExpenseBase):
    """Expense model as stored in database."""
    id: str = Field(alias="_id")
    createdBy: str = Field(..., description="User ID who created the expense")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ExpenseResponse(ExpenseBase):
    """Expense model for API responses."""
    id: str
    createdBy: str
    createdAt: datetime
    
    class Config:
        from_attributes = True


class ExpenseListResponse(BaseModel):
    """Response model for expense list endpoint."""
    expenses: list[ExpenseResponse]
    total: int