/**
 * TanStack Query Hooks for Task Management
 *
 * @module features/tasks/hooks/useTasks
 * @description React hooks for task CRUD operations using TanStack Query.
 * Provides caching, optimistic updates, and automatic cache invalidation.
 *
 * @example
 * ```typescript
 * // Fetch all tasks
 * const { data: tasks, isLoading } = useTasks()
 *
 * // Create new task
 * const { mutateAsync: createTask } = useCreateTask()
 * const newTask = await create(taskData)
 *
 * // Update task
 * const { mutateAsync: updateTask } = useUpdateTask()
 * await update({ id: 'task-123', status: TaskStatus.COMPLETE })
 * ```
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getTasksByAssignee,
    getTasksByClient,
} from '@/lib/supabase/tasks'
import type { TaskFilters, TaskStatus } from '@/types'

const TASKS_QUERY_KEY = 'tasks'

/**
 * Hook to fetch all tasks with optional filtering.
 * Cached for 5 minutes (staleTime).
 *
 * @param filters - Optional filters for status, priority, client, assignee, dates, or search
 * @returns Query result with tasks array, loading state, and error
 *
 * @example
 * ```ts
 * const { data: tasks, isLoading } = useTasks()
 * const { data: filtered } = useTasks({ status: TaskStatus.IN_PROGRESS })
 * ```
 */
export function useTasks(filters?: TaskFilters) {
    return useQuery({
        queryKey: [TASKS_QUERY_KEY, filters],
        queryFn: () => getTasks(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to fetch a single task by ID.
 *
 * @param taskId - The task ID to fetch, or null to skip
 * @returns Query result with task data or null if not found
 *
 * @example
 * ```ts
 * const { data: task } = useTask('task-123')
 * ```
 */
export function useTask(taskId: string | null) {
    return useQuery({
        queryKey: [TASKS_QUERY_KEY, taskId],
        queryFn: () => (taskId ? getTask(taskId) : null),
        enabled: !!taskId,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook to fetch tasks assigned to a specific employee.
 *
 * @param assigneeId - The employee UID to filter by
 * @returns Query result with filtered tasks
 *
 * @example
 * ```ts
 * const { data: myTasks } = useTasksByAssignee('user-123')
 * ```
 */
export function useTasksByAssignee(assigneeId: string | null) {
    return useQuery({
        queryKey: [TASKS_QUERY_KEY, 'assignee', assigneeId],
        queryFn: () => (assigneeId ? getTasksByAssignee(assigneeId) : []),
        enabled: !!assigneeId,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook to fetch tasks for a specific client.
 *
 * @param clientId - The client ID to filter by
 * @returns Query result with filtered tasks
 *
 * @example
 * ```ts
 * const { data: clientTasks } = useTasksByClient('client-123')
 * ```
 */
export function useTasksByClient(clientId: string | null) {
    return useQuery({
        queryKey: [TASKS_QUERY_KEY, 'client', clientId],
        queryFn: () => (clientId ? getTasksByClient(clientId) : []),
        enabled: !!clientId,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook to create a new task.
 * Invalidates tasks cache on success.
 *
 * @returns Mutation result with create function
 *
 * @example
 * ```ts
 * const { mutateAsync: create } = useCreateTask()
 * const newTask = await create({
 *   title: 'Design Homepage',
 *   description: 'Create hero section',
 *   status: TaskStatus.NOT_STARTED,
 *   priority: TaskPriority.HIGH,
 *   dueDate: '2024-03-15',
 *   clientId: 'client-123',
 *   assignees: ['user-456'],
 * })
 * ```
 */
export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
            toast.success('Task created successfully')
        },
        onError: (error) => {
            toast.error(`Failed to create task: ${error.message}`)
        },
    })
}

/**
 * Hook to update an existing task.
 * Invalidates tasks cache on success.
 *
 * @returns Mutation result with update function
 *
 * @example
 * ```ts
 * const { mutateAsync: update } = useUpdateTask()
 * await update({
 *   id: 'task-123',
 *   status: TaskStatus.IN_PROGRESS,
 * })
 * ```
 */
export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateTask,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
            queryClient.invalidateQueries({
                queryKey: [TASKS_QUERY_KEY, variables.id],
            })
            toast.success('Task updated successfully')
        },
        onError: (error) => {
            toast.error(`Failed to update task: ${error.message}`)
        },
    })
}

/**
 * Hook to delete a task.
 * Invalidates tasks cache on success.
 *
 * @returns Mutation result with delete function
 *
 * @example
 * ```ts
 * const { mutateAsync: remove } = useDeleteTask()
 * await remove('task-123')
 * ```
 */
export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
            toast.success('Task deleted successfully')
        },
        onError: (error) => {
            toast.error(`Failed to delete task: ${error.message}`)
        },
    })
}

/**
 * Hook to quickly update only the task status.
 * Useful for Kanban board drag-and-drop or quick status toggles.
 * Invalidates tasks cache on success.
 *
 * @returns Mutation result with status update function
 *
 * @example
 * ```ts
 * const { mutateAsync: updateStatus } = useUpdateTaskStatus()
 * await updateStatus({ taskId: 'task-123', status: TaskStatus.COMPLETE })
 * ```
 */
export function useUpdateTaskStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
            updateTaskStatus(taskId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] })
            queryClient.invalidateQueries({
                queryKey: [TASKS_QUERY_KEY, variables.taskId],
            })
        },
        onError: (error) => {
            toast.error(`Failed to update status: ${error.message}`)
        },
    })
}
