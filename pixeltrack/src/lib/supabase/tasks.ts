import { supabase } from './config'
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types'
import { TaskStatus } from '@/types'

/**
 * Creates a new task in the database.
 * @param data - Task data without id and timestamps
 * @returns The created Task with generated id and timestamps
 */
export async function createTask(data: CreateTaskInput): Promise<Task> {
    const { data: task, error } = await supabase
        .from('tasks')
        .insert({
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            due_date: data.dueDate,
            client_id: data.clientId,
            project_id: data.projectId,
            assignees: data.assignees,
            created_by: data.createdBy,
        })
        .select()
        .single()

    if (error) throw error
    if (!task) throw new Error('Failed to create task')

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        clientId: task.client_id,
        projectId: task.project_id,
        assignees: task.assignees || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        createdBy: task.created_by,
    }
}

/**
 * Fetches a single task by ID.
 * @param taskId - The task UUID
 * @returns The Task object or null if not found
 */
export async function getTask(taskId: string): Promise<Task | null> {
    const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }
    if (!task) return null

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        clientId: task.client_id,
        assignees: task.assignees || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        createdBy: task.created_by,
    }
}

/**
 * Updates an existing task.
 * @param data - Update data including the task id
 */
export async function updateTask(data: UpdateTaskInput): Promise<void> {
    const { id, ...updates } = data

    const updateData: Record<string, unknown> = {}
    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status) updateData.status = updates.status
    if (updates.priority) updateData.priority = updates.priority
    if (updates.dueDate) updateData.due_date = updates.dueDate
    if (updates.clientId) updateData.client_id = updates.clientId
    if (updates.projectId !== undefined) updateData.project_id = updates.projectId
    if (updates.assignees) updateData.assignees = updates.assignees

    const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)

    if (error) throw error
}

/**
 * Deletes a task from the database.
 * @param taskId - The task UUID to delete
 */
export async function deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

    if (error) throw error
}

/**
 * Fetches all tasks with optional filtering.
 * @param filters - Optional filters for status, priority, client, assignee, dates, or search
 * @returns Array of Task objects sorted by due date (ascending)
 */
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
    let query = supabase.from('tasks').select('*').order('due_date', { ascending: true })

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    if (filters?.priority) {
        query = query.eq('priority', filters.priority)
    }

    if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId)
    }

    if (filters?.assigneeId) {
        query = query.contains('assignees', [filters.assigneeId])
    }

    if (filters?.dueDateFrom) {
        query = query.gte('due_date', filters.dueDateFrom)
    }

    if (filters?.dueDateTo) {
        query = query.lte('due_date', filters.dueDateTo)
    }

    if (filters?.projectId) {
        query = query.eq('project_id', filters.projectId)
    }

    const { data: tasks, error } = await query

    if (error) throw error
    if (!tasks) return []

    let result = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.due_date,
        clientId: task.client_id,
        projectId: task.project_id,
        assignees: task.assignees || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        createdBy: task.created_by,
    }))

    if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase()
        result = result.filter(
            (task) =>
                task.title.toLowerCase().includes(search) ||
                (task.description && task.description.toLowerCase().includes(search)),
        )
    }

    return result
}

/**
 * Fetches tasks for a specific client.
 * @param clientId - The client ID to filter by
 * @returns Array of Task objects for the client
 */
export async function getTasksByClient(clientId: string): Promise<Task[]> {
    return getTasks({ clientId })
}

/**
 * Fetches tasks assigned to a specific employee.
 * @param assigneeId - The employee UID to filter by
 * @returns Array of Task objects assigned to the employee
 */
export async function getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return getTasks({ assigneeId })
}

/**
 * Updates only the task status.
 * @param taskId - The task ID
 * @param status - The new status value
 */
export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await updateTask({ id: taskId, status })
}
