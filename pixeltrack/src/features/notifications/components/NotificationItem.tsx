import { Check } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '@/features/notifications/constants'
import type { Notification } from '@/types'

interface NotificationItemProps {
    notification: Notification
    onClick: () => void
    onMarkAsRead?: (e: React.MouseEvent) => void
}

export function NotificationItem({ notification, onClick, onMarkAsRead }: NotificationItemProps) {
    const Icon = NOTIFICATION_ICONS[notification.type]
    const colorClass = NOTIFICATION_COLORS[notification.type]
    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })

    return (
        <DropdownMenuItem
            className={`flex items-start gap-3 p-3 cursor-pointer ${
                notification.isRead ? 'opacity-60' : ''
            }`}
            onClick={onClick}
        >
            <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{timeAgo}</p>
            </div>
            {!notification.isRead && onMarkAsRead && (
                <button
                    onClick={onMarkAsRead}
                    className="p-1 rounded hover:bg-muted shrink-0"
                    aria-label="Mark as read"
                    title="Mark as read"
                >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                </button>
            )}
            {notification.isRead && (
                <Check className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            )}
        </DropdownMenuItem>
    )
}
