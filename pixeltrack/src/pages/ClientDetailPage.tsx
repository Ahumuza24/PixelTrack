import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Building2, FolderKanban, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { useClient } from '@/features/clients'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { ClientStatus, TaskStatus, TaskStatus as TaskStatusConst } from '@/types'
import { ROUTES } from '@/lib/constants'
import { TaskStatusBadge } from '@/components/status'

const clientStatusConfig: Record<ClientStatus, { label: string; className: string }> = {
    [ClientStatus.ACTIVE]: { label: 'Active', className: 'bg-green-100 text-green-700' },
    [ClientStatus.INACTIVE]: { label: 'Inactive', className: 'bg-slate-100 text-slate-700' },
    [ClientStatus.ARCHIVED]: { label: 'Archived', className: 'bg-gray-100 text-gray-700' },
}

export function ClientDetailPage() {
    const { clientId } = useParams<{ clientId: string }>()
    const navigate = useNavigate()

    const { data: client, isLoading: clientLoading } = useClient(clientId ?? null)
    const { data: clientTasks, isLoading: tasksLoading } = useTasksByClient(clientId ?? null)
    const { data: clientProjects, isLoading: projectsLoading } = useProjects(
        clientId ? { clientId } : undefined,
    )

    const taskStats = useMemo(() => {
        const base = {
            total: clientTasks?.length ?? 0,
            [TaskStatusConst.NOT_STARTED]: 0,
            [TaskStatusConst.IN_PROGRESS]: 0,
            [TaskStatusConst.IN_REVIEW]: 0,
            [TaskStatusConst.COMPLETE]: 0,
            [TaskStatusConst.BLOCKED]: 0,
        }

        clientTasks?.forEach((task) => {
            base[task.status as TaskStatus] += 1
        })

        return base
    }, [clientTasks])

    if (clientLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-cobalt" />
            </div>
        )
    }

    if (!client) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mb-4" />
                <h1 className="text-2xl font-semibold text-slate-900">Client not found</h1>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                    We couldn't find the client you're looking for. It may have been deleted or you might have an outdated
                    link.
                </p>
                <Button className="mt-6" onClick={() => navigate(ROUTES.ADMIN_CLIENTS)}>
                    Return to Client Directory
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f5f7f8]">
            <header className="border-b border-slate-200 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-500 leading-tight">Client Details</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <div>
                    <p className="text-xs uppercase text-slate-500">Client</p>
                    <h1 className="text-3xl font-bold text-slate-900 leading-tight">{client.name}</h1>
                </div>
                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <h2 className="text-lg font-semibold text-slate-900">Project Overview</h2>
                            <p className="text-sm text-slate-500 mb-6">
                                Current project progress.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-xs uppercase text-slate-500">Active Projects</p>
                                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                                        {clientProjects?.filter((project) => project.status === 'active').length ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-xs uppercase text-slate-500">Total Projects</p>
                                    <p className="text-2xl font-semibold text-slate-900 mt-2">{clientProjects?.length ?? 0}</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <p className="text-xs uppercase text-slate-500">Open Tasks</p>
                                    <p className="text-2xl font-semibold text-slate-900 mt-2">
                                        {taskStats.total - taskStats[TaskStatusConst.COMPLETE]}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid sm:grid-cols-5 gap-3">
                                {(
                                    [
                                        TaskStatusConst.NOT_STARTED,
                                        TaskStatusConst.IN_PROGRESS,
                                        TaskStatusConst.IN_REVIEW,
                                        TaskStatusConst.BLOCKED,
                                        TaskStatusConst.COMPLETE,
                                    ] as TaskStatus[]
                                ).map((status) => (
                                    <div key={status} className="rounded-xl border border-slate-200 p-3">
                                        <p className="text-xs uppercase text-slate-500">
                                            <TaskStatusBadge status={status} />
                                        </p>
                                        <p className="text-lg font-semibold text-slate-900 mt-1">{taskStats[status]}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-slate-900">Primary Details</h2>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-white/10 text-cobalt flex items-center justify-center">
                                    {client.logoUrl ? (
                                            <img
                                                src={client.logoUrl}
                                                alt={`${client.name} logo`}
                                                className="w-10 h-10 object-contain rounded-lg border border-blue-300"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                </div>
                                <div>
                                    
                                    <p className="text-base font-semibold text-slate-900">{client.name}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-slate-500">Primary Contact</p>
                                <p className="text-base font-semibold text-slate-900">{client.primaryContact}</p>
                                <p className="text-sm text-slate-500">{client.email}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-slate-500">Status</p>
                                <Badge className={clientStatusConfig[client.status].className}>
                                    {clientStatusConfig[client.status].label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-slate-500">Member Since</p>
                                <p className="text-base font-semibold text-slate-900">
                                    {new Date(client.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Tasks </h2>
                                    <p className="text-sm text-slate-500">
                                        Past and current tasks for {client.name}.
                                    </p>
                                </div>
                                <Badge variant="secondary">{taskStats.total} tasks</Badge>
                            </div>

                            {tasksLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : clientTasks && clientTasks.length > 0 ? (
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead>Title</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Priority</TableHead>
                                                <TableHead>Due</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {clientTasks.map((task) => (
                                                <TableRow
                                                    key={task.id}
                                                    className="hover:bg-slate-50 cursor-pointer"
                                                    onClick={() => navigate(ROUTES.TASK_DETAIL.replace(':taskId', task.id))}
                                                >
                                                    <TableCell className="font-medium text-slate-900">
                                                        {task.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <TaskStatusBadge status={task.status} />
                                                    </TableCell>
                                                    <TableCell className="capitalize text-slate-600">
                                                        {task.priority.replace('_', ' ')}
                                                    </TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                                    <p className="text-sm text-slate-500">No tasks recorded yet for this client.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">{client.name}'s Projects</h2>
                                    <p className="text-sm text-slate-500">Active and archived projects.</p>
                                </div>
                                <Badge variant="secondary">{clientProjects?.length ?? 0} total</Badge>
                            </div>

                            {projectsLoading ? (
                                <div className="flex items-center justify-center py-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                </div>
                            ) : clientProjects && clientProjects.length > 0 ? (
                                <div className="space-y-4">
                                    {clientProjects.map((project) => (
                                        <button
                                            key={project.id}
                                            className="w-full text-left rounded-2xl border border-slate-200 p-4 hover:border-cobalt/50 transition-all"
                                            onClick={() => navigate(ROUTES.ADMIN_PROJECT_DETAIL.replace(':projectId', project.id))}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                                        <FolderKanban className="w-4 h-4 text-cobalt" />
                                                        {project.title}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'TBD'}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="capitalize">
                                                    {project.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                                    <p className="text-sm text-slate-500">No projects currently linked to this client.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </main>
        </div>
    )
}
