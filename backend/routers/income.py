from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from typing import Optional

from models.income import IncomeCreate, IncomeResponse, IncomeListResponse, ImportResult
from crud import income as income_crud
from auth.middleware import get_current_user
from models.user import UserInDB

router = APIRouter(prefix="/income", tags=["income"])


@router.post("", response_model=IncomeResponse, status_code=201)
async def create_income(
    income_data: IncomeCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Create a new income record.
    
    - **date**: Date in YYYY-MM-DD format (cannot be in future)
    - **amount**: Income amount (must be > 0)
    - **source**: Income source type (Dues, Assessment, Fine, Interest, Other)
    - **description**: Income description
    """
    try:
        income = await income_crud.create_income(income_data, current_user.id)
        return IncomeResponse(
            id=income.id,
            date=income.date,
            amount=income.amount,
            source=income.source,
            description=income.description,
            createdBy=income.createdBy,
            createdAt=income.createdAt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create income: {str(e)}")


@router.get("", response_model=IncomeListResponse)
async def list_income(
    source: Optional[str] = Query(None, description="Filter by source type"),
    search: Optional[str] = Query(None, description="Search in description"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    List all income records with optional filtering.
    
    Supports filtering by:
    - **source**: Exact source type match (Dues, Assessment, Fine, Interest, Other)
    - **search**: Search in description (case-insensitive)
    
    Results are paginated and sorted by date (newest first).
    """
    try:
        income_records, total = await income_crud.get_income_list(
            source=source,
            search=search,
            limit=limit,
            skip=skip
        )
        
        income_responses = [
            IncomeResponse(
                id=inc.id,
                date=inc.date,
                amount=inc.amount,
                source=inc.source,
                description=inc.description,
                createdBy=inc.createdBy,
                createdAt=inc.createdAt
            )
            for inc in income_records
        ]
        
        return IncomeListResponse(income=income_responses, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve income: {str(e)}")


@router.post("/import", response_model=ImportResult)
async def import_income(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Bulk import income records from Excel or CSV file.
    
    **File Requirements:**
    - Format: Excel (.xlsx, .xls) or CSV (.csv)
    - Max size: 10MB
    - Max rows: 1000
    - Required columns: date, amount, description, source (or category)
    
    **Column Details:**
    - **date**: Date in any standard format (will be converted to YYYY-MM-DD)
    - **amount**: Positive number for income
    - **description**: Text description of the income
    - **source** or **category**: One of: Dues, Assessment, Fine, Interest, Other
    
    Returns the number of successfully imported records and any errors encountered.
    """
    try:
        # Validate file size (10MB limit)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
        
        # Read file content
        file_content = await file.read()
        
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 10MB limit"
            )
        
        # Validate file type
        if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only CSV and Excel files are supported."
            )
        
        # Parse the file
        valid_records, errors = income_crud.parse_import_file(file_content, file.filename)
        
        # If there are validation errors at file level, return them
        if errors and not valid_records:
            return ImportResult(imported=0, errors=errors)
        
        # Create income records from valid data
        imported_count = 0
        if valid_records:
            try:
                income_objects = [
                    IncomeCreate(**record) for record in valid_records
                ]
                imported_count = await income_crud.bulk_create_income(
                    income_objects,
                    current_user.id
                )
            except Exception as e:
                errors.append({
                    "row": 0,
                    "error": f"Failed to import records: {str(e)}"
                })
        
        return ImportResult(imported=imported_count, errors=errors)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process import: {str(e)}"
        )