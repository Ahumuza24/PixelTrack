-- Task file storage + metadata setup
-- Run inside Supabase SQL editor or via `supabase db execute`.

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-files', 'task-files', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TASK FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.task_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks (id) ON DELETE CASCADE,
    uploaded_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
    file_name text NOT NULL,
    file_url text,
    file_type text NOT NULL,
    file_size bigint,
    version integer NOT NULL DEFAULT 1 CHECK (version > 0),
    is_external_link boolean NOT NULL DEFAULT false,
    external_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT task_files_supported_type CHECK (
        file_type IN (
            'image/png',
            'image/jpeg',
            'image/svg+xml',
            'application/pdf',
            'external/link'
        )
    ),
    CONSTRAINT task_files_external_link_requires_url CHECK (
        (is_external_link = true AND external_url IS NOT NULL)
        OR (is_external_link = false AND external_url IS NULL)
    ),
    CONSTRAINT task_files_storage_path_required CHECK (
        (is_external_link = true) OR (file_url IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON public.task_files (task_id);
CREATE INDEX IF NOT EXISTS idx_task_files_task_id_version ON public.task_files (task_id, version DESC);

ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: TASK FILES TABLE
-- ============================================
CREATE POLICY "Admins manage task files" ON public.task_files
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Employees manage their task files" ON public.task_files
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee')
        )
        AND EXISTS (
            SELECT 1
            FROM public.tasks t
            WHERE t.id = public.task_files.task_id
              AND (auth.uid() = ANY (t.assignees) OR t.created_by = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'employee')
        )
        AND EXISTS (
            SELECT 1
            FROM public.tasks t
            WHERE t.id = public.task_files.task_id
              AND (auth.uid() = ANY (t.assignees) OR t.created_by = auth.uid())
        )
    );

CREATE POLICY "Clients can read task files" ON public.task_files
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.profiles p
            JOIN public.tasks t ON t.id = public.task_files.task_id
            WHERE p.id = auth.uid()
              AND p.role = 'client'
              AND p.client_id = t.client_id
        )
    );

-- ============================================
-- STORAGE OBJECT POLICIES (task-files bucket)
-- ============================================
CREATE POLICY "Admin storage access" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'task-files'
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    )
    WITH CHECK (
        bucket_id = 'task-files'
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

CREATE POLICY "Employees manage assigned task files" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'task-files'
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id::text = split_part(name, '/', 1)
              AND (auth.uid() = ANY (t.assignees) OR t.created_by = auth.uid())
        )
    )
    WITH CHECK (
        bucket_id = 'task-files'
        AND EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id::text = split_part(name, '/', 1)
              AND (auth.uid() = ANY (t.assignees) OR t.created_by = auth.uid())
        )
    );

CREATE POLICY "Clients can read task file objects" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'task-files'
        AND EXISTS (
            SELECT 1
            FROM public.profiles p
            JOIN public.tasks t ON t.id::text = split_part(storage.objects.name, '/', 1)
            WHERE p.id = auth.uid()
              AND p.role = 'client'
              AND p.client_id = t.client_id
        )
    );
