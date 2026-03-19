import { Plus, FolderKanban } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PROJECT_STATUS_CONFIG } from '@/features/admin/constants/dashboard'
import type { ProjectWithClientAndAnalytics } from '@/types'

interface AdminDashboardActiveProjectsProps {
    projects: ProjectWithClientAndAnalytics[]
    loading: boolean
    onSelect: (projectId: string) => void
    onViewAll: () => void
}

export function AdminDashboardActiveProjects({ projects, loading, onSelect, onViewAll }: AdminDashboardActiveProjectsProps) {
    return (
        <section>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Active Projects</h3>
                <button onClick={onViewAll} className="text-primary text-sm font-semibold hover:underline">
                    View all
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-48 bg-card border border-border rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => {
                        const config = PROJECT_STATUS_CONFIG[project.status] ?? PROJECT_STATUS_CONFIG.not_started
                        return (
                            <div
                                key={project.id}
                                className="bg-card p-5 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group shadow-sm"
                                onClick={() => onSelect(project.id)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <FolderKanban className="w-6 h-6" />
                                    </div>
                                    <Badge className={`text-xs font-semibold ${config.bg} ${config.color}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot} mr-1`} />
                                        {config.label}
                                    </Badge>
                                </div>
                                <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{project.title}</h4>
                                <p className="text-sm text-muted-foreground mb-6">Client: {project.clientName || 'Unknown'}</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-muted-foreground">
                                            {project.completedTasks}/{project.totalTasks} tasks
                                        </span>
                                        <span className="text-foreground">{project.progress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <Card className="bg-card">
                    <CardContent className="p-8 text-center">
                        <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No active projects</h3>
                        <p className="text-muted-foreground mb-4">Create your first project to get started</p>
                        <Button onClick={onViewAll}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            )}
        </section>
    )
}
