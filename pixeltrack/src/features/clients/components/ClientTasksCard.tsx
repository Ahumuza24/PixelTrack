import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TaskStatusBadge } from '@/components/status'
import type { Task } from '@/types'

interface ClientTasksCardProps {
    clientName: string
    tasks: Task[]
    isLoading: boolean
    onSelectTask: (taskId: string) => void
}

export function ClientTasksCard({ clientName, tasks, isLoading, onSelectTask }: ClientTasksCardProps) {
    return (
        <Card className="shadow-sm bg-card border border-border">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
                        <p className="text-sm text-muted-foreground">Past and current tasks for {clientName}.</p>
                    </div>
                    <Badge variant="secondary">{tasks.length} tasks</Badge>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="rounded-xl border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/60">
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Due</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => (
                                    <TableRow
                                        key={task.id}
                                        className="hover:bg-muted/40 cursor-pointer"
                                        onClick={() => onSelectTask(task.id)}
                                    >
                                        <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                                        <TableCell>
                                            <TaskStatusBadge status={task.status} />
                                        </TableCell>
                                        <TableCell className="capitalize text-muted-foreground">
                                            {task.priority.replace('_', ' ')}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'TBD'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center">
                        <p className="text-sm text-muted-foreground">No tasks recorded yet for this client.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
