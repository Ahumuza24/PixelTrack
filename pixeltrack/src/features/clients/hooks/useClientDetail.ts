import { useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClient } from './useClients'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { ROUTES } from '@/lib/constants'
import { TaskStatus, ProjectStatus, type Client, type Project, type Task } from '@/types'
import {
    CLIENT_STATUS_CONFIG,
    type ClientStatusDisplayConfig,
} from '@/features/clients/constants/clientDetail'

interface UseClientDetailResult {
    client: Client | null
    tasks: Task[]
    projects: Project[]
    isLoading: boolean
    isTasksLoading: boolean
    isProjectsLoading: boolean
    notFound: boolean
    overviewStats: {
        activeProjects: number
        totalProjects: number
        openTasks: number
    }
    taskStats: Record<TaskStatus, number> & { total: number }
    statusConfig: ClientStatusDisplayConfig | null
    handlers: {
        handleBack: () => void
        handleTaskSelect: (taskId: string) => void
        handleProjectSelect: (projectId: string) => void
    }
}

export function useClientDetail(clientId?: string): UseClientDetailResult {
    const navigate = useNavigate()
    const { data: client, isLoading: clientLoading } = useClient(clientId ?? null)
    const { data: tasks = [], isLoading: tasksLoading } = useTasksByClient(clientId ?? null)
    const { data: projects = [], isLoading: projectsLoading } = useProjects(clientId ? { clientId } : undefined)

    const taskStats = useMemo(() => {
        const stats = {
            total: tasks.length,
            [TaskStatus.NOT_STARTED]: 0,
            [TaskStatus.IN_PROGRESS]: 0,
            [TaskStatus.IN_REVIEW]: 0,
            [TaskStatus.COMPLETE]: 0,
            [TaskStatus.BLOCKED]: 0,
        } as Record<TaskStatus, number> & { total: number }

        tasks.forEach((task) => {
            stats[task.status] += 1
        })

        return stats
    }, [tasks])

    const overviewStats = useMemo(
        () => ({
            activeProjects: projects.filter((project) => project.status === ProjectStatus.ACTIVE).length,
            totalProjects: projects.length,
            openTasks: taskStats.total - taskStats[TaskStatus.COMPLETE],
        }),
        [projects, taskStats],
    )

    const handleBack = useCallback(() => {
        navigate(ROUTES.ADMIN_CLIENTS)
    }, [navigate])

    const handleTaskSelect = useCallback(
        (taskId: string) => {
            navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
        },
        [navigate],
    )

    const handleProjectSelect = useCallback(
        (projectId: string) => {
            navigate(ROUTES.ADMIN_PROJECT_DETAIL.replace(':projectId', projectId))
        },
        [navigate],
    )

    const statusConfig = client ? CLIENT_STATUS_CONFIG[client.status] : null

    const isLoading = clientLoading || tasksLoading || projectsLoading
    const notFound = !isLoading && !client

    return {
        client: client ?? null,
        tasks,
        projects,
        isLoading,
        isTasksLoading: tasksLoading,
        isProjectsLoading: projectsLoading,
        notFound,
        overviewStats,
        taskStats,
        statusConfig,
        handlers: {
            handleBack,
            handleTaskSelect,
            handleProjectSelect,
        },
    }
}
