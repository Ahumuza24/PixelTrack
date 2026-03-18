import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    FolderKanban, ArrowLeft, Calendar, Clock, AlertCircle,
    Edit2, Trash2, Plus, Loader2, Users, CheckSquare
} from 'lucide-react'
import { useProject, useUpdateProject, useDeleteProject } from '@/features/projects/hooks/useProjects'
import { useTasks, useCreateTask } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients/hooks/useClients'
import { useUsers } from '@/features/users/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import type { ProjectStatus } from '@/types'
import { TaskStatus, UserRole } from '@/types'

const statusConfig: Record<ProjectStatus, { label: string; bgClass: string; textClass: string }> = {
    not_started: { label: 'Not Started', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
    active: { label: 'Active', bgClass: 'bg-primary/10', textClass: 'text-primary' },
    completed: { label: 'Completed', bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-500' },
    on_hold: { label: 'On Hold', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
    cancelled: { label: 'Cancelled', bgClass: 'bg-destructive/15', textClass: 'text-destructive' },
}

export function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()

    const { data: project, isLoading: projectLoading } = useProject(projectId || '')
    const { data: allTasks, isLoading: tasksLoading } = useTasks()
    const { data: clients } = useClients()
    const { data: users } = useUsers()
    const deleteProject = useDeleteProject()
    const updateProject = useUpdateProject()
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

    /**
     * Formats ISO date strings safely for UI output.
     */
    const formatDate = (value?: string) => {
        if (!value) return 'TBD'
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? 'TBD' : parsed.toLocaleDateString()
    }

    const handleDelete = async () => {
        if (projectId) {
            await deleteProject.mutateAsync(projectId)
            navigate('/admin/projects')
        }
    }

    const handleUpdateProject = async (data: {
        title: string
        description: string
        clientId: string
        status: ProjectStatus
        dueDate: string
    }) => {
        if (!projectId) return
        await updateProject.mutateAsync({
            id: projectId,
            ...data,
            startDate: data.status === 'active' && !project?.startDate
                ? new Date().toISOString()
                : undefined,
        })
        setIsEditOpen(false)
    }

    const handleCreateTask = async (values: TaskFormValues) => {
        if (projectId) {
            await createTask.mutateAsync({ ...values, projectId })
            setIsTaskFormOpen(false)
        }
    }

    const taskFormInitialValues = useMemo(() => {
        if (!project) return undefined
        return { projectId: project.id, clientId: project.clientId }
    }, [project])

    const isLoading = projectLoading || tasksLoading

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-background text-foreground">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Project not found</h2>
                <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/admin/projects')} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        )
    }

    const status = statusConfig[project.status]

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/projects')}
                        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/60"
                    >
                        <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">{project.title}</h1>
                        <p className="text-sm text-muted-foreground">{getClientName(project.clientId)}</p>
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
                        <Card className="bg-card border border-border">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <FolderKanban className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-foreground">{project.title}</h2>
                                            <Badge className={`mt-1 ${status.bgClass} ${status.textClass}`}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-muted-foreground mb-4">{project.description || 'No description provided.'}</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>Start: {formatDate(project.startDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        <span>End: {formatDate(project.dueDate)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress Card */}
                        <Card className="bg-card border border-border">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-foreground mb-4">Project Progress</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1">
                                        <Progress value={projectProgress} className="h-3" />
                                    </div>
                                    <span className="text-lg font-semibold text-foreground">{projectProgress}%</span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-muted/60 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
                                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                                        <p className="text-xs text-muted-foreground">Completed</p>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-primary">{taskStats.inProgress}</p>
                                        <p className="text-xs text-muted-foreground">In Progress</p>
                                    </div>
                                    <div className="p-3 bg-destructive/15 rounded-lg text-center">
                                        <p className="text-2xl font-bold text-destructive">{taskStats.blocked}</p>
                                        <p className="text-xs text-muted-foreground">Blocked</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tasks List */}
                        <Card className="bg-card border border-border">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-foreground">Tasks</h3>
                                    <Button onClick={() => setIsTaskFormOpen(true)} size="sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Task
                                    </Button>
                                </div>

                                {projectTasks.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                                        <p>No tasks yet. Add your first task to this project!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {projectTasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer"
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
                                                        <p className="font-medium text-sm text-foreground">{task.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={
                                                    task.priority === 'urgent' ? 'border-destructive/60 text-destructive' :
                                                    task.priority === 'high' ? 'border-orange-300 text-orange-600' :
                                                    'border-border text-muted-foreground'
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
                        <Card className="bg-card border border-border">
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-foreground mb-4">Client</h3>
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
                                            <p className="text-xs text-slate-500">{formatDate(project.startDate)}</p>
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
                                            <p className="text-xs text-slate-500">{formatDate(project.dueDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Edit Project Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-[#0048ad]" />
                            Edit Project
                        </DialogTitle>
                        <DialogDescription>
                            Update the project details below.
                        </DialogDescription>
                    </DialogHeader>
                    {project && (
                        <ProjectForm
                            clients={clients ?? []}
                            initialData={project}
                            onSubmit={handleUpdateProject}
                            onCancel={() => setIsEditOpen(false)}
                            isSubmitting={updateProject.isPending}
                            isEditing
                        />
                    )}
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
                        projects={project ? [project] : []}
                        initialValues={taskFormInitialValues}
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

// Project Form Component for editing
interface ProjectFormProps {
    clients: { id: string; name: string }[]
    initialData?: {
        title: string
        description?: string
        clientId: string
        status: ProjectStatus
        dueDate?: string
    }
    isEditing?: boolean
    onSubmit: (data: {
        title: string
        description: string
        clientId: string
        status: ProjectStatus
        dueDate: string
    }) => void
    onCancel: () => void
    isSubmitting?: boolean
}

function ProjectForm({ clients, initialData, isEditing, onSubmit, onCancel, isSubmitting }: ProjectFormProps) {
    const [formData, setFormData] = useState<{
        title: string
        description: string
        clientId: string
        status: ProjectStatus
        dueDate: string
    }>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        clientId: initialData?.clientId || '',
        status: initialData?.status || 'not_started',
        dueDate: initialData?.dueDate ? initialData.dueDate.split('T')[0] : '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.clientId) return
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Project Title *
                </label>
                <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Brand Design, Website Redesign"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Client *
                </label>
                <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt/50"
                    required
                >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                            {client.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the project scope..."
                    rows={3}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt/50 resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cobalt/50"
                    >
                        <option value="not_started">Not Started</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Due Date
                    </label>
                    <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                </div>
            </div>

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
                    disabled={isSubmitting || !formData.title || !formData.clientId}
                    className="flex-1 bg-[#0048ad] hover:bg-[#0048ad]/90"
                >
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Project')}
                </Button>
            </div>
        </form>
    )
}
