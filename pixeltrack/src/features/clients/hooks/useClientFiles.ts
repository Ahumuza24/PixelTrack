import { useMemo } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useClient } from '@/features/clients/hooks/useClients'
import { useTaskFiles } from '@/features/tasks/hooks/useTaskFiles'
import { useTasksByClient } from '@/features/tasks/hooks/useTasks'
import type { TaskFile } from '@/types'

interface FileWithTask extends TaskFile {
    taskTitle: string
    taskId: string
    uploadedAt: string
}

interface UseClientFilesResult {
    clientName: string
    files: FileWithTask[]
    isLoading: boolean
    notFound: boolean
}

export function useClientFiles(): UseClientFilesResult {
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const { data: client, isLoading: clientLoading } = useClient(clientId)
    const { data: tasks = [], isLoading: tasksLoading } = useTasksByClient(clientId)

    const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])

    // Fetch files for all tasks
    const { data: taskFilesMap, isLoading: filesLoading } = useTaskFiles(taskIds)

    const files = useMemo<FileWithTask[]>(() => {
        const allFiles: FileWithTask[] = []
        const taskMap = new Map(tasks.map((t) => [t.id, t.title]))

        taskFilesMap?.forEach((taskFiles, taskId) => {
            const taskTitle = taskMap.get(taskId) ?? 'Unknown Task'
            taskFiles.forEach((file) => {
                allFiles.push({
                    ...file,
                    taskTitle,
                    taskId,
                    uploadedAt: file.createdAt,
                })
            })
        })

        // Sort by upload date, newest first
        return allFiles.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    }, [taskFilesMap, tasks])

    const isLoading = clientLoading || tasksLoading || filesLoading
    const notFound = !!clientId && !client && !isLoading

    return {
        clientName: client?.name ?? 'Client Portal',
        files,
        isLoading,
        notFound,
    }
}
