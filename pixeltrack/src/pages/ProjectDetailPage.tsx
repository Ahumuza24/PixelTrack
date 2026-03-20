import { useParams } from 'react-router-dom'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { useProjectDetail } from '@/features/projects/hooks/useProjectDetail'
import { ProjectDetailHeader } from '@/features/projects/components/ProjectDetailHeader'
import { ProjectOverviewCard } from '@/features/projects/components/ProjectOverviewCard'
import { ProjectProgressCard } from '@/features/projects/components/ProjectProgressCard'
import { ProjectTasksCard } from '@/features/projects/components/ProjectTasksCard'
import { ProjectClientCard } from '@/features/projects/components/ProjectClientCard'
import { ProjectTimelineCard } from '@/features/projects/components/ProjectTimelineCard'
import { ProjectForm } from '@/features/projects/components/ProjectForm'

export function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>()
    const {
        project,
        clients,
        employees,
        projectTasks,
        projectProgress,
        taskStats,
        clientName,
        statusMeta,
        formatDate,
        taskFormInitialValues,
        isLoading,
        mutationState,
        dialogState,
        handlers,
    } = useProjectDetail(projectId)

    const {
        isEditOpen,
        openEditDialog,
        closeEditDialog,
        isDeleteOpen,
        openDeleteDialog,
        closeDeleteDialog,
        isTaskFormOpen,
        openTaskForm,
        closeTaskForm,
    } = dialogState

    const { isUpdating, isDeleting, isCreatingTask } = mutationState

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64 bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-background text-foreground">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Project not found</h2>
                <p className="text-muted-foreground mt-2">The project you're looking for doesn't exist.</p>
                <Button onClick={handlers.handleBack} className="mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Projects
                </Button>
            </div>
        )
    }

    const projectFormInitialValues = project
        ? {
              title: project.title,
              description: project.description ?? '',
              clientId: project.clientId,
              status: project.status,
              dueDate: project.dueDate ?? '',
          }
        : undefined

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground">
            <ProjectDetailHeader
                title={project.title}
                clientName={clientName}
                status={statusMeta}
                onBack={handlers.handleBack}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
            />

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <ProjectOverviewCard project={project} statusMeta={statusMeta} formatDate={formatDate} />
                        <ProjectProgressCard progress={projectProgress} taskStats={taskStats} />
                        <ProjectTasksCard
                            tasks={projectTasks}
                            onAddTask={openTaskForm}
                            onTaskSelect={handlers.handleTaskSelect}
                        />
                    </div>
                    <div className="space-y-6">
                        <ProjectClientCard clientName={clientName} onViewClient={handlers.handleViewClient} />
                        <ProjectTimelineCard
                            startDate={project.startDate}
                            dueDate={project.dueDate}
                            status={project.status}
                            formatDate={formatDate}
                        />
                    </div>
                </div>
            </div>

            <Dialog open={isEditOpen} onOpenChange={(open) => (open ? openEditDialog() : closeEditDialog())}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>Update the project details below.</DialogDescription>
                    </DialogHeader>
                    {project && (
                        <ProjectForm
                            clients={clients}
                            initialData={projectFormInitialValues}
                            onSubmit={handlers.handleUpdateProject}
                            onCancel={closeEditDialog}
                            isSubmitting={isUpdating}
                            isEditing
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteOpen} onOpenChange={(open) => (open ? openDeleteDialog() : closeDeleteDialog())}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{project.title}</strong>? This will also remove all associated
                            tasks. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlers.handleDeleteProject}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isTaskFormOpen} onOpenChange={(open) => (open ? openTaskForm() : closeTaskForm())}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                        <DialogDescription>Add a new task to this project.</DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        clients={clients}
                        projects={project ? [project] : []}
                        initialValues={taskFormInitialValues}
                        employees={employees}
                        onSubmit={handlers.handleCreateTask}
                        onCancel={closeTaskForm}
                        isSubmitting={isCreatingTask}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
