import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import type { Client } from '@/types'
import type { ProjectWithClientAndAnalytics } from '@/types'
import type { ProjectFormValues } from '@/features/projects/components/ProjectForm'
import { ProjectForm } from '@/features/projects/components/ProjectForm'
import { FolderOpen } from 'lucide-react'

interface ProjectEditDialogProps {
    project: ProjectWithClientAndAnalytics | null
    clients: Client[]
    initialValues?: ProjectFormValues
    isSubmitting: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (values: ProjectFormValues) => void
    onCancel: () => void
}

export function ProjectEditDialog({
    project,
    clients,
    initialValues,
    isSubmitting,
    onOpenChange,
    onSubmit,
    onCancel,
}: ProjectEditDialogProps) {
    const open = Boolean(project)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-primary" />
                        Edit Project
                    </DialogTitle>
                    <DialogDescription>Update the project details below.</DialogDescription>
                </DialogHeader>
                {project ? (
                    <ProjectForm
                        clients={clients}
                        initialData={initialValues}
                        onSubmit={onSubmit}
                        onCancel={onCancel}
                        isSubmitting={isSubmitting}
                        isEditing
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
