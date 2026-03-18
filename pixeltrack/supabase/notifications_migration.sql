-- Notifications + notification preferences schema
-- Run with `supabase db execute --file supabase/notifications_migration.sql`

-- Reusable enums ------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE public.notification_type AS ENUM (
            'task_assigned',
            'task_status_updated',
            'comment_added',
            'file_uploaded',
            'annotation_submitted',
            'report_ready',
            'system'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority') THEN
        CREATE TYPE public.notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
    END IF;
END
$$;

-- Notifications table -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    action_url text,
    related_entity_type text,
    related_entity_id uuid,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    priority notification_priority NOT NULL DEFAULT 'normal',
    is_read boolean NOT NULL DEFAULT false,
    read_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created_at
    ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON public.notifications (user_id, is_read)
    WHERE is_read = false;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notification preferences table -------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
    in_app_enabled boolean NOT NULL DEFAULT true,
    email_enabled boolean NOT NULL DEFAULT true,
    task_assignments boolean NOT NULL DEFAULT true,
    status_updates boolean NOT NULL DEFAULT true,
    comments boolean NOT NULL DEFAULT true,
    files boolean NOT NULL DEFAULT true,
    annotations boolean NOT NULL DEFAULT true,
    reports boolean NOT NULL DEFAULT true,
    digest_frequency text NOT NULL DEFAULT 'immediate',
    quiet_hours jsonb NOT NULL DEFAULT jsonb_build_object('start', '22:00', 'end', '07:00'),
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Timestamp maintenance trigger --------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notifications_set_updated_at ON public.notifications;
CREATE TRIGGER notifications_set_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS notification_preferences_set_updated_at ON public.notification_preferences;
CREATE TRIGGER notification_preferences_set_updated_at
    BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- RLS policies -------------------------------------------------------------
-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;
CREATE POLICY "Admins can manage notifications" ON public.notifications
    FOR ALL TO authenticated
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

-- Notification preferences
DROP POLICY IF EXISTS "Users can manage own notification preferences" ON public.notification_preferences;
CREATE POLICY "Users can manage own notification preferences" ON public.notification_preferences
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage notification preferences" ON public.notification_preferences;
CREATE POLICY "Admins can manage notification preferences" ON public.notification_preferences
    FOR ALL TO authenticated
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
