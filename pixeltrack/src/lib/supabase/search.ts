import { supabase } from './config'
import { ROUTES } from '@/lib/constants'
import type { AdminSearchResultItem, AdminSearchResults } from '@/types/search'

const MAX_RESULTS = 5
const ENTITY_LIMIT = 8

function escapeForILike(input: string): string {
    return input.replace(/[%_]/g, (symbol) => `\\${symbol}`)
}

function normalize(text: string): string {
    return text.trim().toLowerCase()
}

function computeScore(text: string | null | undefined, query: string, base = 1): number {
    if (!text) return base
    const normalizedText = normalize(text)
    const normalizedQuery = normalize(query)

    let score = base
    if (normalizedText.startsWith(normalizedQuery)) score += 2
    if (normalizedText.includes(normalizedQuery)) score += 1
    return score
}

export async function searchAdminEntities(query: string): Promise<AdminSearchResults> {
    const trimmed = query.trim()
    if (trimmed.length < 3) {
        return { results: [] }
    }

    const escaped = escapeForILike(trimmed)
    const pattern = `%${escaped}%`

    const [tasksRes, projectsRes, clientsRes, filesRes] = await Promise.all([
        supabase
            .from('tasks')
            .select('id,title,description,status,due_date,client_id')
            .or(`title.ilike.${pattern},description.ilike.${pattern}`)
            .limit(ENTITY_LIMIT),
        supabase
            .from('projects')
            .select('id,title,description,status,due_date,client_id')
            .or(`title.ilike.${pattern},description.ilike.${pattern}`)
            .limit(ENTITY_LIMIT),
        supabase
            .from('clients')
            .select('id,name,primary_contact,email,status')
            .or(`name.ilike.${pattern},primary_contact.ilike.${pattern},email.ilike.${pattern}`)
            .limit(ENTITY_LIMIT),
        supabase
            .from('task_files')
            .select('id,file_name,is_external_link,file_url,external_url,task_id,created_at')
            .ilike('file_name', pattern)
            .limit(ENTITY_LIMIT),
    ])

    const errors = [tasksRes.error, projectsRes.error, clientsRes.error, filesRes.error].filter(Boolean)
    if (errors.length > 0) {
        throw errors[0]!
    }

    const results: AdminSearchResultItem[] = []

    const clientsById = new Map((clientsRes.data ?? []).map((client) => [client.id, client]))

    for (const task of tasksRes.data ?? []) {
        results.push({
            id: task.id,
            type: 'task',
            title: task.title,
            subtitle: task.description ?? null,
            metadata: task.due_date ? `Due ${new Date(task.due_date).toLocaleDateString()}` : null,
            navigationTarget: ROUTES.TASK_DETAIL.replace(':taskId', task.id),
            score: computeScore(task.title, trimmed, 4) + computeScore(task.description, trimmed, 0),
        })
    }

    for (const project of projectsRes.data ?? []) {
        const client = clientsById.get(project.client_id)
        results.push({
            id: project.id,
            type: 'project',
            title: project.title,
            subtitle: client?.name ?? null,
            metadata: project.due_date ? `Due ${new Date(project.due_date).toLocaleDateString()}` : null,
            navigationTarget: ROUTES.ADMIN_PROJECT_DETAIL.replace(':projectId', project.id),
            score: computeScore(project.title, trimmed, 3) + computeScore(client?.name, trimmed, 0.5),
        })
    }

    for (const client of clientsRes.data ?? []) {
        results.push({
            id: client.id,
            type: 'client',
            title: client.name,
            subtitle: client.primary_contact ?? null,
            metadata: client.email ?? null,
            navigationTarget: ROUTES.ADMIN_CLIENT_DETAIL.replace(':clientId', client.id),
            score: computeScore(client.name, trimmed, 2.5),
        })
    }

    for (const file of filesRes.data ?? []) {
        results.push({
            id: file.id,
            type: 'file',
            title: file.file_name,
            subtitle: 'File',
            metadata: file.created_at ? new Date(file.created_at).toLocaleString() : null,
            storagePath: file.file_url || null,
            externalUrl: file.external_url || null,
            isExternalLink: file.is_external_link ?? false,
            score: computeScore(file.file_name, trimmed, 2),
        })
    }

    const sorted = results
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RESULTS)

    return { results: sorted }
}
