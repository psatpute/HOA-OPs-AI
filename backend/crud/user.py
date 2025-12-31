from datetime import datetime
from typing import Optional
from bson import ObjectId

import database as db_module
from models.user import UserCreate, UserInDB


async def create_user(user_data: UserCreate, password_hash: str) -> UserInDB:
    """
    Create a new user in the database.
    
    Args:
        user_data: User creation data
        password_hash: Hashed password
        
    Returns:
        Created user from database
        
    Raises:
        RuntimeError: If database is not connected
    """
    if db_module.database is None:
        raise RuntimeError("Database connection not established")
    
    users_collection = db_module.database.users
    
    user_dict = {
        "email": user_data.email,
        "passwordHash": password_hash,
        "firstName": user_data.firstName,
        "lastName": user_data.lastName,
        "role": user_data.role,
        "createdAt": datetime.utcnow(),
        "lastLoginAt": None
    }
    
    result = await users_collection.insert_one(user_dict)
    user_dict["_id"] = str(result.inserted_id)
    
    return UserInDB(**user_dict)


async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """
    Get user by email address.
    
    Args:
        email: User's email address
        
    Returns:
        User if found, None otherwise
        
    Raises:
        RuntimeError: If database is not connected
    """
    if db_module.database is None:
        raise RuntimeError("Database connection not established")
    
    users_collection = db_module.database.users
    
    user_doc = await users_collection.find_one({"email": email})
    
    if user_doc:
        user_doc["_id"] = str(user_doc["_id"])
        return UserInDB(**user_doc)
    
    return None


async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """
    Get user by ID.
    
    Args:
        user_id: User's ID
        
    Returns:
        User if found, None otherwise
        
    Raises:
        RuntimeError: If database is not connected
    """
    if db_module.database is None:
        raise RuntimeError("Database connection not established")
    
    users_collection = db_module.database.users
    
    try:
        user_doc = await users_collection.find_one({"_id": ObjectId(user_id)})
        
        if user_doc:
            user_doc["_id"] = str(user_doc["_id"])
            return UserInDB(**user_doc)
    except Exception:
        pass
    
    return None


async def update_last_login(user_id: str) -> bool:
    """
    Update user's last login timestamp.
    
    Args:
        user_id: User's ID
        
    Returns:
        True if updated successfully, False otherwise
        
    Raises:
        RuntimeError: If database is not connected
    """
    if db_module.database is None:
        raise RuntimeError("Database connection not established")
    
    users_collection = db_module.database.users
    
    try:
        result = await users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"lastLoginAt": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception:
        return False