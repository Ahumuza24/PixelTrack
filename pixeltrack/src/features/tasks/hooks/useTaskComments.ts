import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { TaskComment, CreateTaskCommentInput } from '@/types'
import { listTaskComments, createTaskComment, deleteTaskComment } from '@/lib/supabase/taskComments'

const TASK_COMMENTS_QUERY_KEY = 'task-comments'

interface DeleteTaskCommentInput {
    commentId: string
    taskId: string
}

export function useTaskComments(taskId: string | null) {
    return useQuery<TaskComment[]>({
        queryKey: [TASK_COMMENTS_QUERY_KEY, taskId],
        queryFn: () => (taskId ? listTaskComments(taskId) : []),
        enabled: Boolean(taskId),
        staleTime: 1000 * 30,
    })
}

export function useCreateTaskComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CreateTaskCommentInput) => createTaskComment(input),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [TASK_COMMENTS_QUERY_KEY, variables.taskId] })
            toast.success('Comment added successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to add comment: ${error.message}`)
        },
    })
}

export function useDeleteTaskComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ commentId }: DeleteTaskCommentInput) => deleteTaskComment(commentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [TASK_COMMENTS_QUERY_KEY, variables.taskId] })
            toast.success('Comment deleted successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete comment: ${error.message}`)
        },
    })
}
