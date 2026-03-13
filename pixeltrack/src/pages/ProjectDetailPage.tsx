import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    FolderKanban, ArrowLeft, Calendar, Clock, CheckCircle, AlertCircle,
    Edit2, Trash2, Plus, MoreHorizontal, Loader2, Users, CheckSquare
} from 'lucide-react'
import { useProject, useUpdateProject, useDeleteProject } from '@/features/projects/hooks/useProjects'
import { useTasks, useCreateTask } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients/hooks/useClients'
import { useUsers } from '@/features/users/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
import type { Task, ProjectStatus } from '@/types'
import { TaskStatus, UserRole } from '@/types'

const statusConfig: Record<ProjectStatus, { label: string; bg: string; color: string }> = {
    active: { label: 'Active', bg: 'bg-blue-100', color: 'text-blue-600' },
    completed: { label: 'Completed', bg: 'bg-green-100', color: 'text-green-600' },
    on_hold: { label: 'On Hold', bg: 'bg-yellow-100', color: 'text-yellow-600' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-100', color: 'text-red-600' },
}

export function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()

    const { data: project, isLoading: projectLoading } = useProject(projectId || '')
    const { data: allTasks, isLoading: tasksLoading } = useTasks()
    const { data: clients } = useClients()
    const { data: users } = useUsers()
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()
    const createTask = useCreateTask()

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

    const projectTasks = useMemo(() => {
        return allTasks?.filter((t) => t.projectId === projectId) || []
    }, [allTasks, projectId])

    const projectProgress = useMemo(() => {
        if (projectTasks.length === 0) return 0
        const completed = projectTasks.filter((t) => t.status === TaskStatus.COMPLETE).length
        return Math.round((completed / projectTasks.length) * 100)
    }, [projectTasks])

    const taskStats = useMemo(() => {
        return {
            total: projectTasks.length,
            completed: projectTasks.filter((t) => t.status === TaskStatus.COMPLETE).length,
            inProgress: projectTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
            notStarted: projectTasks.filter((t) => t.status === TaskStatus.NOT_STARTED).length,
            blocked: projectTasks.filter((t) => t.status === TaskStatus.BLOCKED).length,
        }
    }, [projectTasks])

    const employees = users?.filter((u) => u.role !== UserRole.CLIENT) || []

    const getClientName = (clientId: string) => {
        const client = clients?.find((c) => c.id === clientId)
        return client?.name || 'Unknown Client'
    }

    const handleDelete = async () => {
        if (projectId) {
            await deleteProject.mutateAsync(projectId)
            navigate('/admin/projects')
        }
    }

    const handleCreateTask = async (values: TaskFormValues) => {
        if (projectId) {
            await createTask.mutateAsync({ ...values, projectId })
            setIsTaskFormOpen(false)
        }
    }

    const isLoading = projectLoading || tasksLoading

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#0048ad]" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900">Project not found</h2>
                <p className="text-slate-500 mt-2">The project you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/admin/projects')} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        )
    }

    const status = statusConfig[project.status]

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f7f8]">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/projects')}
                        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900">{project.title}</h1>
                        <p className="text-sm text-slate-500">{getClientName(project.clientId)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" className="text-red-600" onClick={() => setIsDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Info Card */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-[#0048ad]/10 rounded-lg flex items-center justify-center">
                                            <FolderKanban className="w-6 h-6 text-[#0048ad]" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">{project.title}</h2>
                                            <Badge className={`mt-1 ${status.bg} ${status.color}`}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-600 mb-4">{project.description || 'No description provided.'}</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Card */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Project Progress</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                        <Progress value={projectProgress} className="h-3" />
                                    </div>
                                    <span className="text-lg font-semibold text-slate-900">{projectProgress}%</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-slate-900">{taskStats.total}</p>
                                        <p className="text-xs text-slate-500">Total Tasks</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                                        <p className="text-xs text-slate-500">Completed</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                                        <p className="text-xs text-slate-500">In Progress</p>
                                    </div>
                                    <div className="p-3 bg-red-50 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-red-600">{taskStats.blocked}</p>
                                        <p className="text-xs text-slate-500">Blocked</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tasks List */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-slate-900">Tasks</h3>
                                    <Button onClick={() => setIsTaskFormOpen(true)} size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Task
                                    </Button>
                                </div>

                                {projectTasks.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        <CheckSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p>No tasks yet. Add your first task to this project!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {projectTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        task.status === TaskStatus.COMPLETE ? 'bg-green-500' :
                                                        task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' :
                                                        task.status === TaskStatus.BLOCKED ? 'bg-red-500' :
                                                        'bg-slate-400'
                                                    }`} />
                                                    <div>
                                                        <p className="font-medium text-sm text-slate-900">{task.title}</p>
                                                        <p className="text-xs text-slate-500">
                                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={
                                                    task.priority === 'urgent' ? 'border-red-200 text-red-700' :
                                                    task.priority === 'high' ? 'border-orange-200 text-orange-700' :
                                                    'border-slate-200 text-slate-600'
                                                }>
                                                    {task.priority}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Client Info */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Client</h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{getClientName(project.clientId)}</p>
                                        <button
                                            onClick={() => navigate(`/admin/clients/${project.clientId}`)}
                                            className="text-sm text-[#0048ad] hover:underline"
                                        >
                                            View Client
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Timeline</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Project Started</p>
                                            <p className="text-xs text-slate-500">{new Date(project.startDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                            project.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                                        }`}>
                                            <Clock className={`w-4 h-4 ${
                                                project.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                            }`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">
                                                {project.status === 'completed' ? 'Completed' : 'Due Date'}
                                            </p>
                                            <p className="text-xs text-slate-500">{new Date(project.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Project Dialog - Placeholder */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Project editing functionality coming soon.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setIsEditOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{project.title}</strong>?
                            This will also remove all associated tasks. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteProject.isPending}
                        >
                            {deleteProject.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Task Dialog */}
            <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>
                            Add a new task to this project.
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        clients={clients || []}
                        projects={[]}
                        employees={employees}
                        onSubmit={handleCreateTask}
                        onCancel={() => setIsTaskFormOpen(false)}
                        isSubmitting={createTask.isPending}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
