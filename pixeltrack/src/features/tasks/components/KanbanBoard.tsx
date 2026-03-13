/**
 * KanbanBoard Component
 *
 * @module features/tasks/components/KanbanBoard
 * @description Kanban board view for tasks with drag-and-drop columns
 * representing task statuses: Not Started, In Progress, In Review, Complete, Blocked.
 *
 * @example
 * ```tsx
 * <KanbanBoard
 *   tasks={tasks}
 *   clients={clients}
 *   employees={employees}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onStatusChange={handleStatusChange}
 * />
 * ```
 */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    MoreHorizontal,
    Calendar,
    Flag,
    Users,
    Building2,
    Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Task, TaskStatus, TaskPriority, Client, UserProfile } from '@/types'
import { TaskStatus as TaskStatusConst, TaskPriority as TaskPriorityConst } from '@/types'

interface KanbanBoardProps {
    tasks: Task[]
    clients?: Client[]
    employees?: UserProfile[]
    isLoading?: boolean
    error?: Error | null
    onEdit: (task: Task) => void
    onDelete: (task: Task) => void
    onStatusChange: (taskId: string, status: TaskStatus) => void
    onAdd: () => void
}

interface ColumnConfig {
    id: TaskStatus
    title: string
    color: string
    bgColor: string
}

const columns: ColumnConfig[] = [
    {
        id: TaskStatusConst.NOT_STARTED,
        title: 'Not Started',
        color: 'border-slate-300',
        bgColor: 'bg-slate-50',
    },
    {
        id: TaskStatusConst.IN_PROGRESS,
        title: 'In Progress',
        color: 'border-blue-400',
        bgColor: 'bg-blue-50',
    },
    {
        id: TaskStatusConst.IN_REVIEW,
        title: 'In Review',
        color: 'border-yellow-400',
        bgColor: 'bg-yellow-50',
    },
    {
        id: TaskStatusConst.COMPLETE,
        title: 'Complete',
        color: 'border-green-400',
        bgColor: 'bg-green-50',
    },
    {
        id: TaskStatusConst.BLOCKED,
        title: 'Blocked',
        color: 'border-red-400',
        bgColor: 'bg-red-50',
    },
]

const priorityColors: Record<TaskPriority, string> = {
    [TaskPriorityConst.LOW]: 'bg-slate-100 text-slate-700',
    [TaskPriorityConst.MEDIUM]: 'bg-blue-100 text-blue-700',
    [TaskPriorityConst.HIGH]: 'bg-orange-100 text-orange-700',
    [TaskPriorityConst.URGENT]: 'bg-red-100 text-red-700',
}

const priorityLabels: Record<TaskPriority, string> = {
    [TaskPriorityConst.LOW]: 'Low',
    [TaskPriorityConst.MEDIUM]: 'Medium',
    [TaskPriorityConst.HIGH]: 'High',
    [TaskPriorityConst.URGENT]: 'Urgent',
}

export function KanbanBoard({
    tasks,
    clients = [],
    employees = [],
    isLoading = false,
    error = null,
    onEdit,
    onDelete,
    onStatusChange,
    onAdd,
}: KanbanBoardProps) {
    const navigate = useNavigate()

    // Build lookup maps
    const clientMap = useMemo(() => {
        const map = new Map<string, Client>()
        clients.forEach((c) => map.set(c.id, c))
        return map
    }, [clients])

    const employeeMap = useMemo(() => {
        const map = new Map<string, UserProfile>()
        employees.forEach((e) => map.set(e.uid, e))
        return map
    }, [employees])

    // Group tasks by status
    const tasksByColumn = useMemo(() => {
        const grouped: Record<TaskStatus, Task[]> = {
            [TaskStatusConst.NOT_STARTED]: [],
            [TaskStatusConst.IN_PROGRESS]: [],
            [TaskStatusConst.IN_REVIEW]: [],
            [TaskStatusConst.COMPLETE]: [],
            [TaskStatusConst.BLOCKED]: [],
        }
        tasks.forEach((task) => {
            if (grouped[task.status]) {
                grouped[task.status].push(task)
            }
        })
        return grouped
    }, [tasks])

    // Loading state
    if (isLoading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.map((column) => (
                    <div key={column.id} className="w-80 flex-shrink-0">
                        <div className={`h-12 ${column.bgColor} rounded-t-lg border-t-4 ${column.color} animate-pulse`} />
                        <div className="bg-slate-100 rounded-b-lg p-4 space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load tasks</h3>
                <p className="text-slate-500">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => {
                const columnTasks = tasksByColumn[column.id]

                return (
                    <div key={column.id} className="w-80 flex-shrink-0">
                        {/* Column Header */}
                        <div
                            className={`h-12 ${column.bgColor} rounded-t-lg border-t-4 ${column.color} px-4 flex items-center justify-between`}
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900">{column.title}</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {columnTasks.length}
                                </Badge>
                            </div>
                            {column.id === TaskStatusConst.NOT_STARTED && (
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onAdd}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        {/* Column Content */}
                        <div className="bg-slate-100 rounded-b-lg p-3 space-y-3 min-h-96">
                            {columnTasks.map((task) => {
                                const client = clientMap.get(task.clientId)
                                const assigneeNames = task.assignees
                                    .map((id) => employeeMap.get(id)?.displayName)
                                    .filter(Boolean)

                                return (
                                    <div
                                        key={task.id}
                                        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                    >
                                        {/* Task Header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium text-slate-900 line-clamp-2 flex-1">
                                                {task.title}
                                            </h4>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onEdit(task)
                                                        }}
                                                    >
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {columns.map((col) => (
                                                        <DropdownMenuItem
                                                            key={col.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onStatusChange(task.id, col.id)
                                                            }}
                                                            disabled={task.status === col.id}
                                                        >
                                                            Move to {col.title}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onDelete(task)
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Priority Badge */}
                                        <Badge className={`text-xs mb-2 ${priorityColors[task.priority]}`}>
                                            <Flag className="w-3 h-3 mr-1" />
                                            {priorityLabels[task.priority]}
                                        </Badge>

                                        {/* Task Details */}
                                        <div className="space-y-1 text-sm text-slate-500">
                                            {client && (
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    <span className="truncate">{client.name}</span>
                                                </div>
                                            )}
                                            {assigneeNames.length > 0 && (
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="truncate">
                                                        {assigneeNames.slice(0, 2).join(', ')}
                                                        {assigneeNames.length > 2 && '...'}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {columnTasks.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
