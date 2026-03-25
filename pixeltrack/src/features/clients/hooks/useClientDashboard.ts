import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useClient } from './useClients'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import { useProjectsByClient } from '@/features/projects/hooks/useProjects'
import { useTaskFiles } from '@/features/tasks/hooks/useTaskFiles'
import { TaskStatus, type TaskFile } from '@/types'
import { ROUTES } from '@/lib/constants'

interface DashboardStats {
    projects: {
        total: number
        active: number
        completed: number
    }
    tasks: {
        total: number
        inProgress: number
        completed: number
        overdue: number
    }
}

interface RecentDeliverable {
    id: string
    fileName: string
    taskId: string
    taskTitle: string
    uploadedAt: string
    fileType: string
}

interface RecentActivity {
    id: string
    type: 'comment' | 'file_upload' | 'status_change' | 'task_created'
    taskId: string
    taskTitle: string
    description: string
    timestamp: string
}

interface UseClientDashboardResult {
    clientName: string
    userName: string
    stats: DashboardStats
    recentDeliverables: RecentDeliverable[]
    recentActivity: RecentActivity[]
    isLoading: boolean
    notFound: boolean
    handlers: {
        handleViewTask: (taskId: string) => void
        handleViewProject: (projectId: string) => void
        handleViewFile: (file: RecentDeliverable) => void
    }
}

export function useClientDashboard(): UseClientDashboardResult {
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const navigate = useNavigate()
    const { data: client, isLoading: clientLoading } = useClient(clientId)
    const { data: tasks = [], isLoading: tasksLoading } = useTasksByClient(clientId)
    const { data: projects = [], isLoading: projectsLoading } = useProjectsByClient(clientId)

    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])
    const { data: taskFilesMap, isLoading: filesLoading } = useTaskFiles(taskIds)

    const stats = useMemo<DashboardStats>(() => {
        const now = new Date().toISOString()
        const totalProjects = projects.length
        const activeProjects = projects.filter((p) => p.status === 'active').length
        const completedProjects = projects.filter((p) => p.status === 'completed').length

        const totalTasks = tasks.length
        const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
        const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETE).length
        const overdueTasks = tasks.filter((t) => t.dueDate < now && t.status !== TaskStatus.COMPLETE).length

        return {
            projects: {
                total: totalProjects,
                active: activeProjects,
                completed: completedProjects,
            },
            tasks: {
                total: totalTasks,
                inProgress: inProgressTasks,
                completed: completedTasks,
                overdue: overdueTasks,
            },
        }
    }, [projects, tasks])

    const recentDeliverables = useMemo<RecentDeliverable[]>(() => {
        const allFiles: RecentDeliverable[] = []
        const taskMap = new Map(tasks.map((t) => [t.id, t.title]))

        taskFilesMap?.forEach((taskFiles, taskId) => {
            const taskTitle = taskMap.get(taskId) ?? 'Unknown Task'
            taskFiles.forEach((file: TaskFile) => {
                allFiles.push({
                    id: file.id,
                    fileName: file.fileName,
                    taskId,
                    taskTitle,
                    uploadedAt: file.createdAt,
                    fileType: file.fileType,
                })
            })
        })

        return allFiles
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 5)
    }, [taskFilesMap, tasks])

    const recentActivity = useMemo<RecentActivity[]>(() => {
        const activities: RecentActivity[] = tasks.slice(0, 10).map((task) => ({
            id: `task-${task.id}`,
            type: 'task_created' as const,
            taskId: task.id,
            taskTitle: task.title,
            description: `Task "${task.title}" is ${task.status.replace('_', ' ')}`,
            timestamp: task.updatedAt,
        }))

        return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
    }, [tasks])

    const handleViewTask = (taskId: string) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
    }

    const handleViewProject = (projectId: string) => {
        navigate(ROUTES.CLIENT_PROJECT_DETAIL.replace(':projectId', projectId))
    }

    const handleViewFile = (file: RecentDeliverable) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', file.taskId))
    }

    const isLoading = clientLoading || tasksLoading || projectsLoading || filesLoading
    const notFound = !!clientId && !client && !isLoading

    return {
        clientName: client?.name ?? 'Client Portal',
        userName: user?.displayName ?? 'Client',
        stats,
        recentDeliverables,
        recentActivity,
        isLoading,
        notFound,
        handlers: {
            handleViewTask,
            handleViewProject,
            handleViewFile,
        },
    }
}
