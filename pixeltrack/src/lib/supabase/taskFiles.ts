import { supabase } from './config'
import type { TaskFile } from '@/types'

const TASK_FILES_BUCKET = 'task-files'
const ALLOWED_FILE_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf'])
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

interface UploadBinaryFileInput {
    taskId: string
    file: File
    uploadedBy?: string
}

interface UploadExternalFileInput {
    taskId: string
    externalUrl: string
    displayName: string
    uploadedBy?: string
}

export type UploadTaskFileInput = UploadBinaryFileInput | UploadExternalFileInput

type TaskFileRow = {
    id: string
    task_id: string
    uploaded_by: string | null
    file_name: string
    file_url: string | null
    file_type: string
    file_size: number | null
    version: number
    is_external_link: boolean
    external_url: string | null
    created_at: string
}

function sanitizeFileName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9.-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function getExtension(fileName: string): string {
    const index = fileName.lastIndexOf('.')
    return index >= 0 ? fileName.slice(index) : ''
}

function generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID()
    }
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function mapTaskFile(row: TaskFileRow): TaskFile {
    return {
        id: row.id,
        taskId: row.task_id,
        uploadedBy: row.uploaded_by,
        fileName: row.file_name,
        fileUrl: row.file_url,
        fileType: row.file_type,
        fileSize: row.file_size,
        version: row.version,
        isExternalLink: row.is_external_link,
        externalUrl: row.external_url,
        createdAt: row.created_at,
    }
}

async function getNextVersion(taskId: string): Promise<number> {
    const { data, error } = await supabase
        .from('task_files')
        .select('version')
        .eq('task_id', taskId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error && error.code !== 'PGRST116') throw error
    return (data?.version ?? 0) + 1
}

function isBinaryInput(input: UploadTaskFileInput): input is UploadBinaryFileInput {
    return 'file' in input
}

/**
 * Fetch all files uploaded for a task.
 */
export async function listTaskFiles(taskId: string): Promise<TaskFile[]> {
    const { data, error } = await supabase
        .from('task_files')
        .select('*')
        .eq('task_id', taskId)
        .order('version', { ascending: false })

    if (error) throw error
    return (data ?? []).map(mapTaskFile)
}

/**
 * Upload a binary asset or register an external link.
 */
export async function uploadTaskFile(input: UploadTaskFileInput): Promise<TaskFile> {
    const version = await getNextVersion(input.taskId)
    const uploadedBy = 'uploadedBy' in input ? input.uploadedBy ?? null : null

    if (isBinaryInput(input)) {
        const { file } = input

        if (!ALLOWED_FILE_TYPES.has(file.type)) {
            throw new Error('Unsupported file type. Allowed: PNG, JPG, SVG, PDF')
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error('File exceeds 25MB limit')
        }

        const ext = getExtension(file.name) || '.bin'
        const baseName = sanitizeFileName(file.name.replace(ext, '')) || `file-${version}`
        const objectPath = `${input.taskId}/${version}-${baseName}-${generateId()}${ext}`

        const { error: uploadError } = await supabase.storage
            .from(TASK_FILES_BUCKET)
            .upload(objectPath, file, {
                contentType: file.type,
                upsert: false,
            })

        if (uploadError) throw uploadError

        const { data, error } = await supabase
            .from('task_files')
            .insert({
                task_id: input.taskId,
                uploaded_by: uploadedBy,
                file_name: file.name,
                file_url: objectPath,
                file_type: file.type,
                file_size: file.size,
                version,
                is_external_link: false,
            })
            .select('*')
            .single()

        if (error) throw error
        return mapTaskFile(data)
    }

    const { data, error } = await supabase
        .from('task_files')
        .insert({
            task_id: input.taskId,
            uploaded_by: uploadedBy,
            file_name: input.displayName,
            file_type: 'external/link',
            file_size: null,
            version,
            is_external_link: true,
            external_url: input.externalUrl,
        })
        .select('*')
        .single()

    if (error) throw error
    return mapTaskFile(data)
}

/**
 * Delete file metadata and remove the binary from storage when applicable.
 */
export async function deleteTaskFile(taskFileId: string): Promise<void> {
    const { data, error } = await supabase
        .from('task_files')
        .select('file_url, is_external_link')
        .eq('id', taskFileId)
        .maybeSingle()

    if (error) throw error

    if (!data) {
        return
    }

    if (!data.is_external_link && data.file_url) {
        const { error: storageError } = await supabase.storage
            .from(TASK_FILES_BUCKET)
            .remove([data.file_url])

        if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase
        .from('task_files')
        .delete()
        .eq('id', taskFileId)

    if (deleteError) throw deleteError
}

/**
 * Generate a short-lived signed URL for secure previews/downloads.
 */
export async function createSignedTaskFileUrl(objectPath: string, expiresInSeconds = 60): Promise<string> {
    const { data, error } = await supabase.storage
        .from(TASK_FILES_BUCKET)
        .createSignedUrl(objectPath, expiresInSeconds)

    if (error || !data?.signedUrl) {
        throw error ?? new Error('Failed to generate signed URL')
    }

    return data.signedUrl
}
