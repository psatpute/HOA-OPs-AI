# Sprint S5: Vendor Proposal Management - Summary

## ✅ Completed Tasks

### 1. Backend Implementation

#### Proposal Model (`backend/models/proposal.py`)
- Created Pydantic models for proposal management
- Implemented validation for:
  - Bid amount (must be > 0)
  - Status (Pending/Accepted/Rejected)
  - Required fields (vendorName, timeline, warranty, scopeSummary)
- Models created:
  - `ProposalBase`: Base model with common fields
  - `ProposalCreate`: Model for creation
  - `ProposalUpdate`: Model for updates (all fields optional)
  - `ProposalInDB`: Database model with timestamps
  - `ProposalResponse`: API response model
  - `ProposalListResponse`: List endpoint response model

#### Proposal CRUD Operations (`backend/crud/proposal.py`)
- `create_proposal()`: Create new proposal with optional file URL
- `get_proposals()`: List proposals with filtering by:
  - Project ID
  - Vendor name (case-insensitive partial match)
  - Archived status
  - Pagination support (limit/skip)
- `get_proposal_by_id()`: Retrieve single proposal
- `update_proposal()`: Update proposal metadata (partial updates)
- `archive_proposal()`: Soft delete by setting archivedAt timestamp

#### File Upload Utility (`backend/utils/file_upload.py`)
- File validation:
  - Allowed extensions: PDF, JPG, JPEG, PNG, DOCX, XLSX, DOC, XLS
  - Maximum file size: 10MB (configurable via settings)
- `validate_file()`: Validates file type and existence
- `save_file()`: Saves file to disk with:
  - Unique UUID-based filename
  - Chunked reading (8KB chunks) for memory efficiency
  - Size validation during upload
  - Automatic directory creation
- `delete_file()`: Delete file from disk
- `get_file_size_mb()`: Get file size in megabytes

#### Proposal Router (`backend/routers/proposals.py`)
Implemented all CRUD endpoints:

1. **POST /api/v1/proposals**
   - Accepts multipart/form-data with file upload
   - Form fields: projectId, vendorName, bidAmount, timeline, warranty, scopeSummary, status
   - Optional file attachment (max 10MB)
   - Validates project exists before creating proposal
   - Returns created proposal with file URL

2. **GET /api/v1/proposals**
   - List all proposals with filtering
   - Query params: projectId, vendorName, archived, limit, skip
   - Returns paginated results with total count
   - Sorted by creation date (newest first)

3. **GET /api/v1/proposals/{id}**
   - Retrieve single proposal by ID
   - Returns 404 if not found

4. **PATCH /api/v1/proposals/{id}**
   - Update proposal metadata
   - Supports partial updates
   - Cannot update file (must archive and create new)
   - Updates timestamp automatically

5. **DELETE /api/v1/proposals/{id}**
   - Soft delete (archive) proposal
   - Sets archivedAt timestamp
   - Excluded from default queries

#### Main App Integration (`backend/main.py`)
- Registered proposals router at `/api/v1/proposals`
- Router included in FastAPI app with proper prefix

### 2. Frontend Implementation

#### Project Detail Page Updates (`HOA-OPs-AI/frontend/app/projects/[id]/page.tsx`)
- Added file upload support to proposal modal
- Implemented FormData for multipart/form-data submission
- Features:
  - File input with drag-and-drop area
  - Accepts: PDF, JPG, PNG, DOCX, XLSX (max 10MB)
  - Shows selected filename
  - Optional file attachment
  - Real-time proposal list updates after upload
- Updated `handleUploadSubmit()` to:
  - Create FormData object
  - Append all form fields
  - Append file if selected
  - Send multipart request without Content-Type header (browser sets it)
  - Clear form and file state on success

## 📋 API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/v1/proposals` | Create proposal with file | Yes |
| GET | `/api/v1/proposals` | List proposals (filtered) | Yes |
| GET | `/api/v1/proposals/{id}` | Get single proposal | Yes |
| PATCH | `/api/v1/proposals/{id}` | Update proposal metadata | Yes |
| DELETE | `/api/v1/proposals/{id}` | Archive proposal | Yes |

## 🗄️ Database Schema

### Collection: `proposals`
```json
{
  "_id": "ObjectId",
  "projectId": "string (required)",
  "vendorName": "string (required)",
  "bidAmount": "float (required, > 0)",
  "timeline": "string (required)",
  "warranty": "string (required)",
  "scopeSummary": "string (required)",
  "fileUrl": "string (optional)",
  "status": "string (default: 'Pending', enum: Pending/Accepted/Rejected)",
  "uploadedBy": "ObjectId (required, ref: users)",
  "createdAt": "datetime (required)",
  "updatedAt": "datetime (required)",
  "archivedAt": "datetime (optional)"
}
```

## 📁 File Storage

- **Location**: `./uploads/proposals/`
- **Naming**: UUID-based (e.g., `abc123-def456.pdf`)
- **URL Format**: `/uploads/proposals/{filename}`
- **Max Size**: 10MB (configurable via `MAX_FILE_SIZE` env var)
- **Allowed Types**: PDF, JPG, JPEG, PNG, DOCX, XLSX, DOC, XLS

## ✅ Constraint Checklist

1. ✅ **Can upload proposal with file?**
   - Yes, multipart/form-data endpoint accepts file uploads
   - File is optional, can create proposal without file

2. ✅ **File saved to disk/storage?**
   - Yes, files saved to `./uploads/proposals/` directory
   - Unique UUID-based filenames prevent conflicts
   - File URL stored in database

3. ✅ **Proposal linked to project?**
   - Yes, projectId is required field
   - Validates project exists before creating proposal
   - Project detail endpoint includes linked proposals

4. ✅ **Can view proposal list?**
   - Yes, GET /api/v1/proposals returns all proposals
   - Supports filtering by projectId and vendorName
   - Pagination support with limit/skip

5. ✅ **Can update proposal status?**
   - Yes, PATCH endpoint supports status updates
   - Status validation (Pending/Accepted/Rejected)
   - Can update all metadata fields

6. ✅ **Frontend connected?**
   - Yes, project detail page integrated with API
   - File upload modal functional
   - Proposals display in project detail view
   - Real-time updates after upload

## 🧪 Manual Testing Guide

### Test 1: Create Proposal with File Upload
1. Start backend: `cd backend && python3 -m uvicorn main:app --reload --port 8000`
2. Start frontend: `cd HOA-OPs-AI/frontend && npm run dev`
3. Navigate to a project detail page
4. Click "Upload Proposal" button
5. Fill in all fields:
   - Vendor Name: "Test Roofing Co"
   - Bid Amount: 25000
   - Timeline: "2 weeks"
   - Warranty: "10 years"
   - Scope Summary: "Full roof replacement"
6. Click file upload area and select a PDF file
7. Click "Upload Proposal"
8. **Expected**: Proposal appears in list with file attached

### Test 2: Create Proposal without File
1. Follow steps 1-5 from Test 1
2. Skip file upload
3. Click "Upload Proposal"
4. **Expected**: Proposal created successfully without file

### Test 3: List Proposals
1. Open browser console
2. Check Network tab for GET request to `/api/v1/proposals?projectId={id}`
3. **Expected**: All proposals for project returned

### Test 4: Update Proposal Status
1. Use API client (Postman/curl) or implement frontend UI
2. PATCH `/api/v1/proposals/{id}` with `{"status": "Accepted"}`
3. **Expected**: Proposal status updated, updatedAt timestamp changed

### Test 5: Archive Proposal
1. Use API client
2. DELETE `/api/v1/proposals/{id}`
3. **Expected**: Proposal archived (archivedAt set)
4. Verify proposal excluded from default list

### Test 6: File Validation
1. Try uploading file > 10MB
2. **Expected**: Error message about file size
3. Try uploading unsupported file type (e.g., .exe)
4. **Expected**: Error message about file type

## 🔧 Configuration

### Environment Variables
```bash
UPLOAD_DIR=./uploads          # Directory for file uploads
MAX_FILE_SIZE=10485760        # Max file size in bytes (10MB)
```

### File Upload Settings
- Chunked reading: 8KB chunks
- Automatic directory creation
- UUID-based unique filenames
- Content-type validation

## 📝 Notes

1. **File Updates**: Files cannot be updated via PATCH endpoint. To change a file, archive the proposal and create a new one.

2. **Soft Delete**: Archived proposals remain in database but are excluded from default queries. Use `archived=true` query param to include them.

3. **Project Validation**: Creating a proposal validates that the project exists. Returns 404 if project not found.

4. **File Storage**: Files are stored on local filesystem. For production, consider cloud storage (S3, Azure Blob, etc.).

5. **Security**: All endpoints require JWT authentication. File uploads validate size and type.

## 🚀 Next Steps (Sprint S6)

- Document repository implementation
- Additional file upload endpoints for documents
- File download endpoint
- File serving with proper content-type headers

## 📊 Sprint Metrics

- **Files Created**: 4 backend files, 1 frontend update
- **Lines of Code**: ~700 lines
- **Endpoints Implemented**: 5 REST endpoints
- **Test Scenarios**: 6 manual tests
- **Time Estimate**: 2-3 hours for full implementation and testing

---

**Sprint S5 Status**: ✅ **COMPLETE**

All objectives met. Proposal management system fully functional with file upload support.