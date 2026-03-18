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

  // Verify user is authenticated (any logged-in user can update task status)
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return jsonResponse({ error: "Missing Authorization header" }, { status: 401 })
  }

  // Validate the JWT token by checking if we can get the user
  const supabase = createUserClient(authHeader)
  const { data: userData, error: userError } = await supabase.auth.getUser()
  
  if (userError || !userData?.user) {
    return jsonResponse({ error: "Invalid JWT token" }, { status: 401 })
  }

  let payload: { taskId: string; status: string }
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, { status: 400 })
  }

  if (!payload.taskId || !payload.status) {
    return jsonResponse({ error: "taskId and status are required" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: task, error: taskError } = await admin
    .from("tasks")
    .select("id, title, status, assignees, created_by, client_id")
    .eq("id", payload.taskId)
    .maybeSingle()

  if (taskError) {
    return jsonResponse({ error: taskError.message }, { status: 400 })
  }

  if (!task) {
    return jsonResponse({ error: "Task not found" }, { status: 404 })
  }

  if (task.status === payload.status) {
    return jsonResponse({ success: true, message: "Task status already up to date" })
  }

  const { error: updateError } = await admin
    .from("tasks")
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq("id", payload.taskId)

  if (updateError) {
    return jsonResponse({ error: updateError.message }, { status: 400 })
  }

  const actorName = await fetchProfileDisplayName(admin, userData.user.id)

  notifyTaskAudience({
    admin,
    taskId: payload.taskId,
    type: "task_status_updated",
    actorId: userData.user.id,
    actorName,
    metadata: {
      previousStatus: task.status ?? null,
      newStatus: payload.status,
    },
  }).catch((error) => console.error("Failed to dispatch status notification", error))

  return jsonResponse({ success: true, message: "Task status updated" })
})
