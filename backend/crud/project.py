from datetime import datetime
from typing import Optional, List
from bson import ObjectId

import database as db_module
from models.project import ProjectCreate, ProjectUpdate, ProjectInDB


async def create_project(project_data: ProjectCreate, user_id: str) -> ProjectInDB:
    """
    Create a new project in the database.
    
    Args:
        project_data: Project creation data
        user_id: ID of user creating the project
        
    Returns:
        Created project from database
    """
    projects_collection = db_module.database.projects
    
    project_dict = {
        "name": project_data.name,
        "description": project_data.description,
        "status": project_data.status,
        "budget": project_data.budget,
        "startDate": project_data.startDate,
        "endDate": project_data.endDate,
        "assignedVendorId": project_data.assignedVendorId,
        "createdBy": user_id,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "archivedAt": None
    }
    
    result = await projects_collection.insert_one(project_dict)
    project_dict["_id"] = str(result.inserted_id)
    
    return ProjectInDB(**project_dict)


async def get_projects(
    status: Optional[str] = None,
    search: Optional[str] = None,
    archived: bool = False,
    limit: int = 50,
    skip: int = 0
) -> tuple[List[ProjectInDB], int]:
    """
    Get projects with optional filtering.
    
    Args:
        status: Filter by status
        search: Search in name and description
        archived: Include archived projects
        limit: Maximum number of results
        skip: Number of results to skip (for pagination)
        
    Returns:
        Tuple of (list of projects, total count)
    """
    projects_collection = db_module.database.projects
    
    # Build filter query
    query = {}
    
    # Exclude archived by default
    if not archived:
        query["archivedAt"] = None
    
    if status:
        query["status"] = status
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await projects_collection.count_documents(query)
    
    # Get projects with pagination, sorted by createdAt descending
    cursor = projects_collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    projects = []
    
    async for project_doc in cursor:
        project_doc["_id"] = str(project_doc["_id"])
        projects.append(ProjectInDB(**project_doc))
    
    return projects, total


async def get_project_by_id(project_id: str) -> Optional[ProjectInDB]:
    """
    Get project by ID.
    
    Args:
        project_id: Project ID
        
    Returns:
        Project if found, None otherwise
    """
    projects_collection = db_module.database.projects
    
    try:
        project_doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
        
        if project_doc:
            project_doc["_id"] = str(project_doc["_id"])
            return ProjectInDB(**project_doc)
    except Exception:
        pass
    
    return None


async def get_project_with_aggregations(project_id: str) -> Optional[dict]:
    """
    Get project by ID with linked proposals and expenses, and calculate actualSpent.
    
    Args:
        project_id: Project ID
        
    Returns:
        Dict with project, proposals, expenses, and actualSpent if found, None otherwise
    """
    projects_collection = db_module.database.projects
    proposals_collection = db_module.database.proposals
    expenses_collection = db_module.database.expenses
    
    try:
        # Get project
        project_doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project_doc:
            return None
        
        project_doc["_id"] = str(project_doc["_id"])
        project = ProjectInDB(**project_doc)
        
        # Get linked proposals (non-archived)
        proposals_cursor = proposals_collection.find({
            "projectId": project_id,
            "archivedAt": None
        })
        proposals = []
        async for proposal_doc in proposals_cursor:
            proposal_doc["_id"] = str(proposal_doc["_id"])
            proposals.append(proposal_doc)
        
        # Get linked expenses
        expenses_cursor = expenses_collection.find({"projectId": project_id})
        expenses = []
        actual_spent = 0.0
        async for expense_doc in expenses_cursor:
            expense_doc["_id"] = str(expense_doc["_id"])
            expenses.append(expense_doc)
            actual_spent += expense_doc.get("amount", 0.0)
        
        return {
            "project": project,
            "proposals": proposals,
            "expenses": expenses,
            "actualSpent": actual_spent
        }
    except Exception:
        return None


async def update_project(project_id: str, project_data: ProjectUpdate) -> Optional[ProjectInDB]:
    """
    Update project by ID.
    
    Args:
        project_id: Project ID
        project_data: Project update data (partial)
        
    Returns:
        Updated project if found, None otherwise
    """
    projects_collection = db_module.database.projects
    
    try:
        # Build update dict with only provided fields
        update_dict = {}
        if project_data.name is not None:
            update_dict["name"] = project_data.name
        if project_data.description is not None:
            update_dict["description"] = project_data.description
        if project_data.status is not None:
            update_dict["status"] = project_data.status
        if project_data.budget is not None:
            update_dict["budget"] = project_data.budget
        if project_data.startDate is not None:
            update_dict["startDate"] = project_data.startDate
        if project_data.endDate is not None:
            update_dict["endDate"] = project_data.endDate
        if project_data.assignedVendorId is not None:
            update_dict["assignedVendorId"] = project_data.assignedVendorId
        
        # Always update updatedAt
        update_dict["updatedAt"] = datetime.utcnow()
        
        if not update_dict:
            # No fields to update
            return await get_project_by_id(project_id)
        
        result = await projects_collection.find_one_and_update(
            {"_id": ObjectId(project_id)},
            {"$set": update_dict},
            return_document=True
        )
        
        if result:
            result["_id"] = str(result["_id"])
            return ProjectInDB(**result)
    except Exception:
        pass
    
    return None


async def archive_project(project_id: str) -> bool:
    """
    Archive project (soft delete) by setting archivedAt timestamp.
    
    Args:
        project_id: Project ID
        
    Returns:
        True if archived successfully, False otherwise
    """
    projects_collection = db_module.database.projects
    
    try:
        result = await projects_collection.update_one(
            {"_id": ObjectId(project_id)},
            {"$set": {"archivedAt": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception:
        return False