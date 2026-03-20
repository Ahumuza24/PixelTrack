import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectStatusDisplayConfig } from '@/features/projects/constants/projectDetail'

interface ProjectDetailHeaderProps {
    title: string
    clientName: string
    status?: ProjectStatusDisplayConfig
    onBack: () => void
    onEdit: () => void
    onDelete: () => void
}

export function ProjectDetailHeader({ title, clientName, status, onBack, onEdit, onDelete }: ProjectDetailHeaderProps) {
    return (
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/60"
                    aria-label="Go back to projects"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                        {status ? (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bgClass} ${status.textClass}`}>
                                {status.label}
                            </span>
                        ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground">{clientName}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onEdit} aria-label="Edit project">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                </Button>
                <Button variant="outline" className="text-red-600" onClick={onDelete} aria-label="Delete project">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </Button>
            </div>
        </header>
    )
}
