import { corsHeaders, createAdminClient, jsonResponse, requireAdmin } from "../_shared/utils.ts"

type DeleteUserPayload = {
  uid: string
}

/**
 * Edge Function to delete a user account with admin-only access.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 })
  }

  const adminCheck = await requireAdmin(req)
  if (!adminCheck.ok) return adminCheck.response

  let payload: DeleteUserPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, { status: 400 })
  }

  if (!payload.uid) {
    return jsonResponse({ error: "User id is required." }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error: authError } = await admin.auth.admin.deleteUser(payload.uid)
  if (authError) {
    return jsonResponse({ error: authError.message }, { status: 400 })
  }

  await admin.from("profiles").delete().eq("id", payload.uid)

  return jsonResponse({ success: true })
})
