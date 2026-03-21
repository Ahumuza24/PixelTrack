import { useState, useMemo, useCallback } from 'react'
import { useTaskFiles, useDeleteTaskFile } from '@/features/tasks/hooks/useTaskFiles'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { FileFilterType } from '@/features/files/constants'
import type { TaskFile } from '@/types'

interface UseFilesReturn {
    files: TaskFile[]
    isLoading: boolean
    searchQuery: string
    setSearchQuery: (query: string) => void
    filterType: FileFilterType | null
    setFilterType: (type: FileFilterType | null) => void
    selectedFileId: string | null
    setSelectedFileId: (id: string | null) => void
    viewMode: 'list' | 'grid'
    setViewMode: (mode: 'list' | 'grid') => void
    selectedFile: TaskFile | null
    handleDeleteFile: (fileId: string, taskId: string) => void
}

/**
 * Hook for managing file list state, filtering, and operations.
 */
export function useFiles(): UseFilesReturn {
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
    const [filterType, setFilterType] = useState<FileFilterType | null>(null)

    const { data: tasks = [] } = useTasks()
    const firstTaskId = tasks[0]?.id || null
    const { data: files = [], isLoading } = useTaskFiles(firstTaskId)
    const deleteFile = useDeleteTaskFile()

    const filteredFiles = useMemo(() => {
        let result = files

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
    }, [files, searchQuery, filterType])

    const selectedFile = useMemo(
        () => files.find((f) => f.id === selectedFileId) || null,
        [files, selectedFileId]
    )

    const handleDeleteFile = useCallback(
        (fileId: string, taskId: string) => {
            if (confirm('Are you sure you want to delete this file?')) {
                deleteFile.mutate({ taskFileId: fileId, taskId })
            }
        },
        [deleteFile]
    )

    return {
        files: filteredFiles,
        isLoading,
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
    }
}
