import { FolderOpen, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProjectManagementHeaderProps {
    totalProjects: number
    onCreate: () => void
    isCreating: boolean
}

export function ProjectManagementHeader({ totalProjects, onCreate, isCreating }: ProjectManagementHeaderProps) {
    return (
        <div className="bg-card border-b border-border sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Projects</h1>
                            <p className="text-sm text-muted-foreground">{totalProjects} projects</p>
                        </div>
                    </div>
                    <Button onClick={onCreate} disabled={isCreating}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </div>
            </div>
        </div>
    )
}
