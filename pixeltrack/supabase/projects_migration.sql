-- PixelTrack Projects Schema Migration
-- Run this in Supabase SQL Editor after the main schema

-- ============================================
-- PROJECTS TABLE
-- ============================================
create table if not exists public.projects (
    id uuid default gen_random_uuid() primary key,
    client_id uuid references public.clients(id) on delete cascade not null,
    title text not null,
    description text,
    status text not null default 'not_started' check (
        status in ('not_started', 'active', 'completed', 'on_hold', 'cancelled')
    ),
    start_date timestamptz,
    due_date timestamptz,
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Ensure status column matches latest defaults/constraints even on existing tables
alter table public.projects
    alter column status set default 'not_started';

alter table public.projects
    drop constraint if exists projects_status_check;

alter table public.projects
    add constraint projects_status_check check (
        status in ('not_started', 'active', 'completed', 'on_hold', 'cancelled')
    );

-- Add project_id to tasks table (nullable for standalone tasks)
alter table public.tasks add column if not exists project_id uuid references public.projects(id) on delete set null;

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_due_date on public.projects(due_date);
create index if not exists idx_tasks_project_id on public.tasks(project_id);

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES FOR PROJECTS
-- ============================================

alter table public.projects enable row level security;

-- Admins have full access
DROP POLICY IF EXISTS "Admins have full access to projects" ON public.projects;
CREATE POLICY "Admins have full access to projects" ON public.projects
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Employees can read all projects
DROP POLICY IF EXISTS "Employees can read all projects" ON public.projects;
CREATE POLICY "Employees can read all projects" ON public.projects
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Employees can create projects
DROP POLICY IF EXISTS "Employees can create projects" ON public.projects;
CREATE POLICY "Employees can create projects" ON public.projects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Employees can update projects
DROP POLICY IF EXISTS "Employees can update projects" ON public.projects;
CREATE POLICY "Employees can update projects" ON public.projects
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Client-role users can only see projects for their client
DROP POLICY IF EXISTS "Clients can only see own projects" ON public.projects;
CREATE POLICY "Clients can only see own projects" ON public.projects
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'client'
            AND p.client_id = projects.client_id
        )
    );

-- ============================================
-- UPDATE TASK POLICIES TO HANDLE PROJECT TASKS
-- ============================================

-- Drop and recreate task policies to handle project context
DROP POLICY IF EXISTS "Employees can read all tasks" ON public.tasks;

CREATE POLICY "Employees can read all tasks" ON public.tasks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );
