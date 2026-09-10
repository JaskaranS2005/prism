# PRISM — Codex Development Guide

> Persistent project context for Codex and other AI coding agents.
>
> **Source of truth:** The actual repository, Prisma schema/migrations, package configuration, source code, tests, and Git history are authoritative. This document records the intended architecture and known state as of 2026-09-10. If it conflicts with the repository, inspect the repository first.

## 1. Project

PRISM is a civic grievance management system. The current work is focused on the backend API; the frontend is planned for later.

Core flow:

```text
HTTP Request
    ↓
Route
    ↓
Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
PostgreSQL / Neon
```

Business/resource authorization belongs in services where the resource scope is known. Middleware handles authentication and broad role gates.

## 2. Stack

- Node.js 24
- Express 5
- TypeScript, strict mode
- Prisma 6.16.2
- PostgreSQL / Neon
- JWT authentication
- bcrypt password hashing through the existing password utility
- Zod validation
- Helmet, CORS, compression, Morgan
- ESLint + Prettier
- ESM imports use `.js` extensions where required by the project

Do not replace the stack or introduce major dependencies without a concrete reason.

## 3. Repository Structure

```text
PRISM/
├── AGENTS.md
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── complaints/
│   │   │   └── administration/
│   │   ├── routes/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
└── frontend/
```

The backend uses **module-based organization**, not global `controllers/`, `services/`, and `repositories/` directories.

Typical module structure:

```text
src/modules/<module>/
    controller.ts
    service.ts
    repository.ts
    validation.ts
    types.ts
    routes.ts
    index.ts
```

Only create files that are actually needed.

## 4. Important Files

Application:

```text
backend/src/app.ts
backend/src/server.ts
```

Routing:

```text
backend/src/routes/index.ts
backend/src/routes/health.routes.ts
```

Authentication:

```text
backend/src/modules/auth/
backend/src/config/jwt.ts
backend/src/utils/password.ts
backend/src/middleware/auth.middleware.ts
backend/src/middleware/authorize.middleware.ts
backend/src/types/express.d.ts
```

Administration:

```text
backend/src/modules/administration/
├── controller.ts
├── service.ts
├── repository.ts
├── validation.ts
├── types.ts
├── scope.ts
├── routes.ts
└── index.ts
```

Complaints:

```text
backend/src/modules/complaints/
```

Database:

```text
backend/prisma/schema.prisma
backend/prisma/seed.ts
backend/prisma/migrations/
```

Always inspect the actual repository before relying on this list.

## 5. Application and Routes

`src/app.ts` currently configures:

```text
helmet
cors
compression
express.json
express.urlencoded
morgan
/api/v1 routes
notFound
errorHandler
```

Main route mounts:

```text
/api/v1/health
/api/v1/auth
/api/v1/complaints
/api/v1/administration
```

Local development backend has been run at:

```text
http://localhost:8000
```

API prefix:

```text
/api/v1
```

## 6. Authentication

`authenticate`:

1. Reads `Authorization: Bearer <token>`.
2. Verifies the JWT.
3. Loads the user from the database.
4. Rejects missing users.
5. Rejects inactive users.
6. Loads the user's role.
7. Loads the user's `AdministrativeAssignment`.
8. Attaches user ID, role, and scope to `req.user`.

`src/types/express.d.ts` currently provides:

```text
req.user.id
req.user.role
req.user.administrativeScope.stateId?
req.user.administrativeScope.districtId?
req.user.administrativeScope.municipalityId?
req.user.administrativeScope.departmentId?
```

Do not trust client-supplied scope for authorization.

## 7. Roles and Administrative Hierarchy

Roles:

```text
SUPER_ADMIN
STATE_ADMIN
DISTRICT_ADMIN
MUNICIPAL_ADMIN
DEPARTMENT_HEAD
OFFICER
CITIZEN
```

Government hierarchy:

```text
SUPER_ADMIN
    ↓
STATE_ADMIN
    ↓
DISTRICT_ADMIN
    ↓
MUNICIPAL_ADMIN
    ↓
DEPARTMENT_HEAD
    ↓
OFFICER
```

`CITIZEN` is outside this government hierarchy.

Creation permissions are exactly one level downward:

```text
SUPER_ADMIN       → STATE_ADMIN
STATE_ADMIN       → DISTRICT_ADMIN
DISTRICT_ADMIN    → MUNICIPAL_ADMIN
MUNICIPAL_ADMIN   → DEPARTMENT_HEAD
DEPARTMENT_HEAD   → OFFICER
```

A creator must not create a higher-level or unrelated/lateral government role.

## 8. Administrative Scope

Administrative hierarchy:

```text
State
  ↓
District
  ↓
Municipality
  ↓
Department
```

`AdministrativeAssignment` can contain:

```text
stateId?
districtId?
municipalityId?
departmentId?
```

Typical assignments:

```text
STATE_ADMIN:
  stateId

DISTRICT_ADMIN:
  stateId + districtId

MUNICIPAL_ADMIN:
  stateId + districtId + municipalityId

DEPARTMENT_HEAD:
  stateId + districtId + municipalityId + departmentId

OFFICER:
  stateId + districtId + municipalityId + departmentId
```

Actual schema relationships are authoritative.

## 9. Scope Authorization

File:

```text
backend/src/modules/administration/scope.ts
```

Central helper:

```text
hasScopeAccess(role, userScope, resourceScope)
```

Current intent:

```text
SUPER_ADMIN       → unrestricted
STATE_ADMIN       → matching state
DISTRICT_ADMIN    → matching district
MUNICIPAL_ADMIN   → matching municipality
DEPARTMENT_HEAD   → matching department
OFFICER           → no administrative management access through this helper
```

Use scope checks for resource-level authorization. Do not duplicate the same logic unnecessarily.

## 10. Government User Creation

Endpoint:

```http
POST /api/v1/administration/users
```

Route protection:

```text
authenticate
    ↓
authorize(
  SUPER_ADMIN,
  STATE_ADMIN,
  DISTRICT_ADMIN,
  MUNICIPAL_ADMIN,
  DEPARTMENT_HEAD
)
    ↓
controller
    ↓
service
```

Validation file:

```text
backend/src/modules/administration/validation.ts
```

Input:

```text
fullName
email
phone
password
role

optional:
stateId
districtId
municipalityId
departmentId
```

Allowed target roles:

```text
STATE_ADMIN
DISTRICT_ADMIN
MUNICIPAL_ADMIN
DEPARTMENT_HEAD
OFFICER
```

Service responsibilities:

1. Validate the requested child role.
2. Check duplicate email.
3. Check duplicate phone.
4. Load the role.
5. Validate required administrative scope.
6. Validate active entities.
7. Validate parent/child relationships.
8. Validate creator scope.
9. Hash password.
10. Create user + assignment transactionally.

Repository functions include:

```text
findRoleByName
findUserByEmail
findUserByPhone
findStateById
findDistrictById
findMunicipalityById
findDepartmentById
createGovernmentUser
```

`createGovernmentUser` uses a Prisma transaction for:

```text
User
+
AdministrativeAssignment
```

Never store or return plaintext passwords.

## 11. Scope Rules for User Creation

### STATE_ADMIN

Required:

```text
stateId
```

State must exist and be active.

### DISTRICT_ADMIN

Required:

```text
stateId
districtId
```

District must exist, be active, and belong to the selected state.

A STATE_ADMIN can only create one inside their assigned state.

### MUNICIPAL_ADMIN

Required:

```text
stateId
districtId
municipalityId
```

Municipality must exist, be active, and belong to the selected district. District must belong to the selected state.

A DISTRICT_ADMIN can only create one inside their assigned district.

### DEPARTMENT_HEAD

Required:

```text
stateId
districtId
municipalityId
departmentId
```

Department must exist, be active, and belong to the selected municipality. Municipality must belong to the selected district. District must belong to the selected state.

A MUNICIPAL_ADMIN can only create one inside their assigned municipality.

### OFFICER

Required:

```text
stateId
districtId
municipalityId
departmentId
```

Department must exist, be active, and belong to the selected municipality. Municipality must belong to the selected district. District must belong to the selected state.

A DEPARTMENT_HEAD can only create one inside their assigned department.

## 12. Complaint Module

Location:

```text
backend/src/modules/complaints/
```

Complaint statuses currently include:

```text
PENDING
UNDER_REVIEW
IN_PROGRESS
RESOLVED
REJECTED
CLOSED
DISPUTED
REOPENED
```

`ComplaintStatusHistory` includes `cycleNumber`.

Current complaint routes:

```http
GET    /api/v1/complaints/test
POST   /api/v1/complaints
GET    /api/v1/complaints/my
GET    /api/v1/complaints/:id
PATCH  /api/v1/complaints/:id/assign
PATCH  /api/v1/complaints/:id/status
POST   /api/v1/complaints/:id/dispute
PATCH  /api/v1/complaints/:id/reopen
PATCH  /api/v1/complaints/:complaintId/close
GET    /api/v1/complaints/:complaintId/history
```

**Do not change PATCH to PUT or alter paths based on generic documentation. The repository is authoritative.**

## 13. Complaint Scope Authorization

Complaint assignment currently checks:

- complaint exists
- requesting user exists
- requesting user has an appropriate admin role
- target officer exists and is an OFFICER
- complaint scope is derived through:
  `complaint → department → municipality → district → state`
- requester has scope access to complaint
- officer has an administrative assignment
- requester has scope access to officer
- assignment is then performed

Complaint closing checks:

- complaint is in the appropriate resolved state
- requester is an authorized administrator
- requester has scope access to complaint

Complaint status-history access allows appropriate complaint participants such as the citizen/creator and assigned officer, plus authorized administrators with scope access.

Inspect the current service/repository before changing these rules.

## 14. Prisma Schema

Important models include:

```text
Role
User
AdministrativeAssignment
State
District
Municipality
Department
Complaint
ComplaintStatusHistory
```

Important enums:

```text
RoleType:
  SUPER_ADMIN
  STATE_ADMIN
  DISTRICT_ADMIN
  MUNICIPAL_ADMIN
  DEPARTMENT_HEAD
  OFFICER
  CITIZEN

ComplaintStatus:
  PENDING
  UNDER_REVIEW
  IN_PROGRESS
  RESOLVED
  REJECTED
  CLOSED
  DISPUTED
  REOPENED
```

Always inspect:

```text
backend/prisma/schema.prisma
```

before making database changes.

## 15. Seed / Development Data

`backend/prisma/seed.ts` currently seeds:

```text
Roles:
- SUPER_ADMIN
- STATE_ADMIN
- DISTRICT_ADMIN
- MUNICIPAL_ADMIN
- DEPARTMENT_HEAD
- OFFICER
- CITIZEN

State:
- Punjab (PB)

District:
- Ludhiana

Municipality:
- Ludhiana Municipal Corporation

Department:
- Sanitation
```

The Sanitation department is linked to the municipality.

The seed does not currently create all government users.

Development database IDs used during manual testing:

```text
Punjab:
fa36a789-e3c5-4d99-b858-56fe1e219ada

Ludhiana:
f45c03f5-d021-4170-8d94-121422602b04

Ludhiana Municipality:
b3af3335-30b2-46ca-9b2d-00e62774572d

Sanitation:
096e2351-6301-4e8c-9f74-9dfb647ed5ea
```

These are development identifiers, not credentials. They may not exist in another database; inspect seed/database first.

## 16. Manual Testing Completed

Successful positive creation flows:

```text
SUPER_ADMIN → STATE_ADMIN
STATE_ADMIN → DISTRICT_ADMIN
DISTRICT_ADMIN → MUNICIPAL_ADMIN
MUNICIPAL_ADMIN → DEPARTMENT_HEAD
DEPARTMENT_HEAD → OFFICER
```

Thus the complete positive government hierarchy has been manually validated.

Also verified:

```text
Missing authentication → 401
Duplicate phone → 409
```

An earlier invalid JWT test was caused by using an altered/redacted token. A fresh unmodified token subsequently worked.

## 17. Progress Dashboard

> This is a rough project-level estimate, not a percentage of lines of code.

```text
PRISM BACKEND
████████████░░░░░░░░  ~60%
```

### Implemented

```text
[██████████] Backend foundation
[██████████] Express application setup
[██████████] TypeScript strict configuration
[██████████] Prisma/PostgreSQL integration
[██████████] JWT authentication
[██████████] Password hashing
[██████████] Active-user checks
[██████████] Role authorization middleware
[██████████] Administrative hierarchy
[██████████] AdministrativeAssignment
[██████████] Scope loaded into req.user
[██████████] Government user validation
[██████████] Government user creation
[██████████] Hierarchy/child-role rules
[██████████] Administrative scope validation
[██████████] hasScopeAccess()
[██████████] Complaint assignment authorization
[██████████] Complaint close authorization
[██████████] Complaint history authorization
```

### Manually tested

```text
[██████████] Positive government hierarchy creation
[██████████] Missing-authentication rejection
[██████████] Duplicate-phone validation
```

### In progress / immediate next

```text
[░░░░░░░░░░] Negative/security testing
[░░░░░░░░░░] Cross-scope authorization testing
[░░░░░░░░░░] Role-escalation testing
[░░░░░░░░░░] Comprehensive complaint lifecycle testing
[░░░░░░░░░░] Automated API/unit/integration tests
```

### Remaining / not yet completed

```text
[░░░░░░░░░░] Additional administration endpoints
[░░░░░░░░░░] Broader complaint workflow hardening
[░░░░░░░░░░] Notifications
[░░░░░░░░░░] Audit logging
[░░░░░░░░░░] API hardening
[░░░░░░░░░░] Comprehensive automated coverage
[░░░░░░░░░░] Production readiness
[░░░░░░░░░░] Frontend
```

Do not treat every unchecked item as a fixed product requirement; requirements may evolve.

## 18. Immediate Next Milestone

Before implementing a large new feature, complete negative/security testing.

Recommended cases:

1. STATE_ADMIN cannot create higher/lateral roles.
2. STATE_ADMIN cannot create a district admin for a district in another state.
3. DISTRICT_ADMIN cannot create a municipal admin outside its district.
4. MUNICIPAL_ADMIN cannot create a department head outside its municipality.
5. DEPARTMENT_HEAD cannot create an officer outside its department.
6. OFFICER cannot create government users.
7. CITIZEN cannot create government users.
8. Invalid/missing scope IDs are rejected.
9. Parent/child administrative relationships are enforced.

Then add automated tests for these cases.

## 19. Security Rules

Always distinguish:

```text
Authentication
    Who are you?

Role authorization
    Are you allowed to perform this category of operation?

Scope authorization
    Are you allowed to perform it on THIS resource?
```

Do not weaken authorization to make a test pass.

Never:

- log passwords
- store plaintext passwords
- return password hashes
- commit JWT/database/API secrets
- trust client scope merely because IDs are valid

## 20. Controllers / Services / Repositories

Controllers should stay thin:

```text
validate input
    ↓
call service
    ↓
return ApiResponse
    ↓
next(error)
```

Services contain business rules and authorization that depends on resources.

Repositories contain Prisma/database operations.

Do not move business logic into repositories just to shorten services.

## 21. Database and Transactions

For multi-step operations that must be atomic, use Prisma transactions.

Current government-user creation is:

```text
transaction:
    create User
    create AdministrativeAssignment
```

Preserve atomicity.

For schema changes:

1. Inspect current schema.
2. Understand relations.
3. Consider existing data.
4. Use the project's migration workflow.
5. Regenerate Prisma Client if required.
6. Run typecheck/build/tests.

## 22. Error Handling

Use the existing `ApiError` and global error middleware.

Do not introduce unrelated response formats.

Use appropriate status codes such as:

```text
401 authentication failure
403 authorization/scope failure
404 missing resource
409 duplicate unique resource
```

## 23. Git Workflow

Current development branch:

```text
develop
```

`main` is intended for stable/production-ready milestones.

Known commits:

```text
feat: add administrative assignments
feat: add administration user management
feat: add complaint scope authorization
```

Use Conventional Commits:

```text
feat:
fix:
docs:
refactor:
test:
chore:
```

Preferred flow:

```text
develop
   ↓
focused change
   ↓
test
   ↓
review
   ↓
stable milestone
   ↓
merge to main
```

Do not merge to `main` merely because code compiles.

## 24. Known Minor Technical Debt

There are still development `console.log()` statements such as route-loading logs. ESLint may report these as warnings. Do not mix cleanup into unrelated feature work unless necessary.

Automated test coverage is behind manual verification.

`hasScopeAccess()` currently models the scope level associated with each administrative role. Future requirements may need richer hierarchical/multi-scope authorization; extend it deliberately.

The administration service currently accepts `creatorId` in its signature for future use, even though current logic primarily uses creator role/scope. Do not remove it casually.

## 25. Codex Working Protocol

Before modifying code:

```text
1. Read AGENTS.md.
2. Check git status.
3. Check current branch.
4. Inspect relevant source files.
5. Inspect package.json/scripts.
6. Inspect prisma/schema.prisma for DB-related tasks.
7. Inspect recent git history where design context matters.
8. Identify what is already implemented.
```

For significant changes, first explain:

```text
- current behavior
- missing/problematic behavior
- proposed solution
- files likely to change
- verification plan
```

Then implement only the approved/focused change.

After implementation:

```text
- run relevant build/typecheck
- run lint
- run tests
- perform manual API verification if needed
- report what changed
- report what was actually tested
- report remaining concerns
- show git status
```

Do not claim a fix is verified unless it was actually verified.

Do not push commits unless explicitly requested or the project's current workflow requires it.

## 26. First Codex Action After Handoff

Do not immediately modify the project.

First:

```text
1. Read AGENTS.md.
2. Inspect the actual repository.
3. Check git status and branch.
4. Compare this document with the code/schema/git history.
5. Run available validation/build/lint/test commands.
6. Report discrepancies or inaccuracies.
7. Report the next logical task.
8. Wait for the user's implementation instruction.
```

The immediate milestone is **security/negative testing**, not a broad rewrite.

## 27. Handoff Philosophy

ChatGPT may be used for:

```text
architecture
product decisions
workflow design
security reasoning
backend planning
feature decomposition
```

Codex may be used for:

```text
repository inspection
implementation
testing
debugging
refactoring
Git changes
```

Keep both workflows consistent.

When sources disagree, use:

```text
actual repository/code/schema/git history
        >
AGENTS.md
        >
AI assumption
```

If the project intentionally changes, update AGENTS.md to reflect the new architecture/state.

## 28. Final Milestone View

```text
                 PRISM BACKEND
                      │
          ┌───────────┴───────────┐
          │                       │
      FOUNDATION               SECURITY
          │                       │
       COMPLETE               NEXT
          │                       │
  ┌───────┴────────┐       ┌──────┴───────┐
  │                │       │              │
 Auth       Administration Scope tests  Automation
  │                │       │              │
  │                ├ Roles └ Complaint    API coverage
  │                ├ Scope
  │                ├ Users
  │                └ Hierarchy
  │
  └ Complaint authorization
```

The successful positive hierarchy is:

```text
SUPER_ADMIN
    ↓
STATE_ADMIN
    ↓
DISTRICT_ADMIN
    ↓
MUNICIPAL_ADMIN
    ↓
DEPARTMENT_HEAD
    ↓
OFFICER
```

The next priority is:

```text
1. Security / negative testing
2. Automated testing
3. Complaint lifecycle hardening
4. Administration expansion
5. Notifications / audit logging
6. Production hardening
7. Frontend
```
