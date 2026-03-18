import {
  corsHeaders,
  createAdminClient,
  createUserClient,
  fetchProfileDisplayName,
  jsonResponse,
} from "../_shared/utils.ts"
import { notifyTaskAudience } from "../_shared/taskNotifications.ts"

interface RegisterTaskFilePayload {
  taskId?: string
  fileName?: string
  fileType?: string
  fileSize?: number | null
  fileUrl?: string | null
  isExternalLink?: boolean
  externalUrl?: string | null
  version?: number | null
}

const ALLOWED_FILE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/pdf",
  "external/link",
])

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

  let payload: RegisterTaskFilePayload
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, { status: 400 })
  }

  const taskId = typeof payload.taskId === "string" ? payload.taskId.trim() : ""
  if (!taskId) {
    return jsonResponse({ error: "taskId is required" }, { status: 400 })
  }

  const fileName = typeof payload.fileName === "string" ? payload.fileName.trim() : ""
  if (!fileName) {
    return jsonResponse({ error: "fileName is required" }, { status: 400 })
  }

  const fileType = typeof payload.fileType === "string" ? payload.fileType.trim() : ""
  if (!fileType || !ALLOWED_FILE_TYPES.has(fileType)) {
    return jsonResponse({ error: "Unsupported fileType" }, { status: 400 })
  }

  const isExternalLink = Boolean(payload.isExternalLink)
  const fileUrl = typeof payload.fileUrl === "string" ? payload.fileUrl.trim() : null
  const externalUrl = typeof payload.externalUrl === "string" ? payload.externalUrl.trim() : null

  if (!isExternalLink && !fileUrl) {
    return jsonResponse({ error: "fileUrl is required for uploads" }, { status: 400 })
  }

  if (isExternalLink && !externalUrl) {
    return jsonResponse({ error: "externalUrl is required for external links" }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: latestVersionRow, error: versionError } = await admin
    .from("task_files")
    .select("version")
    .eq("task_id", taskId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (versionError && versionError.code !== "PGRST116") {
    return jsonResponse({ error: versionError.message }, { status: 400 })
  }

  const nextVersion = (latestVersionRow?.version ?? 0) + 1
  const targetVersion =
    typeof payload.version === "number" && payload.version > 0 ? payload.version : nextVersion

  const insertPayload = {
    task_id: taskId,
    uploaded_by: userData.user.id,
    file_name: fileName,
    file_type: fileType,
    file_size: payload.fileSize ?? null,
    file_url: fileUrl,
    version: targetVersion,
    is_external_link: isExternalLink,
    external_url: isExternalLink ? externalUrl : null,
  }

  const { data: taskFile, error: insertError } = await admin
    .from("task_files")
    .insert(insertPayload)
    .select("id, task_id, uploaded_by, file_name, file_url, file_type, file_size, version, is_external_link, external_url, created_at")
    .single()

  if (insertError || !taskFile) {
    return jsonResponse({ error: insertError?.message ?? "Failed to register task file" }, { status: 400 })
  }

  const actorName = await fetchProfileDisplayName(admin, userData.user.id)

  notifyTaskAudience({
    admin,
    taskId,
    type: "file_uploaded",
    actorId: userData.user.id,
    actorName,
    metadata: {
      fileId: taskFile.id,
      fileName: taskFile.file_name,
      version: taskFile.version,
      isExternalLink,
    },
  }).catch((notifyError) => console.error("Failed to dispatch file notification", notifyError))

  return jsonResponse({ success: true, taskFile })
})
