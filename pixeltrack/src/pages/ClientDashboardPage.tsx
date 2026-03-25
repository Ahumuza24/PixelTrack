import { Building2, FolderOpen, CheckSquare, FileText, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientDashboard } from '@/features/clients/hooks/useClientDashboard'
import { formatRelativeTime } from '@/lib/formatters'

/**
 * ClientDashboardPage - Dashboard for clients showing their company tasks
 *
 * Route: /client
 * Access: Client only
 */
export function ClientDashboardPage() {
    const { clientName, userName, stats, recentDeliverables, recentActivity, isLoading, notFound, handlers } = useClientDashboard()
    const { handleViewTask, handleViewFile } = handlers

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
                            <Building2 className="h-6 w-6 text-cobalt" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{clientName}</h1>
                            <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Project Summary */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-cobalt" />
                        Project Summary
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Total Projects</p>
                                <div className="text-2xl font-semibold text-foreground">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.projects.total}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Active</p>
                                <div className="text-2xl font-semibold text-blue-600">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.projects.active}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Completed</p>
                                <div className="text-2xl font-semibold text-emerald-600">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.projects.completed}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Task Summary */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-cobalt" />
                        Task Summary
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Total Tasks</p>
                                <div className="text-2xl font-semibold text-foreground">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.tasks.total}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">In Progress</p>
                                <div className="text-2xl font-semibold text-blue-600">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.tasks.inProgress}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Completed</p>
                                <div className="text-2xl font-semibold text-emerald-600">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.tasks.completed}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Overdue</p>
                                <div className="text-2xl font-semibold text-red-600">
                                    {isLoading ? <Skeleton className="h-8 w-12" /> : stats.tasks.overdue}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Recent Deliverables & Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Deliverables */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-4 h-4" />
                                Recent Deliverables
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : recentDeliverables.length > 0 ? (
                                <div className="space-y-3">
                                    {recentDeliverables.map((file) => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleViewFile(file)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                                                <p className="text-xs text-muted-foreground truncate">{file.taskTitle}</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {formatRelativeTime(file.uploadedAt)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent deliverables</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="w-4 h-4" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity) => (
                                        <button
                                            key={activity.id}
                                            onClick={() => handleViewTask(activity.taskId)}
                                            className="w-full flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-foreground">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
