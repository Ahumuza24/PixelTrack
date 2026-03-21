import { Bell, Loader2, AlertCircle, CheckCheck } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { NotificationItem } from '@/features/notifications/components/NotificationItem'
import { useNotificationBell } from '@/features/notifications/hooks/useNotificationBell'

interface NotificationBellProps {
    overdueCount?: number
}

export function NotificationBell({ overdueCount = 0 }: NotificationBellProps) {
    const {
        open,
        setOpen,
        notifications,
        isLoading,
        isError,
        unreadCount,
        displayCount,
        handleNotificationClick,
        handleMarkAsRead,
        handleMarkAllAsRead,
        handleViewAll,
        isMarkingAllAsRead,
    } = useNotificationBell(overdueCount)

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
                                    disabled={isMarkingAllAsRead}
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
