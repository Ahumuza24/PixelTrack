import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare } from 'lucide-react'
import type { EmployeeDashboardTask } from '@/features/users/hooks/useEmployeeDashboard'
import { TaskStatus } from '@/types'

const statusLabels: Record<TaskStatus, string> = {
    [TaskStatus.NOT_STARTED]: 'Not Started',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.IN_REVIEW]: 'In Review',
    [TaskStatus.COMPLETE]: 'Complete',
    [TaskStatus.BLOCKED]: 'Blocked',
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.NOT_STARTED]: 'bg-slate-100 text-slate-700',
    [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
    [TaskStatus.IN_REVIEW]: 'bg-yellow-100 text-yellow-700',
    [TaskStatus.COMPLETE]: 'bg-green-100 text-green-700',
    [TaskStatus.BLOCKED]: 'bg-red-100 text-red-700',
}

interface EmployeeDashboardTasksProps {
    tasks: EmployeeDashboardTask[]
    isLoading: boolean
    onViewTask: (taskId: string) => void
}

export function EmployeeDashboardTasks({ tasks, isLoading, onViewTask }: EmployeeDashboardTasksProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div
                                key={task.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-medium text-slate-900 truncate">{task.title}</h3>
                                        <Badge className={statusColors[task.status]}>{statusLabels[task.status]}</Badge>
                                        {task.isOverdue && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">
                                    {task.clientName ?? 'Unassigned client'} • Due {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => onViewTask(task.id)}>
                                    View
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks assigned</h3>
                        <p className="text-slate-500">You don't have any tasks assigned to you yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
