import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CheckSquare, Search, Bell, Plus,
    MoreHorizontal, Calendar, Flag, ChevronLeft, ChevronRight,
    LayoutGrid, List, Trash2, Edit2, Eye, CheckCircle, Clock, AlertCircle, Loader2
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/features/tasks/hooks/useTasks'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useClients } from '@/features/clients/hooks/useClients'
import { useUsers } from '@/features/users/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { TaskForm } from '@/features/tasks/components/TaskForm'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import type { Task } from '@/types'
import { TaskStatus, TaskPriority, UserRole } from '@/types'

type FilterTab = 'all' | 'my-tasks' | 'due-soon' | 'high-priority'
type ViewMode = 'list' | 'kanban'

const statusConfig: Record<TaskStatus, { label: string; bg: string; color: string; icon: typeof Clock }> = {
    [TaskStatus.NOT_STARTED]: { label: 'To Do', bg: 'bg-slate-100', color: 'text-slate-600', icon: Clock },
    [TaskStatus.IN_PROGRESS]: { label: 'In Progress', bg: 'bg-blue-100', color: 'text-blue-600', icon: Clock },
    [TaskStatus.IN_REVIEW]: { label: 'Review', bg: 'bg-indigo-100', color: 'text-indigo-600', icon: Eye },
    [TaskStatus.COMPLETE]: { label: 'Complete', bg: 'bg-green-100', color: 'text-green-600', icon: CheckCircle },
    [TaskStatus.BLOCKED]: { label: 'Blocked', bg: 'bg-red-100', color: 'text-red-600', icon: AlertCircle },
}

const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: typeof Flag }> = {
    [TaskPriority.LOW]: { label: 'Low', color: 'text-slate-500', icon: Flag },
    [TaskPriority.MEDIUM]: { label: 'Medium', color: 'text-blue-500', icon: Flag },
    [TaskPriority.HIGH]: { label: 'High', color: 'text-orange-500', icon: Flag },
    [TaskPriority.URGENT]: { label: 'Urgent', color: 'text-red-500', icon: Flag },
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

    const confirmDelete = async () => {
        if (deletingTask) {
            await deleteTask.mutateAsync(deletingTask.id)
            setDeletingTask(null)
        }
    }

    const handleSubmit = async (values: TaskFormValues) => {
        if (editingTask) {
            await updateTask.mutateAsync({ id: editingTask.id, ...values })
        } else {
            await createTask.mutateAsync(values)
        }
        setIsFormOpen(false)
        setEditingTask(null)
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
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f7f8]">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-100 border-none pl-10 focus:ring-2 focus:ring-[#0048ad]/50"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
                        <Bell className="w-5 h-5" />
                        {getOverdueCount() > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {getOverdueCount()}
                            </span>
                        )}
                    </button>
                    <Button className="bg-[#0048ad] text-white hover:bg-[#003d8f]" onClick={handleAdd}>
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
                                    <p className="text-sm text-slate-500">Total Tasks</p>
                                    <p className="text-2xl font-bold">{tasks?.length || 0}</p>
                                </div>
                                <CheckSquare className="w-8 h-8 text-[#0048ad]" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Completed</p>
                                    <p className="text-2xl font-bold">{tasks?.filter((t) => t.status === TaskStatus.COMPLETE).length || 0}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">In Progress</p>
                                    <p className="text-2xl font-bold">{tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0}</p>
                                </div>
                                <Clock className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">Overdue</p>
                                    <p className="text-2xl font-bold">{getOverdueCount()}</p>
                                </div>
                                <AlertCircle className="w-8 h-8 text-red-500" />
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
                                        ? 'bg-[#0048ad] text-white'
                                        : 'bg-white text-slate-600 hover:bg-slate-100'
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
                                viewMode === 'list' ? 'bg-[#0048ad] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'kanban' ? 'bg-[#0048ad] text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Task List */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0048ad]" />
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 w-12">
                                                <Checkbox
                                                    checked={selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0}
                                                    onCheckedChange={selectAllTasks}
                                                />
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Task</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Priority</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Client</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Assignees</th>
                                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Due Date</th>
                                            <th className="px-4 py-3 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTasks.map((task) => {
                                            const status = statusConfig[task.status]
                                            const priority = priorityConfig[task.priority]
                                            const isSelected = selectedTasks.has(task.id)

                                            return (
                                                <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => toggleTaskSelection(task.id)}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-start gap-3">
                                                            <div>
                                                                <p className="font-medium text-slate-900">{task.title}</p>
                                                                <p className="text-sm text-slate-500 line-clamp-1">{task.description}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge className={`${status.bg} ${status.color}`}>
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm font-medium ${priority.color}`}>
                                                            {priority.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-slate-600">{getClientName(task.clientId)}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm text-slate-600">{getAssigneeNames(task.assignees)}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm ${new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETE ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                                                                    <MoreHorizontal className="w-4 h-4 text-slate-500" />
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
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-4 h-4" /> Previous
                                        </button>
                                        <span className="text-sm text-slate-600">
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
                                    <div key={status} className="bg-slate-100 rounded-lg p-4">
                                        <h3 className="font-medium text-slate-700 mb-4">{statusConfig[status].label}</h3>
                                        <div className="space-y-3">
                                            {filteredTasks
                                                .filter((t) => t.status === status)
                                                .map((task) => (
                                                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/tasks/${task.id}`)}>
                                                        <CardContent className="p-4">
                                                            <p className="font-medium text-slate-900 mb-2">{task.title}</p>
                                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                                <Flag className="w-4 h-4" />
                                                                {priorityConfig[task.priority].label}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
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
                        task={editingTask}
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
