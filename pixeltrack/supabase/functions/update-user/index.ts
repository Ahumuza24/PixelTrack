import { corsHeaders, createAdminClient, jsonResponse, requireAdmin } from "../_shared/utils.ts"

type UpdateUserPayload = {
  uid: string
  displayName?: string
  role?: "admin" | "employee" | "client"
  clientId?: string | null
}

/**
 * Validates the incoming update-user payload.
 */
function validatePayload(payload: UpdateUserPayload) {
  if (!payload.uid) {
    return "User id is required."
  }
  if (payload.role && !["admin", "employee", "client"].includes(payload.role)) {
    return "Invalid role."
  }
  if (payload.role === "client" && !payload.clientId) {
    return "Client users must be assigned to a client."
  }
  return null
}

/**
 * Edge Function to update user profile metadata with admin-only access.
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

  let payload: UpdateUserPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const validationError = validatePayload(payload)
  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (payload.displayName !== undefined) updates.display_name = payload.displayName
  if (payload.role) updates.role = payload.role
  if (payload.clientId !== undefined) updates.client_id = payload.clientId

  const admin = createAdminClient()
  const { error: updateError } = await admin.from("profiles").update(updates).eq("id", payload.uid)
  if (updateError) {
    return jsonResponse({ error: updateError.message }, { status: 400 })
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", payload.uid)
    .single()

  if (profileError || !profile) {
    return jsonResponse({ error: "Failed to load updated profile." }, { status: 500 })
  }

  return jsonResponse({
    uid: profile.id,
    email: profile.email,
    displayName: profile.display_name,
    role: profile.role,
    clientId: profile.client_id ?? undefined,
    photoURL: profile.photo_url ?? undefined,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  })
})
