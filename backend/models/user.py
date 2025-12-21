from pydantic import BaseModel, EmailStr, Field
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


class UserBase(BaseModel):
    """Base user model with common fields."""
    email: EmailStr
    firstName: str = Field(..., min_length=1, max_length=100)
    lastName: str = Field(..., min_length=1, max_length=100)
    role: str = Field(default="Board Member")


class UserCreate(UserBase):
    """User model for creation (includes password)."""
    password: str = Field(..., min_length=8)


class UserInDB(UserBase):
    """User model as stored in database."""
    id: str = Field(alias="_id")
    passwordHash: str
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class UserResponse(UserBase):
    """User model for API responses (no password hash)."""
    id: str
    role: str
    
    class Config:
        from_attributes = True


class UserWithToken(UserResponse):
    """User response with JWT token."""
    token: str