import { useNavigate } from 'react-router-dom'
import { CheckSquare, Clock, CheckCircle2, Building2 } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TaskStatus } from '@/types'
import { TaskStatus as TaskStatusConst } from '@/types'

const statusLabels: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'Not Started',
    [TaskStatusConst.IN_PROGRESS]: 'In Progress',
    [TaskStatusConst.IN_REVIEW]: 'In Review',
    [TaskStatusConst.COMPLETE]: 'Complete',
    [TaskStatusConst.BLOCKED]: 'Blocked',
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatusConst.NOT_STARTED]: 'bg-slate-100 text-slate-700',
    [TaskStatusConst.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TaskStatusConst.IN_REVIEW]: 'bg-yellow-100 text-yellow-700',
    [TaskStatusConst.COMPLETE]: 'bg-green-100 text-green-700',
    [TaskStatusConst.BLOCKED]: 'bg-red-100 text-red-700',
}

/**
 * ClientDashboardPage - Dashboard for clients showing their company tasks
 *
 * Route: /client
 * Access: Client only
 */
export function ClientDashboardPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const clientId = user?.clientId || null
    const { data: tasks, isLoading } = useTasksByClient(clientId)
    const { data: clients } = useClients()

    const client = clients?.find((c) => c.id === clientId)

    const stats = {
        total: tasks?.length || 0,
        inProgress: tasks?.filter((t) => t.status === TaskStatusConst.IN_PROGRESS).length || 0,
        inReview: tasks?.filter((t) => t.status === TaskStatusConst.IN_REVIEW).length || 0,
        complete: tasks?.filter((t) => t.status === TaskStatusConst.COMPLETE).length || 0,
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cobalt rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {client?.name || 'Client Portal'}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Welcome back, {user?.displayName || 'Client'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-cobalt" />
                                <span className="text-2xl font-bold">{stats.total}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-blue-600" />
                                <span className="text-2xl font-bold">{stats.inProgress}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">In Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-600" />
                                <span className="text-2xl font-bold">{stats.inReview}</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Complete</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-green-600" />
                                <span className="text-2xl font-bold">{stats.complete}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Your Project Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : tasks && tasks.length > 0 ? (
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                                        onClick={() => navigate(`/tasks/${task.id}`)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-slate-900 truncate">{task.title}</h3>
                                                <Badge className={statusColors[task.status]}>
                                                    {statusLabels[task.status]}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">
                                                Due {new Date(task.dueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm">View</Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
                                <p className="text-slate-500">
                                    Your projects will appear here once tasks are created.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
