# PixelTrack Task Tracker

## Project Overview

**PixelTrack** — a web-based project management platform for design agencies. Built with React + Vite, TailwindCSS + Shadcn UI, Firebase (Auth, Firestore, Storage, Functions), and TanStack Query.

---

## Phase 1 — Project Setup & Authentication ✅ COMPLETED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P1.1 | Initialise React + Vite project with TypeScript | ✅ Complete | Cascade | Vite 7.3.1, React 19, TypeScript 5.9 configured |
| P1.2 | Install and configure TailwindCSS and Shadcn UI | ✅ Complete | Cascade | TailwindCSS v4, shadcn components installed |
| P1.3 | Set up React Router with route definitions | ✅ Complete | Cascade | All routes defined in `src/routes/router.tsx` |
| P1.4 | Configure Firebase (auth, firestore, storage, functions) | ✅ Complete | Cascade | Config in `src/lib/firebase/config.ts` |
| P1.5 | Build Login page with email/password form + Zod validation | ✅ Complete | Cascade | `src/pages/LoginPage.tsx` with React Hook Form |
| P1.6 | Implement Firebase Auth state listener with `AuthContext` | ✅ Complete | Cascade | `src/features/auth/AuthContext.tsx` |
| P1.7 | Build `AuthGuard` component | ✅ Complete | Cascade | `src/routes/AuthGuard.tsx` with tests |
| P1.8 | Build `RoleGuard` component | ✅ Complete | Cascade | `src/routes/RoleGuard.tsx` with tests |
| P1.9 | Create `/users` Firestore collection with role on first login | ✅ Complete | Cascade | `createUserProfile` in `src/lib/firebase/users.ts` |
| P1.10 | Write redirect logic: admin → /admin, employee → /dashboard, client → /client | ✅ Complete | Cascade | `ROLE_HOME` constant in `src/lib/constants.ts` |
| P1.11 | Write Firestore security rules for `users` collection | ✅ Complete | Cascade | Full rules in `firestore.rules` lines 23-32 |
| P1.12 | Write unit tests for auth logic and route guards | ✅ Complete | Cascade | `AuthGuard.test.tsx`, `RoleGuard.test.tsx`, `loginSchema.test.ts` |

**Phase 1 Deliverables:**
- ✅ Working login page with form validation
- ✅ Role-based routing with AuthGuard and RoleGuard
- ✅ Firestore security rules for users collection
- ✅ Unit tests passing (AuthGuard, RoleGuard, loginSchema)
- ✅ TypeScript types defined (`UserRole`, `UserProfile`)

---

## Phase 2 — Client & User Management ✅ COMPLETED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P2.1 | Define TypeScript types for Client | ✅ Complete | Cascade | `Client`, `ClientStatus` in `src/types/client.ts` |
| P2.2 | Create Client Firebase service layer | ✅ Complete | Cascade | `createClient`, `getClient`, `updateClient`, `deleteClient`, `getClients` |
| P2.3 | Create ClientForm Zod schema | ✅ Complete | Cascade | `clientSchema` with validation rules |
| P2.4 | Build ClientForm component | ✅ Complete | Cascade | Logo upload, validation, status selector |
| P2.5 | Build ClientList component | ✅ Complete | Cascade | Data table with search, filter, status badges |
| P2.6 | Create TanStack Query hooks for clients | ✅ Complete | Cascade | `useClients`, `useCreateClient`, `useUpdateClient`, `useDeleteClient` |
| P2.7 | Build Client Management page (`/admin/clients`) | ✅ Complete | Cascade | Full CRUD with dialogs |
| P2.8 | Build UserList component | ✅ Complete | Cascade | Role badges, client assignment display |
| P2.9 | Create UserForm with role selector | ✅ Complete | Cascade | Role cards, client dropdown, password field |
| P2.10 | Create User TanStack Query hooks | ✅ Complete | Cascade | `useUsers`, `useCreateUser`, `useUpdateUser`, `useDeleteUser` |
| P2.11 | Build User Management page (`/admin/users`) | ✅ Complete | Cascade | Full CRUD with dialogs |
| P2.12 | Create Cloud Functions for user management | ✅ Complete | Cascade | `createUser`, `updateUser`, `deleteUser`, `listUsers` in `functions/src/index.ts` |
| P2.13 | Write Firestore security rules for `clients` collection | ✅ Complete | Cascade | Admin CRUD, Employees/Clients read-only |
| P2.14 | Update router for new pages | ✅ Complete | Cascade | `/admin/clients` and `/admin/users` routes |

**Phase 2 Deliverables:**
- ✅ Client types with full documentation
- ✅ Client service layer with Firestore integration
- ✅ ClientForm with Zod validation and logo upload
- ✅ ClientList with search, filter, and status chips
- ✅ TanStack Query hooks for client CRUD operations
- ✅ Client Management page at `/admin/clients`
- ✅ UserList with role badges and client assignment
- ✅ UserForm with role selector and validation
- ✅ TanStack Query hooks for user operations
- ✅ User Management page at `/admin/users`
- ✅ Cloud Functions for server-side user management
- ✅ Firestore security rules for clients
- ✅ Updated router with new admin routes

**Pending:**
- ❌ Write unit tests for Client CRUD operations
- ❌ Write unit tests for User management hooks
- ❌ Install Cloud Functions dependencies (`cd functions && npm install`)

---

## Phase 3 — Task Management System ❌ NOT STARTED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P3.1 | Define Firestore `tasks` schema | ❌ Not Started | Cascade | title, description, status, priority, dueDate, clientId, assignees, createdAt, updatedAt |
| P3.2 | Create TypeScript types for Task | ❌ Not Started | Cascade | Task, TaskStatus enums |
| P3.3 | Build Task Management page (`/admin/tasks`) | ❌ Not Started | Cascade | Kanban board + list view toggle |
| P3.4 | Implement status columns | ❌ Not Started | Cascade | Not Started, In Progress, In Review, Complete, Blocked |
| P3.5 | Build Create/Edit Task form | ❌ Not Started | Cascade | title, description, client selector, employee multi-select |
| P3.6 | Build Task Detail page | ❌ Not Started | Cascade | Task info, assignees, due date, timeline, attachments |
| P3.7 | Implement task filtering | ❌ Not Started | Cascade | status, assignee, client, priority, date range |
| P3.8 | Build Employee Dashboard | ❌ Not Started | Cascade | Show only assigned tasks |
| P3.9 | Build Client Dashboard | ❌ Not Started | Cascade | Show only tasks linked to their company |
| P3.10 | Write Firestore security rules for `tasks` | ❌ Not Started | Cascade | Placeholder in rules (lines 41-46) |
| P3.11 | Write tests for task creation, update, filtering | ❌ Not Started | Cascade | Role-based visibility tests |

**Phase 3 Status:** `src/features/tasks/` folder exists but is empty

---

## Phase 4 — File Uploads & Design Previews ❌ NOT STARTED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P4.1 | Build file upload component (drag & drop + file picker) | ❌ Not Started | Cascade | |
| P4.2 | Upload files to Firebase Storage | ❌ Not Started | Cascade | Path: `/clients/{clientId}/tasks/{taskId}/files/` |
| P4.3 | Create `files` subcollection schema | ❌ Not Started | Cascade | name, url, uploadedBy, uploadedAt, version, fileType |
| P4.4 | Auto-increment version number on re-upload | ❌ Not Started | Cascade | |
| P4.5 | Build Design Preview page | ❌ Not Started | Cascade | Full-screen viewer for images |
| P4.6 | Add PDF preview support | ❌ Not Started | Cascade | PDF.js-based viewer |
| P4.7 | Build version history panel | ❌ Not Started | Cascade | Timestamp, uploader, download link |
| P4.8 | Write Firebase Storage security rules | ❌ Not Started | Cascade | Role-based access control |
| P4.9 | Write tests for upload logic | ❌ Not Started | Cascade | Version tracking, preview rendering |

**Phase 4 Status:** `src/features/designs/` folder exists but is empty

---

## Phase 5 — Visual Design Feedback System ❌ NOT STARTED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P5.1 | Build `DesignAnnotator` component | ❌ Not Started | Cascade | Image in relative-positioned container |
| P5.2 | Capture click coordinates as percentages | ❌ Not Started | Cascade | x%, y% for responsive scaling |
| P5.3 | Open comment input popover on click | ❌ Not Started | Cascade | Shadcn Popover anchored to click |
| P5.4 | Create `annotations` subcollection schema | ❌ Not Started | Cascade | taskId, fileId, x, y, comment, author, status |
| P5.5 | Render annotation markers as numbered pins | ❌ Not Started | Cascade | Absolute CSS positioning |
| P5.6 | Click pin to open annotation thread | ❌ Not Started | Cascade | Show original + replies |
| P5.7 | Allow designers to reply | ❌ Not Started | Cascade | |
| P5.8 | Mark comments as resolved | ❌ Not Started | Cascade | Admin and author can resolve |
| P5.9 | Show annotation count badge on file | ❌ Not Started | Cascade | In task detail page |
| P5.10 | Write unit tests for coordinate storage | ❌ Not Started | Cascade | Rendering and reply logic |

---

## Phase 6 — Notifications System ❌ NOT STARTED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P6.1 | Create `notifications` Firestore collection schema | ❌ Not Started | Cascade | userId, type, message, read, createdAt, relatedTaskId |
| P6.2 | Write Cloud Function trigger: task assigned | ❌ Not Started | Cascade | Firestore trigger |
| P6.3 | Write Cloud Function trigger: task status updated | ❌ Not Started | Cascade | |
| P6.4 | Write Cloud Function trigger: new comment added | ❌ Not Started | Cascade | |
| P6.5 | Write Cloud Function trigger: file uploaded | ❌ Not Started | Cascade | |
| P6.6 | Write Cloud Function trigger: client feedback submitted | ❌ Not Started | Cascade | |
| P6.7 | Build `NotificationsPanel` component | ❌ Not Started | Cascade | Slide-out panel in sidebar |
| P6.8 | Show unread count badge on bell icon | ❌ Not Started | Cascade | |
| P6.9 | Mark notifications as read on click | ❌ Not Started | Cascade | Mark All as Read button |
| P6.10 | Add real-time listener using `onSnapshot` | ❌ Not Started | Cascade | Instant notification updates |
| P6.11 | (Optional) Integrate Firebase Cloud Messaging | ❌ Not Started | Cascade | Browser push notifications |
| P6.12 | Write tests for Cloud Function triggers | ❌ Not Started | Cascade | Notification read/unread state |

**Phase 6 Status:** `src/features/notifications/` folder exists but is empty. Firestore rules placeholder exists (lines 48-54)

---

## Phase 7 — Analytics Dashboards ❌ NOT STARTED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P7.1 | Install Recharts library | ❌ Not Started | Cascade | Charting library |
| P7.2 | Build Admin Analytics Dashboard | ❌ Not Started | Cascade | Donut: tasks by status, Bar: tasks per client |
| P7.3 | Admin line chart: tasks completed this vs last month | ❌ Not Started | Cascade | |
| P7.4 | Admin top performing employees table | ❌ Not Started | Cascade | |
| P7.5 | Build Employee Dashboard Analytics | ❌ Not Started | Cascade | Personal tasks by status, weekly completed |
| P7.6 | Build Client Dashboard Analytics | ❌ Not Started | Cascade | Active tasks, completed, open feedback |
| P7.7 | Add date range filters to admin analytics | ❌ Not Started | Cascade | |
| P7.8 | Show skeleton loaders while fetching | ❌ Not Started | Cascade | Shadcn Skeleton |
| P7.9 | Write tests for data aggregation logic | ❌ Not Started | Cascade | |

**Phase 7 Status:** `src/features/analytics/` folder exists but is empty

---

## Phase 8 — Reporting System ❌ NOT STARTED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| P8.1 | Build Reports page (`/admin/reports`) | ❌ Not Started | Cascade | Client selector, month/year picker |
| P8.2 | Create Cloud Function for report generation | ❌ Not Started | Cascade | Query tasks by client and month |
| P8.3 | Generate structured report data | ❌ Not Started | Cascade | Completed tasks, in progress, files, comments |
| P8.4 | Return downloadable CSV file | ❌ Not Started | Cascade | |
| P8.5 | (Optional) Generate PDF summary | ❌ Not Started | Cascade | pdfmake or jsPDF |
| P8.6 | Show report preview before download | ❌ Not Started | Cascade | |
| P8.7 | Store generated reports in Firebase Storage | ❌ Not Started | Cascade | Path: `/reports/{clientId}/{year}/{month}.pdf` |
| P8.8 | Write tests for Cloud Function report generation | ❌ Not Started | Cascade | |

**Phase 8 Status:** `src/features/reports/` folder exists but is empty

---

## Shared Components & UI Infrastructure 🚧 PARTIAL

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| S1 | Shadcn UI components | ✅ Complete | Cascade | button, card, input, label, select, table, dialog, dropdown-menu, avatar, badge |
| S2 | Layout component (sidebar navigation) | ❌ Not Started | Cascade | Fixed sidebar desktop, bottom tab mobile |
| S3 | Sidebar footer with user info | ❌ Not Started | Cascade | Name, avatar initials, role |
| S4 | Navigation active state styling | ❌ Not Started | Cascade | Cobalt blue accent |
| S5 | Mobile responsive breakpoints | ❌ Not Started | Cascade | 768px breakpoint |
| S6 | Toast notification system | ✅ Complete | Cascade | Sonner installed and configured |
| S7 | Brand color CSS variables | ✅ Complete | Cascade | Cobalt Blue #0047AB, Navy #000080, Sky #82C8E5, Slate #6D8196 |
| S8 | Error boundary component | ❌ Not Started | Cascade | Global error handling |
| S9 | Loading skeleton components | ❌ Not Started | Cascade | Reusable skeleton patterns |

---

## Testing Infrastructure ✅ COMPLETED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| T1 | Configure Vitest + React Testing Library | ✅ Complete | Cascade | vitest, @testing-library/react, jsdom |
| T2 | Configure test coverage reporting | ✅ Complete | Cascade | @vitest/coverage-v8, `test:coverage` script |
| T3 | Create test setup file | ✅ Complete | Cascade | `src/test/setup.ts` |
| T4 | Write AuthGuard tests | ✅ Complete | Cascade | `src/routes/AuthGuard.test.tsx` |
| T5 | Write RoleGuard tests | ✅ Complete | Cascade | `src/routes/RoleGuard.test.tsx` |
| T6 | Write loginSchema tests | ✅ Complete | Cascade | `src/features/auth/schemas/loginSchema.test.ts` |
| T7 | Write LoginPage tests | ✅ Complete | Cascade | `src/pages/LoginPage.test.tsx` |
| T8 | Setup Firebase Emulator for tests | ❌ Not Started | Cascade | Add `test:emulator` script |

---

## Firebase Configuration & Deployment ✅ COMPLETED

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| FB1 | Firebase project initialization | ✅ Complete | Cascade | `firestore.rules`, `storage.rules` exist |
| FB2 | Firestore security rules (users) | ✅ Complete | Cascade | Lines 23-32 |
| FB3 | Firestore security rules (placeholders) | ✅ Complete | Cascade | clients, tasks, notifications |
| FB4 | Storage rules placeholder | ✅ Complete | Cascade | `storage.rules` exists |
| FB5 | Cloud Functions setup | ✅ Complete | Cascade | `functions/src/index.ts` with user management functions |
| FB6 | Firebase Emulator configuration | ❌ Not Started | Cascade | For local testing |

---

## Missing Types (Need Definition)

| Type | Phase | Description |
|------|-------|-------------|
| `Client` | P2 | ✅ Complete | Company: id, name, logoUrl?, primaryContact, email, status, createdAt, updatedAt |
| `Task` | P3 | Task: id, title, description, status, priority, dueDate, clientId, assignees[], createdAt, updatedAt |
| `TaskStatus` | P3 | Enum: not_started, in_progress, in_review, complete, blocked |
| `TaskPriority` | P3 | Enum: low, medium, high, urgent |
| `File` | P4 | File attachment: id, name, url, uploadedBy, uploadedAt, version, fileType, taskId |
| `Annotation` | P5 | Design comment: id, taskId, fileId, x, y, comment, authorId, authorName, createdAt, status |
| `Notification` | P6 | Notification: id, userId, type, message, read, createdAt, relatedTaskId |
| `Report` | P8 | Report data structure for CSV/PDF export |

---

## Current Summary

- **Phase 1 (Authentication):** ✅ **COMPLETE** — All tasks finished, tests passing
- **Phase 2 (Client & User Mgmt):** ✅ **COMPLETE** — Client & User management fully implemented
- **Phase 3-8:** ❌ **NOT STARTED** — Feature folders exist but empty

**Next Recommended Action:** Proceed to Phase 3 (Task Management System) or write unit tests for Phase 2 features. Cloud Functions need `npm install` in the functions folder before deployment.

