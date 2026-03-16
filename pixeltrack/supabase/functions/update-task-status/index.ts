import { corsHeaders, createAdminClient, jsonResponse } from "../_shared/utils.ts"

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
  const { createUserClient } = await import("../_shared/utils.ts")
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

  // Use admin client to bypass RLS
  const admin = createAdminClient()
  
  const { error: updateError } = await admin
    .from("tasks")
    .update({ status: payload.status, updated_at: new Date().toISOString() })
    .eq("id", payload.taskId)

  if (updateError) {
    return jsonResponse({ error: updateError.message }, { status: 400 })
  }

  return jsonResponse({ success: true, message: "Task status updated" })
})
