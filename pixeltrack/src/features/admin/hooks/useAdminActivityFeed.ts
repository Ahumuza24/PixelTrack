import { useQuery } from '@tanstack/react-query'
import { getRecentActivityNotifications } from '@/lib/supabase/notifications'
import type { Notification } from '@/types'

export const ADMIN_ACTIVITY_QUERY_KEY = ['admin', 'activity-feed'] as const

interface UseAdminActivityFeedOptions {
    limit?: number
}

export function useAdminActivityFeed(options: UseAdminActivityFeedOptions = {}) {
    const { limit = 6 } = options

    return useQuery<Notification[]>({
        queryKey: [...ADMIN_ACTIVITY_QUERY_KEY, limit],
        queryFn: () => getRecentActivityNotifications(limit),
        staleTime: 1000 * 30,
        gcTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60,
    })
}
