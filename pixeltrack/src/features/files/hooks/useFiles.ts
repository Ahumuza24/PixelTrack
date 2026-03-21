import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTaskFiles, useDeleteTaskFile } from '@/features/tasks/hooks/useTaskFiles'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients/hooks/useClients'
import { createSignedTaskFileUrl } from '@/lib/supabase/taskFiles'
import { FileFilterType } from '@/features/files/constants'
import type { TaskFile } from '@/types'

interface FileWithClient extends TaskFile {
    clientName?: string
    clientId?: string
    thumbnailUrl?: string | null
}

interface UseFilesReturn {
    tasks: FileWithClient[]
    isLoading: boolean
    searchQuery: string
    setSearchQuery: (query: string) => void
    filterType: FileFilterType | null
    setFilterType: (type: FileFilterType | null) => void
    selectedFileId: string | null
    setSelectedFileId: (id: string | null) => void
    viewMode: 'list' | 'grid'
    setViewMode: (mode: 'list' | 'grid') => void
    selectedFile: FileWithClient | null
    handleDeleteFile: (fileId: string, taskId: string) => void
    handleViewFile: (file: FileWithClient) => void
    viewingFile: FileWithClient | null
    setViewingFile: (file: FileWithClient | null) => void
    previewUrl: string | null
    isPreviewLoading: boolean
}

const THUMBNAIL_QUERY_KEY = 'file-thumbnails'

/**
 * Generate signed URLs for image thumbnails.
 */
function useThumbnailUrls(files: TaskFile[]) {
    const queryClient = useQueryClient()
    
    const imageFiles = useMemo(() => 
        files.filter(f => f.fileType.startsWith('image/') && f.fileUrl && !f.isExternalLink),
        [files]
    )

    // Generate thumbnail URLs for all images
    useEffect(() => {
        imageFiles.forEach(async (file) => {
            if (!file.fileUrl) return
            
            const queryKey = [THUMBNAIL_QUERY_KEY, file.id]
            
            // Check if we already have a valid URL cached
            const existing = queryClient.getQueryData<string>(queryKey)
            if (existing) return

            try {
                const signedUrl = await createSignedTaskFileUrl(file.fileUrl, 300) // 5 min expiry for thumbnails
                queryClient.setQueryData(queryKey, signedUrl)
            } catch {
                // Silent fail - thumbnail will show fallback icon
            }
        })
    }, [imageFiles, queryClient])

    // Get all cached thumbnail URLs
    const thumbnailUrls = useMemo(() => {
        const urls: Record<string, string> = {}
        imageFiles.forEach(file => {
            const url = queryClient.getQueryData<string>([THUMBNAIL_QUERY_KEY, file.id])
            if (url) urls[file.id] = url
        })
        return urls
    }, [imageFiles, queryClient])

    return thumbnailUrls
}

/**
 * Hook for managing file list state, filtering, and operations.
 */
export function useFiles(): UseFilesReturn {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<FileFilterType | null>(null)
    const [viewingFile, setViewingFile] = useState<FileWithClient | null>(null)

    const { data: rawTasks = [] } = useTasks()
    const { data: clients = [] } = useClients()
    const firstTaskId = rawTasks[0]?.id || null
    const { data: files = [], isLoading: filesLoading } = useTaskFiles(firstTaskId)
    const deleteFile = useDeleteTaskFile()

    // Get thumbnail URLs for images
    const thumbnailUrls = useThumbnailUrls(files)

    // Create a map of taskId to client info
    const taskClientMap = useMemo(() => {
        const map = new Map<string, { clientId: string; clientName: string }>()
        rawTasks.forEach((task) => {
            const client = clients.find((c) => c.id === task.clientId)
            map.set(task.id, {
                clientId: task.clientId,
                clientName: client?.name || client?.primaryContact || 'Unknown Client',
            })
        })
        return map
    }, [rawTasks, clients])

    // Enrich files with client data and thumbnail URLs
    const filesWithClient: FileWithClient[] = useMemo(() => {
        return files.map((file) => {
            const clientInfo = taskClientMap.get(file.taskId)
            return {
                ...file,
                clientId: clientInfo?.clientId,
                clientName: clientInfo?.clientName,
                thumbnailUrl: thumbnailUrls[file.id] || null,
            }
        })
    }, [files, taskClientMap, thumbnailUrls])

    const filteredFiles = useMemo(() => {
        let result = filesWithClient

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter((file) => file.fileName.toLowerCase().includes(query))
        }

        if (filterType) {
            result = result.filter((file) => {
                if (filterType === FileFilterType.IMAGE) return file.fileType.startsWith('image/')
                if (filterType === FileFilterType.DOCUMENT) return file.fileType === 'application/pdf'
                if (filterType === FileFilterType.SOURCE) return file.fileType.includes('svg') || file.isExternalLink
                return true
            })
        }

        return result
    }, [filesWithClient, searchQuery, filterType])

    const selectedFile = useMemo(
        () => filteredFiles.find((f) => f.id === selectedFileId) || null,
        [filteredFiles, selectedFileId]
    )

    // Get signed URL for preview using useEffect for more control
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)

    useEffect(() => {
        if (!viewingFile) {
            setPreviewUrl(null)
            setIsPreviewLoading(false)
            return
        }

        // Handle external links immediately
        if (viewingFile.isExternalLink) {
            setPreviewUrl(viewingFile.externalUrl || null)
            setIsPreviewLoading(false)
            return
        }

        // Need to fetch signed URL
        if (!viewingFile.fileUrl) {
            setPreviewUrl(null)
            setIsPreviewLoading(false)
            return
        }

        let cancelled = false
        setIsPreviewLoading(true)

        createSignedTaskFileUrl(viewingFile.fileUrl, 60)
            .then((url) => {
                if (!cancelled) {
                    setPreviewUrl(url)
                    setIsPreviewLoading(false)
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setPreviewUrl(null)
                    setIsPreviewLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [viewingFile])

    const handleDeleteFile = useCallback(
        (fileId: string, taskId: string) => {
            if (confirm('Are you sure you want to delete this file?')) {
                deleteFile.mutate({ taskFileId: fileId, taskId })
            }
        },
        [deleteFile]
    )

    const handleViewFile = useCallback((file: FileWithClient) => {
        setViewingFile(file)
    }, [])

    return {
        tasks: filteredFiles,
        isLoading: filesLoading,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        selectedFileId,
        setSelectedFileId,
        viewMode,
        setViewMode,
        selectedFile,
        handleDeleteFile,
        handleViewFile,
        viewingFile,
        setViewingFile,
        previewUrl: previewUrl || null,
        isPreviewLoading,
    }
}
