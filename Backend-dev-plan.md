
# BACKEND DEVELOPMENT PLAN - HOA OpsAI

## 1️⃣ EXECUTIVE SUMMARY

**What Will Be Built:**
- FastAPI backend (Python 3.13, async) for HOA OpsAI web application
- MongoDB Atlas database for all entity storage
- RESTful API endpoints supporting financial tracking, project management, vendor proposals, and document repository
- JWT-based authentication system
- File upload handling for proposals, receipts, and documents

**Why:**
- Frontend requires live backend to replace dummy data in [`store.tsx`](HOA-OPs-AI/frontend/lib/store.tsx:1)
- Enable full CRUD operations for projects, proposals, documents
- Provide immutable financial records (expenses/income) for audit compliance
- Support Excel/CSV import for bulk financial data
- Enable vendor proposal comparison and project tracking workflows

**Key Constraints:**
- FastAPI with Python 3.13 runtime (async/await patterns)
- MongoDB Atlas only (no local MongoDB instance)
- No Docker containers
- Manual testing required after every task via frontend UI
- Single Git branch `main` only
- API base path: `/api/v1/*`
- Background tasks: synchronous by default, `BackgroundTasks` only if strictly necessary

**Sprint Structure:**
- **S0:** Environment setup, MongoDB Atlas connection, frontend integration, Git initialization
- **S1:** JWT authentication (signup, login, logout, protected routes)
- **S2:** Financial tracking (expenses - create/view only, immutable)
- **S3:** Income management (create/view, Excel/CSV import)
- **S4:** Project management (full CRUD with archiving)
- **S5:** Vendor proposal management (full CRUD, file uploads, project linking)
- **S6:** Document repository (full CRUD, file uploads, categorization)
- **S7:** Dashboard aggregations and vendor comparison view

---

## 2️⃣ IN-SCOPE & SUCCESS CRITERIA

**In-Scope Features:**
- User authentication (signup, login, logout, JWT tokens)
- Expense tracking (create, list, search, filter by category/vendor/project)
- Income management (create, list, search, filter by source, Excel/CSV import)
- Project management (create, read, update, archive, status tracking)
- Vendor proposal management (create, read, update, archive, file uploads)
- Document repository (create, read, update, archive, file uploads, categorization)
- Financial dashboard aggregations (total balance, income, expenses, category breakdown)
- Vendor comparison view (side-by-side proposal comparison for projects)
- File upload handling (proposals, receipts, documents up to 10MB)
- Search and filtering across all entities

**Success Criteria:**
- All frontend features functional end-to-end with live backend data
- User can complete full workflow: signup → login → create project → upload proposals → compare → track expenses
- Financial records (expenses/income) are immutable after creation
- Excel/CSV import successfully parses and creates income/expense records
- File uploads work reliably up to 10MB (PDF, images, Excel, Word)
- All task-level manual tests pass via frontend UI
- Each sprint's code pushed to `main` after verification
- Dashboard displays real-time calculations from database
- Vendor comparison view shows proposals side-by-side with sortable columns

---

## 3️⃣ API DESIGN

**Base Path:** `/api/v1`

**Error Envelope:**
```json
{ "error": "Descriptive error message" }
```

**Authentication Endpoints:**

- **POST** `/api/v1/auth/signup`
  - Purpose: Register new user account
  - Request: `{ "email": "string", "password": "string", "firstName": "string", "lastName": "string" }`
  - Response: `{ "id": "string", "email": "string", "firstName": "string", "lastName": "string", "token": "string" }`
  - Validation: Email format, password min 8 chars, unique email

- **POST** `/api/v1/auth/login`
  - Purpose: Authenticate user and issue JWT
  - Request: `{ "email": "string", "password": "string" }`
  - Response: `{ "id": "string", "email": "string", "firstName": "string", "lastName": "string", "token": "string" }`
  - Validation: Valid credentials, account exists

- **POST** `/api/v1/auth/logout`
  - Purpose: Invalidate session (client-side token removal)
  - Request: None (token in Authorization header)
  - Response: `{ "message": "Logged out successfully" }`

- **GET** `/api/v1/auth/me`
  - Purpose: Get current user profile
  - Request: None (token in Authorization header)
  - Response: `{ "id": "string", "email": "string", "firstName": "string", "lastName": "string", "role": "string" }`

**Expense Endpoints:**

- **POST** `/api/v1/expenses`
  - Purpose: Create new expense record
  - Request: `{ "date": "YYYY-MM-DD", "amount": number, "category": "string", "vendor": "string", "description": "string", "projectId": "string?" }`
  - Response: `{ "id": "string", "date": "string", "amount": number, "category": "string", "vendor": "string", "description": "string", "projectId": "string?", "createdBy": "string", "createdAt": "ISO8601" }`
  - Validation: Amount > 0, date not future, category from predefined list

- **GET** `/api/v1/expenses`
  - Purpose: List all expenses with filtering
  - Query Params: `?category=string&vendor=string&projectId=string&search=string&limit=50&skip=0`
  - Response: `{ "expenses": [...], "total": number }`

- **GET** `/api/v1/expenses/{id}`
  - Purpose: Get single expense details
  - Response: Expense object

**Income Endpoints:**

- **POST** `/api/v1/income`
  - Purpose: Create new income record
  - Request: `{ "date": "YYYY-MM-DD", "amount": number, "source": "string", "description": "string" }`
  - Response: Income object with id, createdBy, createdAt
  - Validation: Amount > 0, date not future, source from predefined list

- **GET** `/api/v1/income`
  - Purpose: List all income records with filtering
  - Query Params: `?source=string&search=string&limit=50&skip=0`
  - Response: `{ "income": [...], "total": number }`

- **POST** `/api/v1/income/import`
  - Purpose: Bulk import income/expense from Excel/CSV
  - Request: Multipart form-data with file
  - Response: `{ "imported": number, "errors": [...] }`
  - Validation: File size < 10MB, max 1000 rows, valid columns

**Project Endpoints:**

- **POST** `/api/v1/projects`
  - Purpose: Create new project
  - Request: `{ "name": "string", "description": "string", "status": "Planned|In Progress|Completed", "budget": number, "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD?" }`
  - Response: Project object with id, createdBy, createdAt
  - Validation: Budget > 0, status in allowed values

- **GET** `/api/v1/projects`
  - Purpose: List all projects with filtering
  - Query Params: `?status=string&search=string&archived=false`
  - Response: `{ "projects": [...], "total": number }`

- **GET** `/api/v1/projects/{id}`
  - Purpose: Get project details with proposals and expenses
  - Response: `{ "project": {...}, "proposals": [...], "expenses": [...], "actualSpent": number }`

- **PATCH** `/api/v1/projects/{id}`
  - Purpose: Update project details
  - Request: Partial project fields
  - Response: Updated project object

- **DELETE** `/api/v1/projects/{id}`
  - Purpose: Archive project (soft delete)
  - Response: `{ "message": "Project archived" }`

**Proposal Endpoints:**

- **POST** `/api/v1/proposals`
  - Purpose: Create vendor proposal with file upload
  - Request: Multipart form-data with fields + file
  - Response: Proposal object with fileUrl
  - Validation: ProjectId exists, bidAmount > 0, file < 10MB

- **GET** `/api/v1/proposals`
  - Purpose: List proposals with filtering
  - Query Params: `?projectId=string&vendorName=string&archived=false`
  - Response: `{ "proposals": [...], "total": number }`

- **GET** `/api/v1/proposals/{id}`
  - Purpose: Get proposal details
  - Response: Proposal object

- **PATCH** `/api/v1/proposals/{id}`
  - Purpose: Update proposal metadata
  - Request: Partial proposal fields
  - Response: Updated proposal object

- **DELETE** `/api/v1/proposals/{id}`
  - Purpose: Archive proposal
  - Response: `{ "message": "Proposal archived" }`

**Document Endpoints:**

- **POST** `/api/v1/documents`
  - Purpose: Upload document with metadata
  - Request: Multipart form-data
  - Response: Document object with fileUrl
  - Validation: File < 10MB, category from predefined list

- **GET** `/api/v1/documents`
  - Purpose: List documents with filtering
  - Query Params: `?category=string&search=string&archived=false`
  - Response: `{ "documents": [...], "total": number }`

- **GET** `/api/v1/documents/{id}`
  - Purpose: Get document details
  - Response: Document object

- **PATCH** `/api/v1/documents/{id}`
  - Purpose: Update document metadata
  - Request: Partial document fields
  - Response: Updated document object

- **DELETE** `/api/v1/documents/{id}`
  - Purpose: Archive document
  - Response: `{ "message": "Document archived" }`

**Dashboard Endpoints:**

- **GET** `/api/v1/dashboard/summary`
  - Purpose: Get financial overview for dashboard
  - Response: `{ "totalBalance": number, "totalIncome": number, "totalExpenses": number, "expensesByCategory": {...}, "recentTransactions": [...] }`

- **GET** `/api/v1/projects/{id}/comparison`
  - Purpose: Get vendor comparison data for project
  - Response: `{ "project": {...}, "proposals": [...] }` (sorted by amount)

**Health Check:**

- **GET** `/healthz`
  - Purpose: Health check with DB connection status
  - Response: `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`

---

## 4️⃣ DATA MODEL (MONGODB ATLAS)

**Collection: users**
- `_id`: ObjectId (auto)
- `email`: string (required, unique, indexed)
- `passwordHash`: string (required, Argon2)
- `firstName`: string (required)
- `lastName`: string (required)
- `role`: string (default: "Board Member")
- `createdAt`: datetime (required)
- `lastLoginAt`: datetime (optional)

Example:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "treasurer@hoa.com",
  "passwordHash": "$argon2id$v=19$m=65536...",
  "firstName": "Teresa",
  "lastName": "Treasurer",
  "role": "Board Member",
  "createdAt": "2023-10-01T10:00:00Z",
  "lastLoginAt": "2023-10-15T14:30:00Z"
}
```

**Collection: expenses**
- `_id`: ObjectId (auto)
- `date`: string (YYYY-MM-DD, required)
- `amount`: float (required, > 0)
- `category`: string (required, enum)
- `vendor`: string (required)
- `description`: string (required)
- `receiptUrl`: string (optional)
- `projectId`: ObjectId (optional, reference to projects)
- `createdBy`: ObjectId (required, reference to users)
- `createdAt`: datetime (required)

Example:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "date": "2023-10-05",
  "amount": 450.00,
  "category": "Landscaping",
  "vendor": "Green Thumb Landscaping",
  "description": "Weekly Lawn Maintenance",
  "receiptUrl": null,
  "projectId": null,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2023-10-05T09:15:00Z"
}
```

**Collection: income**
- `_id`: ObjectId (auto)
- `date`: string (YYYY-MM-DD, required)
- `amount`: float (required, > 0)
- `source`: string (required, enum: Dues/Assessment/Fine/Interest/Other)
- `description`: string (required)
- `createdBy`: ObjectId (required, reference to users)
- `createdAt`: datetime (required)

Example:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "date": "2023-10-01",
  "amount": 15000.00,
  "source": "Dues",
  "description": "Monthly HOA Dues",
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2023-10-01T08:00:00Z"
}
```

**Collection: projects**
- `_id`: ObjectId (auto)
- `name`: string (required)
- `description`: string (required)
- `status`: string (required, enum: Planned/In Progress/Completed)
- `budget`: float (required, > 0)
- `startDate`: string (YYYY-MM-DD, required)
- `endDate`: string (YYYY-MM-DD, optional)
- `assignedVendorId`: string (optional)
- `createdBy`: ObjectId (required, reference to users)
- `createdAt`: datetime (required)
- `updatedAt`: datetime (required)
- `archivedAt`: datetime (optional)

Example:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Clubhouse Roof Repair",
  "description": "Replace damaged shingles and fix leaks",
  "status": "Planned",
  "budget": 25000.00,
  "startDate": "2023-11-01",
  "endDate": null,
  "assignedVendorId": null,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2023-10-10T11:00:00Z",
  "updatedAt": "2023-10-10T11:00:00Z",
  "archivedAt": null
}
```

**Collection: proposals**
- `_id`: ObjectId (auto)
- `projectId`: ObjectId (required, reference to projects)
- `vendorName`: string (required)
- `bidAmount`: float (required, > 0)
- `timeline`: string (required)
- `warranty`: string (required)
- `scopeSummary`: string (required)
- `fileUrl`: string (optional)
- `status`: string (default: "Pending", enum: Pending/Accepted/Rejected)
- `uploadedBy`: ObjectId (required, reference to users)
- `createdAt`: datetime (required)
- `updatedAt`: datetime (required)
- `archivedAt`: datetime (optional)

Example:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "projectId": "507f1f77bcf86cd799439014",
  "vendorName": "TopTier Roofing",
  "bidAmount": 24500.00,
  "timeline": "2 weeks",
  "warranty": "10 years",
  "scopeSummary": "Full replacement of shingles, underlayment check",
  "fileUrl": "/uploads/proposals/abc123.pdf",
  "status": "Pending",
  "uploadedBy": "507f1f77bcf86cd799439011",
  "createdAt": "2023-10-12T14:00:00Z",
  "updatedAt": "2023-10-12T14:00:00Z",
  "archivedAt": null
}
```

**Collection: documents**
- `_id`: ObjectId (auto)
- `title`: string (required)
- `category`: string (required, enum: Contract/Meeting Minutes/Financial Report/Other)
- `description`: string (optional)
- `fileUrl`: string (required)
- `fileType`: string (required, e.g., pdf, docx)
- `fileSize`: string (required, e.g., "2.4 MB")
- `uploadedBy`: ObjectId (required, reference to users)
- `createdAt`: datetime (required)
- `updatedAt`: datetime (required)
- `archivedAt`: datetime (optional)

Example:
```json
{
  "_id": "507f1f77bcf86cd799439016",
  "title": "Oct 2023 Meeting Minutes",
  "category": "Meeting Minutes",
  "description": "Board meeting minutes",
  "fileUrl": "/uploads/documents/xyz789.pdf",
  "fileType": "pdf",
  "fileSize": "2.4 MB",
  "uploadedBy": "507f1f77bcf86cd799439011",
  "createdAt": "2023-10-02T16:00:00Z",
  "updatedAt": "2023-10-02T16:00:00Z",
  "archivedAt": null
}
```

---

## 5️⃣ FRONTEND AUDIT & FEATURE MAP

**Landing Page** ([`page.tsx`](HOA-OPs-AI/frontend/app/page.tsx:1))
- Route: `/`
- Purpose: Marketing landing page with login form
- Data Needed: None (public page)
- Backend Endpoints: `POST /api/v1/auth/login`
- Auth: None

**Dashboard** ([`dashboard/page.tsx`](HOA-OPs-AI/frontend/app/dashboard/page.tsx:1))
- Route: `/dashboard`
- Purpose: Financial overview with charts and recent transactions
- Data Needed: Total balance, income, expenses, category breakdown, recent transactions
- Backend Endpoints: `GET /api/v1/dashboard/summary`
- Auth: Required (JWT)

**Expenses Page** ([`expenses/page.tsx`](HOA-OPs-AI/frontend/app/expenses/page.tsx:1))
- Route: `/expenses`
- Purpose: List, search, filter, and create expenses
- Data Needed: All expenses with filtering by category/vendor/project
- Backend Endpoints: `GET /api/v1/expenses`, `POST /api/v1/expenses`
- Auth: Required (JWT)

**Income Page** ([`income/page.tsx`](HOA-OPs-AI/frontend/app/income/page.tsx:1))
- Route: `/income`
- Purpose: List, search, filter, create income, and import from Excel/CSV
- Data Needed: All income records with filtering by source
- Backend Endpoints: `GET /api/v1/income`, `POST /api/v1/income`, `POST /api/v1/income/import`
- Auth: Required (JWT)

**Projects List** ([`projects/page.tsx`](HOA-OPs-AI/frontend/app/projects/page.tsx:1))
- Route: `/projects`
- Purpose: List, search, filter, and create projects
- Data Needed: All projects with filtering by status
- Backend Endpoints: `GET /api/v1/projects`, `POST /api/v1/projects`
- Auth: Required (JWT)

**Project Detail** ([`projects/[id]/page.tsx`](HOA-OPs-AI/frontend/app/projects/[id]/page.tsx:1))
- Route: `/projects/:id`
- Purpose: View project details, proposals, expenses, and vendor comparison
- Data Needed: Project details, linked proposals, linked expenses, budget vs actual
- Backend Endpoints: `GET /api/v1/projects/{id}`, `PATCH /api/v1/projects/{id}`, `POST /api/v1/proposals`, `GET /api/v1/projects/{id}/comparison`
- Auth: Required (JWT)
- Notes: Includes vendor comparison tab with AI Analysis button (tooltip only)

**Documents Page** ([`documents/page.tsx`](HOA-OPs-AI/frontend/app/documents/page.tsx:1))
- Route: `/documents`
- Purpose: List, search, filter, upload, and delete documents
- Data Needed: All documents with filtering by category
- Backend Endpoints: `GET /api/v1/documents`, `POST /api/v1/documents`, `DELETE /api/v1/documents/{id}`
- Auth: Required (JWT)

**Contact Page** ([`contact/page.tsx`](HOA-OPs-AI/frontend/app/contact/page.tsx:1))
- Route: `/contact`
- Purpose: Display board member and management contact information
- Data Needed: Static content (no backend needed)
- Backend Endpoints: None
- Auth: Required (JWT)

---

## 6️⃣ CONFIGURATION & ENV VARS

**Required Environment Variables:**

- `APP_ENV` — Environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/hoaops?retryWrites=true&w=majority`)
- `JWT_SECRET` — Secret key for JWT signing (min 32 chars)
- `JWT_EXPIRES_IN` — JWT expiration in seconds (default: 86400 = 24 hours)
- `CORS_ORIGINS` — Comma-separated allowed frontend URLs (e.g., `http://localhost:3000,https://app.hoaops.com`)
- `UPLOAD_DIR` — Directory for file uploads (default: `./uploads`)
- `MAX_FILE_SIZE` — Max file upload size in bytes (default: 10485760 = 10MB)

**Example `.env` file:**
```
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/hoaops?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=86400
CORS_ORIGINS=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## 7️⃣ BACKGROUND WORK

**Not Required for MVP**

All operations are synchronous and complete within request/response cycle. No background tasks, queues, or async processing needed.

---

## 8️⃣ INTEGRATIONS

**File Upload/Storage:**
- Trigger: User uploads file via form (proposals, receipts, documents)
- Flow: Multipart form-data → validate size/type → save to `UPLOAD_DIR` → return file URL
- Storage: Local filesystem in `./uploads` directory (organized by type: proposals/, documents/, receipts/)
- Extra ENV: `UPLOAD_DIR`, `MAX_FILE_SIZE`
- Error Handling: Validate file size < 10MB, allowed types (PDF, JPG, PNG, DOCX, XLSX), return error if validation fails

**Excel/CSV Import:**
- Trigger: User uploads Excel/CSV file on income page
- Flow: Parse file → validate rows → create income/expense records → return success count + errors
- Libraries: `pandas` for parsing, `openpyxl` for Excel
- Validation: Max 1000 rows, required columns (date, amount, description, category/source)
- Error Handling: Row-by-row validation, return list of errors with row numbers

---

## 9️⃣ TESTING STRATEGY (MANUAL VIA FRONTEND)

**Validation Approach:**
- All testing performed through frontend UI
- Every task includes Manual Test Step and User Test Prompt
- No automated tests required for MVP
- After each task passes → proceed to next task
- After all tasks in sprint pass → commit and push to `main`

**Test Failure Protocol:**
- If any test fails → fix issue immediately
- Retest failed task before proceeding
- Do not push to `main` until all sprint tasks pass

**Manual Test Step Format:**
- Exact UI action to perform
- Expected result to verify

**User Test Prompt Format:**
- Concise copy-paste instruction for user
- Clear success criteria

---

## 🔟 DYNAMIC SPRINT PLAN & BACKLOG

---

## 🧱 S0 – ENVIRONMENT SETUP & FRONTEND CONNECTION

**Objectives:**
- Create FastAPI project structure with `/api/v1` base path
- Connect to MongoDB Atlas using `MONGODB_URI`
- Implement `/healthz` endpoint with DB ping
- Enable CORS for frontend origin
- Replace dummy data URLs in frontend with real backend URLs
- Initialize Git repository at root with `main` branch
- Create `.gitignore` at root
- Push initial commit to GitHub

**User Stories:**
- As a developer, I need a working FastAPI skeleton so I can build features
- As a developer, I need MongoDB Atlas connection so I can store data
- As a developer, I need CORS enabled so frontend can call backend
- As a frontend developer, I need to update API URLs so app uses real backend

**Tasks:**

1. **Create FastAPI project structure**
   - Create `backend/` directory at root
   - Create `backend/main.py` with FastAPI app
   - Create `backend/requirements.txt` with dependencies: `fastapi`, `uvicorn[standard]`, `motor`, `pydantic`, `python-jose[cryptography]`, `passlib[argon2]`, `python-multipart`, `pandas`, `openpyxl`
   - Create `backend/.env.example` with all required env vars
   - Create `backend/config.py` to load env vars using `pydantic-settings`
   - Manual Test Step: Run `pip install -r requirements.txt` → all packages install successfully
   - User Test Prompt: "Install dependencies and confirm no errors"

2. **Implement `/healthz` endpoint with MongoDB Atlas connection**
   - Create `backend/database.py` with Motor async client
   - Connect to MongoDB Atlas using `MONGODB_URI` from env
   - Implement `GET /healthz` that pings database and returns `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`
   - Manual Test Step: Start backend with `uvicorn main:app --reload` → visit `http://localhost:8000/healthz` → see `{"status": "ok", "database": "connected"}`
   - User Test Prompt: "Start backend and visit /healthz endpoint. Confirm database shows 'connected'."

3. **Enable CORS for frontend**
   - Add `fastapi.middleware.cors.CORSMiddleware` to app
   - Configure allowed origins from `CORS_ORIGINS` env var
   - Allow credentials, all methods, all headers
   - Manual Test Step: Start backend → open browser console on frontend → make fetch request to `/healthz` → no CORS error
   - User Test Prompt: "Open frontend, check browser console, confirm no CORS errors when calling backend."

4. **Update frontend API URLs**
   - Create `backend/` directory at root if not exists
   - Update [`store.tsx`](HOA-OPs-AI/frontend/lib/store.tsx:1) to use `http://localhost:8000/api/v1` instead of dummy data
   - Add `NEXT_PUBLIC_API_URL` to frontend `.env.local`
   - Manual Test Step: Start both frontend and backend → open frontend → check Network tab → see requests to `localhost:8000/api/v1`
   - User Test Prompt: "Start frontend and backend. Open Network tab and confirm API calls go to localhost:8000."

5. **Initialize Git and push to GitHub**
   - Run `git init` at project root (if not already initialized)
   - Create `.gitignore` at root with: `__pycache__/`, `*.pyc`, `.env`, `*.log`, `uploads/`, `node_modules/`, `.next/`
   - Set default branch to `main`: `git branch -M main`
   - Add all files: `git add .`
   - Commit: `git commit -m "Initial backend setup with FastAPI and MongoDB Atlas"`
   - Create GitHub repo and push: `git remote add origin <url>` → `git push -u origin main`
   - Manual Test Step: Visit GitHub repo → see initial commit with backend files
   - User Test Prompt: "Check GitHub repository and confirm initial commit is visible."

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` returns success with MongoDB Atlas connection status
- Frontend can call backend without CORS errors
- Git repository initialized with `main` branch
- Initial commit pushed to GitHub
- `.gitignore` created at root

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S0: Environment setup complete"`
- Push to main: `git push origin main`

---

## 🧩 S1 – BASIC AUTH (SIGNUP / LOGIN / LOGOUT)

**Objectives:**
- Implement JWT-based authentication
- Create `users` collection in MongoDB
- Hash passwords with Argon2
- Protect one backend route and one frontend page

**User Stories:**
- As a user, I can sign up with email/password so I can create an account
- As a user, I can log in with credentials so I can access the app
- As a user, I can log out so my session ends
- As a developer, I can protect routes so only authenticated users access them

**Endpoints:**
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

**Tasks:**

1. **Create User model and database operations**
   - Create `backend/models/user.py` with Pydantic model for User
   - Fields: `_id`, `email`, `passwordHash`, `firstName`, `lastName`, `role`, `createdAt`, `lastLoginAt`
   - Create `backend/crud/user.py` with async functions: `create_user()`, `get_user_by_email()`, `update_last_login()`
   - Manual Test Step: Create test user in MongoDB Atlas UI → verify document structure matches model
   - User Test Prompt: "Check MongoDB Atlas and confirm users collection exists with correct fields."

2. **Implement password hashing with Argon2**
   - Create `backend/auth/password.py` with `hash_password()` and `verify_password()` using `passlib[argon2]`
   - Manual Test Step: Run Python shell → hash password → verify password → confirm both work
   - User Test Prompt: "Test password hashing in Python shell and confirm hash/verify functions work."

3. **Implement JWT token generation and validation**
   - Create `backend/auth/jwt.py` with `create_access_token()` and `verify_token()` using `python-jose`
   - Use `JWT_SECRET` and `JWT_EXPIRES_IN` from config
   - Manual Test Step: Generate token → decode token → verify payload contains user ID and expiry
   - User Test Prompt: "Generate JWT token and decode it to confirm payload is correct."

4. **Implement signup endpoint**
   - Create `backend/routers/auth.py` with `POST /api/v1/auth/signup`
   - Validate email format, password min 8 chars, unique email
   - Hash password, create user in DB, return user + JWT token
   - Manual Test Step: Use Postman/curl to signup → receive token → verify user in DB
   - User Test Prompt: "Sign up via API and confirm user is created in database."

5. **Implement login endpoint**
   - Add `POST /api/v1/auth/login` to `auth.py`
   - Validate credentials, verify password, update `lastLoginAt`, return user + JWT token
   - Manual Test Step: Login with valid credentials → receive token → login with invalid credentials → receive error
   - User Test Prompt: "Log in with correct and incorrect credentials. Confirm token on success, error on failure."

6. **Implement logout endpoint**
   - Add `POST /api/v1/auth/logout` to `auth.py`
   - Return success message (token invalidation handled client-side)
   - Manual Test Step: Call logout endpoint with valid token → receive success message
   - User Test Prompt: "Call logout endpoint and confirm success response."

7. **Implement auth middleware and protect route**
   - Create `backend/auth/middleware.py` with `get_current_user()` dependency
   - Extract JWT from Authorization header, verify token, return user
   - Protect `GET /api/v1/auth/me` endpoint using dependency
   - Manual Test Step: Call `/auth/me` without token → 401 error → call with valid token → receive user data
   - User Test Prompt: "Test /auth/me endpoint with and without token. Confirm 401 without token, user data with token."

8. **Update frontend to use real auth endpoints**
   - Update [`store.tsx`](HOA-OPs-AI/frontend/lib/store.tsx:126) `login()` function to call `POST /api/v1/auth/login`
   - Store JWT token in localStorage
   - Add Authorization header to all API requests
   - Implement auto-redirect to login if 401 received
   - Manual Test Step: Sign up via frontend → redirected to dashboard → refresh page → still logged in → logout → redirected to login
   - User Test Prompt: "Sign up, log in, refresh page, and log out via frontend. Confirm all flows work correctly."

**Definition of Done:**
- Users can sign up with email/password via frontend
- Users can log in and receive JWT token
- Token stored in localStorage and sent with requests
- Protected routes return 401 without valid token
- Logout clears token and redirects to login
- All auth flows work end-to-end in frontend

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S1: Authentication complete"`
- Push to main: `git push origin main`

---

## 🧱 S2 – EXPENSE TRACKING (CREATE/VIEW ONLY)

**Objectives:**
- Implement expense creation and listing
- Create `expenses` collection in MongoDB
- Enforce immutability (no edit/delete)
- Support filtering by category, vendor, project
- Link expenses to projects (optional)

**User Stories:**
- As a treasurer, I can log expenses so I can track spending
- As a board member, I can view all expenses so I can monitor finances
- As a board member, I can filter expenses by category/vendor so I can analyze spending patterns
- As a project manager, I can link expenses to projects so I can track project costs

**Endpoints:**
- `POST /api/v1/expenses`
- `GET /api/v1/expenses`
- `GET /api/v1/expenses/{id}`

**Tasks:**

1. **Create Expense model and CRUD operations**
   - Create `backend/models/expense.py` with Pydantic model
   - Fields: `_id`, `date`, `amount`, `category`, `vendor`, `description`, `receiptUrl`, `projectId`, `createdBy`, `createdAt`
   - Create `backend/crud/expense.py` with `create_expense()`, `get_expenses()`, `get_expense_by_id()`
   - Manual Test Step: Create test expense in MongoDB Atlas → verify structure
   - User Test Prompt: "Check MongoDB Atlas expenses collection and confirm structure."

2. **Implement POST /api/v1/expenses endpoint**
   - Create `backend/routers/expenses.py` with create endpoint
   - Validate: amount > 0, date not future, category from enum
   - Set `createdBy` from authenticated user
   - Return created expense
   - Manual Test Step: POST expense via Postman → verify in DB → try invalid data → receive validation errors
   - User Test Prompt: "Create expense via API with valid and invalid data. Confirm validation works."

3. **Implement GET /api/v1/expenses endpoint with filtering**
   - Add list endpoint with query params: `category`, `vendor`, `projectId`, `search`, `limit`, `skip`
   - Return paginated results with total count
   - Manual Test Step: Create multiple expenses → filter by category → filter by vendor → search by description
   - User Test Prompt: "Create expenses and test filtering by category, vendor, and search term."

4. **Implement GET /api/v1/expenses/{id} endpoint**
   - Add single expense retrieval
   - Return 404 if not found
   - Manual Test Step: Get existing expense → get non-existent expense → verify 404
   - User Test Prompt: "Retrieve expense by ID and confirm 404 for invalid ID."

5. **Update frontend expenses page**
   - Update [`expenses/page.tsx`](HOA-OPs-AI/frontend/app/expenses/page.tsx:49) to call real API
   - Implement create expense form submission
   - Implement filtering and search
   - Display expenses from API
   - Manual Test Step: Open expenses page → create expense → see in list → filter by category → search by vendor
   - User Test Prompt: "Create, view, filter, and search expenses via frontend. Confirm all features work."

**Definition of Done:**
- Expenses can be created via frontend form
- All expenses display in table with filtering
- Search works across description and vendor
- Expenses are immutable (no edit/delete buttons)
- Expenses linked to projects show project badge
- All data comes from MongoDB via API

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S2: Expense tracking complete"`
- Push to main: `git push origin main`

---

## 🧱 S3 – INCOME MANAGEMENT & IMPORT

**Objectives:**
- Implement income creation and listing
- Create `income` collection in MongoDB
- Support Excel/CSV bulk import
- Enforce immutability (no edit/delete)
- Support filtering by source type

**User Stories:**
- As a treasurer, I can record income so I can track revenue
- As a treasurer, I can import income from Excel so I can migrate existing data
- As a board member, I can view all income so I can monitor cash flow
- As a board member, I can filter income by source so I can analyze revenue streams

**Endpoints:**
- `POST /api/v1/income`
- `GET /api/v1/income`
- `POST /api/v1/income/import`

**Tasks:**

1. **Create Income model and CRUD operations**
   - Create `backend/models/income.py` with Pydantic model
   - Fields: `_id`, `date`, `amount`, `source`, `description`, `createdBy`, `createdAt`
   - Create `backend/crud/income.py` with `create_income()`, `get_income_list()`, `bulk_create_income()`
   - Manual Test Step: Create test income record in MongoDB Atlas → verify structure
   - User Test Prompt: "Check MongoDB Atlas income collection and confirm structure."

2. **Implement POST /api/v1/income endpoint**
   - Create `backend/routers/income.py` with create endpoint
   - Validate: amount > 0, date not future, source from enum (Dues/Assessment/Fine/Interest/Other)
   - Set `createdBy` from authenticated user
   - Return created income record
   - Manual Test Step: POST income via Postman → verify in DB → try invalid data → receive validation errors
   - User Test Prompt: "Create income via API with valid and invalid data. Confirm validation works."

3. **Implement GET /api/v1/income endpoint with filtering**
   - Add list endpoint with query params: `source`, `search`, `limit`, `skip`
   - Return paginated results with total count
   - Manual Test Step: Create multiple income records → filter by source → search by description
   - User Test Prompt: "Create income records and test filtering by source and search term."

4. **Implement Excel/CSV import endpoint**
   - Add `POST /api/v1/income/import` with file upload
   - Parse Excel/CSV using `pandas` and `openpyxl`
   - Validate required columns: date, amount, description, source/category
   - Create income/expense records based on amount sign (positive = income, negative = expense)
   - Return success count and error list with row numbers
   - Manual Test Step: Upload valid Excel file → verify records created → upload invalid file → receive error list
   - User Test Prompt: "Import Excel file with income/expense data. Confirm records created and errors reported."

5. **Update frontend income page**
   - Update [`income/page.tsx`](HOA-OPs-AI/frontend/app/income/page.tsx:46) to call real API
   - Implement create income form submission
   - Implement import modal with file upload
   - Implement filtering and search
   - Display income from API
   - Manual Test Step: Open income page → create income → see in list → import Excel → verify imported records → filter by source
   - User Test Prompt: "Create, import, view, and filter income via frontend. Confirm all features work."

**Definition of Done:**
- Income can be created via frontend form
- Excel/CSV import successfully creates records
- All income displays in table with filtering
- Search works across description
- Income records are immutable (no edit/delete buttons)
- Import errors are displayed with row numbers
- All data comes from MongoDB via API

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S3: Income management and import complete"`
- Push to main: `git push origin main`

---

## 🧱 S4 – PROJECT MANAGEMENT (FULL CRUD)

**Objectives:**
- Implement full CRUD for projects
- Create `projects` collection in MongoDB
- Support status updates (Planned/In Progress/Completed)
- Implement soft delete (archiving)
- Calculate actual spent from linked expenses

**User Stories:**
- As a board member, I can create projects so I can track capital improvements
- As a board member, I can update project details so I can keep information current
- As a board member, I can change project status so I can track progress
- As a board member, I can archive completed projects so I can maintain clean lists
- As a board member, I can view project budget vs actual so I can monitor spending

**Endpoints:**
- `POST /api/v1/projects`
- `GET /api/v1/projects`
- `GET /api/v1/projects/{id}`
- `PATCH /api/v1/projects/{id}`
- `DELETE /api/v1/projects/{id}`

**Tasks:**

1. **Create Project model and CRUD operations**
   - Create `backend/models/project.py` with Pydantic model
   - Fields: `_id`, `name`, `description`, `status`, `budget`, `startDate`, `endDate`, `assignedVendorId`, `createdBy`, `createdAt`, `updatedAt`, `archivedAt`
   - Create `backend/crud/project.py` with full CRUD functions
   - Manual Test Step: Create test project in MongoDB Atlas → verify structure
   - User Test Prompt: "Check MongoDB Atlas projects collection and confirm structure."

2. **Implement POST /api/v1/projects endpoint**
   - Create `backend/routers/projects.py` with create endpoint
   - Validate: budget > 0, status in enum (Planned/In Progress/Completed)
   - Set `createdBy` and timestamps
   - Return created project
   - Manual Test Step: POST project via Postman → verify in DB → try invalid data → receive validation errors
   - User Test Prompt: "Create project via API with valid and invalid data. Confirm validation works."

3. **Implement GET /api/v1/projects endpoint with filtering**
   - Add list endpoint with query params: `status`, `search`, `archived`
   - Exclude archived by default unless `archived=true`
   - Return projects with total count
   - Manual Test Step: Create multiple projects → filter by status → search by name → include archived
   - User Test Prompt: "Create projects and test filtering by status, search, and archived flag."

4. **Implement GET /api/v1/projects/{id} endpoint with aggregations**
   - Add single project retrieval
   - Include linked proposals from proposals collection
   - Include linked expenses from expenses collection
   - Calculate `actualSpent` by summing linked expenses
   - Return 404 if not found
   - Manual Test Step: Get project with proposals and expenses → verify aggregations → get non-existent project → verify 404
   - User Test Prompt: "Retrieve project by ID and confirm proposals, expenses, and actualSpent are included."

5. **Implement PATCH /api/v1/projects/{id} endpoint**
   - Add update endpoint accepting partial project fields
   - Update `updatedAt` timestamp
   - Return updated project
   - Manual Test Step: Update project name → update status → update budget → verify changes in DB
   - User Test Prompt: "Update project fields via API and confirm changes persist."

6. **Implement DELETE /api/v1/projects/{id} endpoint (soft delete)**
   - Add archive endpoint that sets `archivedAt` timestamp
   - Do not actually delete from database
   - Return success message
   - Manual Test Step: Archive project → verify `archivedAt` set → verify excluded from default list
   - User Test Prompt: "Archive project and confirm it no longer appears in default project list."

7. **Update frontend projects pages**
   - Update [`projects/page.tsx`](HOA-OPs-AI/frontend/app/projects/page.tsx:46) to call real API
   - Update [`projects/[id]/page.tsx`](HOA-OPs-AI/frontend/app/projects/[id]/page.tsx:81) to call real API
   - Implement create project form submission
   - Implement status dropdown updates
   - Display projects from API with filtering
   - Show project details with proposals and expenses
   - Display budget vs actual spent
   - Manual Test Step: Create project → view details → update status → see proposals → see expenses → archive project
   - User Test Prompt: "Create, view, update, and archive projects via frontend. Confirm all features work."

**Definition of Done:**
- Projects can be created, viewed, updated, and archived via frontend
- Project detail page shows linked proposals and expenses
- Budget vs actual spent calculation works correctly
- Status updates reflect immediately
- Archived projects excluded from default list
- All data comes from MongoDB via API

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S4: Project management complete"`
- Push to main: `git push origin main`

---

## 🧱 S5 – VENDOR PROPOSAL MANAGEMENT

**Objectives:**
- Implement full CRUD for proposals
- Create `proposals` collection in MongoDB
- Support file uploads (PDF proposals)
- Link proposals to projects
- Implement soft delete (archiving)
- Support proposal status (Pending/Accepted/Rejected)

**User Stories:**
- As a board member, I can upload vendor proposals so I can collect bids
- As a board member, I can view all proposals for a project so I can compare options
- As a board member, I can update proposal metadata so I can correct information
- As a board member, I can archive outdated proposals so I can maintain clean lists
- As a board member, I can mark proposals as accepted/rejected so I can track decisions

**Endpoints:**
- `POST /api/v1/proposals`
- `GET /api/v1/proposals`
- `GET /api/v1/proposals/{id}`
- `PATCH /api/v1/proposals/{id}`
- `DELETE /api/v1/proposals/{id}`

**Tasks:**

1. **Create Proposal model and CRUD operations**
   - Create `backend/models/proposal.py` with Pydantic model
   - Fields: `_id`, `projectId`, `vendorName`, `bidAmount`, `timeline`, `warranty`, `scopeSummary`, `fileUrl`, `status`, `uploadedBy`, `createdAt`, `updatedAt`, `archivedAt`
   - Create `backend/crud/proposal.py` with full CRUD functions
   - Manual Test Step: Create test proposal in MongoDB Atlas → verify structure
   - User Test Prompt: "Check MongoDB Atlas proposals collection and confirm structure."

2. **Implement file upload utility**
   - Create `backend/utils/file_upload.py` with file handling functions
   - Validate file size < 10MB, allowed types (PDF, JPG, PNG, DOCX, XLSX)
   - Save to `UPLOAD_DIR/proposals/` with unique filename
   - Return file URL path
   - Manual Test Step: Upload valid file → verify saved to disk → upload oversized file → receive error
   - User Test Prompt: "Test file upload with valid and invalid files. Confirm validation works."

3. **Implement POST /api/v1/proposals endpoint with file upload**
   - Create `backend/routers/proposals.py` with create endpoint
   - Accept multipart form-data with file and fields
   - Validate: projectId exists, bidAmount > 0, file valid
   - Save file and store URL in database
   - Set `uploadedBy` and timestamps
   - Return created proposal
   - Manual Test Step: POST proposal with file via Postman → verify file saved → verify record in DB
   - User Test Prompt: "Upload proposal with file via API and confirm file saved and record created."

4. **Implement GET /api/v1/proposals endpoint with filtering**
   - Add list endpoint with query params: `projectId`, `vendorName`, `archived`
   - Exclude archived by default
   - Return proposals with total count
   - Manual Test Step: Create multiple proposals → filter by projectId → filter by vendor → include archived
   - User Test Prompt: "Create proposals and test filtering by project, vendor, and archived flag."

5. **Implement GET /api/v1/proposals/{id} endpoint**
   - Add single proposal retrieval
   - Return 404 if not found
   - Manual Test Step: Get existing proposal → get non-existent proposal → verify 404
   - User Test Prompt: "Retrieve proposal by ID and confirm 404 for invalid ID."

6. **Implement PATCH /api/v1/proposals/{id} endpoint**
   - Add update endpoint accepting partial proposal fields
   - Allow updating metadata (vendorName, bidAmount, timeline, warranty, scopeSummary, status)
   - Update `updatedAt` timestamp
   - Return updated proposal
   - Manual Test Step: Update proposal amount → update status → verify changes in DB
   - User Test Prompt: "Update proposal fields via API and confirm changes persist."

7. **Implement DELETE /api/v1/proposals/{id} endpoint (soft delete)**
   - Add archive endpoint that sets `archivedAt` timestamp
   - Return success message
   - Manual Test Step: Archive proposal → verify `archivedAt` set → verify excluded from default list
   - User Test Prompt: "Archive proposal and confirm it no longer appears in default list."

8. **Update frontend project detail page**
   - Update [`projects/[id]/page.tsx`](HOA-OPs-AI/frontend/app/projects/[id]/page.tsx:60) proposal upload modal
   - Implement file upload with form fields
   - Display proposals from API
   - Show proposal status badges
   - Enable proposal status updates
   - Manual Test Step: Open project → upload proposal with file → see in list → update status → archive proposal
   - User Test Prompt: "Upload, view, update, and archive proposals via frontend. Confirm file upload works."

**Definition of Done:**
- Proposals can be uploaded with files via frontend
- Files saved to disk and URLs stored in database
- Proposals display on project detail page
- Proposal metadata can be updated
- Proposal status can be changed (Pending/Accepted/Rejected)
- Archived proposals excluded from default list
- All data comes from MongoDB via API

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S5: Vendor proposal management complete"`
- Push to main: `git push origin main`

---

## 🧱 S6 – DOCUMENT REPOSITORY

**Objectives:**
- Implement full CRUD for documents
- Create `documents` collection in MongoDB
- Support file uploads (PDF, DOCX, XLSX)
- Categorize documents (Contract/Meeting Minutes/Financial Report/Other)
- Implement soft delete (archiving)
- Support search and filtering

**User Stories:**
- As a board member, I can upload documents so I can centralize files
- As a board member, I can categorize documents so I can organize files
- As a board member, I can search documents so I can find files quickly
- As a board member, I can archive old documents so I can maintain clean lists
- As a board member, I can download documents so I can access files

**Endpoints:**
- `POST /api/v1/documents`
- `GET /api/v1/documents`
- `GET /api/v1/documents/{id}`
- `PATCH /api/v1/documents/{id}`
- `DELETE /api/v1/documents/{id}`

**Tasks:**

1. **Create Document model and CRUD operations**
   - Create `backend/models/document.py` with Pydantic model
   - Fields: `_id`, `title`, `category`, `description`, `fileUrl`, `fileType`, `fileSize`, `uploadedBy`, `createdAt`, `updatedAt`, `archivedAt`
   - Create `backend/crud/document.py` with full CRUD functions
   - Manual Test Step: Create test document in MongoDB Atlas → verify structure
   - User Test Prompt: "Check MongoDB Atlas documents collection and confirm structure."

2. **Implement POST /api/v1/documents endpoint with file upload**
   - Create `backend/routers/documents.py` with create endpoint
   - Accept multipart form-data with file and metadata
   - Validate: file < 10MB, category from enum, allowed file types
   - Save file to `UPLOAD_DIR/documents/` with unique filename
   - Calculate file size and detect file type
   - Set `uploadedBy` and timestamps
   - Return created document
   - Manual Test Step: POST document with file via Postman → verify file saved → verify record in DB
   - User Test Prompt: "Upload document with file via API and confirm file saved and record created."

3. **Implement GET /api/v1/documents endpoint with filtering**
   - Add list endpoint with query params: `category`, `search`, `archived`
   - Search across title and description
   - Exclude archived by default
   - Return documents with total count
   - Manual Test Step: Create multiple documents → filter by category → search by title → include archived
   - User Test Prompt: "Create documents and test filtering by category, search, and archived flag."

4. **Implement GET /api/v1/documents/{id} endpoint**
   - Add single document retrieval
   - Return 404 if not found
   - Manual Test Step: Get existing document → get non-existent document → verify 404
   - User Test Prompt: "Retrieve document by ID and confirm 404 for invalid ID."

5. **Implement PATCH /api/v1/documents/{id} endpoint**
   - Add update endpoint accepting partial document fields
   - Allow updating metadata (title, category, description)
   - Update `updatedAt` timestamp
   - Return updated document
   - Manual Test Step: Update document title → update category → verify changes in DB
   - User Test Prompt: "Update document fields via API and confirm changes persist."

6. **Implement DELETE /api/v1/documents/{id} endpoint (soft delete)**
   - Add archive endpoint that sets `archivedAt` timestamp
   - Return success message
   - Manual Test Step: Archive document → verify `archivedAt` set → verify excluded from default list
   - User Test Prompt: "Archive document and confirm it no longer appears in default list."

7. **Update frontend documents page**
   - Update [`documents/page.tsx`](HOA-OPs-AI/frontend/app/documents/page.tsx:51) to call real API
   - Implement file upload with metadata form
   - Display documents from API in grid
   - Implement category filtering and search
   - Enable document archiving
   - Manual Test Step: Open documents page → upload document → see in grid → filter by category → search by title → archive document
   - User Test Prompt: "Upload, view, filter, search, and archive documents via frontend. Confirm all features work."

**Definition of Done:**
- Documents can be uploaded with files via frontend
- Files saved to disk and URLs stored in database
- Documents display in grid with category badges
- Search works across title and description
- Category filtering works correctly
- Archived documents excluded from default list
- All data comes from MongoDB via API

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S6: Document repository complete"`
- Push to main: `git push origin main`

---

## 🧱 S7 – DASHBOARD AGGREGATIONS & VENDOR COMPARISON

**Objectives:**
- Implement dashboard summary endpoint with financial aggregations
- Calculate total balance, income, expenses
- Aggregate expenses by category
- Provide recent transactions
- Implement vendor comparison endpoint for projects
- Sort proposals by amount for comparison

**User Stories:**
- As a treasurer, I can view financial summary so I can monitor HOA health
- As a board member, I can see expense breakdown so I can analyze spending
- As a board member, I can view recent transactions so I can track activity
- As a board member, I can compare vendor proposals so I can make informed decisions
- As a board member, I can sort proposals by price so I can find best value

**Endpoints:**
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/projects/{id}/comparison`

**Tasks:**

1. **Implement GET /api/v1/dashboard/summary endpoint**
   - Create `backend/routers/dashboard.py` with summary endpoint
   - Aggregate total income from income collection
   - Aggregate total expenses from expenses collection
   - Calculate balance (income - expenses)
   - Group expenses by category with totals
   - Get 5 most recent transactions (income + expenses sorted by date)
   - Return comprehensive summary object
   - Manual Test Step: Call dashboard endpoint → verify calculations → create new transaction → verify updated totals
   - User Test Prompt: "Call dashboard API and confirm all financial calculations are correct."

2. **Implement GET /api/v1/projects/{id}/comparison endpoint**
   - Add comparison endpoint to projects router
   - Get project details
   - Get all non-archived proposals for project
   - Sort proposals by bidAmount (ascending)
   - Return project with sorted proposals
   - Manual Test Step: Call comparison endpoint → verify proposals sorted by price → verify archived excluded
   - User Test Prompt: "Call comparison API and confirm proposals sorted by price with cheapest first."

3. **Update frontend dashboard page**
   - Update [`dashboard/page.tsx`](HOA-OPs-AI/frontend/app/dashboard/page.tsx:23) to call real API
   - Display total balance, income, expenses from API
   - Display expense breakdown pie chart from API data
   - Display recent transactions from API
   - Remove dummy data and calculations
   - Manual Test Step: Open dashboard → verify all numbers from API → create expense → refresh → see updated totals
   - User Test Prompt: "View dashboard and confirm all financial data comes from backend. Create transaction and verify dashboard updates."

4. **Update frontend vendor comparison view**
   - Update [`projects/[id]/page.tsx`](HOA-OPs-AI/frontend/app/projects/[id]/page.tsx:220) comparison tab
   - Call comparison API endpoint
   - Display proposals in comparison table sorted by price
   - Show all proposal fields (vendor, price, timeline, warranty, scope)
   - Enable sorting by different columns
   - Manual Test Step: Open project comparison tab → verify proposals sorted by price → verify all fields display → click sort headers
   - User Test Prompt: "View vendor comparison and confirm proposals sorted by price. Test column sorting."

5. **Add file download endpoint**
   - Create `GET /api/v1/files/{type}/{filename}` endpoint
   - Serve files from `UPLOAD_DIR` with proper content-type headers
   - Validate file exists and user is authenticated
   - Return file for download
   - Manual Test Step: Upload proposal → click download → verify file downloads correctly
   - User Test Prompt: "Upload file and download it via frontend. Confirm file downloads correctly."

**Definition of Done:**
- Dashboard displays real-time financial data from database
- All calculations (balance, totals, categories) are accurate
- Recent transactions show latest income and expenses
- Vendor comparison shows proposals sorted by price
- All proposal details display in comparison table
- Files can be downloaded from backend
- All dummy data removed from frontend

**Post-Sprint:**
- Commit all changes: `git add . && git commit -m "S7: Dashboard and vendor comparison complete"`
- Push to main: `git push origin main`

---

## ✅ FINAL CHECKLIST

**Before Switching to Orchestrator Mode:**

- [ ] All 8 sprints (S0-S7) documented with clear objectives
- [ ] Every task includes Manual Test Step and User Test Prompt
- [ ] All API endpoints documented with request/response shapes
- [ ] All MongoDB collections documented with example documents
- [ ] All frontend pages mapped to backend endpoints
- [ ] File upload handling documented for proposals and documents
- [ ] Excel/CSV import flow documented
- [ ] Authentication flow documented with JWT
- [ ] Soft delete (archiving) documented for user-generated content
- [ ] Immutability documented for financial records
- [ ] Git workflow documented (single `main` branch)
- [ ] Environment variables documented
- [ ] Testing strategy documented (manual via frontend)
- [ ] Success criteria clearly defined

**Ready for Execution:**

This Backend Development Plan is now complete and ready to be executed by SnapDev V1 (VS Code extension). The plan provides:

1. **Clear Sprint Structure:** 8 sprints from environment setup to full feature completion
2. **Detailed Tasks:** Every task includes implementation steps, test steps, and user prompts
3. **API Specifications:** Complete endpoint documentation with request/response shapes
4. **Data Models:** MongoDB collection schemas with example documents
5. **Frontend Integration:** Mapping of frontend pages to backend endpoints
6. **Testing Strategy:** Manual testing via frontend UI after every task
7. **Git Workflow:** Single `main` branch with commit/push after each sprint

The orchestrator can now execute this plan step-by-step, building the backend incrementally and testing each feature through the frontend UI.

---

**END OF BACKEND DEVELOPMENT PLAN**
