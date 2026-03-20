import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ProjectWithClientAndAnalytics } from '@/types'

interface ProjectDeleteDialogProps {
    project: ProjectWithClientAndAnalytics | null
    isDeleting: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function ProjectDeleteDialog({ project, isDeleting, onOpenChange, onConfirm }: ProjectDeleteDialogProps) {
    const open = Boolean(project)

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Project</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <strong>{project?.title}</strong>? This action cannot be undone. Associated
                        tasks will become standalone tasks.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive hover:bg-destructive/90"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
