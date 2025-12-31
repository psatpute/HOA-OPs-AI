from datetime import datetime
from typing import Optional, List
from bson import ObjectId
import pandas as pd
from io import BytesIO

import database as db_module
from models.income import IncomeCreate, IncomeInDB


async def create_income(income_data: IncomeCreate, user_id: str) -> IncomeInDB:
    """
    Create a new income record in the database.
    
    Args:
        income_data: Income creation data
        user_id: ID of user creating the income
        
    Returns:
        Created income from database
    """
    income_collection = db_module.database.income
    
    income_dict = {
        "date": income_data.date,
        "amount": income_data.amount,
        "source": income_data.source,
        "description": income_data.description,
        "createdBy": user_id,
        "createdAt": datetime.utcnow()
    }
    
    result = await income_collection.insert_one(income_dict)
    income_dict["_id"] = str(result.inserted_id)
    
    return IncomeInDB(**income_dict)


async def get_income_list(
    source: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    skip: int = 0
) -> tuple[List[IncomeInDB], int]:
    """
    Get income records with optional filtering.
    
    Args:
        source: Filter by source type
        search: Search in description
        limit: Maximum number of results
        skip: Number of results to skip (for pagination)
        
    Returns:
        Tuple of (list of income records, total count)
    """
    income_collection = db_module.database.income
    
    # Build filter query
    query = {}
    
    if source:
        query["source"] = source
    
    if search:
        query["description"] = {"$regex": search, "$options": "i"}
    
    # Get total count
    total = await income_collection.count_documents(query)
    
    # Get income records with pagination, sorted by date descending
    cursor = income_collection.find(query).sort("date", -1).skip(skip).limit(limit)
    income_records = []
    
    async for income_doc in cursor:
        income_doc["_id"] = str(income_doc["_id"])
        income_records.append(IncomeInDB(**income_doc))
    
    return income_records, total


async def bulk_create_income(income_list: List[IncomeCreate], user_id: str) -> int:
    """
    Bulk create income records from import.
    
    Args:
        income_list: List of income records to create
        user_id: ID of user importing the data
        
    Returns:
        Number of records created
    """
    income_collection = db_module.database.income
    
    income_dicts = []
    for income_data in income_list:
        income_dict = {
            "date": income_data.date,
            "amount": income_data.amount,
            "source": income_data.source,
            "description": income_data.description,
            "createdBy": user_id,
            "createdAt": datetime.utcnow()
        }
        income_dicts.append(income_dict)
    
    if income_dicts:
        result = await income_collection.insert_many(income_dicts)
        return len(result.inserted_ids)
    
    return 0


def parse_import_file(file_content: bytes, filename: str) -> tuple[List[dict], List[dict]]:
    """
    Parse Excel or CSV file for income/expense import.
    
    Args:
        file_content: File content as bytes
        filename: Original filename to determine file type
        
    Returns:
        Tuple of (list of valid records, list of errors)
    """
    errors = []
    valid_records = []
    
    try:
        # Determine file type and read
        if filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(file_content))
        elif filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(BytesIO(file_content))
        else:
            errors.append({"row": 0, "error": "Unsupported file format. Use CSV or Excel files."})
            return valid_records, errors
        
        # Validate required columns
        required_columns = ['date', 'amount', 'description']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            errors.append({
                "row": 0,
                "error": f"Missing required columns: {', '.join(missing_columns)}"
            })
            return valid_records, errors
        
        # Check for source or category column
        if 'source' not in df.columns and 'category' not in df.columns:
            errors.append({
                "row": 0,
                "error": "File must have either 'source' or 'category' column"
            })
            return valid_records, errors
        
        # Limit to 1000 rows
        if len(df) > 1000:
            errors.append({
                "row": 0,
                "error": "File exceeds maximum of 1000 rows"
            })
            return valid_records, errors
        
        # Process each row
        for idx, row in df.iterrows():
            row_num = idx + 2  # +2 because Excel rows start at 1 and we have header
            
            try:
                # Validate amount
                amount = float(row['amount'])
                if amount <= 0:
                    errors.append({
                        "row": row_num,
                        "error": "Amount must be greater than 0"
                    })
                    continue
                
                # Get source/category
                source = row.get('source', row.get('category', 'Other'))
                
                # Validate source
                allowed_sources = ["Dues", "Assessment", "Fine", "Interest", "Other"]
                if source not in allowed_sources:
                    # Try to map common variations
                    source_map = {
                        "dues": "Dues",
                        "hoa dues": "Dues",
                        "assessment": "Assessment",
                        "special assessment": "Assessment",
                        "fine": "Fine",
                        "fines": "Fine",
                        "violation": "Fine",
                        "interest": "Interest",
                        "bank interest": "Interest"
                    }
                    source = source_map.get(str(source).lower(), "Other")
                
                # Validate date
                date_str = pd.to_datetime(row['date']).strftime('%Y-%m-%d')
                
                # Validate description
                description = str(row['description']).strip()
                if not description or description == 'nan':
                    errors.append({
                        "row": row_num,
                        "error": "Description is required"
                    })
                    continue
                
                valid_records.append({
                    "date": date_str,
                    "amount": amount,
                    "source": source,
                    "description": description
                })
                
            except Exception as e:
                errors.append({
                    "row": row_num,
                    "error": f"Error processing row: {str(e)}"
                })
        
    except Exception as e:
        errors.append({
            "row": 0,
            "error": f"Error reading file: {str(e)}"
        })
    
    return valid_records, errors