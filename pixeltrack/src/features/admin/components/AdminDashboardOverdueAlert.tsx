import { AlertCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AdminDashboardOverdueAlertProps {
    overdueCount: number
    onViewTasks: () => void
}

export function AdminDashboardOverdueAlert({ overdueCount, onViewTasks }: AdminDashboardOverdueAlertProps) {
    if (overdueCount <= 0) {
        return null
    }

    return (
        <section>
            <Card className="border-destructive/30 bg-destructive/10">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-destructive/20 rounded-full flex items-center justify-center text-destructive">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-destructive">
                            {overdueCount} Overdue Task{overdueCount > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-destructive-foreground/80">Some tasks need immediate attention</p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={onViewTasks}
                    >
                        View Tasks
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </CardContent>
            </Card>
        </section>
    )
}
