import {
  corsHeaders,
  createAdminClient,
  createUserClient,
  fetchProfileDisplayName,
  jsonResponse,
} from "../_shared/utils.ts"
import { notifyTaskAudience } from "../_shared/taskNotifications.ts"

// @ts-expect-error Deno.serve is available in Supabase Edge Runtime
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, { status: 405 })
  }

  // Verify user is authenticated
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, { status: 401 })
  }

  // Validate the JWT token
  const supabase = createUserClient(authHeader)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData?.user) {
    return jsonResponse({ error: "Invalid JWT token" }, { status: 401 })
  }

  let payload: {
    id: string
    title?: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string
    clientId?: string
    projectId?: string | null
    assignees?: string[]
  }
  
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, { status: 400 })
  }

  if (!payload.id) {
    return jsonResponse({ error: "Task id is required" }, { status: 400 })
  }

  const userId = userData.user.id
  const admin = createAdminClient()

  const { data: existingTask, error: existingTaskError } = await admin
    .from("tasks")
    .select("id, title, status, assignees")
    .eq("id", payload.id)
    .maybeSingle()

  if (existingTaskError) {
    return jsonResponse({ error: existingTaskError.message }, { status: 400 })
  }

  if (!existingTask) {
    return jsonResponse({ error: "Task not found" }, { status: 404 })
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  }
  
  if (payload.title) updateData.title = payload.title
  if (payload.description !== undefined) updateData.description = payload.description
  if (payload.status) updateData.status = payload.status
  if (payload.priority) updateData.priority = payload.priority
  if (payload.dueDate) updateData.due_date = payload.dueDate
  if (payload.clientId) updateData.client_id = payload.clientId
  if (payload.projectId !== undefined) updateData.project_id = payload.projectId
  if (payload.assignees) updateData.assignees = payload.assignees

  const { data: updatedTask, error: updateError } = await admin
    .from("tasks")
    .update(updateData)
    .eq("id", payload.id)
    .select("id, title, status, assignees, created_by, client_id")
    .single()

  if (updateError) {
    return jsonResponse({ error: updateError.message }, { status: 400 })
  }

  const notifications: Promise<unknown>[] = []
  const actorName = await fetchProfileDisplayName(admin, userId)

  if (payload.status && payload.status !== existingTask.status) {
    notifications.push(
      notifyTaskAudience({
        admin,
        taskId: payload.id,
        type: "task_status_updated",
        actorId: userId,
        actorName,
        metadata: {
          previousStatus: existingTask.status ?? null,
          newStatus: payload.status,
        },
      })
    )
  }

  if (Array.isArray(updatedTask.assignees)) {
    const beforeAssignees = Array.isArray(existingTask.assignees)
      ? (existingTask.assignees as string[])
      : []
    const newlyAssigned = (updatedTask.assignees as string[]).filter(
      (assignee): assignee is string => typeof assignee === "string" && !beforeAssignees.includes(assignee)
    )

    if (newlyAssigned.length > 0) {
      notifications.push(
        notifyTaskAudience({
          admin,
          taskId: payload.id,
          type: "task_assigned",
          actorId: userId,
          actorName,
          targetUserIds: newlyAssigned,
          excludeActor: false,
          metadata: { assignedUserIds: newlyAssigned },
        })
      )
    }
  }

  if (notifications.length > 0) {
    Promise.allSettled(notifications).catch((error) =>
      console.error("Failed to dispatch task notifications", error)
    )
  }

  return jsonResponse({ success: true, message: "Task updated successfully" })
})
