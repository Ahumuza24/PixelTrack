import { CheckSquare, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Task } from '@/types'
import { TaskStatus } from '@/types'

interface ProjectTasksCardProps {
    tasks: Task[]
    onAddTask: () => void
    onTaskSelect: (taskId: string) => void
}

export function ProjectTasksCard({ tasks, onAddTask, onTaskSelect }: ProjectTasksCardProps) {
    return (
        <Card className="bg-card border border-border">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Tasks</h3>
                    <Button onClick={onAddTask} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>

                {tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/60" />
                        <p>No tasks yet. Add your first task to this project!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <button
                                key={task.id}
                                type="button"
                                className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted text-left"
                                onClick={() => onTaskSelect(task.id)}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`}
                                        aria-hidden
                                    />
                                    <div>
                                        <p className="font-medium text-sm text-foreground">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Due: {new Date(task.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={getPriorityBadge(task.priority)}>
                                    {task.priority}
                                </Badge>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function getStatusColor(status: string) {
    if (status === TaskStatus.COMPLETE) return 'bg-emerald-500'
    if (status === TaskStatus.IN_PROGRESS) return 'bg-blue-500'
    if (status === TaskStatus.BLOCKED) return 'bg-destructive'
    return 'bg-slate-400'
}

function getPriorityBadge(priority: string) {
    if (priority === 'urgent') return 'border-destructive/60 text-destructive'
    if (priority === 'high') return 'border-orange-300 text-orange-600'
    return 'border-border text-muted-foreground'
}
