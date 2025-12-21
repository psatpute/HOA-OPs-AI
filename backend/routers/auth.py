from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr, Field

from models.user import UserCreate, UserResponse, UserWithToken, UserInDB
from crud.user import create_user, get_user_by_email, update_last_login
from auth.password import hash_password, verify_password
from auth.jwt import create_access_token
from auth.middleware import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str


class LogoutResponse(BaseModel):
    """Logout response model."""
    message: str


@router.post("/signup", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user account.
    
    Args:
        user_data: User registration data
        
    Returns:
        Created user with JWT token
        
    Raises:
        HTTPException: If email already exists or validation fails
    """
    # Check if user already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password length
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Hash password and create user
    password_hash = hash_password(user_data.password)
    user = await create_user(user_data, password_hash)
    
    # Generate JWT token
    token = create_access_token(user.id)
    
    # Return user with token
    return UserWithToken(
        id=user.id,
        email=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        role=user.role,
        token=token
    )


@router.post("/login", response_model=UserWithToken)
async def login(login_data: LoginRequest):
    """
    Authenticate user and issue JWT token.
    
    Args:
        login_data: Login credentials
        
    Returns:
        User data with JWT token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email
    user = await get_user_by_email(login_data.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(login_data.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last login timestamp
    await update_last_login(user.id)
    
    # Generate JWT token
    token = create_access_token(user.id)
    
    # Return user with token
    return UserWithToken(
        id=user.id,
        email=user.email,
        firstName=user.firstName,
        lastName=user.lastName,
        role=user.role,
        token=token
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user: UserInDB = Depends(get_current_user)):
    """
    Log out current user.
    
    Note: Token invalidation is handled client-side by removing the token.
    This endpoint confirms the logout action.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    return LogoutResponse(message="Logged out successfully")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_user)):
    """
    Get current authenticated user's profile.
    
    Args:
        current_user: Current authenticated user from token
        
    Returns:
        User profile data
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        firstName=current_user.firstName,
        lastName=current_user.lastName,
        role=current_user.role
    )