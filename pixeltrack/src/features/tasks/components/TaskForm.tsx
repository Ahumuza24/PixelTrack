/**
 * TaskForm Component
 *
 * @module features/tasks/components/TaskForm
 * @description React Hook Form component for creating and editing tasks.
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
    task?: Task
    initialValues?: Partial<TaskFormValues>
    clients: Client[]
    projects: Project[]
    employees: UserProfile[]
    onSubmit: (data: TaskFormValues) => void
    onCancel: () => void
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
    initialValues,
    clients,
    projects,
    employees,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: TaskFormProps) {
    const baseValues = useMemo(() => {
        if (task) return taskToFormValues(task)
        return { ...defaultTaskValues, ...initialValues }
    }, [task, initialValues])

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: baseValues,
    })

    const clientLookup = useMemo(() => {
        const map = new Map<string, Client>()
        clients.forEach((client) => map.set(client.id, client))
        return map
    }, [clients])

    const selectedProjectId = useWatch({ control: form.control, name: 'projectId' }) ?? ''
    const assigneeSelection = useWatch({ control: form.control, name: 'assignees' }) ?? []
    const clientValue = useWatch({ control: form.control, name: 'clientId' }) ?? ''
    const statusValue = useWatch({ control: form.control, name: 'status' }) ?? TaskStatusConst.NOT_STARTED
    const priorityValue = useWatch({ control: form.control, name: 'priority' }) ?? TaskPriorityConst.MEDIUM

    useEffect(() => {
        if (selectedProjectId) {
            const match = projects.find((p) => p.id === selectedProjectId)
            if (match && form.getValues('clientId') !== match.clientId) {
                form.setValue('clientId', match.clientId, { shouldValidate: true })
            }
        }
    }, [selectedProjectId, projects, form])

    useEffect(() => {
        form.reset(baseValues)
    }, [form, baseValues])

    const handleSubmit = form.handleSubmit(onSubmit)

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Title */}
            <div className="space-y-1.5">
                <Label htmlFor="title" className="flex items-center gap-2 text-sm">
                    <Type className="w-4 h-4" />
                    Task Title
                </Label>
                <Input
                    id="title"
                    placeholder="Enter task title..."
                    {...form.register('title')}
                    className={`h-9 w-full ${form.formState.errors.title ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.title && (
                    <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="description" className="flex items-center gap-2 text-sm">
                    <AlignLeft className="w-4 h-4" />
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="Describe the task requirements..."
                    rows={2}
                    {...form.register('description')}
                    className={`w-full resize-none ${form.formState.errors.description ? 'border-red-500' : ''}`}
                />
                {form.formState.errors.description && (
                    <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                )}
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label htmlFor="status" className="flex items-center gap-2 text-sm">
                        <CheckSquare className="w-4 h-4" />
                        Status
                    </Label>
                    <Select
                        value={statusValue}
                        onValueChange={(value) => form.setValue('status', value as TaskStatus)}
                    >
                        <SelectTrigger id="status" className={`h-9 w-full text-sm ${form.formState.errors.status ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TaskStatusConst).map((status) => (
                                <SelectItem key={status} value={status} className="text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${statusColors[status].split(' ')[0]}`} />
                                        {statusLabels[status]}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="priority" className="flex items-center gap-2 text-sm">
                        <Flag className="w-4 h-4" />
                        Priority
                    </Label>
                    <Select
                        value={priorityValue}
                        onValueChange={(value) => form.setValue('priority', value as TaskPriority)}
                    >
                        <SelectTrigger id="priority" className={`h-9 w-full text-sm ${form.formState.errors.priority ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(TaskPriorityConst).map((priority) => (
                                <SelectItem key={priority} value={priority} className="text-sm">
                                    <span className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[priority]}`}>
                                            {priorityLabels[priority]}
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
                <Label htmlFor="dueDate" className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    Due Date
                </Label>
                <Input
                    id="dueDate"
                    type="date"
                    {...form.register('dueDate')}
                    className={`h-9 w-full ${form.formState.errors.dueDate ? 'border-red-500' : ''}`}
                />
            </div>

            {/* Project */}
            <div className="space-y-1.5">
                <Label htmlFor="projectId" className="flex items-center gap-2 text-sm">
                    <Folder className="w-4 h-4" />
                    Project (optional)
                </Label>
                <Select
                    value={selectedProjectId || 'none'}
                    onValueChange={(value) => form.setValue('projectId', value === 'none' ? '' : value)}
                >
                    <SelectTrigger id="projectId" className="h-9 w-full text-sm">
                        <SelectValue placeholder="Select a project (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none" className="text-sm">Standalone Task</SelectItem>
                        {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id} className="text-sm">
                                <div className="flex flex-col max-w-[260px]">
                                    <span className="font-medium truncate">{project.title}</span>
                                    <span className="text-xs text-slate-500 truncate">
                                        {clientLookup.get(project.clientId)?.name || 'Unknown client'}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Client */}
            <div className="space-y-1.5">
                <Label htmlFor="clientId" className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4" />
                    Client
                </Label>
                <Select
                    value={clientValue}
                    onValueChange={(value) => form.setValue('clientId', value)}
                    disabled={Boolean(selectedProjectId)}
                >
                    <SelectTrigger id="clientId" className={`h-9 w-full text-sm ${form.formState.errors.clientId ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id} className="text-sm">
                                {client.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Assignees */}
            <div className="space-y-1.5">
                <Label className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4" />
                    Assignees
                </Label>
                <div className="border rounded-md p-2 max-h-28 overflow-y-auto">
                    {employees.length === 0 ? (
                        <p className="text-sm text-slate-500 px-2 py-1">No employees available</p>
                    ) : (
                        employees.map((employee) => {
                            const isSelected = assigneeSelection.includes(employee.uid)
                            return (
                                <label
                                    key={employee.uid}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            const current = form.getValues('assignees')
                                            if (e.target.checked) {
                                                form.setValue('assignees', [...current, employee.uid])
                                            } else {
                                                form.setValue('assignees', current.filter((id) => id !== employee.uid))
                                            }
                                        }}
                                        className="w-4 h-4 rounded border-slate-300 text-cobalt focus:ring-cobalt shrink-0"
                                    />
                                    <div className="flex flex-col min-w-0 overflow-hidden">
                                        <span className="text-sm font-medium truncate">{employee.displayName || employee.email}</span>
                                    </div>
                                </label>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1 h-9 text-sm">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-9 text-sm bg-cobalt hover:bg-cobalt-600">
                    {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                </Button>
            </div>
        </form>
    )
}
