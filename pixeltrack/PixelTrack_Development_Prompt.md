# PIXEL TRACK
## Design Agency Task Management & Visual Feedback System
### Full-Stack Development Prompt — v3.0

---

## 1. Project Overview

You are a senior full stack software engineer building **Pixel Track** — a web-based project management platform tailored for design agencies. The system enables agency admins, employees, and clients to collaborate on design tasks in a single unified platform. It eliminates fragmentation across email, spreadsheets, and file storage by centralising task tracking, design file management, visual feedback, notifications, and reporting.

This prompt is structured in phases. Build and fully test each phase before proceeding to the next. Maintain clean, production-grade code throughout.

---

## 2. Technology Stack

Use the following stack exactly as specified. Do not substitute libraries without flagging it.

| Layer | Technology |
|---|---|
| Frontend | React with Vite |
| UI Framework | TailwindCSS + Shadcn UI |
| Routing | React Router v6 |
| State / Data Fetching | TanStack Query (React Query) |
| Backend | Supabase (BaaS) |
| Database | Supabase PostgreSQL (via Supabase client) |
| File Storage | Supabase Storage |
| Authentication | Supabase Auth |
| Real-time | Supabase Realtime (Postgres changes) |
| Server Logic | Supabase Edge Functions (Deno / TypeScript) |
| Testing | Vitest + React Testing Library |
| Linting & Formatting | ESLint + Prettier |

---

## 3. Code Quality & Architecture Standards

These standards apply to every phase. Do not skip them for speed.

### 3.1 Project Structure

Organise the codebase using a feature-based folder structure:

```
src/
  features/
    auth/          — login, auth guards, hooks
    tasks/         — task list, task detail, task form
    projects/      — project list, project detail, project form
    clients/       — client management
    designs/       — file upload, preview, feedback
    notifications/ — notification panel, hooks
    analytics/     — dashboards, charts
    reports/       — export logic
  components/      — shared/reusable UI components
  hooks/           — global shared custom hooks
  lib/             — supabase client config, utils, constants
  pages/           — top-level page components
  routes/          — React Router config + guards
  types/           — TypeScript interfaces and types

supabase/
  migrations/      — SQL migration files
  functions/       — Edge Functions (one folder per function)
  seed.sql         — seed data for local development
```

### 3.2 TypeScript

Use TypeScript throughout. Define shared interfaces in `src/types/`. Avoid using `any`. Enable strict mode in `tsconfig.json`. Generate Supabase database types using the Supabase CLI (`supabase gen types typescript`) and keep them up to date with every migration.

### 3.3 Component Design

- Build small, single-responsibility components
- Extract all reusable UI into `src/components/`
- Use Shadcn UI as the base component library and customise with Tailwind
- Never hard-code magic strings — use constants files

### 3.4 Supabase Best Practices

- Initialise a single Supabase client in `src/lib/supabase.ts` and import it everywhere — never create multiple client instances
- All database access must go through Row Level Security (RLS) policies — never query with the service role key on the client
- Use environment variables for all Supabase config (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Use Supabase Edge Functions for sensitive server-side logic such as report generation, user creation, and privileged writes
- Use the service role key only inside Edge Functions, never on the client
- Write SQL migrations for every schema change — never edit the database schema manually via the Supabase dashboard in production
- Use Supabase Realtime channels for live data updates (notifications, task status changes)

### 3.5 Error Handling

- Wrap all async operations in try/catch
- Check for and handle the `error` object returned from every Supabase query
- Display user-friendly error messages using toast notifications
- Log errors to the console in development; suppress in production
- Handle loading, error, and empty states for every data-fetching component

---

## 4. Security Requirements

Security must be enforced at both the client and the database level.

### 4.1 Authentication

- Use Supabase Auth with Email/Password sign-in
- Use `supabase.auth.onAuthStateChange()` to maintain a global reactive session
- Protect all routes behind an `AuthGuard` component that checks the active session
- Redirect unauthenticated users to `/login`
- Store the user session using Supabase's built-in session persistence (local storage by default)

### 4.2 Role-Based Access Control (RBAC)

There are three roles: `admin`, `employee`, and `client`. Store the role in a `profiles` table that is linked one-to-one with `auth.users` via the user's UUID.

- **Admin:** full access to all data, users, and settings
- **Employee:** access only to tasks assigned to them
- **Client:** access only to tasks and files related to their own company
- Implement a `useRole()` hook that reads the role from the `profiles` table for the current user
- Use a `RoleGuard` component to conditionally render UI based on role
- Set the user's role via a Supabase Edge Function after account creation — never allow the client to self-assign a role

### 4.3 Row Level Security (RLS) Policies

Enable RLS on every table. Write explicit policies for each table:

- `profiles` — users can read and update their own profile; admin can read all profiles
- `clients` — admin can read and write; employees and client users can only read their own associated client
- `projects` — admin has full access; employees can read projects where they are assigned to at least one task under that project; clients can read projects where `client_id` matches their associated client
- `tasks` — admin has full access; employees can read tasks where their `id` appears in the `task_assignees` join table; clients can read tasks where `client_id` matches their associated client
- `task_assignees` — admin has full access; employees can read rows where their `user_id` matches
- `comments` — authenticated users can read comments on tasks they have access to; users can only insert and update their own comments
- `annotations` — same access pattern as comments, scoped to task access
- `notifications` — each user can only read and update their own notifications
- `files` — access controlled via Supabase Storage bucket policies by role and `client_id`

### 4.4 Input Validation

- Validate all form inputs on the client using React Hook Form with Zod schemas
- Re-validate all inputs at the start of every Edge Function — never trust client-supplied data
- Sanitise any free-form text input before storing in the database

---

## 5. Database Schema

Design the PostgreSQL schema with the following tables. Write a SQL migration file for each phase.

### Core Tables

```sql
-- User profiles (extends auth.users)
profiles (
  id          uuid primary key references auth.users(id),
  full_name   text,
  avatar_url  text,
  role        text check (role in ('admin', 'employee', 'client')),
  client_id   uuid references clients(id), -- set for client-role users
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
)

-- Client companies
clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  logo_url     text,
  contact_name text,
  email        text,
  status       text default 'active',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
)

-- Projects (long-term client engagements)
projects (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  title       text not null,
  description text,
  status      text default 'active' check (status in ('active','on_hold','complete','cancelled')),
  start_date  date,
  due_date    date,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
)

-- Tasks
tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      text check (status in ('not_started','in_progress','in_review','complete','blocked')),
  priority    text check (priority in ('low','medium','high')),
  due_date    date,
  client_id   uuid references clients(id),
  project_id  uuid references projects(id) on delete set null, -- nullable: null = standalone task
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
)

-- Task assignees (many-to-many)
task_assignees (
  task_id  uuid references tasks(id) on delete cascade,
  user_id  uuid references profiles(id) on delete cascade,
  primary key (task_id, user_id)
)

-- Design files
files (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid references tasks(id) on delete cascade,
  name         text not null,
  storage_path text not null,
  url          text not null,
  file_type    text,
  version      integer default 1,
  uploaded_by  uuid references profiles(id),
  uploaded_at  timestamptz default now()
)

-- Visual annotations on design files
annotations (
  id          uuid primary key default gen_random_uuid(),
  file_id     uuid references files(id) on delete cascade,
  task_id     uuid references tasks(id) on delete cascade,
  x           numeric not null, -- percentage 0-100
  y           numeric not null, -- percentage 0-100
  comment     text not null,
  author_id   uuid references profiles(id),
  status      text default 'open' check (status in ('open','resolved')),
  created_at  timestamptz default now()
)

-- Annotation replies
annotation_replies (
  id            uuid primary key default gen_random_uuid(),
  annotation_id uuid references annotations(id) on delete cascade,
  author_id     uuid references profiles(id),
  comment       text not null,
  created_at    timestamptz default now()
)

-- Task comments
comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid references tasks(id) on delete cascade,
  author_id  uuid references profiles(id),
  body       text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
)

-- In-app notifications
notifications (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references profiles(id) on delete cascade,
  type            text not null,
  message         text not null,
  read            boolean default false,
  related_task_id uuid references tasks(id),
  created_at      timestamptz default now()
)
```

---

## 6. UI & Design System

### 6.1 Brand Colours

| Name | Hex | Usage |
|---|---|---|
| Cobalt Blue | `#0047AB` | Primary CTA buttons, active nav, links |
| Navy Blue | `#000080` | Headers, section titles, sidebar |
| Sky Blue | `#82C8E5` | Highlights, badges, tag backgrounds |
| Slate Grey | `#6D8196` | Secondary text, muted labels, borders |

### 6.2 Layout & Navigation

- Use a fixed left sidebar for desktop navigation with the following items in order: Dashboard, Tasks, Projects, Clients, Team, Files, Notifications, Analytics — with Reports accessible from the Admin section at the bottom
- Collapse sidebar to a bottom tab bar on mobile (responsive breakpoint at 768px) showing the five most-used items: Dashboard, Tasks, Projects, Notifications, and a More menu
- Show the current user's name, avatar initials, and role in the sidebar footer
- Active nav items should use the cobalt blue (`#0047AB`) accent

### 6.3 Typography

- Primary font: **Inter** (Google Fonts)
- Headings: `font-bold`, `text-navy-900`
- Body: `text-sm` or `text-base`, `text-slate-700`
- Labels and captions: `text-xs`, `text-slate-500`

### 6.4 Component Styling Rules

- All buttons use the Shadcn `Button` component with Tailwind variants
- Forms use Shadcn `Input`, `Select`, `Textarea`, and `Label`
- Status badges: pill-shaped chips with colour-coded backgrounds — blue = in progress, green = complete, yellow = review, red = blocked
- Cards use subtle shadow (`shadow-sm`), rounded corners (`rounded-xl`), and white background
- Tables use alternating row backgrounds and sticky headers

### 6.5 Mobile-First

- Design every screen for mobile first, then enhance for desktop
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) consistently
- File previews on mobile should use a full-screen modal viewer
- Touch targets must be at least 44×44px

---

## 7. Development Phases

Build and fully test each phase before moving to the next. Each phase should end with passing unit tests and a working UI.

---

### Phase 1 — Project Setup & Authentication

**Goal:** Scaffold the project, configure Supabase, and implement full authentication with role-based routing.

**Tasks:**
1. Initialise React + Vite project with TypeScript
2. Install and configure TailwindCSS and Shadcn UI
3. Set up React Router with route definitions for all pages
4. Install the Supabase JavaScript client (`@supabase/supabase-js`) and initialise it in `src/lib/supabase.ts` using environment variables
5. Create the Supabase project locally using the Supabase CLI (`supabase init`, `supabase start`)
6. Write the first SQL migration: create the `profiles` table with RLS enabled
7. Create a Postgres trigger that automatically inserts a row into `profiles` when a new user signs up via `auth.users`
8. Build the Login page with email/password form validated by Zod
9. Implement `supabase.auth.onAuthStateChange()` with a global `AuthContext` that exposes the session and user profile
10. Build `AuthGuard` and `RoleGuard` components
11. Write redirect logic: admin → `/admin`, employee → `/dashboard`, client → `/client`
12. Generate TypeScript types from the schema using `supabase gen types typescript`
13. Write unit tests for auth logic and route guards

**Tech Focus:** Vite, React Router, Supabase Auth, Supabase CLI, SQL migrations, Zod, React Hook Form, Vitest

---

### Phase 2 — Client & User Management

**Goal:** Allow the admin to create and manage client companies and user accounts.

**Tasks:**
1. Write SQL migration: create `clients` table with RLS policies
2. Build Client Management page (`/admin/clients`) with a data table (search, filter, paginate)
3. Create Add/Edit Client form: company name, logo upload, primary contact, email, status
4. Upload client logo to Supabase Storage bucket `client-assets`; store the public URL in the `clients` table
5. Write SQL migration: create the `profiles` table updates needed to link a user to a client
6. Build User Management page (`/admin/users`): list all profiles with role, status, and assigned client
7. Create Add/Edit User form: name, email, role selector, optional client assignment
8. Create a Supabase Edge Function `create-user` that uses the Supabase Admin client to create the Auth user and insert the profile row with the correct role server-side
9. Write RLS policies for `clients` and `profiles`
10. Write tests for CRUD operations on clients and users

**Tech Focus:** Supabase Storage, Supabase Edge Functions, Supabase Admin client, RLS policies, Shadcn Table, Shadcn Dialog, React Hook Form

---

### Phase 3 — Projects & Task Management System

**Goal:** Build the projects system and the full task management system. Tasks must support both project-based and standalone modes. This is the core of the application — build it carefully and test it thoroughly.

---

#### 3A — Projects

**Concept:**

A project is a long-term container that groups related tasks together under a single client engagement. Not all tasks belong to a project. Tasks must support an optional project relationship — if `project_id` is `null`, the task is a standalone task.

Example projects: Brand Design, Website Design, Marketing Campaign, Social Media Package.

Example standalone tasks: Women's Day Poster, Event Banner, Instagram Post, Flyer Design.

**Database:**
1. Write SQL migration: create the `projects` table with RLS policies
2. RLS rules: admin has full access; employees can read projects where they are assigned to at least one task under that project; clients can read projects linked to their `client_id`

**Projects Page (`/projects`):**
1. Build a Projects page that lists all projects in a card layout
2. Each project card must display: project name, client name, number of tasks, completed tasks vs total tasks, due date, status, and a progress bar computed from `completed tasks / total tasks * 100`
3. Add filtering by client, status, and due date range
4. Clicking a project card navigates to the Project Detail page

**Project Detail Page (`/projects/:projectId`):**
1. Build a Project Detail page with two sections:

   **Project Overview section:** project title, client name, description, start date, due date, status badge

   **Tasks section:** list all tasks where `project_id` matches this project. Each task row shows: task name, assigned employees (avatars), status badge, priority badge, due date. Clicking a task opens the Task Detail page.

2. Add a button to create a new task directly within this project — the project and client must be pre-filled and locked in the task creation form
3. Show the project's computed progress bar at the top of the page

**Project Creation Form:**
1. Build a Create/Edit Project form with fields: title, description, client (dropdown), start date, due date, status
2. On submit, insert a row into the `projects` table

---

#### 3B — Tasks

**Concept:**

The Tasks page lists every task across the entire system — both project tasks and standalone tasks. This is the global task view.

**Database:**
1. Write SQL migration: create `tasks` and `task_assignees` tables with RLS policies
2. The `project_id` column is nullable — `null` means standalone task, a valid UUID means the task belongs to that project

**Tasks Page (`/tasks`):**
1. Build a Tasks page that lists all tasks across the system with Kanban board view and list view toggle
2. Implement Kanban status columns: Not Started, In Progress, In Review, Complete, Blocked
3. Each task card/row must display: task title, client name, project name (or a **"Standalone Task"** label if `project_id` is null), assigned employees, status, priority, due date
4. Add filtering by status, client, project, assignee, priority, and date range

**Task Display Logic — Breadcrumb Navigation:**

Every task must display a breadcrumb based on whether it belongs to a project:

- If `task.project_id` is set: `Client → Project → Task` (e.g. `Harvey Jewelry → Brand Design → Logo Design`)
- If `task.project_id` is null: `Client → Task` (e.g. `Harvey Jewelry → Women's Day Poster`)

Render this breadcrumb on the Task Detail page header and in any task list row.

**Task Creation Form:**
1. Build a Create/Edit Task form with fields: task title, description, client (dropdown), project (optional dropdown — filters by the selected client), assigned employees (multi-select), priority, status, due date
2. When a project is selected: automatically populate and lock the client field from the project's `client_id`
3. When no project is selected: the task is saved with `project_id = null` and is treated as a standalone task
4. On submit, insert into `tasks` and batch insert assignees into `task_assignees` in a single transaction

**Task Detail Page (`/tasks/:taskId`):**
1. Display the breadcrumb navigation at the top
2. Show all task metadata: title, description, client, project (or "Standalone Task" label), assignees, priority, status, due date
3. Include the activity timeline, comments section, and file attachments (connected in later phases)

**Role-Based Task Visibility:**
- Employee Dashboard: show only tasks where the user appears in `task_assignees`
- Client Dashboard: show only tasks where `client_id` matches the user's associated client, grouped by project where applicable
- Admin: sees all tasks and projects

**Tests:**
1. Write tests for project CRUD operations
2. Write tests for task creation with and without a project
3. Write tests for the breadcrumb logic
4. Write tests for task filtering including standalone vs project-based filtering
5. Write tests for role-based task and project visibility

**Tech Focus:** Supabase PostgreSQL, TanStack Query, React Hook Form, Shadcn Select, Shadcn DatePicker, Shadcn Badge, Shadcn Progress

---

### Phase 4 — File Uploads & Design Previews

**Goal:** Enable employees to upload design files to tasks, with version history and in-app preview.

**Tasks:**
1. Create a Supabase Storage bucket `design-files` with private access (access controlled by RLS)
2. Write SQL migration: create `files` table with RLS policies
3. Build a file upload component for tasks (drag and drop + file picker)
4. Upload files to Supabase Storage under the path `{clientId}/{taskId}/{filename}`
5. After upload, retrieve the signed or public URL and insert a row into the `files` table with metadata: `name`, `url`, `storage_path`, `uploaded_by`, `uploaded_at`, `version`, `file_type`
6. Auto-increment the `version` field by querying the highest existing version for that filename before inserting
7. Build Design Preview page: render image files (PNG, JPG, WebP, SVG) in a full-screen viewer
8. Add PDF preview support using a PDF.js-based viewer
9. Build a version history panel showing all uploaded versions with timestamp, uploader, and download link
10. Write Supabase Storage bucket policies to enforce role-based access (employees can upload, clients can view)
11. Write tests for upload logic, version tracking, and preview rendering

**Tech Focus:** Supabase Storage, PDF.js, Shadcn Dialog, drag-and-drop file input, version control logic

---

### Phase 5 — Visual Design Feedback System

**Goal:** Allow clients to click directly on a design to place coordinate-based comments. Designers can reply and mark comments resolved.

**Tasks:**
1. Write SQL migration: create `annotations` and `annotation_replies` tables with RLS policies
2. Build a `DesignAnnotator` component that renders an image inside a relative-positioned container
3. On click, capture coordinates as percentage values (`x%`, `y%`) relative to image dimensions to support responsive scaling
4. On click, open a comment input popover anchored to the click point
5. On submit, insert a row into the `annotations` table: `file_id`, `task_id`, `x`, `y`, `comment`, `author_id`, `status` (`open` / `resolved`)
6. Render stored annotations as numbered marker pins overlaid on the image, positioned using absolute CSS with the stored percentage coordinates
7. Clicking a pin opens a thread showing the original comment and all replies from `annotation_replies`
8. Employees can insert rows into `annotation_replies` to reply to any annotation
9. Admin and the annotation author can update the annotation `status` to `resolved`
10. Show an annotation count badge on the file in the task detail page
11. Write unit tests for coordinate storage, rendering, and reply logic

**Tech Focus:** Supabase PostgreSQL, absolute CSS positioning, percentage-based coordinates, Shadcn Popover, RLS policies

---

### Phase 6 — Notifications System

**Goal:** Implement an in-app notification system to alert users of key events in real time.

**Tasks:**
1. Write SQL migration: create `notifications` table with RLS policies (users can only read their own rows)
2. Create Postgres functions and triggers (or Supabase Edge Functions) to insert notification rows for: task assigned, task status updated, new comment added, file uploaded, annotation submitted
3. Build a `NotificationsPanel` component in the sidebar: show unread count badge on bell icon
4. Clicking the bell opens a slide-out panel listing all notifications sorted by `created_at` descending
5. Mark individual notifications as read by updating the `read` column; provide a Mark All as Read button that batch-updates all unread rows for the current user
6. Subscribe to new notifications in real time using Supabase Realtime: `supabase.channel('notifications').on('postgres_changes', ...)` filtered by `user_id`
7. Write tests for notification trigger logic and read/unread state updates

**Tech Focus:** Supabase Realtime, Postgres triggers, Supabase Edge Functions, Shadcn Sheet

---

### Phase 7 — Analytics Dashboards

**Goal:** Provide data visualisation for admins and employees to monitor performance and project health.

**Tasks:**
1. Admin Analytics Dashboard: total tasks by status (donut chart), tasks per client (bar chart), tasks completed this month vs last month (line chart), top performing employees (table), projects by status (summary cards)
2. Employee Dashboard Analytics: personal tasks by status, tasks completed this week, upcoming due dates, projects the employee is contributing to
3. Client Dashboard Analytics: active projects count, active tasks count, completed tasks, open annotation items, progress across all projects
4. Use **Recharts** as the charting library
5. Aggregate data using Supabase PostgreSQL queries with `group by` and `count` — avoid client-side aggregation over large datasets
6. Create Postgres views or RPC functions (`supabase.rpc()`) for complex aggregations that require joins
7. Use TanStack Query to cache dashboard data with a 5-minute stale time
8. Add date range filters to admin analytics
9. Show skeleton loaders while data is fetching
10. Write tests for data aggregation logic and RPC function results

**Tech Focus:** Recharts, TanStack Query, Supabase RPC functions, Postgres views, Shadcn Skeleton

---

### Phase 8 — Reporting System

**Goal:** Allow admins to generate and export monthly PDF/CSV reports per client.

**Tasks:**
1. Build a Reports page (`/admin/reports`) with a client selector and month/year picker
2. On export, call a Supabase Edge Function `generate-report` that queries the database for all tasks, files, and annotations related to that client in the selected month
3. The Edge Function generates a structured report including: tasks completed, tasks in progress, files delivered, total comments, open annotation items
4. Return the report as a downloadable CSV for tabular data
5. Optionally generate a PDF summary inside the Edge Function using a Deno-compatible PDF library
6. Show a report preview on screen before downloading
7. Store the generated report file in Supabase Storage under `reports/{clientId}/{year}/{month}/report.pdf`
8. Insert a record of the generated report into a `reports` table for audit history
9. Write tests for the Edge Function report generation logic

**Tech Focus:** Supabase Edge Functions (Deno), Supabase Storage, CSV export, PDF generation, TanStack Query

---

## 8. Testing Requirements

Every phase must include tests. Do not ship features without corresponding test coverage.

### 8.1 Unit Tests (Vitest + React Testing Library)

- **Auth hooks and guards:** test authenticated vs unauthenticated states and role-based redirects
- **Form validation:** test Zod schemas for all forms in the app
- **Task filtering logic:** test all filter combinations
- **Annotation coordinate logic:** test percentage calculation and rendering
- **Notification triggers:** mock Supabase Realtime events and assert UI updates

### 8.2 Component Tests

- Render tests for all major page components
- Test that role-restricted UI is hidden from unauthorised roles
- Test loading and error states for all data-fetching components
- Test form submission, validation feedback, and success/error toasts

### 8.3 Supabase Local Development

- Use the Supabase CLI to run a local Supabase stack (`supabase start`) for all development and testing
- Never run tests against a production Supabase project
- Use `supabase db reset` to apply migrations and seed data before running tests
- Mock the Supabase client in unit tests using `vi.mock()` for components that do not require a real database

### 8.4 Coverage

Aim for **70% code coverage minimum** across features. Run coverage reports using Vitest's built-in coverage reporter (`vitest --coverage`).

---

## 9. Page Breakdown Reference

| Page | Route | Accessible By |
|---|---|---|
| Login | `/login` | All (unauthenticated) |
| Admin Dashboard | `/admin` | Admin |
| Employee Dashboard | `/dashboard` | Employee |
| Client Dashboard | `/client` | Client |
| Projects | `/projects` | Admin, Employee, Client |
| Project Detail | `/projects/:projectId` | Admin, Employee, Client |
| Tasks | `/tasks` | Admin, Employee, Client |
| Task Detail | `/tasks/:taskId` | Admin, Employee, Client |
| Client Management | `/admin/clients` | Admin |
| User Management | `/admin/users` | Admin |
| Design Preview & Feedback | `/tasks/:taskId/designs/:fileId` | All |
| Analytics Dashboard | `/analytics` | Admin, Employee |
| Reports | `/admin/reports` | Admin |
| Notifications Panel | Slide-out panel (global) | All |

---

## 10. General Development Instructions

Apply these instructions throughout all phases:

- Commit code at the end of every completed feature or sub-task using the Conventional Commits format (e.g. `feat(auth): add role-based route guards`)
- Keep `.env.local` out of version control — add it to `.gitignore` and document required variables in a `.env.example` file
- Install only the libraries listed in this prompt — do not add extra packages without leaving a comment explaining why
- All Edge Functions must be written in TypeScript and run on the Deno runtime
- Enable CORS in all Edge Functions that are called from the frontend
- Use Supabase transactions (via RPC functions) when multiple rows must be written atomically
- Add JSDoc comments to all utility functions, custom hooks, and Edge Functions
- Regenerate Supabase TypeScript types (`supabase gen types typescript`) after every migration and commit the updated types file
- Run `npm run lint` and `npm run test` before marking any phase complete
- Never hardcode Supabase URLs or keys — always read from environment variables

---

*End of Pixel Track Development Prompt — v3.0 (Supabase + Projects)*
