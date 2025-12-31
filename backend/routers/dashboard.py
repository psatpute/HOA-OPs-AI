from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from datetime import datetime

import database as db_module
from auth.middleware import get_current_user
from models.user import UserInDB
from bson import ObjectId

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_dashboard_summary(
    current_user: UserInDB = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Get financial overview for dashboard.
    
    Returns:
    - **totalBalance**: Current balance (total income - total expenses)
    - **totalIncome**: Sum of all income records
    - **totalExpenses**: Sum of all expense records
    - **expensesByCategory**: Breakdown of expenses by category with totals
    - **recentTransactions**: 5 most recent transactions (income + expenses)
    """
    try:
        # Get total income
        income_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }
            }
        ]
        income_result = await db_module.database.income.aggregate(income_pipeline).to_list(1)
        total_income = income_result[0]["total"] if income_result else 0.0
        
        # Get total expenses
        expenses_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$amount"}
                }
            }
        ]
        expenses_result = await db_module.database.expenses.aggregate(expenses_pipeline).to_list(1)
        total_expenses = expenses_result[0]["total"] if expenses_result else 0.0
        
        # Calculate balance
        total_balance = total_income - total_expenses
        
        # Get expenses by category
        category_pipeline = [
            {
                "$group": {
                    "_id": "$category",
                    "total": {"$sum": "$amount"},
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"total": -1}
            }
        ]
        category_results = await db_module.database.expenses.aggregate(category_pipeline).to_list(None)
        expenses_by_category = {
            item["_id"]: {
                "total": item["total"],
                "count": item["count"]
            }
            for item in category_results
        }
        
        # Get recent income transactions
        recent_income = await db_module.database.income.find().sort("createdAt", -1).limit(5).to_list(5)
        income_transactions = [
            {
                "id": str(inc["_id"]),
                "type": "income",
                "date": inc["date"],
                "amount": inc["amount"],
                "description": inc["description"],
                "source": inc.get("source", ""),
                "createdAt": inc["createdAt"].isoformat() + "Z"
            }
            for inc in recent_income
        ]
        
        # Get recent expense transactions
        recent_expenses = await db_module.database.expenses.find().sort("createdAt", -1).limit(5).to_list(5)
        expense_transactions = [
            {
                "id": str(exp["_id"]),
                "type": "expense",
                "date": exp["date"],
                "amount": exp["amount"],
                "description": exp["description"],
                "vendor": exp.get("vendor", ""),
                "category": exp.get("category", ""),
                "createdAt": exp["createdAt"].isoformat() + "Z"
            }
            for exp in recent_expenses
        ]
        
        # Combine and sort recent transactions by createdAt
        all_transactions = income_transactions + expense_transactions
        all_transactions.sort(key=lambda x: x["createdAt"], reverse=True)
        recent_transactions = all_transactions[:5]
        
        return {
            "totalBalance": round(total_balance, 2),
            "totalIncome": round(total_income, 2),
            "totalExpenses": round(total_expenses, 2),
            "expensesByCategory": expenses_by_category,
            "recentTransactions": recent_transactions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve dashboard summary: {str(e)}"
        )