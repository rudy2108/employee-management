# Employee Management Project: Full Logic and Working Guide

This file explains the complete working of your project in simple, practical terms.

## 1) What this project is

This is a frontend HRMS (Human Resource Management System) app built with React + TypeScript.
It uses a fake backend (json-server + db.json) so you can practice full CRUD flows like a real app.

Main modules in the app:

1. Authentication (Login + route protection)
2. Dashboard analytics
3. Employee management (add, edit, delete, search)
4. Leave management workflow (employee request -> HR pre-approval -> admin decision)
5. HR administration tools (roles, holidays, policies, job applications)
6. Employee problems/grievances module

## 2) Tech stack and why each is used

1. Vite
- Fast dev server and build tool.

2. React + TypeScript
- Component-based UI with type safety.

3. React Router
- Page navigation and protected routes.

4. Redux Toolkit
- Used mainly for authentication state (is user logged in, current admin data).

5. TanStack React Query
- Used for server data fetching/caching/mutations (employees, leaves, holidays, policies, problems, job applications).

6. Axios
- HTTP client for API calls to json-server.

7. json-server + db.json
- Mock backend and persistent local JSON database.

8. Tailwind CSS + shadcn setup
- Utility-first styling and design tokens.

## 3) High-level architecture

Frontend app layers:

1. UI Components and Pages
2. State + Data Layer
3. API Service Layer
4. Mock Backend (db.json via json-server)

Flow:

1. User action in page/component
2. Mutation/query called via React Query (or auth thunk via Redux)
3. API service in src/services/api.ts calls json-server endpoint
4. Response updates cache/state
5. UI rerenders with fresh data

## 4) Boot sequence (what runs first)

1. src/main.tsx mounts App inside React StrictMode.
2. src/App.tsx wraps app in providers:
   - Redux Provider (global auth state)
   - QueryClientProvider (server data cache)
   - RouterProvider (all routes)
   - ReactQueryDevtools (debug fetch/mutation cache)
3. Router decides page based on URL.

## 5) Routing and protection logic

Routing is in src/routes/index.tsx.

Public route:

1. /login

Protected routes (inside ProtectedRoute):

1. /dashboard
2. /hr-administration
3. /employee-management
4. /employee-management/add
5. /employee-management/:id/edit
6. /leave
7. /employee-problems

Fallback:

1. Any unknown path redirects to /login

ProtectedRoute logic (src/routes/ProtectedRoute.tsx):

1. Reads auth.isAuthenticated from Redux store
2. If true -> render child route
3. If false -> redirect to /login

## 6) Authentication flow (Redux side)

Auth slice file: src/features/auth/authSlice.ts

State fields:

1. admin
2. isAuthenticated
3. loading
4. error

Initial auth persistence:

1. On app load, it reads localStorage key admin.
2. If present, user stays logged in.

Login flow:

1. Login page dispatches loginAdmin(email, password)
2. Thunk calls GET /admins?email=...
3. Verifies password client-side against returned admin
4. Stores safe admin object in localStorage (without password)
5. Updates Redux state to authenticated
6. Login page effect redirects to /dashboard

Logout flow:

1. Sidebar logout button dispatches logoutAdmin()
2. Removes admin from localStorage
3. Sets Redux auth state to logged out
4. Navigates to /login

Important learning note:

1. This is demo authentication only. Password check happens on frontend and is not secure for production.

## 7) Data fetching and mutation pattern (React Query)

Most feature data uses this pattern:

1. useQuery for reading list data
2. useMutation for create/update/delete
3. On mutation success, invalidateQueries for the relevant key
4. Query refetches and UI auto-updates

Common query keys used:

1. employees
2. leaves
3. holidays
4. policies
5. problems
6. jobApplications

## 8) API service layer

Single API file: src/services/api.ts

Base URL:

1. http://localhost:3000

Entity APIs:

1. employeeAPI: fetchAll, add, delete, update
2. leaveAPI: fetchAll, create, update, delete
3. holidayAPI: fetchAll, add, delete
4. policyAPI: fetchAll, add, delete, update
5. jobApplicationAPI: fetchAll, update
6. problemAPI: fetchAll, create, update, delete

Why this design is good:

1. Keeps HTTP logic out of pages/components
2. Reusable and centralized typed interfaces

## 9) Backend schema (db.json)

Collections in db.json:

1. admins
2. employees
3. leaves
4. holidays
5. policies
6. problems
7. jobApplications

json-server gives REST endpoints automatically:

1. GET /employees
2. POST /employees
3. PUT /employees/:id
4. DELETE /employees/:id
... same idea for other collections.

## 10) Page-by-page logic

### A) Login page (src/pages/login_page.tsx)

1. Local form state for email/password/show-password/remember-checkbox
2. Submits Redux thunk loginAdmin
3. Shows loading and error from Redux
4. If already authenticated, redirects to dashboard

### B) Dashboard page (src/pages/dashboard_page.tsx)

1. Fetches employees, leaves, problems, job applications, holidays
2. Derives multiple metrics in-memory:
   - total employees
   - new hires this month
   - open/resolved problems
   - leave summaries
   - application summaries
   - upcoming holidays
3. Builds a recent activity timeline by merging latest items from multiple sources
4. Renders cards, charts-like bars, and tables from derived values

### C) Employee Management page (src/pages/employee_management.tsx)

1. Fetches employees + leave requests
2. Reads search term from URL query param q (set by header search)
3. Filters employees by name/email/department/employee-id
4. Supports:
   - delete employee
   - open edit page
   - create leave request (modal)
   - cancel leave request
5. Leave request modal validates fields and creates status=pending request

### D) Add Employee page (src/pages/add_employee.tsx)

1. Controlled form state for employee data
2. On submit calls employeeAPI.add
3. Invalidates employees query and navigates back to employee list

### E) Edit Employee page (src/pages/edit_employee.tsx)

1. Gets id from route param
2. Loads all employees, finds one by id
3. Pre-fills form with selected employee
4. On save calls employeeAPI.update(id, form)
5. Invalidates employees query and navigates back

### F) HR Administration page (src/pages/hr_administration.tsx)

This page combines multiple HR operations:

1. Leave pre-approval queue:
   - shows only leave status = pending
   - HR can mark as hr_approved or hr_rejected

2. Job application handling:
   - approve: update application status to approved and create employee record
   - reject: update application status to rejected
   - bulk approve: approve multiple pending applications and add each as employee

3. Admin tools modals:
   - Manage Roles (department/designation updates)
   - Holidays (CRUD)
   - Policies (CRUD + view details)

4. Dashboard-like stats:
   - departments count
   - pending leave approvals
   - applications count
   - employees count

### G) Leave page (src/pages/leave.tsx)

Admin decision stage for leaves:

1. Fetches leaves + employees
2. Shows only statuses: hr_approved, approved, rejected
3. Search/filter support
4. If status is hr_approved:
   - admin can approve -> approved
   - admin can reject -> rejected
5. Already decided requests can be removed

This creates a two-step workflow:

1. Employee submits pending
2. HR sets hr_approved/hr_rejected
3. Admin finalizes to approved/rejected

### H) Employee Problems page (src/pages/employee_problems.tsx)

1. Fetches problems + employees
2. Joins each problem with employee details by employeeId
3. Filter by search/category/status
4. Actions:
   - log new problem (LogProblem modal)
   - view details (ViewProblemModal)
   - mark resolved
   - delete problem
5. Shows status/priority/category badges and summary counters

## 11) Important shared components

1. Sidebar (src/components/sidebar.tsx)
   - Left navigation
   - active-route highlighting
   - logout action

2. Header (src/components/header.tsx)
   - Search box writes q in URL query string
   - employee management page reads same q param for filtering

3. Modals:
   - logProblem.tsx: create problem ticket
   - ViewProblemModal.tsx: read problem details
   - holidaysModal.tsx: add/delete/search/paginate holidays
   - policiesModal.tsx: add/delete/search/view policies
   - modalRoles.tsx: bulk-edit department/designation and save changed rows

## 12) Styling system

Core style file: src/App.css

What it does:

1. Imports Tailwind v4 + shadcn + font
2. Defines theme tokens (colors, font sizes, radii)
3. Defines utility classes used around app (icon fill, shadows)
4. Sets base body/html styles

Design approach:

1. Utility classes + custom design tokens
2. Material Symbols icons used heavily via class names

## 13) Vite/dev-server behavior detail

In vite.config.ts, db.json is ignored by file watcher.

Why:

1. json-server writes db.json on every mutation
2. Without ignore, Vite could trigger full page reload frequently
3. This keeps the dev experience smoother

## 14) Existing but currently unused files/components

These components exist but are not imported in active pages right now:

1. src/components/dashboardStats.tsx
2. src/components/headCountDepartment.tsx
3. src/components/recentActivity.tsx

Meaning:

1. They may be earlier versions or alternate implementations.
2. Current dashboard page builds those sections inline instead.

## 15) End-to-end real example flows

### Flow 1: Login

1. User enters email/password
2. Redux thunk checks admins in db.json
3. localStorage admin set
4. protected routes become accessible
5. redirect to dashboard

### Flow 2: Add employee

1. Open Add Employee page
2. Submit form
3. POST /employees
4. React Query invalidates employees
5. Employee list refreshes with new row

### Flow 3: Leave lifecycle

1. In Employee Management, leave request created as pending
2. HR Administration approves/rejects to hr_approved/hr_rejected
3. Leave page finalizes hr_approved requests into approved/rejected

### Flow 4: Approve applicant to employee

1. HR Admin approves a pending job application
2. Application status changes to approved
3. New employee record auto-created from candidate data

### Flow 5: Problem resolution

1. HR logs problem from modal (ticket generated)
2. Problem appears in problems table
3. Team marks it resolved or deletes it

## 16) What to learn from this project

This project teaches these practical concepts well:

1. Combining Redux and React Query with clear responsibilities
2. Client-side route protection
3. CRUD with optimistic UX pattern (mutate + invalidate)
4. Joining related entities in frontend (employeeId -> employee)
5. Multi-step business workflows with status fields
6. Reusable modal-based operations

## 17) Current limitations (good learning opportunities)

1. Authentication is demo-only and not secure for production
2. No form validation library (manual validation only)
3. No role-based authorization (all logged-in users act as admin)
4. No backend business rule enforcement (everything is client-driven)
5. Some pages still have duplicated UI layout code that could be shared

## 18) How to run this project correctly

Open two terminals in project root:

1. Start frontend
   npm run dev

2. Start backend mock server
   npm run server

Then open the Vite URL in browser.

Demo login from db.json:

1. email: admin@company.com
2. password: admin123

---

If you want, the next step can be a second file named SYSTEM_FLOW_DIAGRAM.md where I can add visual flow diagrams for:

1. Auth flow
2. Employee CRUD flow
3. Leave approval pipeline
4. HR application-to-employee conversion flow
