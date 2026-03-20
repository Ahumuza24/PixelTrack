import { useMemo } from 'react'
import { MoreHorizontal } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import type { Task, TaskStatus, Client, UserProfile } from '@/types'
import { TaskStatus as TaskStatusConst, getTaskProgress } from '@/types'
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '@/features/tasks/constants/taskManagement'

interface TaskListViewProps {
    tasks: Task[]
    clients: Client[]
    employees: UserProfile[]
    selectedTasks: Set<string>
    allSelected: boolean
    onToggleTask: (taskId: string) => void
    onToggleAll: () => void
    onStatusChange: (taskId: string, status: TaskStatus) => void
    onViewTask: (taskId: string) => void
    onEditTask: (task: Task) => void
    onDeleteTask: (task: Task) => void
    isStatusUpdating: boolean
}

export function TaskListView({
    tasks,
    clients,
    employees,
    selectedTasks,
    allSelected,
    onToggleTask,
    onToggleAll,
    onStatusChange,
    onViewTask,
    onEditTask,
    onDeleteTask,
    isStatusUpdating,
}: TaskListViewProps) {
    const clientMap = useMemo(() => {
        const map = new Map<string, Client>()
        clients.forEach((client) => map.set(client.id, client))
        return map
    }, [clients])

    const employeeMap = useMemo(() => {
        const map = new Map<string, UserProfile>()
        employees.forEach((employee) => map.set(employee.uid, employee))
        return map
    }, [employees])

    if (tasks.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    No tasks match your current filters.
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted/60 border-b border-border/70">
                    <tr>
                        <th className="px-4 py-3 w-12">
                            <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Select all tasks" />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assignees</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Due Date</th>
                        <th className="px-4 py-3 w-12" />
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((task) => {
                        const statusMeta = TASK_STATUS_CONFIG[task.status]
                        const priorityMeta = TASK_PRIORITY_CONFIG[task.priority]
                        const client = clientMap.get(task.clientId)
                        const assigneeNames = task.assignees
                            .map((id) => employeeMap.get(id)?.displayName)
                            .filter(Boolean)
                        const isSelected = selectedTasks.has(task.id)
                        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatusConst.COMPLETE

                        return (
                            <tr key={task.id} className="border-b border-border/70 hover:bg-muted/40">
                                <td className="px-4 py-3">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => onToggleTask(task.id)}
                                        aria-label={`Select task ${task.title}`}
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-start gap-3">
                                        <div>
                                            <p className="font-medium text-foreground">{task.title}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Select
                                        value={task.status}
                                        onValueChange={(value) => onStatusChange(task.id, value as TaskStatus)}
                                        disabled={isStatusUpdating}
                                    >
                                        <SelectTrigger className={`h-8 w-32 text-xs ${statusMeta.bgClass} ${statusMeta.textClass} border-0`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TaskStatusConst).map((status) => (
                                                <SelectItem key={status} value={status} className="text-xs">
                                                    {TASK_STATUS_CONFIG[status].label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${getTaskProgress(task.status)}%` }}
                                        />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-sm font-medium ${priorityMeta.colorClass}`}>{priorityMeta.label}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-muted-foreground">{client?.name ?? 'Unknown'}</span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="text-sm text-muted-foreground">
                                        {assigneeNames.length > 0 ? assigneeNames.join(', ') : 'Unassigned'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-sm ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted/60">
                                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewTask(task.id)}>View</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEditTask(task)}>Edit</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDeleteTask(task)} className="text-red-600">
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
