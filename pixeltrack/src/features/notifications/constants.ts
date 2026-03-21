import {
    Bell,
    Check,
    AlertCircle,
    FileUp,
    MessageSquare,
    UserCheck,
    RefreshCw,
} from 'lucide-react'
import type { NotificationType } from '@/types'

export const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
    task_assigned: UserCheck,
    task_status_updated: RefreshCw,
    comment_added: MessageSquare,
    file_uploaded: FileUp,
    annotation_submitted: AlertCircle,
    report_ready: Check,
    system: Bell,
}

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
    task_assigned: 'text-blue-500 bg-blue-50',
    task_status_updated: 'text-amber-500 bg-amber-50',
    comment_added: 'text-purple-500 bg-purple-50',
    file_uploaded: 'text-green-500 bg-green-50',
    annotation_submitted: 'text-orange-500 bg-orange-50',
    report_ready: 'text-emerald-500 bg-emerald-50',
    system: 'text-gray-500 bg-gray-50',
}
