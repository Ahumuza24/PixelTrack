/**
 * TaskDetailPage - Detailed view of a single task
 *
 * @module pages/TaskDetailPage
 * @description Full task detail view with activity timeline, comments,
 * file attachments, and annotation count. Accessible by all roles
 * with appropriate visibility restrictions.
 *
 * Route: /tasks/:taskId
 */

import { useParams } from 'react-router-dom'
import { Calendar, Users, Building2, Clock, CheckSquare, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { TaskFilesSection } from '@/features/tasks/components/TaskFilesSection'
import { TaskCommentsSection } from '@/features/tasks/components/TaskCommentsSection'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { TaskStatusBadge } from '@/components/status'
import { useTaskDetail } from '@/features/tasks/hooks/useTaskDetail'
import { TaskDetailHeader } from '@/features/tasks/components/TaskDetailHeader'
import { UserRole } from '@/types'

export function TaskDetailPage() {
    const { taskId } = useParams<{ taskId: string }>()
    const {
        task,
        client,
        project,
        users,
        assignees,
        employees,
        taskFiles,
        isTaskFilesLoading,
        isLoading,
        notFound,
        progressPercent,
        canEdit,
        canManageFiles,
        dialogState,
        handlers,
        clients,
        projects,
        currentUser,
        mutationState,
    } = useTaskDetail(taskId)

    const {
        isEditOpen,
        openEditDialog,
        closeEditDialog,
        isDeleteOpen,
        openDeleteDialog,
        closeDeleteDialog,
    } = dialogState
    const { handleBack, handleEditSubmit, handleDeleteTask } = handlers

    // Loading state
    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="min-h-screen bg-background p-8">
                    <div className="max-w-5xl mx-auto space-y-4">
                        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                        <div className="bg-card rounded-xl shadow-sm border border-border p-8 space-y-4">
                            <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
                            <div className="h-32 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    // Task not found
    if (notFound || !task) {
        return (
            <SidebarLayout>
                <div className="min-h-screen bg-background p-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Task Not Found</h1>
                        <p className="text-muted-foreground mb-4">The task you are looking for does not exist.</p>
                        <Button onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    // Get related data now that task exists
    return (
        <SidebarLayout>
            <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
                <TaskDetailHeader
                    title={task.title}
                    onBack={handleBack}
                    canEdit={canEdit}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                    <div>
                        <p className="text-base text-muted-foreground whitespace-pre-wrap">
                            {task.description || 'No description added yet.'}
                        </p>
                    </div>
                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <Calendar className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold text-muted-foreground">Due Date</span>
                            </div>
                            <p className="text-lg font-semibold text-foreground">
                                {new Date(task.dueDate).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">Stay on track to avoid slipping deadlines.</p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <CheckSquare className="w-4 h-4" />
                                    Progress
                                </div>
                                <span className="text-sm font-semibold text-foreground">{progressPercent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                                <span>Current status:</span>
                                <TaskStatusBadge status={task.status} />
                            </p>
                        </div>

                        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <Building2 className="w-5 h-5 text-primary" />
                                <span className="text-sm font-semibold text-muted-foreground">Client</span>
                            </div>
                            <p className="text-lg font-semibold text-foreground">{client?.name || 'Unknown Client'}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                {project ? `Part of ${project.title}` : 'Standalone task'}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Design Files</h2>
                                        <p className="text-sm text-muted-foreground">Uploads and external links shared with the client.</p>
                                    </div>
                                    <Badge variant="secondary">{taskFiles?.length ?? 0} files</Badge>
                                </div>
                                <TaskFilesSection
                                    taskId={task.id}
                                    files={taskFiles}
                                    isLoading={isTaskFilesLoading}
                                    canManageFiles={canManageFiles}
                                    currentUserId={currentUser?.uid ?? null}
                                    currentUserRole={currentUser?.role ?? UserRole.CLIENT}
                                />
                            </div>

                            <TaskCommentsSection
                                taskId={task.id}
                                users={users || []}
                                currentUser={currentUser}
                            />

                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Activity Highlights</h3>
                                        <p className="text-sm text-muted-foreground">Automatic snapshots of key events.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Task created</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(task.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Last updated</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(task.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Current status</p>
                                            <TaskStatusBadge status={task.status} className=
"mt-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className="w-5 h-5 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Team</h3>
                                        <p className="text-sm text-muted-foreground">{assignees.length} assignee(s)</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {assignees.length > 0 ? (
                                        assignees.map((assignee) => (
                                            <div
                                                key={assignee.uid}
                                                className="flex items-center gap-2 rounded-full bg-muted px-3 py-1"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
                                                    {assignee.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-foreground">
                                                    {assignee.displayName}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No assignees yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">Timeline</h3>
                                        <p className="text-sm text-muted-foreground">Key timestamps</p>
                                    </div>
                                </div>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Created</dt>
                                        <dd className="font-medium text-foreground">
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Last Updated</dt>
                                        <dd className="font-medium text-foreground">
                                            {new Date(task.updatedAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </section>
                </div>

                <Dialog open={isEditOpen} onOpenChange={(open) => (open ? openEditDialog() : closeEditDialog())}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                            <DialogDescription>Update the task details below.</DialogDescription>
                        </DialogHeader>
                        <TaskForm
                            task={task}
                            clients={clients}
                            projects={projects}
                            employees={employees}
                            onSubmit={handleEditSubmit}
                            onCancel={closeEditDialog}
                            isSubmitting={mutationState.isUpdating}
                        />
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteOpen} onOpenChange={(open) => (open ? openDeleteDialog() : closeDeleteDialog())}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{task.title}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={closeDeleteDialog}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteTask}
                                disabled={mutationState.isDeleting}
                            >
                                {mutationState.isDeleting ? 'Deleting…' : 'Delete Task'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </SidebarLayout>
    )
}
