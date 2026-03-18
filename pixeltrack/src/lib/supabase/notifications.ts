import { supabase } from './config'
import type { Notification, NotificationType } from '@/types'

const ACTIVITY_NOTIFICATION_TYPES: NotificationType[] = [
    'comment_added',
    'file_uploaded',
    'task_status_updated',
    'task_assigned',
]

interface NotificationRow {
    id: string
    user_id: string
    type: NotificationType
    title: string
    body: string
    action_url: string | null
    related_entity_type: string | null
    related_entity_id: string | null
    metadata: Record<string, unknown>
    priority: 'low' | 'normal' | 'high' | 'urgent'
    is_read: boolean
    read_at: string | null
    created_at: string
    updated_at: string
}

function mapNotification(row: NotificationRow): Notification {
    return {
        id: row.id,
        userId: row.user_id,
        type: row.type,
        title: row.title,
        body: row.body,
        actionUrl: row.action_url,
        relatedEntityType: row.related_entity_type,
        relatedEntityId: row.related_entity_id,
        metadata: row.metadata,
        priority: row.priority,
        isRead: row.is_read,
        readAt: row.read_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }
}

export async function getRecentActivityNotifications(limit = 6): Promise<Notification[]> {
    const { data, error } = await supabase
        .from('notifications')
        .select(
            'id,user_id,type,title,body,action_url,related_entity_type,related_entity_id,metadata,priority,is_read,read_at,created_at,updated_at'
        )
        .in('type', ACTIVITY_NOTIFICATION_TYPES)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        throw error
    }

    return (data ?? []).map((row) => mapNotification(row as NotificationRow))
}
