import {
  corsHeaders,
  createAdminClient,
  createUserClient,
  fetchProfileDisplayName,
  jsonResponse,
} from "../_shared/utils.ts"
import { notifyTaskAudience } from "../_shared/taskNotifications.ts"

interface CreateTaskCommentPayload {
  taskId?: string
  body?: string
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

  let payload: CreateTaskCommentPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const taskId = typeof payload.taskId === "string" ? payload.taskId.trim() : ""
  if (!taskId) {
    return jsonResponse({ error: "taskId is required" }, { status: 400 })
  }

  const body = typeof payload.body === "string" ? payload.body.trim() : ""
  if (!body) {
    return jsonResponse({ error: "body is required" }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: comment, error } = await admin
    .from("comments")
    .insert({
      task_id: taskId,
      author_id: userData.user.id,
      body,
    })
    .select("id, task_id, author_id, body, created_at, updated_at")
    .single()

  if (error || !comment) {
    return jsonResponse({ error: error?.message ?? "Failed to create comment" }, { status: 400 })
  }

  const actorName = await fetchProfileDisplayName(admin, userData.user.id)
  notifyTaskAudience({
    admin,
    taskId,
    type: "comment_added",
    actorId: userData.user.id,
    actorName,
    metadata: {
      commentId: comment.id,
      preview: body.slice(0, 140),
    },
  }).catch((notifyError) => console.error("Failed to dispatch comment notification", notifyError))

  return jsonResponse({ success: true, comment })
})
