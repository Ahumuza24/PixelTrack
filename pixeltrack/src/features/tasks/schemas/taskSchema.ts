/**
 * Task Form Validation Schema
 *
 * @module features/tasks/schemas/taskSchema
 * @description Zod schema for task form validation with React Hook Form.
 * Includes validation rules for all task fields including title, description,
 * status, priority, due date, client assignment, and employee assignees.
 *
 * @example
 * ```typescript
 * const form = useForm<TaskFormValues>({
 *   resolver: zodResolver(taskSchema),
 *   defaultValues: defaultTaskValues,
 * })
 * ```
 */

import { z } from 'zod'
import { TaskStatus, TaskPriority } from '@/types'

/**
 * Zod schema for task form validation
 */
export const taskSchema = z.object({
    title: z
        .string()
        .min(2, 'Title must be at least 2 characters')
        .max(200, 'Title must be 200 characters or less')
        .trim(),

    description: z
        .string()
        .max(5000, 'Description must be 5000 characters or less')
        .trim(),

    status: z.nativeEnum(TaskStatus),

    priority: z.nativeEnum(TaskPriority),

    dueDate: z
        .string()
        .min(1, 'Due date is required')
        .refine((date) => {
            const parsed = new Date(date)
            return !isNaN(parsed.getTime())
        }, { message: 'Please enter a valid date' }),

    clientId: z
        .string()
        .min(1, 'Client is required'),

    projectId: z.string().optional().or(z.literal('')),

    assignees: z
        .array(z.string())
        .min(1, 'At least one assignee is required'),
})

/**
 * Type inferred from the task schema
 * Used with React Hook Form
 */
export type TaskFormValues = z.infer<typeof taskSchema>

/**
 * Default values for the task form
 * Used when creating a new task or resetting the form
 */
export const defaultTaskValues: TaskFormValues = {
    title: '',
    description: '',
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.MEDIUM,
    dueDate: '',
    clientId: '',
    projectId: '',
    assignees: [],
}

/**
 * Helper function to convert a Task to TaskFormValues
 * Useful when editing an existing task
 */
export function taskToFormValues(task: {
    title: string
    description: string
    status: TaskStatus
    priority: TaskPriority
    dueDate: string
    clientId: string
    projectId?: string
    assignees: string[]
}): TaskFormValues {
    return {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        clientId: task.clientId,
        projectId: task.projectId ?? '',
        assignees: task.assignees || [],
    }
}
