import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FolderOpen, ArrowLeft, CheckSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProject } from '@/features/projects/hooks/useProjects'
import { useTasksByProject } from '@/features/tasks/hooks/useTasks'
import { useClient } from '@/features/clients/hooks/useClients'
import { useAuth } from '@/features/auth/useAuth'
import { TASK_STATUS_CONFIG } from '@/lib/constants'
import { ROUTES } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/formatters'
import { Link } from 'react-router-dom'
import type { Task } from '@/types'

export function ClientProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const normalizedProjectId = projectId ?? null

    const { data: client, isLoading: clientLoading } = useClient(clientId)
    const { data: project, isLoading: projectLoading } = useProject(normalizedProjectId)
    const { data: tasks = [], isLoading: tasksLoading } = useTasksByProject(normalizedProjectId)

    const stats = useMemo(() => {
        return tasks.reduce(
            (acc, task) => {
                acc.total += 1
                if (task.status === 'in_progress') acc.inProgress += 1
                if (task.status === 'complete') acc.complete += 1
                if (task.status === 'in_review') acc.inReview += 1
                return acc
            },
            { total: 0, inProgress: 0, complete: 0, inReview: 0 }
        )
    }, [tasks])

    const progressPercent = useMemo(() => {
        if (tasks.length === 0) return 0
        return Math.round((stats.complete / tasks.length) * 100)
    }, [stats.complete, tasks.length])

    const isLoading = clientLoading || projectLoading || tasksLoading

    if (!projectId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
                <h1 className="text-2xl font-semibold text-foreground mb-2">Project not found</h1>
                <p className="text-muted-foreground">Invalid project ID</p>
            </div>
        )
    }

    if (!isLoading && !project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
                <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-semibold text-foreground mb-2">Project not found</h1>
                <p className="text-muted-foreground max-w-md">
                    The project you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button className="mt-4" asChild>
                    <Link to={ROUTES.CLIENT_PROJECTS}>Back to Projects</Link>
                </Button>
            </div>
        )
    }

    const handleViewTask = (taskId: string) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link to={ROUTES.CLIENT_PROJECTS}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-48" /> : project?.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">{client?.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Progress */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Project Progress</span>
                            <span className="text-sm font-bold text-cobalt">{progressPercent}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-cobalt rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Total Tasks</p>
                            <p className="text-2xl font-semibold text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.total}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">In Progress</p>
                            <p className="text-2xl font-semibold text-blue-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.inProgress}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">In Review</p>
                            <p className="text-2xl font-semibold text-amber-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.inReview}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Completed</p>
                            <p className="text-2xl font-semibold text-emerald-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : stats.complete}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                {project?.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">About this Project</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{project.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Tasks */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-cobalt" />
                        Tasks
                    </h2>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    ) : tasks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tasks.map((task: Task) => {
                                const statusConfig = TASK_STATUS_CONFIG[task.status]
                                return (
                                    <Card
                                        key={task.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleViewTask(task.id)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                                                <Badge className={statusConfig.badgeClass}>{statusConfig.label}</Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {task.description || 'No description'}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                <span>{formatRelativeTime(task.updatedAt)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No tasks in this project</p>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    )
}
