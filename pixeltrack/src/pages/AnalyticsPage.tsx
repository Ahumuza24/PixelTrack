import { useMemo } from 'react'
import { CheckSquare, Users, Building2, TrendingUp, AlertCircle, Download, Bell, Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients/hooks/useClients'
import { useUsers } from '@/features/users/hooks/useUsers'
import { TaskPriority, TaskStatus, UserRole } from '@/types'

const statusConfig: Record<TaskStatus, { label: string; bg: string; color: string }> = {
    [TaskStatus.NOT_STARTED]: { label: 'To Do', bg: 'bg-slate-100', color: 'text-slate-600' },
    [TaskStatus.IN_PROGRESS]: { label: 'In Progress', bg: 'bg-blue-100', color: 'text-blue-600' },
    [TaskStatus.IN_REVIEW]: { label: 'Review', bg: 'bg-indigo-100', color: 'text-indigo-600' },
    [TaskStatus.COMPLETE]: { label: 'Complete', bg: 'bg-green-100', color: 'text-green-600' },
    [TaskStatus.BLOCKED]: { label: 'Blocked', bg: 'bg-red-100', color: 'text-red-600' },
}

export function AnalyticsPage() {
    const { data: tasks, isLoading: tasksLoading } = useTasks()
    const { data: clients, isLoading: clientsLoading } = useClients()
    const { data: users, isLoading: usersLoading } = useUsers()

    const isLoading = tasksLoading || clientsLoading || usersLoading

    const metrics = useMemo(() => {
        if (!tasks || !clients || !users) {
            return {
                totalTasks: 0,
                completedTasks: 0,
                inProgressTasks: 0,
                highPriorityTasks: 0,
                overdueTasks: 0,
                completionRate: 0,
                recentCompleted: 0,
                totalClients: 0,
                totalEmployees: 0,
                tasksByStatus: {} as Record<TaskStatus, number>,
            }
        }

        const totalTasks = tasks.length
        const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETE).length
        const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
        const highPriorityTasks = tasks.filter((t) => t.priority === TaskPriority.HIGH || t.priority === TaskPriority.URGENT).length
        const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETE).length
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        // Tasks completed in last 7 days
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const recentCompleted = tasks.filter((t) => t.status === TaskStatus.COMPLETE && new Date(t.updatedAt) > oneWeekAgo).length

        const tasksByStatus = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1
            return acc
        }, {} as Record<TaskStatus, number>)

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            highPriorityTasks,
            overdueTasks,
            completionRate,
            recentCompleted,
            totalClients: clients.length,
            totalEmployees: users.filter((u) => u.role !== UserRole.CLIENT).length,
            tasksByStatus,
        }
    }, [tasks, clients, users])

    const getOverdueCount = () => {
        return tasks?.filter((t) => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.COMPLETE).length || 0
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f7f8]">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative w-full">
                        <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search analytics..."
                            className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-[#0048ad]/50 focus:outline-none"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
                        <Bell className="w-5 h-5" />
                        {getOverdueCount() > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {getOverdueCount()}
                            </span>
                        )}
                    </button>
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0048ad]" />
                    </div>
                ) : (
                    <>
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Total Tasks</p>
                                            <p className="text-2xl font-bold">{metrics.totalTasks}</p>
                                        </div>
                                        <CheckSquare className="w-8 h-8 text-[#0048ad]" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Completion Rate</p>
                                            <p className="text-2xl font-bold">{metrics.completionRate}%</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-green-500" />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{metrics.recentCompleted} completed this week</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">High Priority</p>
                                            <p className="text-2xl font-bold">{metrics.highPriorityTasks}</p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-orange-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-500">Overdue</p>
                                            <p className={`text-2xl font-bold ${metrics.overdueTasks > 0 ? 'text-red-600' : ''}`}>
                                                {metrics.overdueTasks}
                                            </p>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {/* Tasks by Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tasks by Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {Object.entries(statusConfig).map(([status, config]) => {
                                            const count = metrics.tasksByStatus[status as TaskStatus] || 0
                                            const percentage = metrics.totalTasks > 0 ? Math.round((count / metrics.totalTasks) * 100) : 0
                                            return (
                                                <div key={status} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${config.bg.replace('bg-', 'bg-').replace('100', '500')}`} />
                                                        <span className="text-sm text-slate-600">{config.label}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${config.bg.replace('100', '500')}`} style={{ width: `${percentage}%` }} />
                                                        </div>
                                                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Team Overview */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Team Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users className="w-5 h-5 text-[#0048ad]" />
                                                <span className="text-sm text-slate-600">Employees</span>
                                            </div>
                                            <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 className="w-5 h-5 text-green-500" />
                                                <span className="text-sm text-slate-600">Clients</span>
                                            </div>
                                            <p className="text-2xl font-bold">{metrics.totalClients}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckSquare className="w-5 h-5 text-blue-500" />
                                                <span className="text-sm text-slate-600">In Progress</span>
                                            </div>
                                            <p className="text-2xl font-bold">{metrics.inProgressTasks}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-5 h-5 text-purple-500" />
                                                <span className="text-sm text-slate-600">Completed</span>
                                            </div>
                                            <p className="text-2xl font-bold">{metrics.completedTasks}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
