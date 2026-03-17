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
    const { data, error } = await supabase
        .from('comments')
        .insert({
            task_id: input.taskId,
            author_id: input.authorId,
            body: input.body,
        })
        .select('*')
        .single()

    if (error) throw error
    return mapComment(data)
}

export async function deleteTaskComment(commentId: string): Promise<void> {
    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

    if (error) throw error
}
