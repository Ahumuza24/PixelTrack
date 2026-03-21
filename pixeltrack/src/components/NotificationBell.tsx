import { useState } from 'react'
import { Bell, Check, Loader2, AlertCircle, FileUp, MessageSquare, UserCheck, RefreshCw, CheckCheck } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAdminActivityFeed } from '@/features/admin/hooks/useAdminActivityFeed'
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/features/notifications/hooks/useMarkAsRead'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { Notification, NotificationType } from '@/types'

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
    task_assigned: UserCheck,
    task_status_updated: RefreshCw,
    comment_added: MessageSquare,
    file_uploaded: FileUp,
    annotation_submitted: AlertCircle,
    report_ready: Check,
    system: Bell,
}

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    task_assigned: 'text-blue-500 bg-blue-50',
    task_status_updated: 'text-amber-500 bg-amber-50',
    comment_added: 'text-purple-500 bg-purple-50',
    file_uploaded: 'text-green-500 bg-green-50',
    annotation_submitted: 'text-orange-500 bg-orange-50',
    report_ready: 'text-emerald-500 bg-emerald-50',
    system: 'text-gray-500 bg-gray-50',
}

interface NotificationItemProps {
    notification: Notification
    onClick: () => void
    onMarkAsRead?: (e: React.MouseEvent) => void
}

function NotificationItem({ notification, onClick, onMarkAsRead }: NotificationItemProps) {
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

interface NotificationBellProps {
    overdueCount?: number
}

export function NotificationBell({ overdueCount = 0 }: NotificationBellProps) {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { data: notifications = [], isLoading, isError } = useAdminActivityFeed({ limit: 10 })
    const markAsRead = useMarkNotificationAsRead()
    const markAllAsRead = useMarkAllNotificationsAsRead()

    const unreadCount = notifications.filter((n) => !n.isRead).length
    const displayCount = unreadCount > 0 ? unreadCount : overdueCount

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead.mutate(notification.id)
        }
        setOpen(false)
        if (notification.actionUrl) {
            navigate(notification.actionUrl)
        }
    }

    const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        markAsRead.mutate(notificationId)
    }

    const handleMarkAllAsRead = () => {
        markAllAsRead.mutate()
    }

    const handleViewAll = () => {
        setOpen(false)
        navigate('/notifications')
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative rounded-lg hover:bg-muted/60"
                >
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {displayCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                            {displayCount > 99 ? '99+' : displayCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80 max-h-96 overflow-y-auto"
                sideOffset={8}
            >
                <DropdownMenuLabel className="flex items-center justify-between py-2">
                    <span className="font-semibold">Notifications</span>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <>
                                <span className="text-xs text-primary font-medium">
                                    {unreadCount} unread
                                </span>
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={markAllAsRead.isPending}
                                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                                    aria-label="Mark all as read"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <AlertCircle className="w-5 h-5 text-destructive mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Failed to load notifications
                        </p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <Bell className="w-8 h-8 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            New activity will appear here
                        </p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={() => handleNotificationClick(notification)}
                                onMarkAsRead={(e) => handleMarkAsRead(e, notification.id)}
                            />
                        ))}
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="justify-center text-sm text-primary cursor-pointer"
                    onClick={handleViewAll}
                >
                    View all notifications
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
