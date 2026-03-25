import { UserRole, TaskStatus } from '@/types'

/** All application route paths — never hard-code these strings elsewhere. */
export const ROUTES = {
    LOGIN: '/login',
    ADMIN: '/admin',
    DASHBOARD: '/dashboard',
    CLIENT: '/client',
    CLIENT_PROJECTS: '/client/projects',
    CLIENT_PROJECT_DETAIL: '/client/projects/:projectId',
    CLIENT_TASKS: '/client/tasks',
    CLIENT_FILES: '/client/files',
    EMPLOYEE_ANALYTICS: '/dashboard/analytics',
    ADMIN_CLIENTS: '/admin/clients',
    ADMIN_CLIENT_DETAIL: '/admin/clients/:clientId',
    ADMIN_USERS: '/admin/users',
    ADMIN_PROJECTS: '/admin/projects',
    ADMIN_PROJECT_DETAIL: '/admin/projects/:projectId',
    ADMIN_TASKS: '/admin/tasks',
    ADMIN_SETTINGS: '/admin/settings',
    ADMIN_REPORTS: '/admin/reports',
    ADMIN_FILES: '/admin/files',
    PROJECT_ANALYTICS: '/admin/analytics/projects',
    CLIENT_REPORTS: '/client/reports',
    TASK_DETAIL: '/tasks/:taskId',
    DESIGN_PREVIEW: '/tasks/:taskId/designs/:fileId',
    ANALYTICS: '/admin/analytics',
    NOTIFICATIONS: '/notifications',
} as const

/** Routes accessible by each role after successful login */
export const ROLE_HOME: Record<UserRole, string> = {
    [UserRole.ADMIN]: ROUTES.ADMIN,
    [UserRole.EMPLOYEE]: ROUTES.DASHBOARD,
    [UserRole.CLIENT]: ROUTES.CLIENT,
} as const

export interface TaskStatusDisplayConfig {
    label: string
    badgeClass: string
    dotClass: string
}

export const SUPABASE_FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

/** Task status labels and colours for badge rendering */
export const TASK_STATUS_CONFIG: Record<TaskStatus, TaskStatusDisplayConfig> = {
    not_started: {
        label: 'Not Started',
        badgeClass: 'bg-slate-100 text-slate-600',
        dotClass: 'bg-slate-300',
    },
    in_progress: {
        label: 'In Progress',
        badgeClass: 'bg-blue-100 text-blue-700',
        dotClass: 'bg-blue-400',
    },
    in_review: {
        label: 'In Review',
        badgeClass: 'bg-yellow-100 text-yellow-700',
        dotClass: 'bg-yellow-400',
    },
    complete: {
        label: 'Complete',
        badgeClass: 'bg-green-100 text-green-700',
        dotClass: 'bg-green-400',
    },
    blocked: {
        label: 'Blocked',
        badgeClass: 'bg-red-100 text-red-700',
        dotClass: 'bg-red-400',
    },
}
