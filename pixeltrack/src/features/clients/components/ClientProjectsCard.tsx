import { Loader2, FolderKanban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Project } from '@/types'

interface ClientProjectsCardProps {
    projects: Project[]
    isLoading: boolean
    onSelectProject: (projectId: string) => void
    clientName: string
}

export function ClientProjectsCard({ projects, isLoading, onSelectProject, clientName }: ClientProjectsCardProps) {
    const formatDate = (value?: string) => {
        if (!value) return 'TBD'
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? 'TBD' : parsed.toLocaleDateString()
    }

    return (
        <Card className="shadow-sm bg-card border border-border">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">{clientName}'s Projects</h2>
                        <p className="text-sm text-muted-foreground">Active and archived projects.</p>
                    </div>
                    <Badge variant="secondary">{projects.length} total</Badge>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : projects.length > 0 ? (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <button
                                key={project.id}
                                className="w-full text-left rounded-2xl border border-border p-4 hover:border-primary/60 transition-all"
                                onClick={() => onSelectProject(project.id)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-base font-semibold text-foreground flex items-center gap-2">
                                            <FolderKanban className="w-4 h-4 text-primary" />
                                            {project.title}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">Due {formatDate(project.dueDate)}</p>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                    {project.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                        <p className="text-sm text-muted-foreground">No projects currently linked to this client.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
