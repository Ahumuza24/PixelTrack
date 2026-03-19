import { CheckSquare, FolderKanban, Loader2, Building2, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { AdminDashboardStats } from '@/features/admin/hooks/useAdminDashboard'

interface AdminDashboardStatsGridProps {
    stats: AdminDashboardStats
}

interface StatConfig {
    key: keyof AdminDashboardStats
    label: string
    icon: LucideIcon
    iconWrapperClass: string
}

const STAT_CONFIG: StatConfig[] = [
    {
        key: 'totalProjects',
        label: 'Projects',
        icon: FolderKanban,
        iconWrapperClass: 'bg-primary/10 text-primary',
    },
    {
        key: 'totalTasks',
        label: 'Total Tasks',
        icon: CheckSquare,
        iconWrapperClass: 'bg-primary/10 text-primary',
    },
    {
        key: 'inProgressTasks',
        label: 'In Progress',
        icon: Loader2,
        iconWrapperClass: 'bg-accent/20 text-accent-foreground',
    },
    {
        key: 'totalClients',
        label: 'Clients',
        icon: Building2,
        iconWrapperClass: 'bg-secondary text-secondary-foreground',
    },
    {
        key: 'totalEmployees',
        label: 'Team Members',
        icon: Users,
        iconWrapperClass: 'bg-accent/20 text-accent-foreground',
    },
]

export function AdminDashboardStatsGrid({ stats }: AdminDashboardStatsGridProps) {
    return (
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {STAT_CONFIG.map(({ key, label, icon: Icon, iconWrapperClass }) => (
                <Card key={key}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{label}</p>
                                <p className="text-2xl font-bold text-foreground">{stats[key]}</p>
                            </div>
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconWrapperClass}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    )
}
