import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Clock, ListTodo } from 'lucide-react'
import type { TaskManagementStats } from '@/features/tasks/hooks/useTaskManagement'

interface TaskManagementStatsGridProps {
    stats: TaskManagementStats
}

const STAT_ITEMS = [
    {
        key: 'totalTasks' as const,
        label: 'Total Tasks',
        icon: ListTodo,
        accentClass: 'bg-primary/10 text-primary',
    },
    {
        key: 'completedTasks' as const,
        label: 'Completed',
        icon: CheckCircle,
        accentClass: 'bg-emerald-500/15 text-emerald-500',
    },
    {
        key: 'inProgressTasks' as const,
        label: 'In Progress',
        icon: Clock,
        accentClass: 'bg-accent/20 text-accent-foreground',
    },
    {
        key: 'overdueTasks' as const,
        label: 'Overdue',
        icon: AlertCircle,
        accentClass: 'bg-destructive/15 text-destructive',
    },
]

export function TaskManagementStatsGrid({ stats }: TaskManagementStatsGridProps) {
    return (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {STAT_ITEMS.map(({ key, label, icon: Icon, accentClass }) => (
                <Card key={key}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold text-foreground">{stats[key]}</p>
                            </div>
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accentClass}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    )
}
