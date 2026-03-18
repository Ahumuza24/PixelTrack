import { supabase } from './config'
import type { TaskComment, CreateTaskCommentInput } from '@/types'

type TaskCommentRow = {
    id: string
    task_id: string
    author_id: string | null
    body: string
    created_at: string
    updated_at: string
}

const mapComment = (row: TaskCommentRow): TaskComment => ({
    id: row.id,
    taskId: row.task_id,
    authorId: row.author_id,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
})

export async function listTaskComments(taskId: string): Promise<TaskComment[]> {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapComment)
}

export async function createTaskComment(input: CreateTaskCommentInput): Promise<TaskComment> {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    if (!token) {
        throw new Error('Not authenticated')
    }

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-task-comment`

    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(input),
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
        throw new Error(result.error || `Failed to create comment: ${response.status}`)
    }

    const comment = result.comment as TaskCommentRow | undefined
    if (!comment) {
        throw new Error('Comment creation response missing payload')
    }

    return mapComment(comment)
}

export async function deleteTaskComment(commentId: string): Promise<void> {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) throw error
}
