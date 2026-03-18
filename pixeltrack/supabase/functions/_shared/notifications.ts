// Shared notification processing utilities for Edge Functions.
// Centralises normalization, preference lookups, DB inserts, and Resend dispatching.

// @ts-expect-error Supabase Deno types are not available in the IDE env
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

// @ts-expect-error Deno env is provided in Supabase Edge Runtime
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")?.trim() ?? ""
// @ts-expect-error Deno env is provided in Supabase Edge Runtime
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL")?.trim() ?? ""

export const VALID_NOTIFICATION_TYPES = [
  "task_assigned",
  "task_status_updated",
  "comment_added",
  "file_uploaded",
  "annotation_submitted",
  "report_ready",
  "system",
] as const

export const VALID_NOTIFICATION_PRIORITIES = ["low", "normal", "high", "urgent"] as const

export type NotificationType = (typeof VALID_NOTIFICATION_TYPES)[number]
export type NotificationPriority = (typeof VALID_NOTIFICATION_PRIORITIES)[number]
export type NotificationChannel = "in_app" | "email"

const DEFAULT_CHANNELS: NotificationChannel[] = ["in_app", "email"]

export type NotificationEventInput = {
  userId: string
  type: NotificationType
  title: string
  body: string
  actionUrl?: string
  relatedEntityType?: string
  relatedEntityId?: string
  metadata?: Record<string, unknown>
  priority?: NotificationPriority
  channels?: NotificationChannel[]
}

type NormalizedNotificationEvent = {
  userId: string
  type: NotificationType
  title: string
  body: string
  actionUrl?: string
  relatedEntityType?: string
  relatedEntityId?: string
  metadata: Record<string, unknown>
  priority: NotificationPriority
  channels: NotificationChannel[]
}

type NotificationPreferencesRow = {
  user_id: string
  in_app_enabled: boolean
  email_enabled: boolean
  task_assignments: boolean
  status_updates: boolean
  comments: boolean
  files: boolean
  annotations: boolean
  reports: boolean
  digest_frequency: string
  quiet_hours: Record<string, unknown>
}

type RecipientProfile = {
  id: string
  email: string | null
  display_name: string | null
}

type InAppDispatchResult =
  | { status: "inserted"; notificationId: string }
  | { status: "skipped"; reason: string }
  | { status: "error"; reason: string }

type EmailDispatchResult =
  | { status: "queued"; provider: "resend"; detail?: string }
  | { status: "skipped"; reason: string }
  | { status: "error"; reason: string }

export type NotificationDispatchResult = {
  userId: string
  inApp: InAppDispatchResult
  email: EmailDispatchResult
}

const TYPE_CHANNEL_GATES: Record<NotificationType, keyof NotificationPreferencesRow | null> = {
  task_assigned: "task_assignments",
  task_status_updated: "status_updates",
  comment_added: "comments",
  file_uploaded: "files",
  annotation_submitted: "annotations",
  report_ready: "reports",
  system: null,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
}

export function extractNotificationEvents(payload: unknown): NotificationEventInput[] {
  const eventsPayload: unknown = Array.isArray(payload)
    ? payload
    : isRecord(payload) && Array.isArray(payload.events)
    ? payload.events
    : payload

  if (!Array.isArray(eventsPayload) || eventsPayload.length === 0) {
    throw new Error("Request must include at least one notification event.")
  }

  return eventsPayload as NotificationEventInput[]
}

function normalizeChannels(channels?: unknown): NotificationChannel[] {
  if (!channels) return DEFAULT_CHANNELS
  if (!Array.isArray(channels)) return DEFAULT_CHANNELS

  const filtered = channels.filter((channel): channel is NotificationChannel =>
    channel === "in_app" || channel === "email"
  )

  return filtered.length ? filtered : DEFAULT_CHANNELS
}

function normalizeMetadata(metadata?: unknown): Record<string, unknown> {
  if (isRecord(metadata)) return metadata
  return {}
}

function normalizePriority(priority?: unknown): NotificationPriority {
  if (typeof priority === "string" && VALID_NOTIFICATION_PRIORITIES.includes(priority as NotificationPriority)) {
    return priority as NotificationPriority
  }
  return "normal"
}

function normalizeType(type: unknown): NotificationType | null {
  if (typeof type === "string" && VALID_NOTIFICATION_TYPES.includes(type as NotificationType)) {
    return type as NotificationType
  }
  return null
}

function normalizeEvent(raw: NotificationEventInput, index: number): NormalizedNotificationEvent {
  const type = normalizeType(raw.type)
  if (!type) {
    throw new Error(`Event at index ${index} has invalid type.`)
  }

  const userId = typeof raw.userId === "string" && raw.userId.trim().length > 0 ? raw.userId.trim() : null
  if (!userId) {
    throw new Error(`Event at index ${index} is missing a valid userId.`)
  }

  const title = typeof raw.title === "string" && raw.title.trim().length > 0 ? raw.title.trim() : null
  if (!title) {
    throw new Error(`Event at index ${index} is missing a title.`)
  }

  const body = typeof raw.body === "string" && raw.body.trim().length > 0 ? raw.body.trim() : null
  if (!body) {
    throw new Error(`Event at index ${index} is missing a body.`)
  }

  const actionUrl = typeof raw.actionUrl === "string" ? raw.actionUrl : undefined
  const relatedEntityType = typeof raw.relatedEntityType === "string" ? raw.relatedEntityType : undefined
  const relatedEntityId = typeof raw.relatedEntityId === "string" ? raw.relatedEntityId : undefined

  return {
    userId,
    type,
    title,
    body,
    actionUrl,
    relatedEntityType,
    relatedEntityId,
    metadata: normalizeMetadata(raw.metadata),
    priority: normalizePriority(raw.priority),
    channels: normalizeChannels(raw.channels),
  }
}

async function fetchPreferences(
  admin: SupabaseClient,
  userId: string,
  cache: Map<string, NotificationPreferencesRow>
): Promise<NotificationPreferencesRow> {
  const cached = cache.get(userId)
  if (cached) return cached

  const { data, error } = await admin
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  const preferences: NotificationPreferencesRow =
    data ?? {
      user_id: userId,
      in_app_enabled: true,
      email_enabled: true,
      task_assignments: true,
      status_updates: true,
      comments: true,
      files: true,
      annotations: true,
      reports: true,
      digest_frequency: "immediate",
      quiet_hours: { start: "22:00", end: "07:00" },
    }

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to load notification preferences for user ${userId}: ${error.message}`)
  }

  cache.set(userId, preferences)
  return preferences
}

async function fetchRecipientProfile(
  admin: SupabaseClient,
  userId: string,
  cache: Map<string, RecipientProfile>
): Promise<RecipientProfile | null> {
  const cached = cache.get(userId)
  if (cached) return cached

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, display_name")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load profile for user ${userId}: ${error.message}`)
  }

  if (!data) {
    cache.set(userId, { id: userId, email: null, display_name: null })
    return null
  }

  cache.set(userId, data as RecipientProfile)
  return data as RecipientProfile
}

function isChannelAllowed(
  channel: NotificationChannel,
  event: NormalizedNotificationEvent,
  preferences: NotificationPreferencesRow
): { allowed: boolean; reason?: string } {
  if (channel === "in_app" && !preferences.in_app_enabled) {
    return { allowed: false, reason: "In-app notifications disabled via preferences." }
  }

  if (channel === "email" && !preferences.email_enabled) {
    return { allowed: false, reason: "Email notifications disabled via preferences." }
  }

  const gate = TYPE_CHANNEL_GATES[event.type]
  if (!gate) {
    return { allowed: true }
  }

  const gateValue = preferences[gate]
  if (typeof gateValue === "boolean" && !gateValue) {
    return { allowed: false, reason: `${event.type} notifications disabled via preferences.` }
  }

  return { allowed: true }
}

async function insertNotification(
  admin: SupabaseClient,
  event: NormalizedNotificationEvent
): Promise<InAppDispatchResult> {
  const insertPayload = {
    user_id: event.userId,
    type: event.type,
    title: event.title,
    body: event.body,
    action_url: event.actionUrl,
    related_entity_type: event.relatedEntityType,
    related_entity_id: event.relatedEntityId,
    metadata: event.metadata,
    priority: event.priority,
  }

  const { data, error } = await admin.from("notifications").insert(insertPayload).select("id").single()

  if (error || !data) {
    return { status: "error", reason: error?.message ?? "Unknown insert error." }
  }

  return { status: "inserted", notificationId: data.id }
}

async function queueEmailNotification(
  event: NormalizedNotificationEvent,
  recipient: RecipientProfile | null
): Promise<EmailDispatchResult> {
  if (!event.channels.includes("email")) {
    return { status: "skipped", reason: "Email channel not requested." }
  }

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    return { status: "skipped", reason: "Resend credentials missing." }
  }

  if (!recipient?.email) {
    return { status: "skipped", reason: "Recipient email unavailable." }
  }

  const payload = {
    from: RESEND_FROM_EMAIL,
    to: [recipient.email],
    subject: event.title,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <p style="color:#0f172a; font-size:16px;">${event.body}</p>
        ${event.actionUrl ? `<p><a href="${event.actionUrl}" style="color:#2563eb;">Open in PixelTrack</a></p>` : ""}
      </div>
    `,
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const detail = await response.text()
    return { status: "error", reason: `Resend error: ${detail}` }
  }

  return { status: "queued", provider: "resend", detail: "Email dispatched." }
}

async function processEvent(
  admin: SupabaseClient,
  event: NormalizedNotificationEvent,
  preferenceCache: Map<string, NotificationPreferencesRow>,
  profileCache: Map<string, RecipientProfile>
): Promise<NotificationDispatchResult> {
  const preferences = await fetchPreferences(admin, event.userId, preferenceCache)
  let inApp: InAppDispatchResult = { status: "skipped", reason: "In-app channel not requested." }
  let email: EmailDispatchResult = { status: "skipped", reason: "Email channel not requested." }

  if (event.channels.includes("in_app")) {
    const gate = isChannelAllowed("in_app", event, preferences)
    if (gate.allowed) {
      inApp = await insertNotification(admin, event)
    } else {
      inApp = { status: "skipped", reason: gate.reason ?? "In-app channel disabled." }
    }
  }

  if (event.channels.includes("email")) {
    const gate = isChannelAllowed("email", event, preferences)
    if (gate.allowed) {
      const recipient = await fetchRecipientProfile(admin, event.userId, profileCache)
      email = await queueEmailNotification(event, recipient)
    } else {
      email = { status: "skipped", reason: gate.reason ?? "Email channel disabled." }
    }
  }

  return { userId: event.userId, inApp, email }
}

export async function processNotificationEvents(
  admin: SupabaseClient,
  events: NotificationEventInput[]
): Promise<NotificationDispatchResult[]> {
  if (!events.length) return []

  const normalized = events.map((event, index) => normalizeEvent(event, index))
  const preferenceCache = new Map<string, NotificationPreferencesRow>()
  const profileCache = new Map<string, RecipientProfile>()
  const results: NotificationDispatchResult[] = []

  for (const event of normalized) {
    try {
      const result = await processEvent(admin, event, preferenceCache, profileCache)
      results.push(result)
    } catch (error) {
      results.push({
        userId: event.userId,
        inApp: { status: "error", reason: error instanceof Error ? error.message : "Unknown error" },
        email: { status: "error", reason: error instanceof Error ? error.message : "Unknown error" },
      })
    }
  }

  return results
}
