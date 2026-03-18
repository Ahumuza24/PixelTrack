// @ts-expect-error Supabase Deno types are not available in the IDE environment
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

import {
  type NotificationChannel,
  type NotificationPriority,
  type NotificationType,
  type NotificationDispatchResult,
  processNotificationEvents,
} from "./notifications.ts"
import { fetchTaskContext, resolveTaskAudienceIds, type TaskContext } from "./taskContext.ts"

interface TaskNotificationOptions {
  admin: SupabaseClient
  taskId: string
  type: NotificationType
  actorId?: string
  actorName?: string | null
  title?: string
  body?: string
  actionUrl?: string
  metadata?: Record<string, unknown>
  priority?: NotificationPriority
  channels?: NotificationChannel[]
  relatedEntityType?: string
  relatedEntityId?: string
  excludeActor?: boolean
  targetUserIds?: string[]
}

function buildFallbackCopy(
  task: TaskContext,
  type: NotificationType,
  actorName?: string | null
): { title: string; body: string } {
  const author = actorName?.trim()?.length ? actorName : "A teammate"

  switch (type) {
    case "comment_added":
      return {
        title: `${author} commented on ${task.title}`,
        body: `${author} left a comment on “${task.title}”. Open the task to review and respond.`,
      }
    case "file_uploaded":
      return {
        title: `${author} uploaded files to ${task.title}`,
        body: `${author} added new files for “${task.title}”. Review the latest uploads.`,
      }
    case "task_assigned":
      return {
        title: `New task assigned: ${task.title}`,
        body: `${author} assigned you to “${task.title}”.`,
      }
    case "task_status_updated":
      return {
        title: `Status update · ${task.title}`,
        body: `${author} updated the task status for “${task.title}”.`,
      }
    case "annotation_submitted":
      return {
        title: `${author} submitted design feedback`,
        body: `${author} left a new annotation on “${task.title}”.`,
      }
    case "report_ready":
      return {
        title: `Report ready for ${task.title}`,
        body: `A fresh report related to “${task.title}” is ready to view.`,
      }
    case "system":
    default:
      return {
        title: `Update on ${task.title}`,
        body: `${author} shared an update on “${task.title}”.`,
      }
  }
}

export async function notifyTaskAudience(options: TaskNotificationOptions): Promise<NotificationDispatchResult[]> {
  const {
    admin,
    taskId,
    type,
    actorId,
    actorName,
    title,
    body,
    actionUrl,
    metadata,
    priority,
    channels,
    relatedEntityType = "task",
    relatedEntityId = taskId,
    excludeActor = true,
    targetUserIds,
  } = options

  const task = await fetchTaskContext(admin, taskId)
  if (!task) {
    return []
  }

  let recipients: string[]

  if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
    const uniqueTargets = new Set(
      targetUserIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
    )

    if (excludeActor && actorId) {
      uniqueTargets.delete(actorId)
    }

    recipients = Array.from(uniqueTargets)
  } else {
    recipients = await resolveTaskAudienceIds(admin, task, excludeActor ? actorId : null)
  }

  if (!recipients.length) {
    return []
  }

  const copy = title && body ? { title, body } : buildFallbackCopy(task, type, actorName)

  const events = recipients.map((userId) => ({
    userId,
    type,
    title: copy.title,
    body: copy.body,
    actionUrl: actionUrl ?? `/tasks/${taskId}`,
    relatedEntityType,
    relatedEntityId,
    metadata: { ...(metadata ?? {}), taskId },
    priority: priority ?? "normal",
    channels,
  }))

  return processNotificationEvents(admin, events)
}
