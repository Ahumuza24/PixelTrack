import {
  corsHeaders,
  createAdminClient,
  createUserClient,
  fetchProfileDisplayName,
  jsonResponse,
} from "../_shared/utils.ts"
import { notifyTaskAudience } from "../_shared/taskNotifications.ts"

interface CreateTaskPayload {
  title?: string
  description?: string
  status?: string
  priority?: string
  dueDate?: string
  clientId?: string
  projectId?: string | null
  assignees?: string[]
  createdBy?: string | null
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function normalizeAssignees(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const deduped = new Set(
    value.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
  )
  return Array.from(deduped)
}

// @ts-expect-error Deno.serve is available in Supabase Edge Runtime
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, { status: 401 })
  }

  const supabase = createUserClient(authHeader)
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData?.user) {
    return jsonResponse({ error: "Invalid JWT token" }, { status: 401 })
  }

  let payload: CreateTaskPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const title = isNonEmptyString(payload.title) ? payload.title.trim() : ""
  const description = isNonEmptyString(payload.description) ? payload.description.trim() : ""
  const status = isNonEmptyString(payload.status) ? payload.status.trim() : ""
  const priority = isNonEmptyString(payload.priority) ? payload.priority.trim() : ""
  const dueDate = isNonEmptyString(payload.dueDate) ? payload.dueDate.trim() : ""
  const clientId = isNonEmptyString(payload.clientId) ? payload.clientId.trim() : ""
  const projectId =
    typeof payload.projectId === "string" && payload.projectId.trim().length > 0
      ? payload.projectId.trim()
      : null
  const assignees = normalizeAssignees(payload.assignees)

  if (!title || !description || !status || !priority || !dueDate || !clientId) {
    return jsonResponse({ error: "Missing required task fields" }, { status: 400 })
  }

  const admin = createAdminClient()

  const insertPayload = {
    title,
    description,
    status,
    priority,
    due_date: dueDate,
    client_id: clientId,
    project_id: projectId,
    assignees,
    created_by: payload.createdBy ?? userData.user.id,
  }

  const { data: task, error } = await admin
    .from("tasks")
    .insert(insertPayload)
    .select(
      "id, title, description, status, priority, due_date, client_id, project_id, assignees, created_at, updated_at, created_by"
    )
    .single()

  if (error || !task) {
    return jsonResponse({ error: error?.message ?? "Failed to create task" }, { status: 400 })
  }

  if (assignees.length > 0) {
    const actorName = await fetchProfileDisplayName(admin, userData.user.id)
    notifyTaskAudience({
      admin,
      taskId: task.id,
      type: "task_assigned",
      actorId: userData.user.id,
      actorName,
      targetUserIds: assignees,
      excludeActor: false,
      metadata: { assignedUserIds: assignees },
    }).catch((notifyError) => console.error("Failed to dispatch task assignment notification", notifyError))
  }

  return jsonResponse({ success: true, task })
})
