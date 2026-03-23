import { supabase } from './config'
import type {
    NotificationChannelId,
    NotificationChannelPreferenceMap,
    NotificationPreferences,
    QuietHoursWindow,
} from '@/types'

const NOTIFICATION_COLUMNS = '*'

const DEFAULT_QUIET_HOURS: QuietHoursWindow = {
    start: '22:00',
    end: '07:00',
}

export const DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES: NotificationChannelPreferenceMap = {
    mentions: { email: true, push: true },
    projects: { email: true, push: false },
    summaries: { email: false, push: false },
}

function cloneChannelPreferences(
    source: NotificationChannelPreferenceMap,
): NotificationChannelPreferenceMap {
    const clone = {} as NotificationChannelPreferenceMap
    ;(Object.keys(source) as NotificationChannelId[]).forEach((key) => {
        clone[key] = { ...source[key] }
    })
    return clone
}

interface NotificationPreferencesRow {
    user_id: string
    in_app_enabled: boolean
    email_enabled: boolean
    task_assignments: boolean
    status_updates: boolean
    comments: boolean
    files: boolean
    annotations: boolean
    reports: boolean
    digest_frequency: 'immediate' | 'daily' | 'weekly'
    quiet_hours: QuietHoursWindow | null
    channel_preferences: NotificationChannelPreferenceMap | null
    created_at: string
    updated_at: string
}

function mergeChannelPreferences(
    stored?: NotificationChannelPreferenceMap | null,
): NotificationChannelPreferenceMap {
    const merged: NotificationChannelPreferenceMap = cloneChannelPreferences(DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES)

    const keys = Object.keys(merged) as NotificationChannelId[]
    keys.forEach((key: NotificationChannelId) => {
        if (stored?.[key]) {
            merged[key] = {
                email: stored[key].email,
                push: stored[key].push,
            }
        }
    })

    return merged
}

function mapPreferencesRow(row: NotificationPreferencesRow): NotificationPreferences {
    return {
        userId: row.user_id,
        inAppEnabled: row.in_app_enabled,
        emailEnabled: row.email_enabled,
        taskAssignments: row.task_assignments,
        statusUpdates: row.status_updates,
        comments: row.comments,
        files: row.files,
        annotations: row.annotations,
        reports: row.reports,
        digestFrequency: row.digest_frequency,
        quietHours: row.quiet_hours ?? DEFAULT_QUIET_HOURS,
        channelPreferences: mergeChannelPreferences(row.channel_preferences),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

function createDefaultPreferences(userId: string): NotificationPreferences {
    const now = new Date().toISOString()
    return {
        userId,
        inAppEnabled: true,
        emailEnabled: true,
        taskAssignments: true,
        statusUpdates: true,
        comments: true,
        files: true,
        annotations: true,
        reports: true,
        digestFrequency: 'immediate',
        quietHours: { ...DEFAULT_QUIET_HOURS },
        channelPreferences: cloneChannelPreferences(DEFAULT_NOTIFICATION_CHANNEL_PREFERENCES),
        createdAt: now,
        updatedAt: now,
    }
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
        const { data, error } = await supabase
            .from('notification_preferences')
            .select(NOTIFICATION_COLUMNS)
            .eq('user_id', userId)
            .maybeSingle()

        if (error) {
            // Log but don't throw - return defaults on any error
            console.warn('Notification preferences fetch error:', error.message)
            return createDefaultPreferences(userId)
        }

        if (!data) {
            return createDefaultPreferences(userId)
        }

        return mapPreferencesRow(data as NotificationPreferencesRow)
    } catch (err) {
        // Handle any unexpected errors gracefully
        console.warn('Notification preferences fetch failed:', err)
        return createDefaultPreferences(userId)
    }
}

export type NotificationPreferencesUpdate = Partial<
    Omit<NotificationPreferences, 'userId' | 'createdAt' | 'updatedAt'>
>

export async function upsertNotificationPreferences(
    userId: string,
    data: NotificationPreferencesUpdate,
): Promise<void> {
    const payload: Record<string, unknown> = {
        user_id: userId,
    }

    if (data.inAppEnabled !== undefined) payload.in_app_enabled = data.inAppEnabled
    if (data.emailEnabled !== undefined) payload.email_enabled = data.emailEnabled
    if (data.taskAssignments !== undefined) payload.task_assignments = data.taskAssignments
    if (data.statusUpdates !== undefined) payload.status_updates = data.statusUpdates
    if (data.comments !== undefined) payload.comments = data.comments
    if (data.files !== undefined) payload.files = data.files
    if (data.annotations !== undefined) payload.annotations = data.annotations
    if (data.reports !== undefined) payload.reports = data.reports
    if (data.channelPreferences) payload.channel_preferences = data.channelPreferences
    if (data.digestFrequency) payload.digest_frequency = data.digestFrequency
    if (data.quietHours) payload.quiet_hours = data.quietHours

    const { error } = await supabase
        .from('notification_preferences')
        .upsert(payload, { onConflict: 'user_id' })

    if (error) {
        throw error
    }
}
