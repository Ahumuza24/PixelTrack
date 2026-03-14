-- PixelTrack Supabase Database Schema
-- Run this in the Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ============================================
-- EXTENSIONS
-- ============================================
extension pgcrypto;

-- ============================================
-- TABLES (Order matters - clients must be created before profiles)
-- ============================================

-- Clients table (must be first - referenced by profiles)
-- Stores client company information
create table if not exists public.clients (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    logo_url text,
    primary_contact text not null,
    email text not null,
    status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Profiles table (extends auth.users)
-- Stores additional user information beyond what Supabase Auth provides
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    display_name text not null,
    role text not null default 'employee' check (role in ('admin', 'employee', 'client')),
    photo_url text,
    client_id uuid references public.clients(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Tasks table
-- Stores task/project information
create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'in_review', 'complete', 'blocked')),
    priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
    due_date timestamptz,
    client_id uuid references public.clients(id) on delete cascade not null,
    assignees uuid[] default '{}',
    created_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_client_id on public.profiles(client_id);
create index if not exists idx_clients_status on public.clients(status);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_client_id on public.tasks(client_id);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_tasks_assignees on public.tasks using gin(assignees);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.tasks enable row level security;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================

-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can read all profiles (needed for assignee lists, etc.)
CREATE POLICY "Authenticated users can read all profiles" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can only update their own profile (except role - that's admin only)
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND client_id = (SELECT client_id FROM public.profiles WHERE id = auth.uid())
    );

-- ============================================
-- RLS POLICIES FOR CLIENTS
-- ============================================

-- Admins have full access
CREATE POLICY "Admins have full access to clients" ON public.clients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Employees can read all clients
CREATE POLICY "Employees can read all clients" ON public.clients
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

-- Client-role users can only see their own client
CREATE POLICY "Clients can only see own client" ON public.clients
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND client_id = clients.id
        )
    );

-- ============================================
-- RLS POLICIES FOR TASKS
-- ============================================

-- Admins have full access
CREATE POLICY "Admins have full access to tasks" ON public.tasks
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Employees can read tasks they're assigned to (or created)
CREATE POLICY "Employees can read assigned tasks" ON public.tasks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'employee'
        )
        AND (
            auth.uid() = ANY(assignees)
            OR created_by = auth.uid()
        )
    );

CREATE POLICY "Employees can create tasks" ON public.tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'employee')
        )
    );

CREATE POLICY "Employees can update tasks they're assigned to" ON public.tasks
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'employee')
            AND (
                auth.uid() = ANY(assignees)
                OR id IN (SELECT id FROM public.tasks WHERE created_by = auth.uid())
            )
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() 
            AND role IN ('admin', 'employee')
        )
    );

-- Client-role users can only see tasks for their client
CREATE POLICY "Clients can only see tasks for their client" ON public.tasks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() 
            AND p.role = 'client'
            AND p.client_id = tasks.client_id
        )
    );

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', new.email),
        'employee'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED DATA (Optional)
-- ============================================

-- Create an admin user (you'll need to sign up with this email first via Supabase Auth)
-- Then run this to make them admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
