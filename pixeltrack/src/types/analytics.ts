import type { Task, Project, Client } from '@/types'

export interface AnalyticsDateRange {
    from: string
    to: string
}

export type AnalyticsDatePreset = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface EmployeeAnalyticsFilters {
    userId: string
    range?: AnalyticsDateRange
    clientId?: string
    projectId?: string
}

export interface EmployeeAnalyticsSummary {
    totals: {
        assigned: number
        completed: number
        inProgress: number
        overdue: number
    }
    completedWithinRange: number
    averageCompletionTimeHours: number | null
    filesUploaded: number
    commentsAuthored: number
    tasks: Array<{
        task: Task
        isOverdue: boolean
    }>
}

export interface ProjectAnalyticsFilters {
    projectId: string
    range?: AnalyticsDateRange
}

export interface ProjectAnalyticsSummary {
    project: Project | null
    totals: {
        tasks: number
        completed: number
        inProgress: number
        overdue: number
    }
    progressPercent: number
    averageTaskDurationHours: number | null
    revisionCount: number
    assigneeLoad: Array<{
        assigneeId: string
        taskCount: number
    }>
    tasks: Task[]
}

export interface ClientReportFilters {
    clientId: string
    range?: AnalyticsDateRange
}

export interface ClientReportProjectBreakdown {
    project: Project
    totals: {
        tasks: number
        completed: number
        inProgress: number
        overdue: number
    }
    progressPercent: number
    assignedEmployeeIds: string[]
}

export interface ClientReportDeliverable {
    taskId: string
    taskTitle: string
    fileCount: number
    latestVersion: number
    latestFileAt?: string
}

export interface ClientReportFeedbackItem {
    taskId: string
    taskTitle: string
    commentCount: number
}

export interface ClientReportData {
    client: Client | null
    range?: AnalyticsDateRange
    summary: {
        projects: number
        tasks: number
        completed: number
        inProgress: number
        overdue: number
    }
    projectBreakdown: ClientReportProjectBreakdown[]
    tasksByProject: Record<string, Task[]>
    standaloneTasks: Task[]
    deliverables: ClientReportDeliverable[]
    feedback: ClientReportFeedbackItem[]
}
