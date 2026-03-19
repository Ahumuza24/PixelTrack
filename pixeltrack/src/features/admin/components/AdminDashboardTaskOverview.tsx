import { List, Loader2, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { AdminTaskColumns } from '@/features/admin/hooks/useAdminDashboard'

interface AdminDashboardTaskOverviewProps {
    taskColumns: AdminTaskColumns
    onTaskSelect: (taskId: string) => void
}

const COLUMN_CONFIG = [
    {
        key: 'todo' as const,
        title: 'To Do',
        icon: List,
        accentClass: 'text-muted-foreground',
        badgeVariant: 'secondary' as const,
        wrapperClass: 'bg-card',
    },
    {
        key: 'inProgress' as const,
        title: 'In Progress',
        icon: Loader2,
        accentClass: 'text-primary',
        badgeVariant: 'secondary' as const,
        wrapperClass: 'bg-card border-l-4 border-l-primary',
    },
    {
        key: 'review' as const,
        title: 'Review',
        icon: Eye,
        accentClass: 'text-primary',
        badgeVariant: 'secondary' as const,
        wrapperClass: 'bg-card',
    },
]

export function AdminDashboardTaskOverview({ taskColumns, onTaskSelect }: AdminDashboardTaskOverviewProps) {
    return (
        <section className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">Task Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {COLUMN_CONFIG.map(({ key, title, icon: Icon, accentClass, badgeVariant, wrapperClass }) => {
                    const tasks = taskColumns[key]
                    return (
                        <div key={key} className="bg-muted/60 p-4 rounded-xl border border-border/60">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon className={`w-5 h-5 ${accentClass}`} />
                                <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
                                <Badge variant={badgeVariant} className="ml-auto">
                                    {tasks.length}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {tasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className={`${wrapperClass} p-3 rounded-lg shadow-sm border border-border cursor-pointer hover:border-primary/40 transition-colors`}
                                        onClick={() => onTaskSelect(task.id)}
                                    >
                                        <p className="text-sm font-medium truncate text-foreground">{task.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Due {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                                {tasks.length === 0 && <p className="text-sm text-muted-foreground italic">No tasks</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
