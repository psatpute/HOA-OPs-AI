from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from models.expense import ExpenseCreate, ExpenseResponse, ExpenseListResponse
from crud import expense as expense_crud
from auth.middleware import get_current_user
from models.user import UserInDB

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseResponse, status_code=201)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Create a new expense record.
    
    - **date**: Date in YYYY-MM-DD format (cannot be in future)
    - **amount**: Expense amount (must be > 0)
    - **category**: Expense category (Maintenance, Utilities, Insurance, Landscaping, Repairs, Administrative, Other)
    - **vendor**: Vendor name
    - **description**: Expense description
    - **projectId**: Optional project ID to link expense to project
    - **receiptUrl**: Optional receipt URL
    """
    try:
        expense = await expense_crud.create_expense(expense_data, current_user.id)
        return ExpenseResponse(
            id=expense.id,
            date=expense.date,
            amount=expense.amount,
            category=expense.category,
            vendor=expense.vendor,
            description=expense.description,
            projectId=expense.projectId,
            receiptUrl=expense.receiptUrl,
            createdBy=expense.createdBy,
            createdAt=expense.createdAt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create expense: {str(e)}")


@router.get("", response_model=ExpenseListResponse)
async def list_expenses(
    category: Optional[str] = Query(None, description="Filter by category"),
    vendor: Optional[str] = Query(None, description="Filter by vendor name"),
    projectId: Optional[str] = Query(None, description="Filter by project ID"),
    search: Optional[str] = Query(None, description="Search in description and vendor"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    List all expenses with optional filtering.
    
    Supports filtering by:
    - **category**: Exact category match
    - **vendor**: Partial vendor name match (case-insensitive)
    - **projectId**: Expenses linked to specific project
    - **search**: Search across description and vendor (case-insensitive)
    
    Results are paginated and sorted by date (newest first).
    """
    try:
        expenses, total = await expense_crud.get_expenses(
            category=category,
            vendor=vendor,
            project_id=projectId,
            search=search,
            limit=limit,
            skip=skip
        )
        
        expense_responses = [
            ExpenseResponse(
                id=exp.id,
                date=exp.date,
                amount=exp.amount,
                category=exp.category,
                vendor=exp.vendor,
                description=exp.description,
                projectId=exp.projectId,
                receiptUrl=exp.receiptUrl,
                createdBy=exp.createdBy,
                createdAt=exp.createdAt
            )
            for exp in expenses
        ]
        
        return ExpenseListResponse(expenses=expense_responses, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve expenses: {str(e)}")


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Get a single expense by ID.
    
    Returns 404 if expense not found.
    """
    expense = await expense_crud.get_expense_by_id(expense_id)
    
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    return ExpenseResponse(
        id=expense.id,
        date=expense.date,
        amount=expense.amount,
        category=expense.category,
        vendor=expense.vendor,
        description=expense.description,
        projectId=expense.projectId,
        receiptUrl=expense.receiptUrl,
        createdBy=expense.createdBy,
        createdAt=expense.createdAt
    )