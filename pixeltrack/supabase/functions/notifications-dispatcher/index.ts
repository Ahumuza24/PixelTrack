import { corsHeaders, createAdminClient, jsonResponse } from "../_shared/utils.ts"
import { extractNotificationEvents, processNotificationEvents } from "../_shared/notifications.ts"

// @ts-expect-error Deno env is provided in Supabase Edge Runtime
const DISPATCHER_SECRET = Deno.env.get("NOTIFICATIONS_DISPATCHER_SECRET")?.trim() ?? ""

/**
 * Validates that the request contains the expected shared secret header when configured.
 */
function validateSecretHeader(req: Request): string | null {
  if (!DISPATCHER_SECRET) return null

  const provided = req.headers.get("x-notifications-secret")?.trim()
  if (!provided || provided !== DISPATCHER_SECRET) {
    return "Invalid notifications dispatcher secret."
  }

  return null
}

// @ts-expect-error Deno.serve is provided in Supabase Edge Runtime
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, { status: 405 })
  }

  const secretError = validateSecretHeader(req)
  if (secretError) {
    return jsonResponse({ error: secretError }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, { status: 400 })
  }

  let eventsInput
  try {
    eventsInput = extractNotificationEvents(payload)
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Invalid payload." }, { status: 400 })
  }

  const admin = createAdminClient()
  const results = await processNotificationEvents(admin, eventsInput)

  return jsonResponse({ count: results.length, results })
})
