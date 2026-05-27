# Complaint to Action — agent.md

## Project Overview

**Project Name:** Complaint to Action  
**Type:** MERN Stack Civic Grievance and Resolution Platform  
**Primary Goal:** Convert citizen complaints into trackable, accountable, and time-bound action through role-based workflows, escalation, proof-based resolution, and analytics.

This project is a complaint-to-resolution platform designed for civic, municipal, campus, apartment, or organizational use. Citizens submit complaints with evidence and location details, the system routes the complaint to the proper department or officer, and the complaint moves through a controlled workflow until it is resolved, reopened, or escalated.

This file defines the product scope, user roles, modules, workflows, logic, backend expectations, and development behavior for implementation.

***

## Core Problem

Most complaint systems fail because:
- complaints are submitted but not routed properly,
- users cannot clearly track what is happening,
- no proof of action is attached,
- complaints are closed without citizen satisfaction,
- escalations are manual or inconsistent,
- admins cannot identify weak departments or repeated issue zones.

Complaint to Action solves this by turning every complaint into a structured action pipeline.

***

## Product Vision

Build a system where:
- filing a complaint is simple,
- routing is automatic,
- each complaint has a lifecycle,
- every action is logged,
- SLA deadlines are enforced,
- closure requires proof,
- citizens can reopen unsolved complaints,
- admins can monitor performance across departments.

***

## User Roles

There are **3 primary logins** and **1 optional support login**.

### 1. Citizen Login
Purpose: Register complaints, track progress, receive updates, reopen unresolved issues, and give feedback.

### 2. Officer Login
Purpose: Handle assigned complaints, update progress, upload proof, and resolve issues.

### 3. Admin Login
Purpose: Manage users, departments, routing rules, escalation rules, reports, and overall governance.

### 4. Operator Login (Optional)
Purpose: Register complaints on behalf of citizens through call-center/help-desk workflow.

***

## Login-wise Features

## Citizen Features
- Register/login using email, mobile OTP, or password.
- Create complaint with title, description, category, subcategory, location, landmark, and evidence.
- Upload image, video, or document proof.
- View complaint ID and full timeline.
- Track status: Submitted, Assigned, In Progress, Resolved, Reopened, Escalated, Closed, Rejected.
- Receive notifications on every important update.
- Reopen complaint if issue still exists.
- Submit satisfaction rating and feedback.
- View past complaints and filter by status/category/date.
- Save profile details and common locations.
- Optionally support anonymous reporting for sensitive complaints.

## Officer Features
- Login to department dashboard.
- View assigned complaints by category, zone, and priority.
- Accept, reject, forward, or transfer complaints.
- Update status with notes.
- Add internal remarks and resolution comments.
- Upload before/after proof.
- Mark complaint as resolved or require reassignment.
- View overdue complaints and SLA alerts.
- Filter reopened, escalated, and urgent complaints.
- Manage field visit notes.
- Track own performance metrics.

## Admin Features
- Create and manage departments.
- Create and manage officers and admins.
- Define complaint categories and subcategories.
- Set SLA rules based on complaint type and severity.
- Configure escalation matrix.
- Configure routing logic based on location + category.
- View analytics dashboard.
- View complaint trends by department, area, date, and status.
- Handle appeals, reopen rates, and failed closures.
- Audit logs for every action.
- Export reports.
- Disable users or departments.
- Publish system announcements.

## Operator Features (Optional)
- Register complaint for citizen.
- Search complaint by mobile number or complaint ID.
- Add complaint updates after phone conversation.
- Reopen complaint on citizen request.
- Capture feedback over support calls.

***

## Core Complaint Lifecycle

Every complaint should move through a controlled lifecycle:

1. Submitted  
2. Under Review  
3. Assigned  
4. In Progress  
5. Resolved  
6. Citizen Verification  
7. Closed  
8. Reopened (if unsatisfied)  
9. Escalated (if overdue or failed multiple times)  
10. Rejected (if invalid/spam/out of jurisdiction)

### Lifecycle Rules
- A complaint must always have one latest active status.
- Every status change must create a timeline log.
- Resolution should require officer remarks.
- Closure should optionally require citizen confirmation or auto-close after a configured period.
- Reopened complaints should return to active workflow.
- Escalated complaints should notify higher authority.

***

## Complaint Categories

The system should support configurable categories such as:
- Garbage collection
- Water leakage
- Drainage blockage
- Streetlight issue
- Road damage / potholes
- Illegal dumping
- Public sanitation
- Noise complaint
- Safety issue
- Park/public property damage
- Electricity issue
- Campus or apartment maintenance complaint

Admin should be able to add custom categories and map each category to a department.

***

## Data Model Suggestions

## User
Fields:
- name
- email
- mobile
- passwordHash
- role (`citizen`, `officer`, `admin`, `operator`)
- departmentId (nullable)
- zoneIds
- isActive
- profileImage
- createdAt
- updatedAt

## Department
Fields:
- name
- description
- zoneCoverage
- escalationLevel
- active
- createdAt
- updatedAt

## Complaint
Fields:
- complaintId (human-readable unique ID)
- citizenId
- createdByRole
- title
- description
- category
- subcategory
- severity
- status
- departmentId
- assignedOfficerId
- locationText
- landmark
- geo: { lat, lng }
- mediaUrls
- proofUrls
- slaDueAt
- resolvedAt
- closedAt
- reopenedCount
- escalationCount
- isAnonymous
- rating
- feedbackText
- createdAt
- updatedAt

## StatusLog
Fields:
- complaintId
- previousStatus
- newStatus
- changedByUserId
- changedByRole
- comment
- attachments
- createdAt

## EscalationRule
Fields:
- category
- severity
- departmentId
- escalationAfterHours
- escalateToUserId
- level
- active

## Notification
Fields:
- userId
- complaintId
- type
- title
- message
- isRead
- createdAt

## Appeal / ReopenRequest
Fields:
- complaintId
- requestedBy
- reason
- attachmentUrls
- status
- reviewedBy
- createdAt
- updatedAt

***

## Backend Modules

The backend should be divided into clean modules.

### Authentication Module
- Register/login
- JWT authentication
- Role-based authorization
- Password reset / OTP flow

### User Management Module
- Citizen management
- Officer assignment
- Admin controls
- Operator creation (optional)

### Complaint Module
- Create complaint
- Get complaint by ID
- List complaints with filters
- Update complaint details
- Attach media/proof
- Search complaints

### Assignment Module
- Auto-assignment based on rules
- Manual reassignment by admin
- Officer transfer requests

### Workflow Module
- Status changes
- Timeline logs
- Citizen verification
- Closure/reopen handling

### Escalation Module
- SLA calculation
- Overdue detection
- Escalation notification
- Multi-level escalation support

### Notification Module
- In-app notifications
- Email/SMS integration
- Template-driven status alerts

### Analytics Module
- Count by category/status/department
- Reopen rate
- Average resolution time
- Area hotspot analysis
- Officer efficiency metrics

***

## Frontend Modules

## Citizen Panel
Pages:
- Landing page
- Register/login
- Submit complaint
- My complaints
- Complaint details
- Notifications
- Profile/settings

## Officer Panel
Pages:
- Dashboard
- Assigned complaints
- Complaint details
- Update status form
- Proof upload
- SLA alerts
- Performance summary

## Admin Panel
Pages:
- Dashboard
- Complaint management
- Department management
- User management
- Category/SLA settings
- Escalation settings
- Reports and analytics
- Audit logs

## Operator Panel (Optional)
Pages:
- Register complaint
- Search citizen complaint
- Complaint update form
- Feedback entry

***

## Important Business Logic

### Complaint ID Generation
Use readable complaint IDs such as:
`CTA-2026-000123`

### Routing Logic
Routing may use:
- complaint category,
- subcategory,
- zone or ward,
- severity,
- department availability.

### SLA Logic
Each complaint must get an SLA deadline based on category + severity.
Example:
- pothole: 72 hours
- garbage issue: 24 hours
- water leakage: 12 hours
- streetlight: 48 hours

### Escalation Logic
If complaint remains unresolved after SLA:
- escalate to next authority,
- notify officer + admin,
- mark complaint as escalated,
- increase escalation count.

### Reopen Logic
If citizen rejects resolution:
- complaint goes back to active state,
- reopen reason becomes mandatory,
- reopen count increases,
- priority may be boosted.

### Closure Logic
Complaint may close when:
- officer marks resolved,
- proof uploaded,
- citizen accepts resolution,
- or auto-close happens after X days if no response.

***

## Suggested APIs

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`

### Complaints
- `POST /api/complaints`
- `GET /api/complaints`
- `GET /api/complaints/:id`
- `PATCH /api/complaints/:id`
- `PATCH /api/complaints/:id/status`
- `POST /api/complaints/:id/reopen`
- `POST /api/complaints/:id/feedback`
- `POST /api/complaints/:id/attachments`

### Admin
- `POST /api/departments`
- `GET /api/departments`
- `POST /api/categories`
- `POST /api/escalation-rules`
- `GET /api/reports/overview`
- `GET /api/reports/department`
- `GET /api/reports/officers`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

***

## Advanced Features That Can Be Added Later

- Duplicate complaint detection using same location + category.
- AI-based complaint categorization from description.
- Complaint clustering on map.
- Voice-based complaint creation.
- WhatsApp complaint intake.
- Public transparency dashboard.
- Offline complaint submission sync.
- QR-code complaint tracking slip.
- Multi-language support.
- Heatmap of issue hotspots.
- Predictive area-risk insights.

***

## Security and Validation Rules

- All routes must use role-based middleware.
- Citizens can only view their own complaints.
- Officers can only act on assigned or department-visible complaints.
- Admin has full access.
- Every uploaded file must be validated.
- Sensitive data must be sanitized.
- Use rate-limiting on auth and public complaint endpoints.
- Store passwords using bcrypt.
- Validate all request bodies using a schema validator.

***

## Recommended Stack

### Frontend
- React
- React Router
- Tailwind CSS or your reference-based styling system
- Axios
- React Hook Form
- Framer Motion (optional)
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- Multer / Cloudinary
- Nodemailer / SMS provider
- Cron jobs for escalation checks

***

## Development Notes

- Design/color decisions are intentionally excluded from this file.
- Follow the provided reference screenshots for layout and visual styling.
- Keep business logic and workflow rules separate from UI styling.
- Build role-based dashboards independently but on the same backend.
- Timeline history is a mandatory feature, not optional.
- Proof-based resolution is a mandatory feature, not optional.
- Reopen + escalation logic should be treated as core product value.

***

## Final Objective

Build Complaint to Action as a serious accountability platform, not just a complaint form. The product should demonstrate:
- role-based architecture,
- structured workflow,
- complaint lifecycle management,
- escalation automation,
- proof-backed resolution,
- citizen trust through transparency,
- admin oversight through analytics.