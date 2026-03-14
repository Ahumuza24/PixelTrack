import { corsHeaders, createAdminClient, jsonResponse, requireAdmin } from "../_shared/utils.ts"

type CreateUserPayload = {
  email: string
  password: string
  displayName: string
  role: "admin" | "employee" | "client"
  clientId?: string | null
}

/**
 * Validates the incoming create-user payload.
 */
function validatePayload(payload: CreateUserPayload) {
  if (!payload.email || !payload.email.includes("@")) {
    return "A valid email address is required."
  }
  if (!payload.password || payload.password.length < 8) {
    return "Password must be at least 8 characters."
  }
  if (!payload.displayName || payload.displayName.trim().length < 2) {
    return "Display name must be at least 2 characters."
  }
  if (!["admin", "employee", "client"].includes(payload.role)) {
    return "Invalid role."
  }
  if (payload.role === "client" && !payload.clientId) {
    return "Client users must be assigned to a client."
  }
  return null
}

/**
 * Edge Function to create a new user and profile with admin-only access.
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

  let payload: CreateUserPayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const validationError = validatePayload(payload)
  if (validationError) {
    return jsonResponse({ error: validationError }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      display_name: payload.displayName,
    },
  })

  if (createError || !created?.user) {
    return jsonResponse({ error: createError?.message ?? "Failed to create user." }, { status: 400 })
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    email: payload.email,
    display_name: payload.displayName,
    role: payload.role,
    client_id: payload.clientId ?? null,
  })

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id)
    return jsonResponse({ error: profileError.message }, { status: 400 })
  }

  const { data: profile, error: profileFetchError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", created.user.id)
    .single()

  if (profileFetchError || !profile) {
    return jsonResponse({ error: "Failed to load created profile." }, { status: 500 })
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
