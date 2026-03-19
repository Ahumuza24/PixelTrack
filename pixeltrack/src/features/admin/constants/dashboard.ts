import { CheckSquare, FolderKanban, UserCircle2, FileText, Plus, Building2, Users, MessageSquare, Upload, CheckCircle, Bell } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NotificationType, SearchResultType } from '@/types'
import { ROUTES } from '@/lib/constants'

export interface SearchTypeConfig {
    icon: LucideIcon
    accentClass: string
    backgroundClass: string
    label: string
}

export const SEARCH_TYPE_CONFIG: Record<SearchResultType, SearchTypeConfig> = {
    task: {
        icon: CheckSquare,
        accentClass: 'text-[#0048ad]',
        backgroundClass: 'bg-[#0048ad]/10',
        label: 'Task',
    },
    project: {
        icon: FolderKanban,
        accentClass: 'text-indigo-600',
        backgroundClass: 'bg-indigo-50',
        label: 'Project',
    },
    client: {
        icon: UserCircle2,
        accentClass: 'text-emerald-600',
        backgroundClass: 'bg-emerald-50',
        label: 'Client',
    },
    file: {
        icon: FileText,
        accentClass: 'text-slate-600',
        backgroundClass: 'bg-slate-100',
        label: 'File',
    },
}

export interface AdminDashboardQuickAction {
    icon: LucideIcon
    label: string
    href: string
    className: string
}

export const DASHBOARD_QUICK_ACTIONS: AdminDashboardQuickAction[] = [
    { icon: Plus, label: 'New Project', href: ROUTES.ADMIN_PROJECTS, className: 'bg-primary text-primary-foreground hover:bg-primary/90' },
    { icon: Plus, label: 'New Task', href: ROUTES.ADMIN_TASKS, className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80' },
    { icon: Building2, label: 'Add Client', href: ROUTES.ADMIN_CLIENTS, className: 'bg-accent text-accent-foreground hover:bg-accent/90' },
    { icon: Users, label: 'Add Team Member', href: ROUTES.ADMIN_USERS, className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90' },
]

export interface ActivityDisplayConfig {
    icon: LucideIcon
    backgroundClass: string
    accentClass: string
    action: string
}

export const ACTIVITY_TYPE_CONFIG: Partial<Record<NotificationType, ActivityDisplayConfig>> = {
    comment_added: {
        icon: MessageSquare,
        backgroundClass: 'bg-[#0048ad]/10',
        accentClass: 'text-[#0048ad]',
        action: 'commented on',
    },
    file_uploaded: {
        icon: Upload,
        backgroundClass: 'bg-slate-100',
        accentClass: 'text-slate-500',
        action: 'uploaded files to',
    },
    task_status_updated: {
        icon: CheckCircle,
        backgroundClass: 'bg-green-100',
        accentClass: 'text-green-600',
        action: 'updated',
    },
    task_assigned: {
        icon: Users,
        backgroundClass: 'bg-orange-100',
        accentClass: 'text-orange-600',
        action: 'assigned teammates to',
    },
}

export const DEFAULT_ACTIVITY_CONFIG: ActivityDisplayConfig = {
    icon: Bell,
    backgroundClass: 'bg-slate-100',
    accentClass: 'text-slate-500',
    action: 'shared an update about',
}

export const PROJECT_STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    not_started: { label: 'Not Started', bg: 'bg-muted', color: 'text-muted-foreground', dot: 'bg-muted-foreground/70' },
    active: { label: 'Active', bg: 'bg-primary/10', color: 'text-primary', dot: 'bg-primary' },
    on_hold: { label: 'On Hold', bg: 'bg-amber-100 text-amber-700', color: 'text-amber-700', dot: 'bg-amber-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-100 text-emerald-700', color: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-destructive/10 text-destructive', color: 'text-destructive', dot: 'bg-destructive' },
}
