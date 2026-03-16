import { corsHeaders, createAdminClient, jsonResponse } from "../_shared/utils.ts"

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
  const { createUserClient } = await import("../_shared/utils.ts")
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

  // Use admin client to bypass RLS
  const admin = createAdminClient()
  
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

  const { error: updateError } = await admin
    .from("tasks")
    .update(updateData)
    .eq("id", payload.id)

  if (updateError) {
    return jsonResponse({ error: updateError.message }, { status: 400 })
  }

  return jsonResponse({ success: true, message: "Task updated successfully" })
})
