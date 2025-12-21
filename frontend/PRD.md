# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Name:** HOA OpsAI

**Product Vision:** HOA OpsAI provides HOA board members with a centralized dashboard to track community finances and compare vendor proposals, eliminating the chaos of scattered spreadsheets and email threads. The platform streamlines financial oversight and vendor selection, enabling boards to make faster, more informed decisions about community spending.

**Core Purpose:** Solves the problem of fragmented financial data and vendor proposal management that forces HOA boards to juggle multiple spreadsheets, email attachments, and paper documents. Board members waste hours searching for information and struggle to compare vendor bids effectively.

**Target Users:** HOA board members (treasurers, presidents, committee chairs) responsible for managing community finances, reviewing vendor proposals, and making spending decisions for residential homeowner associations.

**Key MVP Features:**
- User Authentication - System/Configuration
- Financial Overview Dashboard - System Data (view/export)
- Expense Tracking - Financial Records (create/view)
- Income & Balance Management - Financial Records (create/view)
- Vendor Proposal Management - User-Generated Content (full CRUD)
- Project Management - User-Generated Content (full CRUD)
- Vendor Comparison View - System Data (view)
- Document Repository - User-Generated Content (full CRUD)

**Platform:** Web application (responsive design, accessible via browser on desktop, tablet, and mobile devices)

**Complexity Assessment:** Moderate
- State Management: Backend database with frontend caching
- External Integrations: File upload/storage, Excel/Google Sheets import (reduces complexity - standard libraries available)
- Business Logic: Moderate - financial calculations, proposal comparisons, project-vendor relationships

**MVP Success Criteria:**
- Board members complete full workflow: create project → upload proposals → compare bids → select vendor → track expenses
- All financial data imports successfully from Excel/Google Sheets
- Vendor comparison view displays proposals side-by-side with key metrics
- Document repository organizes files by category with search functionality
- Responsive design functions on mobile devices for on-the-go access

---

## 1. USERS & PERSONAS

**Primary Persona: Teresa the Treasurer**
- **Context:** Elected HOA treasurer for 150-unit condo community, manages $500K annual budget, volunteers 10-15 hours monthly, uses Excel extensively but struggles with version control and sharing financial reports with other board members
- **Goals:** Track all income and expenses accurately, generate monthly financial reports quickly, ensure reserve fund targets are met, make vendor selection transparent and data-driven
- **Pain Points:** Maintains 5+ Excel files for different purposes, loses track of vendor proposals in email, spends hours manually updating spreadsheets, difficult to share real-time financial status with board, no audit trail for financial decisions

**Secondary Persona: Paul the Project Manager**
- **Context:** Board member chairing the capital improvements committee, coordinates 3-5 major projects annually (roof repairs, landscaping, pool maintenance), collects vendor bids via email and phone
- **Goals:** Compare vendor proposals objectively, track project budgets vs. actuals, maintain records of all vendor communications and contracts
- **Pain Points:** Vendor proposals arrive in different formats (PDF, email, paper), difficult to compare bids side-by-side, loses track of project status, no centralized place for project documentation

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Core MVP Features (Priority 0)

**FR-001: User Authentication**
- **Description:** Secure registration, login, password reset, and session management for board members
- **Entity Type:** System/Configuration
- **Operations:** Register, Login, View profile, Edit profile, Reset password, Logout
- **Key Rules:** Email-based registration, secure password storage, session persistence across browser sessions
- **Acceptance:** Board members register with email/password, login securely, maintain session, and manage account settings

**FR-002: Financial Overview Dashboard**
- **Description:** Real-time summary of HOA financial health including current balance, monthly income/expenses, reserve funds, and expense breakdown by category
- **Entity Type:** System Data
- **Operations:** View, Export (PDF/Excel), Refresh data
- **Key Rules:** Dashboard displays aggregated data from all financial records, updates in real-time as expenses/income added
- **Acceptance:** Board members view current financial status at a glance with visual charts and export reports

**FR-003: Expense Tracking**
- **Description:** Manual entry of HOA expenses with categorization, vendor assignment, and receipt attachment
- **Entity Type:** Financial Records
- **Operations:** Create, View, List/Search, Export
- **Key Rules:** All expenses require date, amount, category, and description; cannot edit or delete after creation (audit compliance)
- **Acceptance:** Board members log expenses with full details, view expense history, search by date/vendor/category, and export records

**FR-004: Income & Balance Management**
- **Description:** Record HOA dues, special assessments, and other income; set and track account balances including operating and reserve funds
- **Entity Type:** Financial Records
- **Operations:** Create, View, List/Search, Import (Excel/Google Sheets), Export
- **Key Rules:** Income records immutable after creation; balance calculations automatic based on income minus expenses
- **Acceptance:** Board members record income, import bulk data from spreadsheets, view balance history, and track reserve fund targets

**FR-005: Project Management**
- **Description:** Create and track HOA projects with status, budget, timeline, and assigned vendor
- **Entity Type:** User-Generated Content
- **Operations:** Create, View, Edit, Delete (archive), List/Search, Export
- **Key Rules:** Projects have statuses (Planned/In Progress/Completed); budget tracked against actual expenses; archived projects retained for historical reference
- **Acceptance:** Board members create projects, update status and details, assign vendors, track budget vs. actuals, and archive completed projects

**FR-006: Vendor Proposal Management**
- **Description:** Upload, organize, and manage vendor proposals tied to specific projects
- **Entity Type:** User-Generated Content
- **Operations:** Create (upload), View, Edit metadata, Delete, List/Search, Export, Archive
- **Key Rules:** Proposals must be linked to a project; support PDF and image uploads; metadata includes vendor name, bid amount, scope summary, timeline, warranty terms
- **Acceptance:** Board members upload proposals for projects, edit proposal details, view all proposals for a project, and archive outdated bids

**FR-007: Vendor Comparison View**
- **Description:** Side-by-side comparison table of all proposals for a project showing key decision factors
- **Entity Type:** System Data
- **Operations:** View, Export comparison table, Filter/sort proposals
- **Key Rules:** Displays proposals for selected project only; comparison includes price, timeline, warranty, scope summary; AI Analysis button present (shows "Coming Soon" tooltip for MVP)
- **Acceptance:** Board members select a project, view all proposals in comparison table, sort by price/timeline, and export comparison for board meetings

**FR-008: Document Repository**
- **Description:** Centralized file storage for contracts, meeting minutes, and other HOA documents organized by category
- **Entity Type:** User-Generated Content
- **Operations:** Create (upload), View, Edit metadata, Delete, List/Search, Archive, Export
- **Key Rules:** Documents categorized (Contracts/Minutes/Other); support PDF, Word, Excel, images; metadata includes title, category, upload date, description
- **Acceptance:** Board members upload documents, organize by category, search by title/category/date, view/download files, and archive outdated documents

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: Project Vendor Selection

**Trigger:** Board identifies need for community project (e.g., roof repair)
**Outcome:** Board selects vendor based on objective proposal comparison and tracks project execution

**Steps:**
1. Board member creates new project with name, description, budget estimate, and status "Planned"
2. Board member uploads 3-5 vendor proposals (PDFs) for the project, entering metadata (vendor name, bid amount, timeline, warranty, scope summary)
3. Board member navigates to Vendor Comparison View, selects the project, and views all proposals side-by-side in comparison table
4. Board reviews comparison table (sortable by price, timeline), discusses at board meeting, and selects winning vendor
5. Board member updates project status to "In Progress," assigns selected vendor, and uploads signed contract to Document Repository
6. As project progresses, board member logs expenses against the project and tracks budget vs. actuals on project detail page
7. Upon completion, board member updates project status to "Completed" and archives rejected proposals

### 3.2 Key Supporting Workflows

**Import Financial Data:** Board member navigates to Income/Expense section → clicks "Import" → uploads Excel/Google Sheets file → system parses and creates records → board member reviews imported data

**Log Expense:** Board member clicks "Add Expense" → fills form (date, amount, category, vendor, description) → optionally attaches receipt → saves → expense appears in dashboard and expense list

**Generate Financial Report:** Board member opens Financial Dashboard → reviews current balance, income/expenses charts → clicks "Export Report" → selects date range and format (PDF/Excel) → downloads report for board meeting

**Upload Document:** Board member navigates to Document Repository → clicks "Upload" → selects file → enters metadata (title, category, description) → saves → document appears in repository list

**Search Proposals:** Board member enters vendor name or project name in search bar → system filters proposals in real-time → board member clicks proposal to view details

---

## 4. BUSINESS RULES

### 4.1 Entity Lifecycle Rules

| Entity | Type | Who Creates | Who Edits | Who Deletes | Delete Action |
|--------|------|-------------|-----------|-------------|---------------|
| User | System/Configuration | Self-registration | Self | Self | Hard delete (account closure) |
| Expense | Financial | All board members | None | None | Not allowed (audit trail) |
| Income | Financial | All board members | None | None | Not allowed (audit trail) |
| Project | User-Generated | All board members | All board members | All board members | Soft delete (archive) |
| Proposal | User-Generated | All board members | All board members | All board members | Soft delete (archive) |
| Document | User-Generated | All board members | All board members | All board members | Soft delete (archive) |

### 4.2 Data Validation Rules

| Entity | Required Fields | Key Constraints |
|--------|-----------------|-----------------|
| Expense | date, amount, category, description | Amount > 0, date not future, category from predefined list |
| Income | date, amount, source, description | Amount > 0, date not future |
| Project | name, status, budget | Budget > 0, status in [Planned/In Progress/Completed] |
| Proposal | projectId, vendorName, bidAmount, file | Bid amount > 0, file size < 10MB, PDF or image format |
| Document | title, category, file | Category from predefined list, file size < 10MB |

### 4.3 Access & Process Rules
- All authenticated board members have equal access to all features and data (no role-based restrictions for MVP)
- Financial records (expenses, income) are immutable once created to maintain audit trail integrity
- Projects can only be deleted (archived) if status is "Planned" or "Completed" - active projects must be completed first
- Proposals must be linked to an existing project - cannot create orphaned proposals
- Archived items (projects, proposals, documents) remain viewable but marked as archived and excluded from active lists by default
- File uploads limited to 10MB per file; supported formats: PDF, JPG, PNG, DOCX, XLSX
- Financial dashboard calculations update in real-time as new income/expense records are created
- Vendor comparison view only displays proposals for the selected project - no cross-project comparisons
- AI Analysis button displays "Coming Soon - AI-powered proposal analysis will be available in future release" tooltip when clicked

---

## 5. DATA REQUIREMENTS

### 5.1 Core Entities

**User**
- **Type:** System/Configuration | **Storage:** Backend (MongoDB)
- **Key Fields:** id, email, password (hashed), firstName, lastName, role (board member), createdAt, lastLoginAt, preferences
- **Relationships:** has many Expenses (created), has many Income records (created), has many Projects (created), has many Proposals (uploaded), has many Documents (uploaded)
- **Lifecycle:** Full CRUD with account export and deletion

**Expense**
- **Type:** Financial Records | **Storage:** Backend (MongoDB)
- **Key Fields:** id, date, amount, category, vendorName, description, receiptUrl, projectId (optional), createdBy, createdAt
- **Relationships:** belongs to User (creator), optionally belongs to Project
- **Lifecycle:** Create and View only (immutable for audit compliance)

**Income**
- **Type:** Financial Records | **Storage:** Backend (MongoDB)
- **Key Fields:** id, date, amount, source (dues/assessment/other), description, createdBy, createdAt
- **Relationships:** belongs to User (creator)
- **Lifecycle:** Create and View only (immutable for audit compliance)

**Project**
- **Type:** User-Generated Content | **Storage:** Backend (MongoDB)
- **Key Fields:** id, name, description, status, budgetEstimate, actualSpent, startDate, endDate, assignedVendor, createdBy, createdAt, updatedAt, archivedAt
- **Relationships:** belongs to User (creator), has many Proposals, has many Expenses
- **Lifecycle:** Full CRUD with archive and export

**Proposal**
- **Type:** User-Generated Content | **Storage:** Backend (MongoDB + file storage)
- **Key Fields:** id, projectId, vendorName, bidAmount, scopeSummary, timeline, warrantyTerms, fileUrl, uploadedBy, createdAt, updatedAt, archivedAt
- **Relationships:** belongs to Project, belongs to User (uploader)
- **Lifecycle:** Full CRUD with archive and export

**Document**
- **Type:** User-Generated Content | **Storage:** Backend (MongoDB + file storage)
- **Key Fields:** id, title, category, description, fileUrl, fileType, fileSize, uploadedBy, createdAt, updatedAt, archivedAt
- **Relationships:** belongs to User (uploader)
- **Lifecycle:** Full CRUD with archive and export

### 5.2 Data Storage Strategy
- **Primary Storage:** Backend MongoDB database for all entity metadata and relationships
- **File Storage:** Server file system or cloud storage (AWS S3) for uploaded files (proposals, receipts, documents)
- **Capacity:** MongoDB handles millions of records; file storage scales based on HOA size (estimate 1-5GB per HOA annually)
- **Persistence:** All data persists indefinitely; archived items retained for historical reference and audit compliance
- **Audit Fields:** All entities include createdAt, updatedAt, createdBy, updatedBy for full audit trail
- **Data Import:** Excel/Google Sheets import parses rows into Income/Expense records with validation and error reporting

---

## 6. INTEGRATION REQUIREMENTS

**Excel/Google Sheets Import:**
- **Purpose:** Bulk import of existing financial data (income and expenses) from spreadsheets
- **Type:** Frontend file upload with backend parsing
- **Data Exchange:** Sends Excel/CSV file, Receives parsed records with validation errors
- **Trigger:** User clicks "Import" button and uploads file
- **Error Handling:** Display row-by-row validation errors; allow user to fix and re-upload; successfully parsed records saved immediately

**File Upload/Storage:**
- **Purpose:** Store and retrieve uploaded files (proposals, receipts, documents)
- **Type:** Backend file storage service (local or AWS S3)
- **Data Exchange:** Sends file binary, Receives file URL for storage in database
- **Trigger:** User uploads file via form
- **Error Handling:** Validate file size/type before upload; display error if limits exceeded; retry failed uploads

---

## 7. VIEWS & NAVIGATION

### 7.1 Primary Views

**Login/Register** (`/login`, `/register`) - Authentication forms with email/password, password reset link, new user registration

**Financial Dashboard** (`/dashboard`) - Default landing page showing current balance, monthly income/expenses charts, expense breakdown by category, recent transactions, quick action buttons (Add Expense, Add Income, View Reports)

**Expense List** (`/expenses`) - Searchable/filterable table of all expenses with date, amount, category, vendor, project; export button; "Add Expense" button leads to form

**Income List** (`/income`) - Searchable/filterable table of all income records with date, amount, source; import and export buttons; "Add Income" button leads to form

**Project List** (`/projects`) - Grid or table view of all projects with name, status, budget vs. actual, assigned vendor; filter by status; "Create Project" button leads to form

**Project Detail** (`/projects/:id`) - Full project information, list of linked proposals with "Upload Proposal" button, list of linked expenses, edit/archive actions, status update

**Vendor Comparison** (`/projects/:id/compare`) - Side-by-side table comparing all proposals for selected project with columns for vendor, price, timeline, warranty, scope; sort by any column; "AI Analysis" button (shows tooltip); export comparison button

**Document Repository** (`/documents`) - Categorized list of all documents with search/filter by category; upload button; document preview/download; edit metadata and archive actions

**Settings** (`/settings`) - User profile edit, password change, notification preferences, data export (download all HOA data), account deletion

### 7.2 Navigation Structure

**Main Nav:** Dashboard | Expenses | Income | Projects | Documents | Settings | User Menu (profile, logout)
**Default Landing:** Financial Dashboard (`/dashboard`)
**Mobile:** Hamburger menu with collapsible navigation, responsive tables with horizontal scroll, touch-friendly buttons

---

## 8. MVP SCOPE & CONSTRAINTS

### 8.1 MVP Success Definition

The MVP is successful when:
- ✅ Board members complete end-to-end workflow: create project → upload proposals → compare → select vendor → track expenses
- ✅ Financial data imports successfully from Excel/Google Sheets with validation
- ✅ Vendor comparison view displays proposals side-by-side with sortable columns
- ✅ All CRUD operations work correctly for projects, proposals, and documents
- ✅ Financial records (expenses, income) are immutable and maintain audit trail
- ✅ Responsive design functions on mobile/tablet/desktop browsers
- ✅ File uploads (proposals, receipts, documents) work reliably up to 10MB
- ✅ Dashboard displays real-time financial calculations and charts

### 8.2 In Scope for MVP

Core features included:
- FR-001: User Authentication
- FR-002: Financial Overview Dashboard
- FR-003: Expense Tracking
- FR-004: Income & Balance Management
- FR-005: Project Management
- FR-006: Vendor Proposal Management
- FR-007: Vendor Comparison View
- FR-008: Document Repository

### 8.3 Technical Constraints

- **Data Storage:** Backend MongoDB database for all entities; server or cloud file storage for uploads
- **Concurrent Users:** Expected 5-10 board members per HOA accessing simultaneously
- **Performance:** Dashboard loads <2s, file uploads complete within 30s for 10MB files, search results return <1s
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile:** Responsive design supporting iOS Safari and Android Chrome browsers
- **Offline:** Not supported - requires internet connection for all operations
- **File Limits:** 10MB per file upload, supports PDF, JPG, PNG, DOCX, XLSX formats
- **Import Limits:** Excel/Google Sheets import supports up to 1,000 rows per file

### 8.4 Known Limitations

**For MVP:**
- No AI-powered proposal analysis (button present but shows "Coming Soon" tooltip)
- No automated financial forecasting or budget recommendations
- No homeowner portal or communication features
- No multi-HOA management (single HOA per deployment)
- No role-based permissions (all board members have equal access)
- No real-time collaboration (no conflict resolution if two users edit same project simultaneously)
- No automated vendor notifications or bid request workflows
- No integration with accounting software (QuickBooks, Xero)
- No mobile native apps (web-only, responsive design)

**Future Enhancements:**
- V2 will add AI analysis of proposals (extract key terms, compare scope automatically, flag risks)
- V2 will add financial forecasting based on historical spending patterns
- V2 will add homeowner portal for dues payment and communication
- V2 will add role-based access control (treasurer, president, committee member roles)
- V2 will add accounting software integrations for automated expense sync

---

## 9. ASSUMPTIONS & DECISIONS

### 9.1 Platform Decisions
- **Type:** Full-stack web application (frontend + backend + database)
- **Storage:** Backend MongoDB for all entity data; server/cloud storage for uploaded files
- **Auth:** Backend JWT-based authentication with email/password (no OAuth for MVP)

### 9.2 Entity Lifecycle Decisions

**Expenses & Income:** Create/View only
- **Reason:** Financial records must be immutable for audit compliance and regulatory requirements; editing or deleting transactions would compromise audit trail integrity

**Projects:** Full CRUD + archiving
- **Reason:** User-generated content requiring flexibility; board members need to update project details, status, and budget as projects evolve; archiving preserves historical data

**Proposals:** Full CRUD + archiving
- **Reason:** User-generated content tied to projects; board members may need to update proposal metadata (e.g., vendor contact info) or archive outdated bids while preserving comparison history

**Documents:** Full CRUD + archiving
- **Reason:** User-generated content requiring full lifecycle management; board members need to update document metadata, replace outdated versions, and archive old files while maintaining repository organization

### 9.3 Key Assumptions

1. **Board members have basic spreadsheet literacy**
   - Reasoning: Product idea mentions Excel/Google Sheets import and comparison to spreadsheets; assumes users comfortable with tabular data and basic financial concepts

2. **Proposals arrive in digital format (PDF or images)**
   - Reasoning: MVP focuses on upload and comparison; assumes vendors provide digital proposals rather than paper-only; board members can scan paper proposals if needed

3. **Single HOA per deployment (no multi-tenancy)**
   - Reasoning: MVP scope focuses on core workflow for one HOA; multi-HOA management adds significant complexity (data isolation, cross-HOA reporting) deferred to future versions

4. **All board members have equal access (no role restrictions)**
   - Reasoning: Simplifies MVP by avoiding role-based access control; small boards (5-7 members) typically operate collaboratively; role permissions deferred to V2

5. **Manual proposal comparison sufficient for MVP**
   - Reasoning: Product idea explicitly states validating value before investing in AI parsing; side-by-side table view with sortable columns provides immediate value; AI analysis button present but non-functional to set future expectations

### 9.4 Clarification Q&A Summary

**Q:** Should proposals be strictly tied to specific projects, or can proposals exist independently?
**A:** Yes, proposals will be tied to projects.
**Decision:** Proposals entity includes required `projectId` foreign key; proposal upload flow requires selecting existing project; vendor comparison view filters proposals by selected project; prevents orphaned proposals and ensures organized bid management.

**Q:** How should income (HOA dues) and initial account balances be handled?
**A:** Should have ability to take data from other sources like Excel and Google Sheets.
**Decision:** Added FR-004 Income & Balance Management with Excel/Google Sheets import functionality; income records created via manual entry or bulk import; initial balances set via income record with source "Opening Balance"; import parses spreadsheet rows into income/expense records with validation.

**Q:** Should uploaded proposals automatically appear in the Document Repository, or should these be two completely separate sections?
**A:** Completely separate sections.
**Decision:** Proposals (FR-006) and Document Repository (FR-008) are distinct features with separate data models; proposals tied to projects with bid-specific metadata (amount, timeline, warranty); documents organized by category (contracts, minutes, other) with general metadata; no automatic cross-population between sections.

**Q:** Should the UI include any "coming soon" AI placeholders, or should the interface be strictly manual for this version?
**A:** Yes, add AI Analysis button.
**Decision:** Vendor Comparison View (FR-007) includes "AI Analysis" button that displays tooltip "Coming Soon - AI-powered proposal analysis will be available in future release" when clicked; sets user expectations for future functionality while keeping MVP strictly manual; button visually present but non-functional.

---

**PRD Complete - Ready for Development**