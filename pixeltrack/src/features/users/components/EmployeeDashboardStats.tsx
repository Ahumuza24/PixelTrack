import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { EmployeeDashboardStats } from '@/features/users/hooks/useEmployeeDashboard'

const cards = [
    {
        label: 'Total Tasks',
        icon: CheckSquare,
        iconClass: 'text-cobalt',
        key: 'total' as const,
    },
    {
        label: 'In Progress',
        icon: Clock,
        iconClass: 'text-blue-600',
        key: 'inProgress' as const,
    },
    {
        label: 'In Review',
        icon: CheckCircle2,
        iconClass: 'text-yellow-600',
        key: 'inReview' as const,
    },
    {
        label: 'Overdue',
        icon: AlertCircle,
        iconClass: 'text-red-600',
        key: 'overdue' as const,
    },
]

interface EmployeeDashboardStatsProps {
    stats: EmployeeDashboardStats
}

export function EmployeeDashboardStats({ stats }: EmployeeDashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {cards.map(({ label, icon: Icon, iconClass, key }) => (
                <Card key={label}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Icon className={`w-5 h-5 ${iconClass}`} />
                            <span className="text-2xl font-bold">{stats[key]}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
