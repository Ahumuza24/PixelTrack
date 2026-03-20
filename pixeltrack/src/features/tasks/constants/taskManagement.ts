import { CheckCircle, Clock, Eye, AlertCircle } from 'lucide-react'
import type { TaskPriority, TaskStatus } from '@/types'

export type TaskFilterTab = 'all' | 'my-tasks' | 'due-soon' | 'high-priority'
export type TaskViewMode = 'list' | 'kanban'

export const TASK_ITEMS_PER_PAGE = 10

export const TASK_FILTER_TABS: { id: TaskFilterTab; label: string }[] = [
    { id: 'all', label: 'All Tasks' },
    { id: 'my-tasks', label: 'My Tasks' },
    { id: 'due-soon', label: 'Due Soon' },
    { id: 'high-priority', label: 'High Priority' },
]

export const TASK_STATUS_CONFIG: Record<
    TaskStatus,
    { label: string; bgClass: string; textClass: string; icon: typeof Clock | typeof Eye | typeof CheckCircle | typeof AlertCircle }
> = {
    not_started: {
        label: 'To Do',
        bgClass: 'bg-muted/70',
        textClass: 'text-muted-foreground',
        icon: Clock,
    },
    in_progress: {
        label: 'In Progress',
        bgClass: 'bg-primary/10',
        textClass: 'text-primary',
        icon: Clock,
    },
    in_review: {
        label: 'Review',
        bgClass: 'bg-accent/20',
        textClass: 'text-accent-foreground',
        icon: Eye,
    },
    complete: {
        label: 'Complete',
        bgClass: 'bg-emerald-500/15',
        textClass: 'text-emerald-500',
        icon: CheckCircle,
    },
    blocked: {
        label: 'Blocked',
        bgClass: 'bg-destructive/15',
        textClass: 'text-destructive',
        icon: AlertCircle,
    },
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; colorClass: string }> = {
    low: { label: 'Low', colorClass: 'text-muted-foreground' },
    medium: { label: 'Medium', colorClass: 'text-blue-500' },
    high: { label: 'High', colorClass: 'text-orange-500' },
    urgent: { label: 'Urgent', colorClass: 'text-destructive' },
}
