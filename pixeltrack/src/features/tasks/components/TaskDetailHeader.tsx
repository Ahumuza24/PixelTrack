import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TaskDetailHeaderProps {
    title: string
    onBack: () => void
    canEdit: boolean
    onEdit: () => void
    onDelete: () => void
}

export function TaskDetailHeader({ title, onBack, canEdit, onEdit, onDelete }: TaskDetailHeaderProps) {
    return (
        <div className="bg-card/80 border-b border-border backdrop-blur">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to previous page">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Task Detail</p>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
                    </div>
                </div>
                {canEdit && (
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={onEdit} aria-label="Edit task">
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={onDelete}
                            aria-label="Delete task"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
