import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useTasksByAssignee } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients'
import { TaskStatus, type Task } from '@/types'
import { ROUTES } from '@/lib/constants'

export interface EmployeeDashboardTask extends Task {
    clientName?: string
    isOverdue: boolean
}

export interface EmployeeDashboardStats {
    total: number
    inProgress: number
    inReview: number
    overdue: number
}

interface UseEmployeeDashboardResult {
    userName: string
    tasks: EmployeeDashboardTask[]
    stats: EmployeeDashboardStats
    isLoading: boolean
    handlers: {
        handleViewTask: (taskId: string) => void
    }
}

export function useEmployeeDashboard(): UseEmployeeDashboardResult {
    const { user } = useAuth()
    const navigate = useNavigate()
    const assigneeId = user?.uid ?? null

    const { data: tasks = [], isLoading: tasksLoading } = useTasksByAssignee(assigneeId)
    const { data: clients = [], isLoading: clientsLoading } = useClients()

    const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients])

    const enrichedTasks = useMemo<EmployeeDashboardTask[]>(() => {
        return tasks.map((task) => {
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETE
            return {
                ...task,
                clientName: clientMap.get(task.clientId),
                isOverdue,
            }
        })
    }, [tasks, clientMap])

    const stats = useMemo<EmployeeDashboardStats>(() => {
        return enrichedTasks.reduce(
            (acc, task) => {
                acc.total += 1
                if (task.status === TaskStatus.IN_PROGRESS) acc.inProgress += 1
                if (task.status === TaskStatus.IN_REVIEW) acc.inReview += 1
                if (task.isOverdue) acc.overdue += 1
                return acc
            },
            { total: 0, inProgress: 0, inReview: 0, overdue: 0 },
        )
    }, [enrichedTasks])

    const handleViewTask = (taskId: string) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
    }

    return {
        userName: user?.displayName ?? 'Employee',
        tasks: enrichedTasks,
        stats,
        isLoading: tasksLoading || clientsLoading,
        handlers: {
            handleViewTask,
        },
    }
}
