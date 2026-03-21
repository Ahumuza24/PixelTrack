import { useRef, useState, useCallback } from 'react'
import type { TaskFile } from '@/types'
import { UserRole } from '@/types'
import { useUploadTaskFile, useDeleteTaskFile } from './useTaskFiles'

interface UseTaskFilesSectionProps {
    taskId: string
    currentUserId: string | null
    currentUserRole: UserRole
}

interface UseTaskFilesSectionReturn {
    // Upload state
    isDragging: boolean
    setIsDragging: (value: boolean) => void
    linkName: string
    setLinkName: (value: string) => void
    linkUrl: string
    setLinkUrl: (value: string) => void
    uploadInputRef: React.RefObject<HTMLInputElement | null>

    // Preview state
    previewFile: TaskFile | null
    setPreviewFile: (file: TaskFile | null) => void

    // Mutation states
    isUploading: boolean

    // Actions
    handleFilesUpload: (files: FileList | null) => void
    handleLinkSubmit: (name: string, url: string) => void
    handleDelete: (file: TaskFile) => void
    canDelete: (file: TaskFile) => boolean
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void
}

export function useTaskFilesSection({
    taskId,
    currentUserId,
    currentUserRole,
}: UseTaskFilesSectionProps): UseTaskFilesSectionReturn {
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [linkName, setLinkName] = useState('')
    const [linkUrl, setLinkUrl] = useState('')
    const [previewFile, setPreviewFile] = useState<TaskFile | null>(null)

    const uploadMutation = useUploadTaskFile()
    const deleteMutation = useDeleteTaskFile()

    const canDelete = useCallback((file: TaskFile) => {
        if (currentUserRole === UserRole.ADMIN) return true
        if (currentUserRole === UserRole.EMPLOYEE && file.uploadedBy && file.uploadedBy === currentUserId) {
            return true
        }
        return false
    }, [currentUserRole, currentUserId])

    const handleFilesUpload = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles || uploadMutation.isPending) return
        Array.from(selectedFiles).forEach((file) => {
            uploadMutation.mutate({
                taskId,
                file,
                uploadedBy: currentUserId ?? undefined,
            })
        })
    }, [taskId, currentUserId, uploadMutation])

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)
        handleFilesUpload(event.dataTransfer.files)
    }, [handleFilesUpload])

    const handleLinkSubmit = useCallback((name: string, url: string) => {
        if (!name.trim() || !url.trim()) return
        uploadMutation.mutate({
            taskId,
            displayName: name.trim(),
            externalUrl: url.trim(),
            uploadedBy: currentUserId ?? undefined,
        })
        setLinkName('')
        setLinkUrl('')
    }, [taskId, currentUserId, uploadMutation])

    const handleDelete = useCallback((file: TaskFile) => {
        deleteMutation.mutate({ taskFileId: file.id, taskId })
    }, [taskId, deleteMutation])

    return {
        isDragging,
        setIsDragging,
        linkName,
        setLinkName,
        linkUrl,
        setLinkUrl,
        uploadInputRef,
        previewFile,
        setPreviewFile,
        isUploading: uploadMutation.isPending,
        handleFilesUpload,
        handleLinkSubmit,
        handleDelete,
        canDelete,
        onDrop,
    }
}
