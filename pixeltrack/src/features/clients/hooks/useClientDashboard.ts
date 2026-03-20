import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useClient } from './useClients'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import { TaskStatus, type Task } from '@/types'
import { ROUTES } from '@/lib/constants'

interface ClientDashboardStats {
    total: number
    inProgress: number
    inReview: number
    complete: number
}

interface UseClientDashboardResult {
    clientName: string
    userName: string
    tasks: Task[]
    stats: ClientDashboardStats
    isLoading: boolean
    notFound: boolean
    handlers: {
        handleViewTask: (taskId: string) => void
    }
}

export function useClientDashboard(): UseClientDashboardResult {
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const navigate = useNavigate()
    const { data: client, isLoading: clientLoading } = useClient(clientId)
    const { data: tasks = [], isLoading: tasksLoading } = useTasksByClient(clientId)

    const stats = useMemo<ClientDashboardStats>(() => {
        return tasks.reduce(
            (acc, task) => {
                acc.total += 1
                if (task.status === TaskStatus.IN_PROGRESS) acc.inProgress += 1
                if (task.status === TaskStatus.IN_REVIEW) acc.inReview += 1
                if (task.status === TaskStatus.COMPLETE) acc.complete += 1
                return acc
            },
            { total: 0, inProgress: 0, inReview: 0, complete: 0 },
        )
    }, [tasks])

    const handleViewTask = (taskId: string) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
    }

    const isLoading = clientLoading || tasksLoading
    const notFound = !!clientId && !client && !isLoading

    return {
        clientName: client?.name ?? 'Client Portal',
        userName: user?.displayName ?? 'Client',
        tasks,
        stats,
        isLoading,
        notFound,
        handlers: {
            handleViewTask,
        },
    }
}
