import { supabase } from './config'
import { getTasks } from './tasks'
import { getProject, getProjectsByClient } from './projects'
import { getClient } from './clients'
import type {
    AnalyticsDateRange,
    EmployeeAnalyticsFilters,
    EmployeeAnalyticsSummary,
    ProjectAnalyticsFilters,
    ProjectAnalyticsSummary,
    ClientReportFilters,
    ClientReportData,
    ClientReportDeliverable,
    ClientReportFeedbackItem,
} from '@/types'
import { TaskStatus, calculateProjectProgress, type Task } from '@/types'

const DEFAULT_RANGE_DAYS = 30

function ensureRange(range?: AnalyticsDateRange): AnalyticsDateRange {
    if (range) {
        return range
    }

    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - DEFAULT_RANGE_DAYS)

    return { from: from.toISOString(), to: to.toISOString() }
}

function isWithinRange(dateIso: string | undefined, range: AnalyticsDateRange): boolean {
    if (!dateIso) return false
    const date = new Date(dateIso).getTime()
    return date >= new Date(range.from).getTime() && date <= new Date(range.to).getTime()
}

function filterTasksByRange(tasks: Task[], range: AnalyticsDateRange): Task[] {
    return tasks.filter((task) => isWithinRange(task.updatedAt, range) || isWithinRange(task.createdAt, range))
}

async function fetchTaskFilesSummary(taskIds: string[]) {
    if (!taskIds.length) return [] as Array<{ task_id: string; version: number; created_at: string; uploaded_by: string | null }>

    const { data, error } = await supabase
        .from('task_files')
        .select('task_id, version, created_at, uploaded_by')
        .in('task_id', taskIds)

    if (error) throw error
    return data ?? []
}

async function fetchTaskCommentsSummary(taskIds: string[]) {
    if (!taskIds.length) return [] as Array<{ task_id: string; author_id: string | null; created_at: string }>

    const { data, error } = await supabase
        .from('comments')
        .select('task_id, author_id, created_at')
        .in('task_id', taskIds)

    if (error) throw error
    return data ?? []
}

function toHours(ms: number): number {
    return Math.round((ms / 36e5) * 100) / 100
}

export async function getEmployeeAnalytics(filters: EmployeeAnalyticsFilters): Promise<EmployeeAnalyticsSummary> {
    const range = ensureRange(filters.range)
    const baseTasks = await getTasks({ clientId: filters.clientId, projectId: filters.projectId, assigneeId: filters.userId })
    const tasks = filterTasksByRange(baseTasks, range)
    const taskIds = tasks.map((task) => task.id)

    const [files, comments] = await Promise.all([
        fetchTaskFilesSummary(taskIds),
        fetchTaskCommentsSummary(taskIds),
    ])

    const now = new Date()
    const completedTasks = tasks.filter((task) => task.status === TaskStatus.COMPLETE && task.updatedAt)
    const completionDurations = completedTasks.map((task) => new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime())

    const totals = {
        assigned: tasks.length,
        completed: completedTasks.length,
        inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.IN_REVIEW).length,
        overdue: tasks.filter((task) => new Date(task.dueDate) < now && task.status !== TaskStatus.COMPLETE).length,
    }

    const filesUploaded = files.filter(
        (file) => file.uploaded_by === filters.userId && isWithinRange(file.created_at, range),
    ).length

    const commentsAuthored = comments.filter(
        (comment) => comment.author_id === filters.userId && isWithinRange(comment.created_at, range),
    ).length

    return {
        totals,
        completedWithinRange: completedTasks.filter((task) => isWithinRange(task.updatedAt, range)).length,
        averageCompletionTimeHours: completionDurations.length
            ? toHours(completionDurations.reduce((sum, duration) => sum + duration, 0) / completionDurations.length)
            : null,
        filesUploaded,
        commentsAuthored,
        tasks: tasks.map((task) => ({
            task,
            isOverdue: new Date(task.dueDate) < now && task.status !== TaskStatus.COMPLETE,
        })),
    }
}

export async function getProjectAnalytics(filters: ProjectAnalyticsFilters): Promise<ProjectAnalyticsSummary> {
    const range = ensureRange(filters.range)
    const project = await getProject(filters.projectId)
    const baseTasks = await getTasks({ projectId: filters.projectId })
    const tasks = filterTasksByRange(baseTasks, range)
    const now = new Date()

    const taskIds = tasks.map((task) => task.id)
    const files = await fetchTaskFilesSummary(taskIds)

    const totals = {
        tasks: tasks.length,
        completed: tasks.filter((task) => task.status === TaskStatus.COMPLETE).length,
        inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.IN_REVIEW).length,
        overdue: tasks.filter((task) => new Date(task.dueDate) < now && task.status !== TaskStatus.COMPLETE).length,
    }

    const averageTaskDurationHours = (() => {
        const durations = tasks
            .filter((task) => task.status === TaskStatus.COMPLETE && task.updatedAt)
            .map((task) => new Date(task.updatedAt).getTime() - new Date(task.createdAt).getTime())
        if (!durations.length) return null
        return toHours(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
    })()

    const assigneeLoadMap = new Map<string, number>()
    tasks.forEach((task) => {
        task.assignees.forEach((assignee) => {
            assigneeLoadMap.set(assignee, (assigneeLoadMap.get(assignee) ?? 0) + 1)
        })
    })

    return {
        project,
        totals,
        progressPercent: calculateProjectProgress(tasks),
        averageTaskDurationHours,
        revisionCount: files.length,
        assigneeLoad: Array.from(assigneeLoadMap.entries()).map(([assigneeId, taskCount]) => ({ assigneeId, taskCount })),
        tasks,
    }
}

export async function getClientReport(filters: ClientReportFilters): Promise<ClientReportData> {
    const range = ensureRange(filters.range)
    const client = await getClient(filters.clientId)
    const projects = await getProjectsByClient(filters.clientId)
    const baseTasks = await getTasks({ clientId: filters.clientId })
    const tasks = filterTasksByRange(baseTasks, range)
    const taskIds = tasks.map((task) => task.id)

    const [files, comments] = await Promise.all([
        fetchTaskFilesSummary(taskIds),
        fetchTaskCommentsSummary(taskIds),
    ])

    const summary = {
        projects: projects.length,
        tasks: tasks.length,
        completed: tasks.filter((task) => task.status === TaskStatus.COMPLETE).length,
        inProgress: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.IN_REVIEW).length,
        overdue: tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETE).length,
    }

    const tasksByProject = tasks.reduce<Record<string, Task[]>>((acc, task) => {
        const key = task.projectId ?? 'standalone'
        acc[key] = acc[key] ? [...acc[key], task] : [task]
        return acc
    }, {})

    const projectBreakdown = projects.map((project) => {
        const projectTasks = tasksByProject[project.id] ?? []
        return {
            project,
            totals: {
                tasks: projectTasks.length,
                completed: projectTasks.filter((task) => task.status === TaskStatus.COMPLETE).length,
                inProgress: projectTasks.filter((task) => task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.IN_REVIEW).length,
                overdue: projectTasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETE).length,
            },
            progressPercent: calculateProjectProgress(projectTasks),
            assignedEmployeeIds: Array.from(
                new Set(projectTasks.flatMap((task) => task.assignees)),
            ),
        }
    })

    const deliverables: ClientReportDeliverable[] = tasks.map((task) => {
        const taskFiles = files.filter((file) => file.task_id === task.id)
        const latest = taskFiles.reduce<{ version: number; created_at?: string }>((acc, file) => {
            if (!acc.created_at || new Date(file.created_at) > new Date(acc.created_at)) {
                return { version: file.version, created_at: file.created_at }
            }
            return acc
        }, { version: 0 })

        return {
            taskId: task.id,
            taskTitle: task.title,
            fileCount: taskFiles.length,
            latestVersion: latest.version,
            latestFileAt: latest.created_at,
        }
    })

    const feedback: ClientReportFeedbackItem[] = tasks.map((task) => {
        const taskComments = comments.filter((comment) => comment.task_id === task.id)
        return {
            taskId: task.id,
            taskTitle: task.title,
            commentCount: taskComments.length,
        }
    })

    return {
        client,
        range,
        summary,
        projectBreakdown,
        tasksByProject,
        standaloneTasks: tasksByProject['standalone'] ?? [],
        deliverables,
        feedback,
    }
}
