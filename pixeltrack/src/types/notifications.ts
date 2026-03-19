export type NotificationChannelId = 'mentions' | 'projects' | 'summaries'

export interface NotificationChannelPreference {
    email: boolean
    push: boolean
}

export type NotificationChannelPreferenceMap = Record<NotificationChannelId, NotificationChannelPreference>

export interface QuietHoursWindow {
    start: string
    end: string
}

export interface NotificationPreferences {
    userId: string
    inAppEnabled: boolean
    emailEnabled: boolean
    taskAssignments: boolean
    statusUpdates: boolean
    comments: boolean
    files: boolean
    annotations: boolean
    reports: boolean
    channelPreferences: NotificationChannelPreferenceMap
    digestFrequency: 'immediate' | 'daily' | 'weekly'
    quietHours: QuietHoursWindow
    createdAt: string
    updatedAt: string
}

export type NotificationType =
    | 'task_assigned'
    | 'task_status_updated'
    | 'comment_added'
    | 'file_uploaded'
    | 'annotation_submitted'
    | 'report_ready'
    | 'system'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationMetadata {
    actorId?: string | null
    actorName?: string | null
    taskId?: string | null
    taskTitle?: string | null
    commentSnippet?: string | null
    fileName?: string | null
    [key: string]: unknown
}

export interface Notification {
    id: string
    userId: string
    type: NotificationType
    title: string
    body: string
    actionUrl?: string | null
    relatedEntityType?: string | null
    relatedEntityId?: string | null
    metadata: NotificationMetadata
    priority: NotificationPriority
    isRead: boolean
    readAt?: string | null
    createdAt: string
    updatedAt: string
}
