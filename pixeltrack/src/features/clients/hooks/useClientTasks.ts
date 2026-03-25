import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useClient } from '@/features/clients/hooks/useClients'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import { useProjectsByClient } from '@/features/projects/hooks/useProjects'
import { ROUTES } from '@/lib/constants'
import { TaskStatus, type Task } from '@/types'

interface ClientTasksStats {
    total: number
    inProgress: number
    inReview: number
    complete: number
    overdue: number
}

interface TaskWithProject extends Task {
    projectName?: string
    isStandalone: boolean
}

interface UseClientTasksResult {
    clientName: string
    tasks: TaskWithProject[]
    standaloneTasks: TaskWithProject[]
    projectTasks: TaskWithProject[]
    stats: ClientTasksStats
    isLoading: boolean
    notFound: boolean
    handlers: {
        handleViewTask: (taskId: string) => void
    }
}

export function useClientTasks(): UseClientTasksResult {
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const navigate = useNavigate()
    const { data: client, isLoading: clientLoading } = useClient(clientId)
    const { data: tasks = [], isLoading: tasksLoading } = useTasksByClient(clientId)
    const { data: projects = [] } = useProjectsByClient(clientId)

    const tasksWithProject = useMemo<TaskWithProject[]>(() => {
        const projectMap = new Map(projects.map((p) => [p.id, p.name]))
        return tasks.map((task) => ({
            ...task,
            projectName: task.projectId ? projectMap.get(task.projectId) : undefined,
            isStandalone: !task.projectId,
        }))
    }, [tasks, projects])

    const standaloneTasks = useMemo(() => {
        return tasksWithProject.filter((t) => t.isStandalone)
    }, [tasksWithProject])

    const projectTasks = useMemo(() => {
        return tasksWithProject.filter((t) => !t.isStandalone)
    }, [tasksWithProject])

    const stats = useMemo<ClientTasksStats>(() => {
        const now = new Date().toISOString()
        return tasks.reduce(
            (acc, task) => {
                acc.total += 1
                if (task.status === TaskStatus.IN_PROGRESS) acc.inProgress += 1
                if (task.status === TaskStatus.IN_REVIEW) acc.inReview += 1
                if (task.status === TaskStatus.COMPLETE) acc.complete += 1
                if (task.dueDate < now && task.status !== TaskStatus.COMPLETE) acc.overdue += 1
                return acc
            },
            { total: 0, inProgress: 0, inReview: 0, complete: 0, overdue: 0 },
        )
    }, [tasks])

    const handleViewTask = (taskId: string) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
    }

    const isLoading = clientLoading || tasksLoading
    const notFound = !!clientId && !client && !isLoading

    return {
        clientName: client?.name ?? 'Client Portal',
        tasks: tasksWithProject,
        standaloneTasks,
        projectTasks,
        stats,
        isLoading,
        notFound,
        handlers: {
            handleViewTask,
        },
    }
}
