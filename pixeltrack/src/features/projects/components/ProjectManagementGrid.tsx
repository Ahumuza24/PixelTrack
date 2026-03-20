import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, Building2, Clock, FolderOpen, MoreHorizontal } from 'lucide-react'
import type { ProjectWithClientAndAnalytics } from '@/types'
import type { ProjectStatusFilter } from '@/features/projects/hooks/useProjectManagement'
import { ProjectStatus } from '@/types'
import { PROJECT_STATUS_CONFIG } from '@/features/projects/constants/projectDetail'

interface ProjectManagementGridProps {
    projects: ProjectWithClientAndAnalytics[]
    isLoading: boolean
    searchQuery: string
    statusFilter: ProjectStatusFilter
    onCreateProject: () => void
    onProjectSelect: (projectId: string) => void
    onProjectEdit: (project: ProjectWithClientAndAnalytics) => void
    onProjectDelete: (project: ProjectWithClientAndAnalytics) => void
}

export function ProjectManagementGrid({
    projects,
    isLoading,
    searchQuery,
    statusFilter,
    onCreateProject,
    onProjectSelect,
    onProjectEdit,
    onProjectDelete,
}: ProjectManagementGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 w-3/4 bg-muted rounded mb-4" />
                            <div className="h-3 w-1/2 bg-muted rounded mb-6" />
                            <div className="h-2 w-full bg-muted rounded mb-2" />
                            <div className="h-2 w-2/3 bg-muted rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (projects.length === 0) {
        const hasFilters = Boolean(searchQuery || statusFilter !== 'all')
        return (
            <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                    {hasFilters ? 'Try adjusting your filters' : 'Get started by creating your first project'}
                </p>
                {!hasFilters && (
                    <Button onClick={onCreateProject}>
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Create Project
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={onProjectSelect}
                    onEdit={onProjectEdit}
                    onDelete={onProjectDelete}
                />
            ))}
        </div>
    )
}

interface ProjectCardProps {
    project: ProjectWithClientAndAnalytics
    onSelect: (projectId: string) => void
    onEdit: (project: ProjectWithClientAndAnalytics) => void
    onDelete: (project: ProjectWithClientAndAnalytics) => void
}

function ProjectCard({ project, onSelect, onEdit, onDelete }: ProjectCardProps) {
    const status = PROJECT_STATUS_CONFIG[project.status]
    const isOverdue = Boolean(
        project.dueDate &&
            new Date(project.dueDate) < new Date() &&
            project.status !== ProjectStatus.COMPLETED,
    )

    return (
        <Card
            className="hover:shadow-md transition-shadow cursor-pointer group bg-card border border-border"
            onClick={() => onSelect(project.id)}
        >
            <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
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
                        <DropdownMenuTrigger asChild onClick={(event) => event.stopPropagation()}>
                            <button
                                type="button"
                                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Project actions"
                            >
                                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onEdit(project)
                                }}
                            >
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onSelect(project.id)
                                }}
                            >
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(event) => {
                                    event.stopPropagation()
                                    onDelete(project)
                                }}
                                className="text-destructive"
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex items-center gap-2">
                    <Badge className={`${status.bgClass} ${status.textClass}`}>{status.label}</Badge>
                    {isOverdue && (
                        <Badge className="bg-destructive/15 text-destructive">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                        </Badge>
                    )}
                </div>

                <div>
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
                    <p className="text-xs text-muted-foreground mt-1">{project.progress}% complete</p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
            </CardContent>
        </Card>
    )
}

function getProgressColor(progress: number) {
    if (progress >= 75) return 'bg-emerald-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-amber-500'
    return 'bg-slate-400'
}
