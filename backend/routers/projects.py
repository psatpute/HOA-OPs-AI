from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from models.project import (
    ProjectCreate, 
    ProjectUpdate, 
    ProjectResponse, 
    ProjectDetailResponse,
    ProjectListResponse
)
from crud import project as project_crud
from auth.middleware import get_current_user
from models.user import UserInDB

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Create a new project.
    
    - **name**: Project name
    - **description**: Project description
    - **status**: Project status (Planned, In Progress, Completed)
    - **budget**: Project budget (must be > 0)
    - **startDate**: Start date in YYYY-MM-DD format
    - **endDate**: Optional end date in YYYY-MM-DD format
    - **assignedVendorId**: Optional assigned vendor ID
    """
    try:
        project = await project_crud.create_project(project_data, current_user.id)
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            status=project.status,
            budget=project.budget,
            startDate=project.startDate,
            endDate=project.endDate,
            assignedVendorId=project.assignedVendorId,
            createdBy=project.createdBy,
            createdAt=project.createdAt,
            updatedAt=project.updatedAt,
            archivedAt=project.archivedAt
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    status: Optional[str] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    archived: bool = Query(False, description="Include archived projects"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    List all projects with optional filtering.
    
    Supports filtering by:
    - **status**: Exact status match (Planned, In Progress, Completed)
    - **search**: Search across name and description (case-insensitive)
    - **archived**: Include archived projects (default: false)
    
    Results are paginated and sorted by creation date (newest first).
    """
    try:
        projects, total = await project_crud.get_projects(
            status=status,
            search=search,
            archived=archived,
            limit=limit,
            skip=skip
        )
        
        project_responses = [
            ProjectResponse(
                id=proj.id,
                name=proj.name,
                description=proj.description,
                status=proj.status,
                budget=proj.budget,
                startDate=proj.startDate,
                endDate=proj.endDate,
                assignedVendorId=proj.assignedVendorId,
                createdBy=proj.createdBy,
                createdAt=proj.createdAt,
                updatedAt=proj.updatedAt,
                archivedAt=proj.archivedAt
            )
            for proj in projects
        ]
        
        return ProjectListResponse(projects=project_responses, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve projects: {str(e)}")


@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Get a single project by ID with linked proposals and expenses.
    
    Returns:
    - Project details
    - Linked proposals (non-archived)
    - Linked expenses
    - Actual spent amount (sum of linked expenses)
    
    Returns 404 if project not found.
    """
    result = await project_crud.get_project_with_aggregations(project_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = result["project"]
    
    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        budget=project.budget,
        startDate=project.startDate,
        endDate=project.endDate,
        assignedVendorId=project.assignedVendorId,
        createdBy=project.createdBy,
        createdAt=project.createdAt,
        updatedAt=project.updatedAt,
        archivedAt=project.archivedAt,
        proposals=result["proposals"],
        expenses=result["expenses"],
        actualSpent=result["actualSpent"]
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Update project details.
    
    All fields are optional. Only provided fields will be updated.
    
    - **name**: Project name
    - **description**: Project description
    - **status**: Project status (Planned, In Progress, Completed)
    - **budget**: Project budget (must be > 0)
    - **startDate**: Start date in YYYY-MM-DD format
    - **endDate**: End date in YYYY-MM-DD format
    - **assignedVendorId**: Assigned vendor ID
    
    Returns 404 if project not found.
    """
    project = await project_crud.update_project(project_id, project_data)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        budget=project.budget,
        startDate=project.startDate,
        endDate=project.endDate,
        assignedVendorId=project.assignedVendorId,
        createdBy=project.createdBy,
        createdAt=project.createdAt,
        updatedAt=project.updatedAt,
        archivedAt=project.archivedAt
    )


@router.delete("/{project_id}")
async def archive_project(
    project_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Archive project (soft delete).
    
    Sets the archivedAt timestamp. Archived projects are excluded from
    default list queries unless explicitly requested.
    
    Returns 404 if project not found.
    """
    success = await project_crud.archive_project(project_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Project archived successfully"}