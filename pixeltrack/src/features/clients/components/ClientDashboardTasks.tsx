import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskStatusBadge } from '@/components/status'
import { CheckSquare } from 'lucide-react'
import type { Task } from '@/types'

interface ClientDashboardTasksProps {
    tasks: Task[]
    isLoading: boolean
    onViewTask: (taskId: string) => void
}

export function ClientDashboardTasks({ tasks, isLoading, onViewTask }: ClientDashboardTasksProps) {
    return (
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
                                        <TaskStatusBadge status={task.status} />
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">
                                        Due {new Date(task.dueDate).toLocaleDateString()}
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
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h3>
                        <p className="text-slate-500">Your projects will appear here once tasks are created.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
