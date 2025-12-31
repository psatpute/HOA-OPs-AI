from datetime import datetime
from typing import Optional, List
from bson import ObjectId

import database as db_module
from models.expense import ExpenseCreate, ExpenseInDB


async def create_expense(expense_data: ExpenseCreate, user_id: str) -> ExpenseInDB:
    """
    Create a new expense in the database.
    
    Args:
        expense_data: Expense creation data
        user_id: ID of user creating the expense
        
    Returns:
        Created expense from database
    """
    expenses_collection = db_module.database.expenses
    
    expense_dict = {
        "date": expense_data.date,
        "amount": expense_data.amount,
        "category": expense_data.category,
        "vendor": expense_data.vendor,
        "description": expense_data.description,
        "projectId": expense_data.projectId,
        "receiptUrl": expense_data.receiptUrl,
        "createdBy": user_id,
        "createdAt": datetime.utcnow()
    }
    
    result = await expenses_collection.insert_one(expense_dict)
    expense_dict["_id"] = str(result.inserted_id)
    
    return ExpenseInDB(**expense_dict)


async def get_expenses(
    category: Optional[str] = None,
    vendor: Optional[str] = None,
    project_id: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
) -> tuple[List[ExpenseInDB], int]:
    """
    Get expenses with optional filtering.
    
    Args:
        category: Filter by category
        vendor: Filter by vendor
        project_id: Filter by project ID
        search: Search in description and vendor
        limit: Maximum number of results
        skip: Number of results to skip (for pagination)
        
    Returns:
        Tuple of (list of expenses, total count)
    """
    expenses_collection = db_module.database.expenses
    
    # Build filter query
    query = {}
    
    if category:
        query["category"] = category
    
    if vendor:
        query["vendor"] = {"$regex": vendor, "$options": "i"}
    
    if project_id:
        query["projectId"] = project_id
    
    if search:
        query["$or"] = [
            {"description": {"$regex": search, "$options": "i"}},
            {"vendor": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await expenses_collection.count_documents(query)
    
    # Get expenses with pagination, sorted by date descending
    cursor = expenses_collection.find(query).sort("date", -1).skip(skip).limit(limit)
    expenses = []
    
    async for expense_doc in cursor:
        expense_doc["_id"] = str(expense_doc["_id"])
        expenses.append(ExpenseInDB(**expense_doc))
    
    return expenses, total


async def get_expense_by_id(expense_id: str) -> Optional[ExpenseInDB]:
    """
    Get expense by ID.
    
    Args:
        expense_id: Expense ID
        
    Returns:
        Expense if found, None otherwise
    """
    expenses_collection = db_module.database.expenses
    
    try:
        expense_doc = await expenses_collection.find_one({"_id": ObjectId(expense_id)})
        
        if expense_doc:
            expense_doc["_id"] = str(expense_doc["_id"])
            return ExpenseInDB(**expense_doc)
    except Exception:
        pass
    
    return None