from datetime import datetime
from typing import Optional, List
from bson import ObjectId

from database import database
from models.proposal import ProposalCreate, ProposalUpdate, ProposalInDB


async def create_proposal(
    proposal_data: ProposalCreate, 
    user_id: str,
    file_url: Optional[str] = None
) -> ProposalInDB:
    """
    Create a new proposal in the database.
    
    Args:
        proposal_data: Proposal creation data
        user_id: ID of user creating the proposal
        file_url: Optional URL to uploaded file
        
    Returns:
        Created proposal from database
    """
    proposals_collection = database.proposals
    
    proposal_dict = {
        "projectId": proposal_data.projectId,
        "vendorName": proposal_data.vendorName,
        "bidAmount": proposal_data.bidAmount,
        "timeline": proposal_data.timeline,
        "warranty": proposal_data.warranty,
        "scopeSummary": proposal_data.scopeSummary,
        "fileUrl": file_url,
        "status": proposal_data.status,
        "uploadedBy": user_id,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "archivedAt": None
    }
    
    result = await proposals_collection.insert_one(proposal_dict)
    proposal_dict["_id"] = str(result.inserted_id)
    
    return ProposalInDB(**proposal_dict)


async def get_proposals(
    project_id: Optional[str] = None,
    vendor_name: Optional[str] = None,
    archived: bool = False,
    limit: int = 50,
    skip: int = 0
) -> tuple[List[ProposalInDB], int]:
    """
    Get proposals with optional filtering.
    
    Args:
        project_id: Filter by project ID
        vendor_name: Filter by vendor name (case-insensitive partial match)
        archived: Include archived proposals
        limit: Maximum number of results
        skip: Number of results to skip (for pagination)
        
    Returns:
        Tuple of (list of proposals, total count)
    """
    proposals_collection = database.proposals
    
    # Build filter query
    query = {}
    
    # Exclude archived by default
    if not archived:
        query["archivedAt"] = None
    
    if project_id:
        query["projectId"] = project_id
    
    if vendor_name:
        query["vendorName"] = {"$regex": vendor_name, "$options": "i"}
    
    # Get total count
    total = await proposals_collection.count_documents(query)
    
    # Get proposals with pagination, sorted by createdAt descending
    cursor = proposals_collection.find(query).sort("createdAt", -1).skip(skip).limit(limit)
    proposals = []
    
    async for proposal_doc in cursor:
        proposal_doc["_id"] = str(proposal_doc["_id"])
        proposals.append(ProposalInDB(**proposal_doc))
    
    return proposals, total


async def get_proposal_by_id(proposal_id: str) -> Optional[ProposalInDB]:
    """
    Get proposal by ID.
    
    Args:
        proposal_id: Proposal ID
        
    Returns:
        Proposal if found, None otherwise
    """
    proposals_collection = database.proposals
    
    try:
        proposal_doc = await proposals_collection.find_one({"_id": ObjectId(proposal_id)})
        
        if proposal_doc:
            proposal_doc["_id"] = str(proposal_doc["_id"])
            return ProposalInDB(**proposal_doc)
    except Exception:
        pass
    
    return None


async def update_proposal(proposal_id: str, proposal_data: ProposalUpdate) -> Optional[ProposalInDB]:
    """
    Update proposal by ID.
    
    Args:
        proposal_id: Proposal ID
        proposal_data: Proposal update data (partial)
        
    Returns:
        Updated proposal if found, None otherwise
    """
    proposals_collection = database.proposals
    
    try:
        # Build update dict with only provided fields
        update_dict = {}
        if proposal_data.vendorName is not None:
            update_dict["vendorName"] = proposal_data.vendorName
        if proposal_data.bidAmount is not None:
            update_dict["bidAmount"] = proposal_data.bidAmount
        if proposal_data.timeline is not None:
            update_dict["timeline"] = proposal_data.timeline
        if proposal_data.warranty is not None:
            update_dict["warranty"] = proposal_data.warranty
        if proposal_data.scopeSummary is not None:
            update_dict["scopeSummary"] = proposal_data.scopeSummary
        if proposal_data.status is not None:
            update_dict["status"] = proposal_data.status
        
        # Always update updatedAt
        update_dict["updatedAt"] = datetime.utcnow()
        
        if not update_dict:
            # No fields to update
            return await get_proposal_by_id(proposal_id)
        
        result = await proposals_collection.find_one_and_update(
            {"_id": ObjectId(proposal_id)},
            {"$set": update_dict},
            return_document=True
        )
        
        if result:
            result["_id"] = str(result["_id"])
            return ProposalInDB(**result)
    except Exception:
        pass
    
    return None


async def archive_proposal(proposal_id: str) -> bool:
    """
    Archive proposal (soft delete) by setting archivedAt timestamp.
    
    Args:
        proposal_id: Proposal ID
        
    Returns:
        True if archived successfully, False otherwise
    """
    proposals_collection = database.proposals
    
    try:
        result = await proposals_collection.update_one(
            {"_id": ObjectId(proposal_id)},
            {"$set": {"archivedAt": datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception:
        return False