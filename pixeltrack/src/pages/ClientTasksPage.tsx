import { Building2, CheckSquare, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useClientTasks } from '@/features/clients/hooks/useClientTasks'
import { TASK_STATUS_CONFIG } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/formatters'

export function ClientTasksPage() {
    const { clientName, tasks, standaloneTasks, projectTasks, stats, isLoading, notFound, handlers } = useClientTasks()
    const { handleViewTask } = handlers

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

    const TaskCard = ({ task }: { task: typeof tasks[0] }) => {
        const statusConfig = TASK_STATUS_CONFIG[task.status]
        return (
            <Card
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
                    {task.projectName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FolderOpen className="w-4 h-4" />
                            <span>{task.projectName}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span>{formatRelativeTime(task.updatedAt)}</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cobalt/10">
                            <CheckSquare className="h-6 w-6 text-cobalt" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
                            <p className="text-sm text-muted-foreground">{clientName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Total</p>
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

                {/* Tasks Tabs */}
                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="all">All Tasks</TabsTrigger>
                        <TabsTrigger value="project">Project Tasks</TabsTrigger>
                        <TabsTrigger value="standalone">Standalone</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ) : tasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No tasks found</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="project" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ) : projectTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projectTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No project tasks found</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="standalone" className="mt-6">
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ) : standaloneTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {standaloneTasks.map((task) => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No standalone tasks found</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
