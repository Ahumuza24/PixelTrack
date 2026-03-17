import type { ReactNode } from 'react'
import type { TaskStatus } from '@/types'
import { TASK_STATUS_CONFIG } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TaskStatusBadgeProps {
    status: TaskStatus
    className?: string
    children?: ReactNode
    showDot?: boolean
}

export function TaskStatusBadge({ status, className, children, showDot = false }: TaskStatusBadgeProps) {
    const config = TASK_STATUS_CONFIG[status]

    if (!config) {
        return null
    }

    return (
        <Badge className={cn(config.badgeClass, className)}>
            {showDot && <span className={cn('inline-flex h-2 w-2 rounded-full', config.dotClass)} />}
            <span className={showDot ? 'ml-1.5' : undefined}>{children ?? config.label}</span>
        </Badge>
    )
}
