import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
    Bell, 
    CheckCheck, 
    MessageSquare, 
    FileText, 
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { useNotifications, NOTIFICATIONS_QUERY_KEY } from '@/features/notifications/hooks/useNotifications'
import type { NotificationFilterType } from '@/features/notifications/hooks/useNotifications'
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/features/notifications/hooks/useMarkAsRead'
import { useQueryClient } from '@tanstack/react-query'
import type { Notification, NotificationType } from '@/types'
import { formatRelativeTime } from '@/lib/formatters'

// ============================================================================
// Types
// ============================================================================

interface NotificationItemProps {
    notification: Notification
    onClick: () => void
    onMarkAsRead: (e: React.MouseEvent) => void
}

interface NotificationGroupProps {
    title: string
    notifications: Notification[]
    onNotificationClick: (notification: Notification) => void
    onMarkAsRead: (e: React.MouseEvent, notificationId: string) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'comment_added':
            return <MessageSquare className="w-5 h-5" />
        case 'file_uploaded':
            return <FileText className="w-5 h-5" />
        case 'task_assigned':
        case 'task_status_updated':
            return <CheckCircle2 className="w-5 h-5" />
        case 'annotation_submitted':
            return <AlertCircle className="w-5 h-5" />
        case 'report_ready':
            return <Bell className="w-5 h-5" />
        default:
            return <Bell className="w-5 h-5" />
    }
}

function getNotificationIconColor(type: NotificationType): string {
    switch (type) {
        case 'comment_added':
            return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
        case 'file_uploaded':
            return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
        case 'task_assigned':
            return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
        case 'task_status_updated':
            return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
        case 'annotation_submitted':
            return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
        case 'report_ready':
            return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
        default:
            return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    }
}

function groupNotificationsByDate(notifications: Notification[]) {
    const groups: Record<string, Notification[]> = {
        today: [],
        yesterday: [],
        lastWeek: [],
        older: []
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    notifications.forEach(notification => {
        const date = new Date(notification.createdAt)
        
        if (date >= today) {
            groups.today.push(notification)
        } else if (date >= yesterday) {
            groups.yesterday.push(notification)
        } else if (date >= lastWeek) {
            groups.lastWeek.push(notification)
        } else {
            groups.older.push(notification)
        }
    })

    return groups
}

// ============================================================================
// Sub-components
// ============================================================================

function NotificationItem({ notification, onClick, onMarkAsRead }: NotificationItemProps) {
    const isUnread = !notification.isRead
    const iconColorClass = getNotificationIconColor(notification.type)
    const actorName = notification.metadata?.actorName || 'Someone'
    
    return (
        <div 
            className={cn(
                "bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-start gap-4 hover:border-primary/50 transition-all group cursor-pointer",
                isUnread ? "border-l-4 border-l-primary" : "opacity-80 hover:opacity-100"
            )}
            onClick={onClick}
        >
            {/* Avatar/Icon */}
            <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", iconColorClass)}>
                {notification.metadata?.actorName ? (
                    <span className="text-sm font-bold">{actorName.charAt(0).toUpperCase()}</span>
                ) : (
                    getNotificationIcon(notification.type)
                )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{notification.title}</span>
                        {notification.body && (
                            <span className="text-slate-600 dark:text-slate-400"> {notification.body}</span>
                        )}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap pt-0.5">
                        {formatRelativeTime(notification.createdAt)}
                    </span>
                </div>
                
                {/* Metadata */}
                {notification.metadata?.taskTitle && (
                    <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Task: {notification.metadata.taskTitle}
                    </div>
                )}
                
                {/* Action Buttons */}
                {isUnread && (
                    <div className="mt-4 flex gap-2">
                        <Button 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={(e) => {
                                e.stopPropagation()
                                onClick()
                            }}
                        >
                            View Details
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={onMarkAsRead}
                        >
                            Mark as read
                        </Button>
                    </div>
                )}
            </div>
            
            {/* Unread indicator dot */}
            {isUnread && (
                <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
            )}
        </div>
    )
}

function NotificationGroup({ title, notifications, onNotificationClick, onMarkAsRead }: NotificationGroupProps) {
    if (notifications.length === 0) return null
    
    return (
        <section>
            <div className="flex items-center gap-4 mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h3>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="space-y-3">
                {notifications.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => onNotificationClick(notification)}
                        onMarkAsRead={(e) => onMarkAsRead(e, notification.id)}
                    />
                ))}
            </div>
        </section>
    )
}

// ============================================================================
// Main Component
// ============================================================================

export function NotificationsPage() {
    const [filter, setFilter] = useState<NotificationFilterType>('all')
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    
    const { data: notifications = [], isLoading, isError } = useNotifications({ filter })
    const markAsRead = useMarkNotificationAsRead()
    const markAllAsRead = useMarkAllNotificationsAsRead()
    
    // Group notifications by date
    const groupedNotifications = useMemo(() => 
        groupNotificationsByDate(notifications),
        [notifications]
    )
    
    // Calculate unread count
    const unreadCount = useMemo(() => 
        notifications.filter(n => !n.isRead).length,
        [notifications]
    )
    
    // Handle notification click
    const handleNotificationClick = useCallback((notification: Notification) => {
        if (!notification.isRead) {
            markAsRead.mutate(notification.id)
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl)
        }
    }, [markAsRead, navigate])
    
    // Handle mark as read
    const handleMarkAsRead = useCallback((e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation()
        markAsRead.mutate(notificationId)
    }, [markAsRead])
    
    // Handle mark all as read
    const handleMarkAllAsRead = useCallback(() => {
        markAllAsRead.mutate()
    }, [markAllAsRead])
    
    // Loading state
    if (isLoading) {
        return (
            <SidebarLayout>
                <div className="max-w-4xl mx-auto w-full p-6 md:p-8">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </SidebarLayout>
        )
    }
    
    return (
        <SidebarLayout>
            <div className="max-w-4xl mx-auto w-full p-6 md:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black tracking-tight">Activity Center</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Stay up to date with your team's progress and mentions.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0 || markAllAsRead.isPending}
                        className="flex items-center gap-2"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all as read
                    </Button>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-slate-200 dark:border-slate-800 mb-6">
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as NotificationFilterType)}>
                        <TabsList className="bg-transparent h-auto p-0 gap-8">
                            <TabsTrigger 
                                value="all"
                                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none pb-4 px-1 text-sm font-medium"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger 
                                value="unread"
                                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none pb-4 px-1 text-sm font-medium"
                            >
                                Unread
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="ml-2 text-[10px] px-1.5 py-0.5">
                                        {unreadCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger 
                                value="mentions"
                                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none pb-4 px-1 text-sm font-medium"
                            >
                                Mentions
                            </TabsTrigger>
                            <TabsTrigger 
                                value="projects"
                                className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none rounded-none pb-4 px-1 text-sm font-medium"
                            >
                                Projects
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                
                {/* Notifications List */}
                {isError ? (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Failed to load notifications.</p>
                        <Button 
                            variant="outline" 
                            onClick={() => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })}
                            className="mt-4"
                        >
                            Try again
                        </Button>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">
                            {filter === 'unread' 
                                ? 'No unread notifications.' 
                                : filter === 'mentions'
                                    ? 'No mentions found.'
                                    : 'No notifications yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <NotificationGroup
                            title="Today"
                            notifications={groupedNotifications.today}
                            onNotificationClick={handleNotificationClick}
                            onMarkAsRead={handleMarkAsRead}
                        />
                        <NotificationGroup
                            title="Yesterday"
                            notifications={groupedNotifications.yesterday}
                            onNotificationClick={handleNotificationClick}
                            onMarkAsRead={handleMarkAsRead}
                        />
                        <NotificationGroup
                            title="Last Week"
                            notifications={groupedNotifications.lastWeek}
                            onNotificationClick={handleNotificationClick}
                            onMarkAsRead={handleMarkAsRead}
                        />
                        <NotificationGroup
                            title="Older"
                            notifications={groupedNotifications.older}
                            onNotificationClick={handleNotificationClick}
                            onMarkAsRead={handleMarkAsRead}
                        />
                    </div>
                )}
                
                {/* Load More Button (placeholder for pagination) */}
                {notifications.length >= 50 && (
                    <div className="mt-10 text-center">
                        <Button variant="link" className="text-sm font-bold">
                            Load older notifications
                        </Button>
                    </div>
                )}
            </div>
        </SidebarLayout>
    )
}
