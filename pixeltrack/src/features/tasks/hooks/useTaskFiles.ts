import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { TaskFile } from '@/types'
import {
    listTaskFiles,
    uploadTaskFile,
    deleteTaskFile,
    createSignedTaskFileUrl,
    type UploadTaskFileInput,
} from '@/lib/supabase/taskFiles'
import { getTask } from '@/lib/supabase/tasks'
import { publishNotificationsSafe } from '@/lib/notifications/dispatcher'

const TASK_FILES_QUERY_KEY = 'task-files'
const TASKS_QUERY_KEY = 'tasks'

interface DeleteTaskFileInput {
    taskFileId: string
    taskId: string
}

/**
 * Load all files that belong to a specific task.
 */
export function useTaskFiles(taskId: string | null) {
    const hasValidTaskId = Boolean(taskId && taskId.length > 0)
    return useQuery<TaskFile[]>({
        queryKey: [TASK_FILES_QUERY_KEY, taskId],
        queryFn: () => (hasValidTaskId ? listTaskFiles(taskId as string) : []),
        enabled: hasValidTaskId,
        staleTime: 1000 * 60,
    })
}

/**
 * Upload a new binary asset or external link for the given task.
 * Notifies task assignees of the new file.
 */
export function useUploadTaskFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: UploadTaskFileInput) => uploadTaskFile(input),
        onSuccess: async (_file, variables) => {
            const taskId = variables.taskId
            queryClient.invalidateQueries({ queryKey: [TASK_FILES_QUERY_KEY, taskId] })
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, taskId] })
            toast.success('File uploaded successfully')

            // Notify task assignees of file upload
            try {
                const task = await getTask(taskId)
                if (task && task.assignees && task.assignees.length > 0) {
                    const fileName = 'file' in variables ? variables.file.name : variables.displayName
                    const notifications = task.assignees.map((userId) => ({
                        userId,
                        type: 'file_uploaded' as const,
                        title: 'New file uploaded',
                        body: `File "${fileName}" uploaded to task "${task.title}"`,
                        actionUrl: `/tasks/${taskId}`,
                        relatedEntityType: 'task',
                        relatedEntityId: taskId,
                        metadata: {
                            taskId: task.id,
                            taskTitle: task.title,
                            fileName: fileName,
                        },
                        priority: 'normal' as const,
                    }))
                    void publishNotificationsSafe(notifications, 'file upload')
                }
            } catch {
                // Silently fail - notification failure shouldn't break file upload
            }
        },
        onError: (error: Error) => {
            toast.error(`Failed to upload file: ${error.message}`)
        },
    })
}

/**
 * Remove a file (and its storage object for binary uploads).
 */
export function useDeleteTaskFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskFileId }: DeleteTaskFileInput) => deleteTaskFile(taskFileId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [TASK_FILES_QUERY_KEY, variables.taskId] })
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, variables.taskId] })
            toast.success('File deleted successfully')
        },
        onError: (error: Error) => {
            toast.error(`Failed to delete file: ${error.message}`)
        },
    })
}

/**
 * Retrieve a short-lived signed URL for secure previews when the file lives in storage.
 */
export function useSignedTaskFileUrl(objectPath: string | null, enabled = true) {
    return useQuery({
        queryKey: ['task-file-url', objectPath],
        queryFn: () => (objectPath ? createSignedTaskFileUrl(objectPath) : null),
        enabled: Boolean(objectPath && enabled),
        staleTime: 1000 * 30,
        refetchOnWindowFocus: false,
    })
}
