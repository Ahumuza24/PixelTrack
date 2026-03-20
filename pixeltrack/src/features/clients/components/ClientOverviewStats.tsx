import { Card, CardContent } from '@/components/ui/card'
import { TaskStatus } from '@/types'
import { TaskStatusBadge } from '@/components/status'

interface ClientOverviewStatsProps {
    stats: {
        activeProjects: number
        totalProjects: number
        openTasks: number
    }
    taskStats: Record<TaskStatus, number> & { total: number }
}

export function ClientOverviewStats({ stats, taskStats }: ClientOverviewStatsProps) {
    const cards = [
        { label: 'Active Projects', value: stats.activeProjects },
        { label: 'Total Projects', value: stats.totalProjects },
        { label: 'Open Tasks', value: stats.openTasks },
    ]
    const statusOrder: TaskStatus[] = [
        TaskStatus.NOT_STARTED,
        TaskStatus.IN_PROGRESS,
        TaskStatus.IN_REVIEW,
        TaskStatus.BLOCKED,
        TaskStatus.COMPLETE,
    ]

    return (
        <Card className="shadow-sm bg-card border border-border">
            <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground">Project Overview</h2>
                <p className="text-sm text-muted-foreground mb-6">Current project progress.</p>
                <div className="grid sm:grid-cols-3 gap-4">
                    {cards.map((card) => (
                        <div key={card.label} className="rounded-2xl border border-border bg-muted/60 p-4">
                            <p className="text-xs uppercase text-muted-foreground">{card.label}</p>
                            <p className="text-2xl font-semibold text-foreground mt-2">{card.value}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 grid sm:grid-cols-5 gap-3">
                    {statusOrder.map((status) => (
                        <div key={status} className="rounded-xl border border-border p-3 bg-card/70">
                            <p className="text-xs uppercase text-muted-foreground">
                                <TaskStatusBadge status={status} />
                            </p>
                            <p className="text-lg font-semibold text-foreground mt-1">{taskStats[status]}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
