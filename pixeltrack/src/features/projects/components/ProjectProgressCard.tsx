import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ProjectTaskStats } from '@/features/projects/types'

interface ProjectProgressCardProps {
    progress: number
    taskStats: ProjectTaskStats
}

export function ProjectProgressCard({ progress, taskStats }: ProjectProgressCardProps) {
    return (
        <Card className="bg-card border border-border">
            <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Project Progress</h3>
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <Progress value={progress} className="h-3" />
                    </div>
                    <span className="text-lg font-semibold text-foreground">{progress}%</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-muted/60 rounded-lg text-center">
                        <p className="text-2xl font-bold text-foreground">{taskStats.total}</p>
                        <p className="text-xs text-muted-foreground">Total Tasks</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-emerald-600">{taskStats.completed}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{taskStats.inProgress}</p>
                        <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="p-3 bg-destructive/15 rounded-lg text-center">
                        <p className="text-2xl font-bold text-destructive">{taskStats.blocked}</p>
                        <p className="text-xs text-muted-foreground">Blocked</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
