/**
 * TaskForm Component
 *
 * @module features/tasks/components/TaskForm
 * @description React Hook Form component for creating and editing tasks.
 * Includes fields for title, description, status, priority, due date,
 * client assignment, and employee assignees.
 *
 * @example
 * ```tsx
 * <TaskForm
 *   task={existingTask}
 *   clients={clients}
 *   employees={employees}
 *   onSubmit={handleSubmit}
 *   onCancel={() => setIsOpen(false)}
 *   isSubmitting={false}
 * />
 * ```
 */

import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, CheckSquare, Flag, Users, Building2, AlignLeft, Type, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { taskSchema, defaultTaskValues, taskToFormValues, type TaskFormValues } from '../schemas/taskSchema'
import type { Task, TaskStatus, TaskPriority, Client, UserProfile, Project } from '@/types'
import { TaskStatus as TaskStatusConst, TaskPriority as TaskPriorityConst } from '@/types'

interface TaskFormProps {
    /** Existing task data when editing, undefined when creating */
    task?: Task

    /** Available clients for selection */
    clients: Client[]

    /** Available projects for optional association */
    projects: Project[]

    /** Available employees for assignment */
    employees: UserProfile[]

    /** Form submission handler */
    onSubmit: (data: TaskFormValues) => void

    /** Cancel handler */
    onCancel: () => void

    /** Whether the form is currently submitting */
    isSubmitting?: boolean
}

const statusLabels: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'Not Started',
    [TaskStatusConst.IN_PROGRESS]: 'In Progress',
    [TaskStatusConst.IN_REVIEW]: 'In Review',
    [TaskStatusConst.COMPLETE]: 'Complete',
    [TaskStatusConst.BLOCKED]: 'Blocked',
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'bg-slate-100 text-slate-700 border-slate-200',
    [TaskStatusConst.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
    [TaskStatusConst.IN_REVIEW]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [TaskStatusConst.COMPLETE]: 'bg-green-100 text-green-700 border-green-200',
    [TaskStatusConst.BLOCKED]: 'bg-red-100 text-red-700 border-red-200',
}

const priorityLabels: Record<TaskPriority, string> = {
    [TaskPriorityConst.LOW]: 'Low',
    [TaskPriorityConst.MEDIUM]: 'Medium',
    [TaskPriorityConst.HIGH]: 'High',
    [TaskPriorityConst.URGENT]: 'Urgent',
}

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriorityConst.LOW]: 'bg-slate-100 text-slate-700',
    [TaskPriorityConst.MEDIUM]: 'bg-blue-100 text-blue-700',
    [TaskPriorityConst.HIGH]: 'bg-orange-100 text-orange-700',
    [TaskPriorityConst.URGENT]: 'bg-red-100 text-red-700',
}

export function TaskForm({
    task,
    clients,
    projects,
    employees,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: TaskFormProps) {
    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: task ? taskToFormValues(task) : defaultTaskValues,
    })

    const clientLookup = useMemo(() => {
        const map = new Map<string, Client>()
        clients.forEach((client) => map.set(client.id, client))
        return map
    }, [clients])

    const selectedProjectId = useWatch({ control: form.control, name: 'projectId' }) ?? ''
    const assigneeSelection = useWatch({ control: form.control, name: 'assignees' }) ?? []

    useEffect(() => {
        if (selectedProjectId) {
            const match = projects.find((project) => project.id === selectedProjectId)
            if (match && form.getValues('clientId') !== match.clientId) {
                form.setValue('clientId', match.clientId, { shouldValidate: true })
            }
        }
    }, [selectedProjectId, projects, form])

    const handleSubmit = form.handleSubmit(onSubmit)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Task Title
                </Label>
                <Input
                    id="title"
                    placeholder="Enter task title..."
                    {...form.register('title')}
                    className={form.formState.errors.title ? 'border-red-500' : ''}
                />
                {form.formState.errors.title && (
                    <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                    <AlignLeft className="w-4 h-4" />
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="Describe the task requirements..."
                    rows={4}
                    {...form.register('description')}
                    className={form.formState.errors.description ? 'border-red-500' : ''}
                />
                {form.formState.errors.description && (
                    <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status" className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Status
                    </Label>
                    <Select
                        value={form.watch('status')}
                        onValueChange={(value) => form.setValue('status', value as TaskStatus)}
                    >
                        <SelectTrigger id="status" className={form.formState.errors.status ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TaskStatusConst).map((status) => (
                                <SelectItem key={status} value={status}>
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`} />
                                        {statusLabels[status]}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.status && (
                        <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                    )}
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <Label htmlFor="priority" className="flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        Priority
                    </Label>
                    <Select
                        value={form.watch('priority')}
                        onValueChange={(value) => form.setValue('priority', value as TaskPriority)}
                    >
                        <SelectTrigger id="priority" className={form.formState.errors.priority ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TaskPriorityConst).map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                    <span className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[priority]}`}>
                                            {priorityLabels[priority]}
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.formState.errors.priority && (
                        <p className="text-sm text-red-500">{form.formState.errors.priority.message}</p>
                    )}
                </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date
                </Label>
                <Input
                    id="dueDate"
                    type="date"
                    {...form.register('dueDate')}
                    className={form.formState.errors.dueDate ? 'border-red-500' : ''}
                />
                {form.formState.errors.dueDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
                )}
            </div>

            {/* Project Association */}
            <div className="space-y-2">
                <Label htmlFor="projectId" className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Project (optional)
                </Label>
                <Select
                    value={selectedProjectId ?? ''}
                    onValueChange={(value) => form.setValue('projectId', value)}
                >
                    <SelectTrigger id="projectId">
                        <SelectValue placeholder="Select a project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Standalone Task</SelectItem>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{project.title}</span>
                                    <span className="text-xs text-slate-500">
                                        {clientLookup.get(project.clientId)?.name || 'Unknown client'}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {selectedProjectId ? (
                    <p className="text-xs text-slate-500">
                        Client automatically set from the selected project.
                    </p>
                ) : (
                    <p className="text-xs text-slate-500">
                        Leave blank for standalone / one-off tasks.
                    </p>
                )}
            </div>

            {/* Client Assignment */}
            <div className="space-y-2">
                <Label htmlFor="clientId" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Client
                </Label>
                <Select
                    value={form.watch('clientId')}
                    onValueChange={(value) => form.setValue('clientId', value)}
                    disabled={Boolean(selectedProjectId)}
                >
                    <SelectTrigger id="clientId" className={form.formState.errors.clientId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                                {client.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.formState.errors.clientId && (
                    <p className="text-sm text-red-500">{form.formState.errors.clientId.message}</p>
                )}
            </div>

            {/* Assignees */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Assignees
                </Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                    {employees.length === 0 ? (
                        <p className="text-sm text-slate-500">No employees available</p>
                    ) : (
                        employees.map((employee) => {
                            const isSelected = assigneeSelection.includes(employee.uid)
                            return (
                                <label
                                    key={employee.uid}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            const current = form.getValues('assignees')
                                            if (e.target.checked) {
                                                form.setValue('assignees', [...current, employee.uid])
                                            } else {
                                                form.setValue(
                                                    'assignees',
                                                    current.filter((id) => id !== employee.uid)
                                                )
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-cobalt focus:ring-cobalt"
                                    />
                                    <span className="text-sm font-medium">{employee.displayName}</span>
                                    <span className="text-xs text-slate-500">{employee.email}</span>
                                </label>
                            )
                        })
                    )}
                </div>
                {form.formState.errors.assignees && (
                    <p className="text-sm text-red-500">{form.formState.errors.assignees.message}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-cobalt hover:bg-cobalt-600"
                >
                    {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    )
}
