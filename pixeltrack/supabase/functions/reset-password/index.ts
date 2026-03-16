import { corsHeaders, createAdminClient, jsonResponse, requireAdmin } from "../_shared/utils.ts"

type ResetPasswordPayload = {
  uid: string
  newPassword: string
}

/**
 * Validates the incoming reset-password payload.
 */
function validatePayload(payload: ResetPasswordPayload) {
  if (!payload.uid) {
    return "User id is required."
  }
  if (!payload.newPassword || payload.newPassword.length < 8) {
    return "Password must be at least 8 characters."
  }
  return null
}

/**
 * Edge Function to reset a user's password with admin-only access.
 */
// @ts-expect-error Deno is available in Supabase Edge Functions runtime
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 })
  }

  const adminCheck = await requireAdmin(req)
  if (!adminCheck.ok) return adminCheck.response

  let payload: ResetPasswordPayload
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
  
  // Update the user's password in auth
  const { error: updateError } = await admin.auth.admin.updateUserById(
    payload.uid,
    { password: payload.newPassword }
  )
  
  if (updateError) {
    return jsonResponse({ error: updateError.message }, { status: 400 })
  }

  return jsonResponse({ success: true, message: "Password reset successfully" })
})
