import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectStatus } from '@/types'

interface ProjectTimelineCardProps {
    startDate?: string
    dueDate?: string
    status: ProjectStatus
    formatDate: (value?: string) => string
}

export function ProjectTimelineCard({ startDate, dueDate, status, formatDate }: ProjectTimelineCardProps) {
    const isComplete = status === 'completed'

    return (
        <Card className="bg-card border border-border">
            <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Timeline</h3>
                <div className="space-y-4">
                    <TimelineItem
                        icon={<Calendar className="w-4 h-4 text-emerald-600" />}
                        label="Project Started"
                        date={formatDate(startDate)}
                        iconBg="bg-emerald-100"
                    />
                    <TimelineItem
                        icon={<Clock className={`w-4 h-4 ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`} />}
                        label={isComplete ? 'Completed' : 'Due Date'}
                        date={formatDate(dueDate)}
                        iconBg={isComplete ? 'bg-emerald-100' : 'bg-amber-100'}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

interface TimelineItemProps {
    icon: React.ReactNode
    label: string
    date: string
    iconBg: string
}

function TimelineItem({ icon, label, date, iconBg }: TimelineItemProps) {
    return (
        <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
            </div>
        </div>
    )
}
