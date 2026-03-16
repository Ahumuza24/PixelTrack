import { useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
    UploadCloud,
    Link2,
    Image as ImageIcon,
    FileText,
    ExternalLink,
    Eye,
    Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TaskFile } from '@/types'
import { UserRole } from '@/types'
import { useUploadTaskFile, useDeleteTaskFile, useSignedTaskFileUrl } from '../hooks/useTaskFiles'

interface TaskFilesSectionProps {
    taskId: string
    files?: TaskFile[]
    isLoading: boolean
    canManageFiles: boolean
    currentUserId: string | null
    currentUserRole: UserRole
}

const IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml'])

export function TaskFilesSection({
    taskId,
    files,
    isLoading,
    canManageFiles,
    currentUserId,
    currentUserRole,
}: TaskFilesSectionProps) {
    const uploadInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [linkName, setLinkName] = useState('')
    const [linkUrl, setLinkUrl] = useState('')
    const [previewFile, setPreviewFile] = useState<TaskFile | null>(null)

    const uploadMutation = useUploadTaskFile()
    const deleteMutation = useDeleteTaskFile()

    const canDelete = (file: TaskFile) => {
        if (currentUserRole === UserRole.ADMIN) return true
        if (currentUserRole === UserRole.EMPLOYEE && file.uploadedBy && file.uploadedBy === currentUserId) {
            return true
        }
        return false
    }

    const handleFilesUpload = (selectedFiles: FileList | null) => {
        if (!selectedFiles || uploadMutation.isPending) return
        Array.from(selectedFiles).forEach((file) => {
            uploadMutation.mutate({
                taskId,
                file,
                uploadedBy: currentUserId ?? undefined,
            })
        })
    }

    const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setIsDragging(false)
        if (!canManageFiles) return
        handleFilesUpload(event.dataTransfer.files)
    }

    const handleLinkSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if (!linkName.trim() || !linkUrl.trim()) return
        uploadMutation.mutate({
            taskId,
            displayName: linkName.trim(),
            externalUrl: linkUrl.trim(),
            uploadedBy: currentUserId ?? undefined,
        })
        setLinkName('')
        setLinkUrl('')
    }

    const handleDelete = (file: TaskFile) => {
        deleteMutation.mutate({ taskFileId: file.id, taskId })
    }

    const renderEmptyState = () => (
        <div className="text-center py-10 px-4 text-slate-500">
            <p className="font-medium">No design files yet</p>
            <p className="text-sm">Uploads will appear here for clients and teammates to review.</p>
        </div>
    )

    return (
        <div className="space-y-6">
            {canManageFiles && (
                <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            if (canManageFiles) setIsDragging(true)
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault()
                            setIsDragging(false)
                        }}
                        onDrop={onDrop}
                        className={cn(
                            'rounded-xl border-2 border-dashed p-6 bg-white transition-colors',
                            isDragging ? 'border-cobalt bg-cobalt/5' : 'border-slate-200'
                        )}
                    >
                        <div className="flex flex-col items-center text-center gap-3">
                            <UploadCloud className="w-10 h-10 text-cobalt" />
                            <div>
                                <p className="font-semibold text-slate-900">Upload design files</p>
                                <p className="text-sm text-slate-500">PNG, JPG, SVG, or PDF up to 25 MB</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    onClick={() => uploadInputRef.current?.click()}
                                    disabled={uploadMutation.isPending}
                                >
                                    Choose files
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => uploadInputRef.current?.click()}
                                    disabled={uploadMutation.isPending}
                                >
                                    Browse device
                                </Button>
                            </div>
                            <input
                                ref={uploadInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept={Array.from(IMAGE_MIME_TYPES).concat('application/pdf').join(',')}
                                onChange={(event) => handleFilesUpload(event.target.files)}
                            />
                        </div>
                    </div>

                    <form
                        onSubmit={handleLinkSubmit}
                        className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
                    >
                        <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-cobalt" />
                            <span className="font-semibold text-slate-900">Add a link</span>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkName">Display name</Label>
                            <Input
                                id="linkName"
                                placeholder="e.g. Figma prototype"
                                value={linkName}
                                onChange={(event) => setLinkName(event.target.value)}
                                disabled={uploadMutation.isPending}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkUrl">URL</Label>
                            <Input
                                id="linkUrl"
                                type="url"
                                placeholder="https://..."
                                value={linkUrl}
                                onChange={(event) => setLinkUrl(event.target.value)}
                                disabled={uploadMutation.isPending}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                            Save link
                        </Button>
                    </form>
                </div>
            )}

            <section className="rounded-xl border border-slate-200 bg-white">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <p className="font-semibold text-slate-900">Design Files</p>
                        <p className="text-sm text-slate-500">Versioned uploads shared with the client.</p>
                    </div>
                    <Badge variant="secondary">{files?.length ?? 0} files</Badge>
                </header>
                <div className="p-6">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-32 rounded-lg bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : !files || files.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {files.map((file) => (
                                <TaskFileCard
                                    key={file.id}
                                    file={file}
                                    onPreview={() => setPreviewFile(file)}
                                    onDelete={() => handleDelete(file)}
                                    canDelete={canDelete(file)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <FilePreviewDialog
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </div>
    )
}

interface TaskFileCardProps {
    file: TaskFile
    onPreview: () => void
    onDelete: () => void
    canDelete: boolean
}

function TaskFileCard({ file, onPreview, onDelete, canDelete }: TaskFileCardProps) {
    const isImage = IMAGE_MIME_TYPES.has(file.fileType)
    return (
        <div className="rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                        {file.isExternalLink ? (
                            <ExternalLink className="w-5 h-5 text-slate-500" />
                        ) : isImage ? (
                            <ImageIcon className="w-5 h-5 text-slate-500" />
                        ) : (
                            <FileText className="w-5 h-5 text-slate-500" />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 break-words">{file.fileName}</p>
                        <p className="text-xs text-slate-500">
                            Uploaded {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <Badge variant="outline">v{file.version}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onPreview}
                >
                    <Eye className="w-4 h-4 mr-1" /> Preview
                </Button>
                {file.isExternalLink && file.externalUrl && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        asChild
                    >
                        <a href={file.externalUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" /> Open link
                        </a>
                    </Button>
                )}
                {canDelete && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                )}
            </div>
        </div>
    )
}

interface FilePreviewDialogProps {
    file: TaskFile | null
    onClose: () => void
}

function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
    const isOpen = Boolean(file)
    const isImage = file ? IMAGE_MIME_TYPES.has(file.fileType) : false

    const { data: signedUrl, isLoading } = useSignedTaskFileUrl(
        file && !file.isExternalLink ? file.fileUrl : null,
        isOpen && Boolean(file && !file.isExternalLink)
    )

    if (!file) return null

    return (
        <div
            role="dialog"
            aria-modal="true"
            className={cn(
                'fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-opacity',
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
        >
            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <p className="font-semibold text-slate-900">{file.fileName}</p>
                        <p className="text-xs text-slate-500">Version {file.version}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        Close
                    </Button>
                </header>
                <div className="p-6">
                    {file.isExternalLink && file.externalUrl ? (
                        <div className="text-center space-y-3">
                            <ExternalLink className="w-10 h-10 text-cobalt mx-auto" />
                            <p className="text-sm text-slate-600">
                                This file is an external link. Open it in a new tab to preview.
                            </p>
                            <Button asChild>
                                <a href={file.externalUrl} target="_blank" rel="noreferrer">
                                    Open link
                                </a>
                            </Button>
                        </div>
                    ) : isLoading ? (
                        <div className="h-64 bg-slate-100 animate-pulse rounded-xl" />
                    ) : !signedUrl ? (
                        <p className="text-sm text-red-500">Preview unavailable. Please try again later.</p>
                    ) : isImage ? (
                        <img
                            src={signedUrl}
                            alt={file.fileName}
                            className="max-h-[60vh] w-full rounded-xl object-contain"
                        />
                    ) : (
                        <iframe
                            src={signedUrl}
                            title={file.fileName}
                            className="h-[60vh] w-full rounded-xl border border-slate-200"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
