import { useQuery } from '@tanstack/react-query'
import { getNotifications } from '@/lib/supabase/notifications'
import type { Notification, NotificationType } from '@/types'

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const

export type NotificationFilterType = 'all' | 'unread' | 'mentions' | 'projects'

interface UseNotificationsOptions {
    filter?: NotificationFilterType
    limit?: number
}

/**
 * Hook for fetching user notifications with filtering support.
 * Used by the NotificationsPage component.
 */
export function useNotifications(options: UseNotificationsOptions = {}) {
    const { filter = 'all', limit = 50 } = options

    // Map filter to query parameters
    const unreadOnly = filter === 'unread'
    const typeFilter: NotificationType | null = filter === 'mentions' 
        ? 'comment_added' 
        : filter === 'projects'
            ? 'task_assigned'
            : null

    return useQuery<Notification[]>({
        queryKey: [...NOTIFICATIONS_QUERY_KEY, filter, limit],
        queryFn: () => getNotifications({ 
            limit, 
            unreadOnly,
            type: typeFilter 
        }),
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60,
    })
}
