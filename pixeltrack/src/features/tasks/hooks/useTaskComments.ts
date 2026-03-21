import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { TaskComment, CreateTaskCommentInput } from '@/types'
import { listTaskComments, createTaskComment, deleteTaskComment } from '@/lib/supabase/taskComments'
import { getTask } from '@/lib/supabase/tasks'
import { publishNotificationsSafe } from '@/lib/notifications/dispatcher'

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
        onSuccess: async (_comment, variables) => {
            queryClient.invalidateQueries({ queryKey: [TASK_COMMENTS_QUERY_KEY, variables.taskId] })
            toast.success('Comment added successfully')

            // Notify task participants of new comment
            try {
                const task = await getTask(variables.taskId)
                if (task && task.assignees && task.assignees.length > 0) {
                    const snippet = variables.body.slice(0, 100) + (variables.body.length > 100 ? '...' : '')
                    const notifications = task.assignees.map((userId) => ({
                        userId,
                        type: 'comment_added' as const,
                        title: 'New comment on task',
                        body: `Comment on "${task.title}": ${snippet}`,
                        actionUrl: `/tasks/${variables.taskId}`,
                        relatedEntityType: 'task',
                        relatedEntityId: variables.taskId,
                        metadata: {
                            taskId: task.id,
                            taskTitle: task.title,
                            commentSnippet: snippet,
                        },
                        priority: 'normal' as const,
                    }))
                    void publishNotificationsSafe(notifications, 'comment creation')
                }
            } catch {
                // Silently fail - notification failure shouldn't break comment creation
            }
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
