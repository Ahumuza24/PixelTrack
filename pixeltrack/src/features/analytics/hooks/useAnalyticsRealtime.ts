import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase/config'
import { ANALYTICS_QUERY_KEY } from './useAnalytics'

const TABLES_TO_WATCH = ['tasks', 'projects', 'task_files', 'comments', 'task_assignments'] as const

/**
 * Subscribes to Supabase realtime changes for analytics-related tables and invalidates
 * cached analytics queries whenever a relevant event occurs.
 */
export function useAnalyticsRealtime(enabled = true) {
    const queryClient = useQueryClient()

    useEffect(() => {
        if (!enabled) {
            return
        }

        const channel = supabase.channel('analytics-live')

        TABLES_TO_WATCH.forEach((table) => {
            channel.on(
                'postgres_changes',
                { event: '*', schema: 'public', table },
                () => {
                    queryClient.invalidateQueries({ queryKey: [ANALYTICS_QUERY_KEY] })
                },
            )
        })

        channel.subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [enabled, queryClient])
}
