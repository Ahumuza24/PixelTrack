import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminActivityFeed } from '@/features/admin/hooks/useAdminActivityFeed'
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/features/notifications/hooks/useMarkAsRead'
import type { Notification } from '@/types'

interface UseNotificationBellReturn {
    open: boolean
    setOpen: (open: boolean) => void
    notifications: Notification[]
    isLoading: boolean
    isError: boolean
    unreadCount: number
    displayCount: number
    handleNotificationClick: (notification: Notification) => void
    handleMarkAsRead: (e: React.MouseEvent, notificationId: string) => void
    handleMarkAllAsRead: () => void
    handleViewAll: () => void
    isMarkingAllAsRead: boolean
}

/**
 * Hook for managing notification bell state and actions.
 */
export function useNotificationBell(overdueCount: number): UseNotificationBellReturn {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const { data: notifications = [], isLoading, isError } = useAdminActivityFeed({ limit: 10 })
    const markAsRead = useMarkNotificationAsRead()
    const markAllAsRead = useMarkAllNotificationsAsRead()

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead).length,
        [notifications]
    )
    const displayCount = unreadCount > 0 ? unreadCount : overdueCount

    const handleNotificationClick = useCallback(
        (notification: Notification) => {
            if (!notification.isRead) {
                markAsRead.mutate(notification.id)
            }
            setOpen(false)
            if (notification.actionUrl) {
                navigate(notification.actionUrl)
            }
        },
        [markAsRead, navigate]
    )

    const handleMarkAsRead = useCallback(
        (e: React.MouseEvent, notificationId: string) => {
            e.stopPropagation()
            markAsRead.mutate(notificationId)
        },
        [markAsRead]
    )

    const handleMarkAllAsRead = useCallback(() => {
        markAllAsRead.mutate()
    }, [markAllAsRead])

    const handleViewAll = useCallback(() => {
        setOpen(false)
        navigate('/notifications')
    }, [navigate])

    return {
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
        isMarkingAllAsRead: markAllAsRead.isPending,
    }
}
