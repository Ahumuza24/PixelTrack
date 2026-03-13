import { UserRole } from '@/types'

/** All application route paths — never hard-code these strings elsewhere. */
export const ROUTES = {
    LOGIN: '/login',
    ADMIN: '/admin',
    DASHBOARD: '/dashboard',
    CLIENT: '/client',
    ADMIN_CLIENTS: '/admin/clients',
    ADMIN_USERS: '/admin/users',
    ADMIN_PROJECTS: '/admin/projects',
    ADMIN_PROJECT_DETAIL: '/admin/projects/:projectId',
    ADMIN_TASKS: '/admin/tasks',
    ADMIN_REPORTS: '/admin/reports',
    TASK_DETAIL: '/tasks/:taskId',
    DESIGN_PREVIEW: '/tasks/:taskId/designs/:fileId',
    ANALYTICS: '/admin/analytics',
} as const

/** Routes accessible by each role after successful login */
export const ROLE_HOME: Record<UserRole, string> = {
    [UserRole.ADMIN]: ROUTES.ADMIN,
    [UserRole.EMPLOYEE]: ROUTES.DASHBOARD,
    [UserRole.CLIENT]: ROUTES.CLIENT,
} as const

/** Task status labels and colours for badge rendering */
export const TASK_STATUS_CONFIG = {
    not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    in_review: { label: 'In Review', color: 'bg-yellow-100 text-yellow-700' },
    complete: { label: 'Complete', color: 'bg-green-100 text-green-700' },
    blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
} as const
