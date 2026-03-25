import { Building2, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useClientProjects } from '@/features/clients/hooks/useClientProjects'

export function ClientProjectsPage() {
    const { clientName, projects, stats, isLoading, notFound, handlers } = useClientProjects()
    const { handleViewProject } = handlers

    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-semibold text-foreground mb-2">Client workspace not found</h1>
                <p className="text-muted-foreground max-w-md">
                    We couldn't load your client workspace. Please contact support if this issue persists.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cobalt/10">
                            <FolderOpen className="h-6 w-6 text-cobalt" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                            <p className="text-sm text-muted-foreground">{clientName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Total Projects</p>
                            <p className="text-2xl font-semibold text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.total}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Active</p>
                            <p className="text-2xl font-semibold text-blue-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.active}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Completed</p>
                            <p className="text-2xl font-semibold text-emerald-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.completed}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects Grid */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Your Projects</h2>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => handleViewProject(project.id)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">{project.title}</CardTitle>
                                            <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                                {project.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {project.description || 'No description'}
                                        </p>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{project.progressPercent}%</span>
                                            </div>
                                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-cobalt rounded-full transition-all"
                                                    style={{ width: `${project.progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{project.taskCount} tasks</span>
                                            <span>{project.completedTasks} completed</span>
                                        </div>
                                        {project.dueDate && (
                                            <p className="text-xs text-muted-foreground">
                                                Due: {new Date(project.dueDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No projects found</p>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    )
}
