import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    FolderOpen,
    Plus,
    Building2,
    Clock,
    MoreHorizontal,
    Search,
    ArrowRight,
    AlertCircle,
} from 'lucide-react'
import { useProjectsWithAnalytics, useCreateProject, useUpdateProject, useDeleteProject } from '@/features/projects/hooks/useProjects'
import { useClients } from '@/features/clients'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ProjectStatus, type ProjectWithClientAndAnalytics } from '@/types'

const statusConfig: Record<ProjectStatus, { label: string; bgClass: string; textClass: string }> = {
    [ProjectStatus.NOT_STARTED]: { label: 'Not Started', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
    [ProjectStatus.ACTIVE]: { label: 'Active', bgClass: 'bg-primary/10', textClass: 'text-primary' },
    [ProjectStatus.COMPLETED]: { label: 'Completed', bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-500' },
    [ProjectStatus.ON_HOLD]: { label: 'On Hold', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
    [ProjectStatus.CANCELLED]: { label: 'Cancelled', bgClass: 'bg-destructive/15', textClass: 'text-destructive' },
}

export function ProjectManagementPage() {
    const navigate = useNavigate()
    const { data: projects, isLoading } = useProjectsWithAnalytics()
    const { data: clients } = useClients()
    const createProject = useCreateProject()
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<ProjectWithClientAndAnalytics | null>(null)
    const [deletingProject, setDeletingProject] = useState<ProjectWithClientAndAnalytics | null>(null)

    const filteredProjects = projects?.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.clientName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const handleCreateProject = async (data: {
        title: string
        description: string
        clientId: string
        status: ProjectStatus
        dueDate: string
    }) => {
        await createProject.mutateAsync({
            ...data,
            startDate: data.status === ProjectStatus.ACTIVE ? new Date().toISOString() : undefined,
        })
        setIsFormOpen(false)
    }

    const handleUpdateProject = async (data: {
        title: string
        description: string
        clientId: string
        status: ProjectStatus
        startDate?: string
        dueDate: string
    }) => {
        if (!editingProject) return
        await updateProject.mutateAsync({
            id: editingProject.id,
            ...data,
            startDate: data.status === ProjectStatus.ACTIVE && !editingProject.startDate
                ? new Date().toISOString()
                : data.startDate,
        })
        setEditingProject(null)
    }

    const handleDeleteProject = async () => {
        if (deletingProject) {
            await deleteProject.mutateAsync(deletingProject.id)
            setDeletingProject(null)
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 75) return 'bg-green-500'
        if (progress >= 50) return 'bg-blue-500'
        if (progress >= 25) return 'bg-yellow-500'
        return 'bg-slate-400'
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Page Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                                <FolderOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Projects</h1>
                                <p className="text-sm text-muted-foreground">
                                    {projects?.length ?? 0} projects
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsFormOpen(true)}
                            disabled={createProject.isPending}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-muted/60 border border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                            className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">All Statuses</option>
                            {Object.entries(statusConfig).map(([status, config]) => (
                                <option key={status} value={status}>
                                    {config.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-4 w-3/4 bg-muted rounded mb-4" />
                                    <div className="h-3 w-1/2 bg-muted rounded mb-6" />
                                    <div className="h-2 w-full bg-muted rounded mb-2" />
                                    <div className="h-2 w-2/3 bg-muted rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredProjects?.length === 0 ? (
                    <div className="text-center py-12">
                        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Get started by creating your first project'}
                        </p>
                        {!searchQuery && statusFilter === 'all' && (
                            <Button onClick={() => setIsFormOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects?.map((project) => {
                            const status = statusConfig[project.status]
                            const isOverdue =
                                project.dueDate &&
                                new Date(project.dueDate) < new Date() &&
                                project.status !== ProjectStatus.COMPLETED

                            return (
                                <Card
                                    key={project.id}
                                    className="hover:shadow-md transition-shadow cursor-pointer group bg-card border border-border"
                                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                                >
                                    <CardContent className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                    {project.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    <span className="truncate">{project.clientName}</span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    asChild
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditingProject(project)
                                                    }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            navigate(`/admin/projects/${project.id}`)
                                                        }}
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setDeletingProject(project)
                                                        }}
                                                        className="text-red-600"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <Badge className={`${status.bgClass} ${status.textClass}`}>
                                                {status.label}
                                            </Badge>
                                            {isOverdue && (
                                                <Badge className="bg-destructive/15 text-destructive">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium text-foreground">
                                                    {project.completedTasks}/{project.totalTasks} tasks
                                                </span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getProgressColor(project.progress)} transition-all duration-500`}
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {project.progress}% complete
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/60">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>
                                                    Due{' '}
                                                    {project.dueDate
                                                        ? new Date(project.dueDate).toLocaleDateString()
                                                        : 'No date'}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </main>

            {/* Edit Project Dialog */}
            <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-primary" />
                            Edit Project
                        </DialogTitle>
                        <DialogDescription>
                            Update the project details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editingProject && (
                        <ProjectForm
                            clients={clients ?? []}
                            initialData={editingProject}
                            onSubmit={handleUpdateProject}
                            onCancel={() => setEditingProject(null)}
                            isSubmitting={updateProject.isPending}
                            isEditing
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Project Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FolderOpen className="w-5 h-5 text-primary" />
                            Create New Project
                        </DialogTitle>
                        <DialogDescription>
                            Enter the details for the new project. Projects help organize related tasks for a client.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm
                        clients={clients ?? []}
                        onSubmit={handleCreateProject}
                        onCancel={() => setIsFormOpen(false)}
                        isSubmitting={createProject.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingProject} onOpenChange={() => setDeletingProject(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingProject?.title}</strong>?
                            This action cannot be undone. Associated tasks will become standalone tasks.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteProject}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={deleteProject.isPending}
                        >
                            {deleteProject.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

// Simple Project Form Component
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
        startDate?: string
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
        status: initialData?.status || ProjectStatus.NOT_STARTED,
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
                <label className="block text-sm font-medium text-muted-foreground mb-1">
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
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Client *
                </label>
                <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Description
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the project scope..."
                    rows={3}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                        Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value={ProjectStatus.NOT_STARTED}>Not Started</option>
                        <option value={ProjectStatus.ACTIVE}>Active</option>
                        <option value={ProjectStatus.ON_HOLD}>On Hold</option>
                        <option value={ProjectStatus.COMPLETED}>Completed</option>
                        <option value={ProjectStatus.CANCELLED}>Cancelled</option>
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
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/70">
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
                    className="flex-1"
                >
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Project')}
                </Button>
            </div>
        </form>
    )
}
