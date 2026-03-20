import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, Clock, CheckCircle2 } from 'lucide-react'

interface ClientDashboardStatsProps {
    stats: {
        total: number
        inProgress: number
        inReview: number
        complete: number
    }
}

const statCards = [
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
        label: 'Complete',
        icon: CheckSquare,
        iconClass: 'text-green-600',
        key: 'complete' as const,
    },
]

export function ClientDashboardStats({ stats }: ClientDashboardStatsProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, icon: Icon, iconClass, key }) => (
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
