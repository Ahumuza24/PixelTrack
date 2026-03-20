import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProjectEmptyStateProps {
    onBack: () => void
}

export function ProjectEmptyState({ onBack }: ProjectEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-64 bg-background text-foreground">
            <ArrowLeft className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Project not found</h2>
            <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
            <Button onClick={onBack} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
            </Button>
        </div>
    )
}
