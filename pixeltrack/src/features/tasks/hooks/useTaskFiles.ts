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
    return useQuery<TaskFile[]>({
        queryKey: [TASK_FILES_QUERY_KEY, taskId],
        queryFn: () => (taskId ? listTaskFiles(taskId) : []),
        enabled: Boolean(taskId),
        staleTime: 1000 * 60,
    })
}

/**
 * Upload a new binary asset or external link for the given task.
 */
export function useUploadTaskFile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: UploadTaskFileInput) => uploadTaskFile(input),
        onSuccess: (_, variables) => {
            const taskId = variables.taskId
            queryClient.invalidateQueries({ queryKey: [TASK_FILES_QUERY_KEY, taskId] })
            queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, taskId] })
            toast.success('File uploaded successfully')
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
