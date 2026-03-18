// Helper utilities to load task context and related stakeholders for notifications.
// @ts-expect-error Supabase Deno types are not available in the IDE environment
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

export interface TaskContext {
  id: string
  title: string
  status: string | null
  assignees: string[]
  created_by: string | null
  client_id: string | null
}

export type TaskRow = {
  id: string
  title: string
  status: string | null
  assignees: string[] | null
  created_by: string | null
  client_id: string | null
}

export async function fetchTaskContext(admin: SupabaseClient, taskId: string): Promise<TaskContext | null> {
  const { data, error } = await admin
    .from("tasks")
    .select("id, title, status, assignees, created_by, client_id")
    .eq("id", taskId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load task ${taskId}: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return {
    id: data.id,
    title: data.title,
    status: data.status ?? null,
    assignees: Array.isArray(data.assignees) ? (data.assignees as string[]) : [],
    created_by: data.created_by ?? null,
    client_id: data.client_id ?? null,
  }
}

export function mapTaskRowToContext(row: TaskRow): TaskContext {
  return {
    id: row.id,
    title: row.title,
    status: row.status ?? null,
    assignees: Array.isArray(row.assignees) ? (row.assignees as string[]) : [],
    created_by: row.created_by ?? null,
    client_id: row.client_id ?? null,
  }
}

export async function fetchClientMemberIds(admin: SupabaseClient, clientId: string | null): Promise<string[]> {
  if (!clientId) return []

  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("client_id", clientId)

  if (error) {
    throw new Error(`Failed to load client members for ${clientId}: ${error.message}`)
  }

  return (data ?? []).map((row: { id: string }) => row.id)
}

export async function resolveTaskAudienceIds(
  admin: SupabaseClient,
  task: TaskContext,
  excludeUserId?: string | null
): Promise<string[]> {
  const recipients = new Set<string>()

  for (const assignee of task.assignees ?? []) {
    if (assignee) recipients.add(assignee)
  }

  if (task.created_by) {
    recipients.add(task.created_by)
  }

  const clientMembers = await fetchClientMemberIds(admin, task.client_id)
  clientMembers.forEach((id) => recipients.add(id))

  if (excludeUserId) {
    recipients.delete(excludeUserId)
  }

  return Array.from(recipients)
}
