/**
 * Task Types for PixelTrack Task Management System (Phase 3)
 *
 * @module types/task
 * @description TypeScript interfaces and enums for the Task entity,
 * supporting status tracking, assignment, priority levels, and filtering.
 *
 * @example
 * ```typescript
 * const task: Task = {
 *   id: 'task-123',
 *   title: 'Design Homepage',
 *   description: 'Create hero section with brand assets',
 *   status: TaskStatus.IN_PROGRESS,
 *   priority: TaskPriority.HIGH,
 *   dueDate: '2024-03-15T23:59:59Z',
 *   clientId: 'client-456',
 *   assignees: ['user-789'],
 *   createdAt: '2024-03-01T00:00:00Z',
 *   updatedAt: '2024-03-10T00:00:00Z',
 * }
 * ```
 */

/**
 * Task status values representing the workflow stages
 */
export const TaskStatus = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    COMPLETE: 'complete',
    BLOCKED: 'blocked',
} as const

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus]

/**
 * Task priority levels for scheduling and urgency
 */
export const TaskPriority = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
} as const

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority]

/**
 * Task entity representing a design project task
 */
export interface Task {
    /** Unique identifier (PostgreSQL UUID) */
    id: string

    /** Task title (display name) */
    title: string

    /** Detailed description of the task */
    description: string

    /** Current workflow status */
    status: TaskStatus

    /** Priority level for scheduling */
    priority: TaskPriority

    /** Due date in ISO 8601 format */
    dueDate: string

    /** Optional project this task belongs to */
    projectId?: string

    /** Client this task belongs to */
    clientId: string

    /** Array of employee UIDs assigned to this task */
    assignees: string[]

    /** Timestamp when task was created */
    createdAt: string

    /** Timestamp of last update */
    updatedAt: string

    /** ID of user who created the task */
    createdBy?: string
}

/**
 * Input type for creating a new task
 * Omits system-generated fields (id, createdAt, updatedAt)
 */
export interface CreateTaskInput {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    dueDate: string
    clientId: string
    projectId?: string
    assignees: string[]
    createdBy?: string
}

/**
 * Input type for updating an existing task
 * All fields are optional to support partial updates
 */
export interface UpdateTaskInput {
    id: string
    title?: string
    description?: string
    status?: TaskStatus
    priority?: TaskPriority
    dueDate?: string
    clientId?: string
    projectId?: string
    assignees?: string[]
}

/**
 * Filter options for task queries
 * Used for filtering task lists by various criteria
 */
export interface TaskFilters {
    /** Filter by task status */
    status?: TaskStatus

    /** Filter by priority level */
    priority?: TaskPriority

    /** Optional project ID to filter by */
    projectId?: string

    /** Filter by client ID */
    clientId?: string

    /** Filter by assignee UID */
    assigneeId?: string

    /** Filter by due date range */
    dueDateFrom?: string
    dueDateTo?: string

    /** Search query for title/description */
    searchQuery?: string
}

/**
 * Task with additional computed/display fields
 * Used for enriched task data in UI components
 */
export interface TaskWithDetails extends Task {
    /** Project name (if task belongs to a project) */
    projectName?: string

    /** Client company name (joined from clients collection) */
    clientName?: string

    /** Assignee display names (joined from users collection) */
    assigneeNames?: string[]

    /** Number of comments on this task */
    commentCount?: number

    /** Number of file attachments */
    fileCount?: number

    /** Number of open annotations/feedback items */
    openAnnotationCount?: number
}

/**
 * Task statistics for dashboard display
 */
export interface TaskStats {
    /** Total number of tasks */
    total: number

    /** Count by status */
    byStatus: Record<TaskStatus, number>

    /** Count by priority */
    byPriority: Record<TaskPriority, number>

    /** Tasks due this week */
    dueThisWeek: number

    /** Overdue tasks count */
    overdue: number
}
