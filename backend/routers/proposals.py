from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from typing import Optional

from models.proposal import (
    ProposalCreate,
    ProposalUpdate,
    ProposalResponse,
    ProposalListResponse
)
from crud import proposal as proposal_crud
from crud import project as project_crud
from auth.middleware import get_current_user
from models.user import UserInDB
from utils.file_upload import save_file

router = APIRouter(prefix="/proposals", tags=["proposals"])


@router.post("", response_model=ProposalResponse, status_code=201)
async def create_proposal(
    projectId: str = Form(...),
    vendorName: str = Form(...),
    bidAmount: float = Form(...),
    timeline: str = Form(...),
    warranty: str = Form(...),
    scopeSummary: str = Form(...),
    status: str = Form(default="Pending"),
    file: Optional[UploadFile] = File(None),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Create a new vendor proposal with optional file upload.
    
    Accepts multipart form-data with the following fields:
    - **projectId**: Project ID this proposal is for (required)
    - **vendorName**: Vendor name (required)
    - **bidAmount**: Bid amount in dollars (required, must be > 0)
    - **timeline**: Project timeline (required)
    - **warranty**: Warranty information (required)
    - **scopeSummary**: Scope of work summary (required)
    - **status**: Proposal status (default: "Pending", options: Pending/Accepted/Rejected)
    - **file**: Proposal file (optional, max 10MB, PDF/JPG/PNG/DOCX/XLSX)
    
    Returns the created proposal with file URL if file was uploaded.
    """
    try:
        # Verify project exists
        project = await project_crud.get_project_by_id(projectId)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Handle file upload if provided
        file_url = None
        if file and file.filename:
            file_url = await save_file(file, subdirectory="proposals")
        
        # Create proposal data
        proposal_data = ProposalCreate(
            projectId=projectId,
            vendorName=vendorName,
            bidAmount=bidAmount,
            timeline=timeline,
            warranty=warranty,
            scopeSummary=scopeSummary,
            status=status
        )
        
        # Create proposal in database
        proposal = await proposal_crud.create_proposal(
            proposal_data,
            current_user.id,
            file_url
        )
        
        return ProposalResponse(
            id=proposal.id,
            projectId=proposal.projectId,
            vendorName=proposal.vendorName,
            bidAmount=proposal.bidAmount,
            timeline=proposal.timeline,
            warranty=proposal.warranty,
            scopeSummary=proposal.scopeSummary,
            fileUrl=proposal.fileUrl,
            status=proposal.status,
            uploadedBy=proposal.uploadedBy,
            createdAt=proposal.createdAt,
            updatedAt=proposal.updatedAt,
            archivedAt=proposal.archivedAt
        )
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create proposal: {str(e)}")


@router.get("", response_model=ProposalListResponse)
async def list_proposals(
    projectId: Optional[str] = Query(None, description="Filter by project ID"),
    vendorName: Optional[str] = Query(None, description="Filter by vendor name (partial match)"),
    archived: bool = Query(False, description="Include archived proposals"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    skip: int = Query(0, ge=0, description="Number of results to skip"),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    List all proposals with optional filtering.
    
    Supports filtering by:
    - **projectId**: Exact project ID match
    - **vendorName**: Partial vendor name match (case-insensitive)
    - **archived**: Include archived proposals (default: false)
    
    Results are paginated and sorted by creation date (newest first).
    """
    try:
        proposals, total = await proposal_crud.get_proposals(
            project_id=projectId,
            vendor_name=vendorName,
            archived=archived,
            limit=limit,
            skip=skip
        )
        
        proposal_responses = [
            ProposalResponse(
                id=prop.id,
                projectId=prop.projectId,
                vendorName=prop.vendorName,
                bidAmount=prop.bidAmount,
                timeline=prop.timeline,
                warranty=prop.warranty,
                scopeSummary=prop.scopeSummary,
                fileUrl=prop.fileUrl,
                status=prop.status,
                uploadedBy=prop.uploadedBy,
                createdAt=prop.createdAt,
                updatedAt=prop.updatedAt,
                archivedAt=prop.archivedAt
            )
            for prop in proposals
        ]
        
        return ProposalListResponse(proposals=proposal_responses, total=total)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve proposals: {str(e)}")


@router.get("/{proposal_id}", response_model=ProposalResponse)
async def get_proposal(
    proposal_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Get a single proposal by ID.
    
    Returns 404 if proposal not found.
    """
    proposal = await proposal_crud.get_proposal_by_id(proposal_id)
    
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    return ProposalResponse(
        id=proposal.id,
        projectId=proposal.projectId,
        vendorName=proposal.vendorName,
        bidAmount=proposal.bidAmount,
        timeline=proposal.timeline,
        warranty=proposal.warranty,
        scopeSummary=proposal.scopeSummary,
        fileUrl=proposal.fileUrl,
        status=proposal.status,
        uploadedBy=proposal.uploadedBy,
        createdAt=proposal.createdAt,
        updatedAt=proposal.updatedAt,
        archivedAt=proposal.archivedAt
    )


@router.patch("/{proposal_id}", response_model=ProposalResponse)
async def update_proposal(
    proposal_id: str,
    proposal_data: ProposalUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Update proposal metadata.
    
    All fields are optional. Only provided fields will be updated.
    
    - **vendorName**: Vendor name
    - **bidAmount**: Bid amount (must be > 0)
    - **timeline**: Project timeline
    - **warranty**: Warranty information
    - **scopeSummary**: Scope of work summary
    - **status**: Proposal status (Pending/Accepted/Rejected)
    
    Note: File cannot be updated via this endpoint. To change the file,
    archive this proposal and create a new one.
    
    Returns 404 if proposal not found.
    """
    try:
        proposal = await proposal_crud.update_proposal(proposal_id, proposal_data)
        
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")
        
        return ProposalResponse(
            id=proposal.id,
            projectId=proposal.projectId,
            vendorName=proposal.vendorName,
            bidAmount=proposal.bidAmount,
            timeline=proposal.timeline,
            warranty=proposal.warranty,
            scopeSummary=proposal.scopeSummary,
            fileUrl=proposal.fileUrl,
            status=proposal.status,
            uploadedBy=proposal.uploadedBy,
            createdAt=proposal.createdAt,
            updatedAt=proposal.updatedAt,
            archivedAt=proposal.archivedAt
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update proposal: {str(e)}")


@router.delete("/{proposal_id}")
async def archive_proposal(
    proposal_id: str,
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Archive proposal (soft delete).
    
    Sets the archivedAt timestamp. Archived proposals are excluded from
    default list queries unless explicitly requested.
    
    Returns 404 if proposal not found.
    """
    success = await proposal_crud.archive_proposal(proposal_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Proposal not found")
    
    return {"message": "Proposal archived successfully"}