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

import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
    ArrowLeft,
    Calendar,
    Users,
    Building2,
    Clock,
    Edit2,
    Trash2,
    CheckSquare,
} from 'lucide-react'
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
import { useTask, useUpdateTask, useDeleteTask } from '@/features/tasks/hooks/useTasks'
import { useTaskFiles } from '@/features/tasks/hooks/useTaskFiles'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useAuth } from '@/features/auth/useAuth'
import { UserRole, getTaskProgress } from '@/types'
import { TaskFilesSection } from '@/features/tasks/components/TaskFilesSection'
import { TaskCommentsSection } from '@/features/tasks/components/TaskCommentsSection'
import { TaskForm } from '@/features/tasks/components/TaskForm'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import { TaskStatusBadge } from '@/components/status'

export function TaskDetailPage() {
    const { taskId } = useParams<{ taskId: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: task, isLoading } = useTask(taskId || null)
    const { data: clients } = useClients()
    const { data: users } = useUsers()
    const { data: projects } = useProjects()
    const { data: taskFiles, isLoading: isTaskFilesLoading } = useTaskFiles(task?.id ?? null)
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    // Loading state
    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="min-h-screen bg-slate-50 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                            <div className="h-12 w-3/4 bg-slate-200 rounded animate-pulse mb-4" />
                            <div className="h-32 bg-slate-100 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    // Task not found
    if (!task) {
        return (
            <SidebarLayout>
                <div className="min-h-screen bg-slate-50 p-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <CheckSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Task Not Found</h1>
                        <p className="text-slate-500 mb-4">The task you are looking for does not exist.</p>
                        <Button onClick={() => navigate(-1)}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>
                </div>
            </SidebarLayout>
        )
    }

    // Get related data now that task exists
    const client = clients?.find((c) => c.id === task.clientId)
    const assignees = users?.filter((u) => task.assignees.includes(u.uid)) || []
    const employees = users?.filter((u) => u.role !== UserRole.CLIENT) || []
    const project = projects?.find((p) => p.id === task.projectId)

    const canEdit = user?.role === UserRole.ADMIN ||
        (user?.role === UserRole.EMPLOYEE && task.assignees.includes(user.uid))

    const handleEditSubmit = async (values: TaskFormValues) => {
        await updateTask.mutateAsync({ id: task.id, ...values })
        setIsEditOpen(false)
    }

    const canManageFiles = Boolean(
        user && (
            user.role === UserRole.ADMIN ||
            (user.role === UserRole.EMPLOYEE && task.assignees.includes(user.uid))
        ),
    )

    const progressPercent = getTaskProgress(task.status)

    return (
        <SidebarLayout>
            <div className="min-h-screen bg-gradient-to-b from-[#f4f7fb] via-white to-white">
                <div className="bg-white/80 border-b border-slate-200 backdrop-blur">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Task Detail</p>
                        </div>
                        {canEdit && (
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => setIsDeleteOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">


                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{task.title}</h1>
                        <p className="text-base text-slate-600 mt-3 whitespace-pre-wrap">
                            {task.description || 'No description added yet.'}
                        </p>
                    </div>
                    <section className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <Calendar className="w-5 h-5 text-cobalt" />
                                <span className="text-sm font-semibold text-slate-500">Due Date</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900">
                                {new Date(task.dueDate).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">Stay on track to avoid slipping deadlines.</p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <CheckSquare className="w-4 h-4" />
                                    Progress
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{progressPercent}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full bg-cobalt rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
                                <span>Current status:</span>
                                <TaskStatusBadge status={task.status} />
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <Building2 className="w-5 h-5 text-cobalt" />
                                <span className="text-sm font-semibold text-slate-500">Client</span>
                            </div>
                            <p className="text-lg font-semibold text-slate-900">{client?.name || 'Unknown Client'}</p>
                            <p className="text-xs text-slate-500 mt-2">
                                {project ? `Part of ${project.title}` : 'Standalone task'}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Design Files</h2>
                                        <p className="text-sm text-slate-500">Uploads and external links shared with the client.</p>
                                    </div>
                                    <Badge variant="secondary">{taskFiles?.length ?? 0} files</Badge>
                                </div>
                                <TaskFilesSection
                                    taskId={task.id}
                                    files={taskFiles}
                                    isLoading={isTaskFilesLoading}
                                    canManageFiles={canManageFiles}
                                    currentUserId={user?.uid ?? null}
                                    currentUserRole={user?.role ?? UserRole.CLIENT}
                                />
                            </div>

                            <TaskCommentsSection
                                taskId={task.id}
                                users={users || []}
                                currentUser={user}
                            />

                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-cobalt" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Activity Highlights</h3>
                                        <p className="text-sm text-slate-500">Automatic snapshots of key events.</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-cobalt" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Task created</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(task.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Last updated</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(task.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Current status</p>
                                            <TaskStatusBadge status={task.status} className="mt-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">


                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Users className="w-5 h-5 text-cobalt" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Team</h3>
                                        <p className="text-sm text-slate-500">{assignees.length} assignee(s)</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {assignees.length > 0 ? (
                                        assignees.map((assignee) => (
                                            <div
                                                key={assignee.uid}
                                                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-cobalt text-white text-xs font-semibold flex items-center justify-center">
                                                    {assignee.displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-medium text-slate-800">
                                                    {assignee.displayName}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">No assignees yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5 text-cobalt" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
                                        <p className="text-sm text-slate-500">Key timestamps</p>
                                    </div>
                                </div>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-slate-500">Created</dt>
                                        <dd className="font-medium text-slate-900">
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-slate-500">Last Updated</dt>
                                        <dd className="font-medium text-slate-900">
                                            {new Date(task.updatedAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </section>
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                            <DialogDescription>Update the task details below.</DialogDescription>
                        </DialogHeader>
                        <TaskForm
                            task={task}
                            clients={clients || []}
                            projects={projects || []}
                            employees={employees}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setIsEditOpen(false)}
                            isSubmitting={updateTask.isPending}
                        />
                    </DialogContent>
                </Dialog>

                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete <strong>{task.title}</strong>? This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={async () => {
                                    await deleteTask.mutateAsync(task.id)
                                    setIsDeleteOpen(false)
                                    navigate('/admin/tasks')
                                }}
                            >
                                {deleteTask.isPending ? 'Deleting…' : 'Delete Task'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </SidebarLayout>
    )
}
