/**
 * Project status values
 */
export const ProjectStatus = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
    CANCELLED: 'cancelled',
} as const

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus]

/**
 * Represents a project in the PixelTrack platform.
 * Projects are long-term engagements that contain multiple tasks.
 * Stored in PostgreSQL at `projects` table
 *
 * @example
 * ```typescript
 * const project: Project = {
 *   id: 'proj-123',
 *   clientId: 'client-456',
 *   title: 'Brand Design',
 *   description: 'Complete brand identity package',
 *   status: ProjectStatus.ACTIVE,
 *   startDate: '2024-01-15T00:00:00Z',
 *   dueDate: '2024-03-15T00:00:00Z',
 *   createdBy: 'user-789',
 *   createdAt: '2024-01-15T10:00:00Z',
 *   updatedAt: '2024-01-15T10:00:00Z',
 * }
 * ```
 */
export interface Project {
    /** Unique identifier (PostgreSQL UUID) */
    id: string

    /** Client this project belongs to */
    clientId: string

    /** Project title/name */
    title: string

    /** Optional project description */
    description?: string

    /** Current project status */
    status: ProjectStatus

    /** When the project started */
    startDate?: string

    /** Project deadline */
    dueDate?: string

    /** User who created this project */
    createdBy?: string

    /** ISO timestamp when created */
    createdAt: string

    /** ISO timestamp when last updated */
    updatedAt: string
}

/**
 * Input type for creating a new project
 * Omits system-generated fields (id, createdAt, updatedAt)
 */
export interface CreateProjectInput {
    clientId: string
    title: string
    description?: string
    status?: ProjectStatus
    startDate?: string
    dueDate?: string
}

/**
 * Input type for updating an existing project
 * All fields optional except id
 */
export interface UpdateProjectInput {
    id: string
    title?: string
    description?: string
    status?: ProjectStatus
    startDate?: string
    dueDate?: string
}

/**
 * Extended project type that includes computed analytics
 */
export interface ProjectWithAnalytics extends Project {
    /** Total number of tasks in this project */
    totalTasks: number

    /** Number of completed tasks */
    completedTasks: number

    /** Progress percentage (0-100) */
    progress: number
}

/**
 * Extended project type that includes client info
 */
export interface ProjectWithClient extends Project {
    /** Client name */
    clientName: string
}

/**
 * Extended project type with both client info and analytics
 */
export interface ProjectWithClientAndAnalytics extends ProjectWithClient, ProjectWithAnalytics {}

/**
 * Filters for querying projects
 */
export interface ProjectFilters {
    /** Filter by client ID */
    clientId?: string

    /** Filter by status */
    status?: ProjectStatus

    /** Search by title */
    searchQuery?: string
}
