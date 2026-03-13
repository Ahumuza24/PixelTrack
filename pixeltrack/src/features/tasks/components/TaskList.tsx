/**
 * TaskList Component
 *
 * @module features/tasks/components/TaskList
 * @description Data table component for displaying tasks with search, filtering,
 * and action dropdowns. Supports loading and error states.
 *
 * @example
 * ```tsx
 * <TaskList
 *   tasks={tasks}
 *   clients={clients}
 *   employees={employees}
 *   isLoading={false}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onAdd={handleAdd}
 * />
 * ```
 */

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    Plus,
    MoreHorizontal,
    Calendar,
    Flag,
    Users,
    Building2,
    CheckSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import type { Task, TaskStatus, TaskPriority, Client, UserProfile } from '@/types'
import { TaskStatus as TaskStatusConst, TaskPriority as TaskPriorityConst } from '@/types'

interface TaskListProps {
    tasks: Task[]
    clients?: Client[]
    employees?: UserProfile[]
    isLoading?: boolean
    error?: Error | null
    onEdit: (task: Task) => void
    onDelete: (task: Task) => void
    onAdd: () => void
}

const statusLabels: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'Not Started',
    [TaskStatusConst.IN_PROGRESS]: 'In Progress',
    [TaskStatusConst.IN_REVIEW]: 'In Review',
    [TaskStatusConst.COMPLETE]: 'Complete',
    [TaskStatusConst.BLOCKED]: 'Blocked',
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    [TaskStatusConst.IN_PROGRESS]: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    [TaskStatusConst.IN_REVIEW]: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    [TaskStatusConst.COMPLETE]: 'bg-green-100 text-green-700 hover:bg-green-200',
    [TaskStatusConst.BLOCKED]: 'bg-red-100 text-red-700 hover:bg-red-200',
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

export function TaskList({
    tasks,
    clients = [],
    employees = [],
    isLoading = false,
    error = null,
    onEdit,
    onDelete,
    onAdd,
}: TaskListProps) {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
    const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')

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

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            // Status filter
            if (statusFilter !== 'all' && task.status !== statusFilter) {
                return false
            }

            // Priority filter
            if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
                return false
            }

            return true
        })
    }, [tasks, searchQuery, statusFilter, priorityFilter])

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
                    <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="border rounded-lg">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-100 animate-pulse border-b last:border-0" />
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Failed to load tasks</h3>
                <p className="text-slate-500 mb-4">{error.message}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with search and filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                        <option value="all">All Status</option>
                        {Object.values(TaskStatusConst).map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status]}
                            </option>
                        ))}
                    </select>
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                        <option value="all">All Priority</option>
                        {Object.values(TaskPriorityConst).map((priority) => (
                            <option key={priority} value={priority}>
                                {priorityLabels[priority]}
                            </option>
                        ))}
                    </select>
                </div>
                <Button onClick={onAdd} className="bg-cobalt hover:bg-cobalt-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-slate-500">
                <span>Total: {filteredTasks.length}</span>
                {statusFilter !== 'all' && (
                    <Badge variant="secondary">{statusLabels[statusFilter]}</Badge>
                )}
                {priorityFilter !== 'all' && (
                    <Badge variant="secondary">{priorityLabels[priorityFilter]}</Badge>
                )}
            </div>

            {/* Table */}
            {filteredTasks.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-slate-50">
                    <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
                    <p className="text-slate-500 mb-4">
                        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Get started by adding your first task'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && priorityFilter === 'all' && (
                        <Button onClick={onAdd} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                        </Button>
                    )}
                </div>
            ) : (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Task</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Assignees</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="w-10" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.map((task) => {
                                const client = clientMap.get(task.clientId)
                                const assigneeNames = task.assignees
                                    .map((id) => employeeMap.get(id)?.displayName)
                                    .filter(Boolean)
                                    .slice(0, 2)

                                return (
                                    <TableRow
                                        key={task.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                    >
                                        <TableCell>
                                            <div className="font-medium">{task.title}</div>
                                            <div className="text-sm text-slate-500 line-clamp-1">
                                                {task.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[task.status]}>
                                                {statusLabels[task.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={priorityColors[task.priority]}>
                                                <Flag className="w-3 h-3 mr-1" />
                                                {priorityLabels[task.priority]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {client && (
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm">{client.name}</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {assigneeNames.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm">
                                                        {assigneeNames.join(', ')}
                                                        {task.assignees.length > 2 &&
                                                            ` +${task.assignees.length - 2}`}
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
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
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
