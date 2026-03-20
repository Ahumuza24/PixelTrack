import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { Client } from '@/types'
import type { ProjectFormValues } from '@/features/projects/components/ProjectForm'
import { ProjectForm } from '@/features/projects/components/ProjectForm'
import { FolderOpen } from 'lucide-react'

interface ProjectCreateDialogProps {
    open: boolean
    clients: Client[]
    isSubmitting: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: ProjectFormValues) => void
    onCancel: () => void
}

export function ProjectCreateDialog({
    open,
    clients,
    isSubmitting,
    onOpenChange,
    onSubmit,
    onCancel,
}: ProjectCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-primary" />
                        Create New Project
                    </DialogTitle>
                    <DialogDescription>
                        Enter the details for the new project. Projects help organize related tasks for a client.
                    </DialogDescription>
                </DialogHeader>
                <ProjectForm
                    clients={clients}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    isSubmitting={isSubmitting}
                />
            </DialogContent>
        </Dialog>
    )
}
