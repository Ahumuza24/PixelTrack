import { FolderKanban, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/types'
import type { ProjectStatusDisplayConfig } from '@/features/projects/constants/projectDetail'

interface ProjectOverviewCardProps {
    project: Project
    statusMeta?: ProjectStatusDisplayConfig
    formatDate: (value?: string) => string
}

export function ProjectOverviewCard({ project, statusMeta, formatDate }: ProjectOverviewCardProps) {
    return (
        <Card className="bg-card border border-border">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{project.title}</h2>
                            {statusMeta ? (
                                <Badge className={`mt-1 ${statusMeta.bgClass} ${statusMeta.textClass}`}>
                                    {statusMeta.label}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>

                <p className="text-muted-foreground mb-4">{project.description || 'No description provided.'}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Start: {formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>End: {formatDate(project.dueDate)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
