import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '@/lib/supabase/notifications'
import { ADMIN_ACTIVITY_QUERY_KEY } from '@/features/admin/hooks/useAdminActivityFeed'

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITY_QUERY_KEY })
        },
        onError: (error) => {
            toast.error(`Failed to mark notification as read: ${error.message}`)
        },
    })
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITY_QUERY_KEY })
            toast.success('All notifications marked as read')
        },
        onError: (error) => {
            toast.error(`Failed to mark all as read: ${error.message}`)
        },
    })
}
