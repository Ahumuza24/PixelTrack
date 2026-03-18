import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CheckSquare, Search, Bell, Plus,
    MoreHorizontal, Calendar, Flag, ChevronLeft, ChevronRight,
    LayoutGrid, List, Trash2, Edit2, Eye, CheckCircle, Clock, AlertCircle, Loader2
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUpdateTaskStatus } from '@/features/tasks/hooks/useTasks'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useClients } from '@/features/clients/hooks/useClients'
import { useUsers } from '@/features/users/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import type { Task } from '@/types'
import { TaskStatus, TaskPriority, UserRole, getTaskProgress } from '@/types'

type FilterTab = 'all' | 'my-tasks' | 'due-soon' | 'high-priority'
type ViewMode = 'list' | 'kanban'

const statusConfig: Record<TaskStatus, { label: string; bgClass: string; textClass: string; icon: typeof Clock }> = {
    [TaskStatus.NOT_STARTED]: { label: 'To Do', bgClass: 'bg-muted/70', textClass: 'text-muted-foreground', icon: Clock },
    [TaskStatus.IN_PROGRESS]: { label: 'In Progress', bgClass: 'bg-primary/10', textClass: 'text-primary', icon: Clock },
    [TaskStatus.IN_REVIEW]: { label: 'Review', bgClass: 'bg-accent/20', textClass: 'text-accent-foreground', icon: Eye },
    [TaskStatus.COMPLETE]: { label: 'Complete', bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-500', icon: CheckCircle },
    [TaskStatus.BLOCKED]: { label: 'Blocked', bgClass: 'bg-destructive/15', textClass: 'text-destructive', icon: AlertCircle },
}

const priorityConfig: Record<TaskPriority, { label: string; colorClass: string; icon: typeof Flag }> = {
    [TaskPriority.LOW]: { label: 'Low', colorClass: 'text-muted-foreground', icon: Flag },
    [TaskPriority.MEDIUM]: { label: 'Medium', colorClass: 'text-blue-500', icon: Flag },
    [TaskPriority.HIGH]: { label: 'High', colorClass: 'text-orange-500', icon: Flag },
    [TaskPriority.URGENT]: { label: 'Urgent', colorClass: 'text-destructive', icon: Flag },
}

export function TaskManagementPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: tasks, isLoading } = useTasks()
    const { data: projects } = useProjects()
    const { data: clients } = useClients()
    const { data: users } = useUsers()
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()
    const updateTaskStatus = useUpdateTaskStatus()

    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [activeTab, setActiveTab] = useState<FilterTab>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [deletingTask, setDeletingTask] = useState<Task | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const itemsPerPage = 10
    const employees = users?.filter((u) => u.role !== UserRole.CLIENT) || []

    const filteredTasks = useMemo(() => {
        let result = tasks || []

        if (activeTab === 'my-tasks') {
            result = result.filter((t) => t.assignees.includes(user?.uid || ''))
        } else if (activeTab === 'due-soon') {
            const threeDaysFromNow = new Date()
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
            result = result.filter((t) => new Date(t.dueDate) <= threeDaysFromNow && t.status !== TaskStatus.COMPLETE)
        } else if (activeTab === 'high-priority') {
            result = result.filter((t) => t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter((t) =>
                t.title.toLowerCase().includes(query) ||
                t.description?.toLowerCase().includes(query)
            )
        }

        return result
    }, [tasks, activeTab, searchQuery, user])

    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredTasks.slice(start, start + itemsPerPage)
    }, [filteredTasks, currentPage])

    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage)

    const handleAdd = () => {
        setEditingTask(null)
        setIsFormOpen(true)
    }

    const handleEdit = (task: Task) => {
        setEditingTask(task)
        setIsFormOpen(true)
    }

    const handleDelete = (task: Task) => {
        setDeletingTask(task)
    }

    const handleQuickStatusChange = async (taskId: string, newStatus: TaskStatus) => {
        await updateTaskStatus.mutateAsync({ taskId, status: newStatus })
    }

    const confirmDelete = async () => {
        if (deletingTask) {
            await deleteTask.mutateAsync(deletingTask.id)
            setDeletingTask(null)
        }
    }

    const handleSubmit = async (values: TaskFormValues) => {
        try {
            if (editingTask) {
                await updateTask.mutateAsync({ id: editingTask.id, ...values })
            } else {
                await createTask.mutateAsync(values)
            }
            setIsFormOpen(false)
            setEditingTask(null)
        } catch (error) {
            console.error('Submit error:', error)
        }
    }

    const toggleTaskSelection = (taskId: string) => {
        const newSelected = new Set(selectedTasks)
        if (newSelected.has(taskId)) {
            newSelected.delete(taskId)
        } else {
            newSelected.add(taskId)
        }
        setSelectedTasks(newSelected)
    }

    const selectAllTasks = () => {
        if (selectedTasks.size === paginatedTasks.length) {
            setSelectedTasks(new Set())
        } else {
            setSelectedTasks(new Set(paginatedTasks.map((t) => t.id)))
        }
    }

    const getClientName = (clientId: string) => {
        const client = clients?.find((c) => c.id === clientId)
        return client?.name || 'Unknown'
    }

    const getAssigneeNames = (assigneeIds: string[]) => {
        return assigneeIds
            .map((id) => users?.find((u) => u.uid === id)?.displayName)
            .filter(Boolean)
            .join(', ') || 'Unassigned'
    }

    const getOverdueCount = () => {
        return tasks?.filter((t) => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETE).length || 0
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/90 backdrop-blur px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-muted/60 border border-transparent pl-10 focus:ring-2 focus:ring-ring/60"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/70 text-muted-foreground relative">
                        <Bell className="w-5 h-5" />
                        {getOverdueCount() > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {getOverdueCount()}
                            </span>
                        )}
                    </button>
                    <Button onClick={handleAdd}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                                    <p className="text-2xl font-bold text-foreground">{tasks?.length || 0}</p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <CheckSquare className="w-5 h-5 text-primary" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold text-emerald-500">{tasks?.filter((t) => t.status === TaskStatus.COMPLETE).length || 0}</p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">In Progress</p>
                                    <p className="text-2xl font-bold text-foreground">{tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0}</p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-accent-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Overdue</p>
                                    <p className="text-2xl font-bold text-destructive">{getOverdueCount()}</p>
                                </div>
                                <div className="h-10 w-10 rounded-lg bg-destructive/15 flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-destructive" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex gap-2">
                        {(['all', 'my-tasks', 'due-soon', 'high-priority'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setCurrentPage(1) }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    activeTab === tab
                                        ? 'bg-primary text-primary-foreground shadow'
                                        : 'bg-card text-muted-foreground hover:bg-muted/60'
                                }`}
                            >
                                {tab === 'all' ? 'All Tasks' : tab === 'my-tasks' ? 'My Tasks' : tab === 'due-soon' ? 'Due Soon' : 'High Priority'}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list' ? 'bg-primary text-primary-foreground shadow' : 'bg-card text-muted-foreground hover:bg-muted/60'
                            }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'kanban' ? 'bg-primary text-primary-foreground shadow' : 'bg-card text-muted-foreground hover:bg-muted/60'
                            }`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Task List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="bg-card rounded-lg border border-border overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted/60 border-b border-border/70">
                                        <tr>
                                            <th className="px-4 py-3 w-12">
                                                <Checkbox
                                                    checked={selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0}
                                                    onCheckedChange={selectAllTasks}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Task</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Priority</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Assignees</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Due Date</th>
                                            <th className="px-4 py-3 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTasks.map((task) => {
                                            const status = statusConfig[task.status]
                                            const priority = priorityConfig[task.priority]
                                            const isSelected = selectedTasks.has(task.id)

                                            return (
                                                <tr key={task.id} className="border-b border-border/70 hover:bg-muted/40">
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleTaskSelection(task.id)}
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
                                                            onValueChange={(value) => handleQuickStatusChange(task.id, value as TaskStatus)}
                                                            disabled={updateTaskStatus.isPending}
                                                        >
                                                            <SelectTrigger className={`h-8 w-32 text-xs ${status.bgClass} ${status.textClass} border-0`}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Object.values(TaskStatus).map((s) => (
                                                                    <SelectItem key={s} value={s} className="text-xs">
                                                                        {statusConfig[s].label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {/* Progress bar */}
                                                        <div className="w-full h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all"
                                                                style={{ width: `${getTaskProgress(task.status)}%` }}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm font-medium ${priority.colorClass}`}>
                                                            {priority.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-muted-foreground">{getClientName(task.clientId)}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-muted-foreground">{getAssigneeNames(task.assignees)}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm ${new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETE ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
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
                                                                <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                                                                    <Eye className="w-4 h-4 mr-2" /> View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleEdit(task)}>
                                                                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDelete(task)} className="text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/70">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Previous
                                        </button>
                                        <span className="text-sm text-muted-foreground">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                        >
                                            Next <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Object.values(TaskStatus).map((status) => (
                                    <div key={status} className="bg-muted/60 rounded-lg p-4 border border-border/60">
                                        <h3 className="font-medium text-muted-foreground mb-4">{statusConfig[status].label}</h3>
                                        <div className="space-y-3">
                                            {filteredTasks
                                                .filter((t) => t.status === status)
                                                .map((task) => (
                                                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/tasks/${task.id}`)}>
                                                        <CardContent className="p-4">
                                                            <p className="font-medium text-foreground mb-2">{task.title}</p>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Flag className="w-4 h-4" />
                                                                {priorityConfig[task.priority].label}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(task.dueDate).toLocaleDateString()}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                        <DialogDescription>
                            {editingTask ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        task={editingTask || undefined}
                        clients={clients || []}
                        projects={projects || []}
                        employees={employees}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        isSubmitting={createTask.isPending || updateTask.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the task "{deletingTask?.title}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingTask(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
