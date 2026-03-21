import { supabase } from '@/lib/supabase/config'
import { SUPABASE_FUNCTIONS_BASE_URL } from '@/lib/constants'
import type { NotificationMetadata, NotificationPriority, NotificationType } from '@/types'

const DISPATCHER_URL = `${SUPABASE_FUNCTIONS_BASE_URL}/notifications-dispatcher`
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export type NotificationEventPayload = {
    userId: string
    type: NotificationType
    title: string
    body: string
    actionUrl?: string
    relatedEntityType?: string
    relatedEntityId?: string
    metadata?: NotificationMetadata
    priority?: NotificationPriority
    channels?: Array<'in_app' | 'email'>
}

async function getSessionToken(): Promise<string> {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
        throw error
    }

    const token = data.session?.access_token
    if (!token) {
        throw new Error('Unable to publish notifications without an authenticated session.')
    }

    return token
}

export async function publishNotifications(
    eventsInput: NotificationEventPayload | NotificationEventPayload[],
): Promise<void> {
    const dispatcherSecret = import.meta.env.VITE_NOTIFICATIONS_DISPATCHER_SECRET

    if (!dispatcherSecret) {
        throw new Error('Missing VITE_NOTIFICATIONS_DISPATCHER_SECRET environment variable.')
    }

    if (!SUPABASE_ANON_KEY) {
        throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable.')
    }

    const events = Array.isArray(eventsInput) ? eventsInput : [eventsInput]
    if (!events.length) {
        return
    }

    const token = await getSessionToken()

    const normalized = events.map((event) => ({
        ...event,
        channels: event.channels?.length ? event.channels : ['in_app'],
    }))

    const response = await fetch(DISPATCHER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_ANON_KEY,
            'x-notifications-secret': dispatcherSecret,
        },
        body: JSON.stringify({ events: normalized }),
    })

    if (!response.ok) {
        const detail = await response.text().catch(() => 'Unknown error')
        throw new Error(`Notifications dispatcher error: ${detail}`)
    }
}

export async function publishNotificationsSafe(
    events: NotificationEventPayload | NotificationEventPayload[],
    context?: string,
): Promise<void> {
    try {
        await publishNotifications(events)
    } catch (error) {
        console.error(`[notifications] Failed to dispatch${context ? ` (${context})` : ''}:`, error)
    }
}
