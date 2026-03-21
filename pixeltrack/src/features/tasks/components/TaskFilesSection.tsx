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
import { formatRelativeTime } from '@/lib/formatters'
import type { TaskFile } from '@/types'
import { useSignedTaskFileUrl } from '../hooks/useTaskFiles'
import { IMAGE_MIME_TYPES, ACCEPTED_FILE_TYPES } from '@/features/tasks/constants/taskFiles'

// ============================================================================
// Types
// ============================================================================

interface TaskFilesSectionProps {
    files?: TaskFile[]
    isLoading: boolean
    canManageFiles: boolean
    onUpload: (files: FileList | null) => void
    onLinkSubmit: (name: string, url: string) => void
    onDelete: (file: TaskFile) => void
    onPreview: (file: TaskFile) => void
    uploadInputRef: React.RefObject<HTMLInputElement | null>
    isUploading: boolean
    linkName: string
    setLinkName: (value: string) => void
    linkUrl: string
    setLinkUrl: (value: string) => void
    isDragging: boolean
    setIsDragging: (value: boolean) => void
    onDrop: (event: React.DragEvent<HTMLDivElement>) => void
    canDelete: (file: TaskFile) => boolean
}

interface TaskFileCardProps {
    file: TaskFile
    onPreview: () => void
    onDelete: () => void
    canDelete: boolean
}

interface FilePreviewDialogProps {
    file: TaskFile | null
    onClose: () => void
}

// ============================================================================
// Components
// ============================================================================

export function TaskFilesSection({
    files,
    isLoading,
    canManageFiles,
    onUpload,
    onLinkSubmit,
    onDelete,
    onPreview,
    uploadInputRef,
    isUploading,
    linkName,
    setLinkName,
    linkUrl,
    setLinkUrl,
    isDragging,
    setIsDragging,
    onDrop,
    canDelete,
}: TaskFilesSectionProps) {
    const handleLinkSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        onLinkSubmit(linkName, linkUrl)
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
                                    disabled={isUploading}
                                >
                                    Choose files
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => uploadInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    Browse device
                                </Button>
                            </div>
                            <input
                                ref={uploadInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                accept={ACCEPTED_FILE_TYPES.join(',')}
                                onChange={(event) => onUpload(event.target.files)}
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
                                disabled={isUploading}
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
                                disabled={isUploading}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isUploading}>
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
                                    onPreview={() => onPreview(file)}
                                    onDelete={() => onDelete(file)}
                                    canDelete={canDelete(file)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

function TaskFileCard({ file, onPreview, onDelete, canDelete }: TaskFileCardProps) {
    const isImage = IMAGE_MIME_TYPES.has(file.fileType)
    const { data: thumbnailUrl } = useSignedTaskFileUrl(
        isImage && !file.isExternalLink ? file.fileUrl : null,
        isImage && !file.isExternalLink
    )

    return (
        <div className="rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {file.isExternalLink ? (
                            <ExternalLink className="w-5 h-5 text-slate-500" />
                        ) : isImage && thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={file.fileName}
                                className="w-full h-full object-cover"
                            />
                        ) : isImage ? (
                            <ImageIcon className="w-5 h-5 text-slate-500" />
                        ) : (
                            <FileText className="w-5 h-5 text-slate-500" />
                        )}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 truncate max-w-[100px]" title={file.fileName}>{file.fileName}</p>
                        <p className="text-xs text-slate-500">
                            Uploaded {formatRelativeTime(file.createdAt)}
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

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
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
                        <p className="font-semibold text-slate-900 truncate max-w-md">{file.fileName}</p>
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

// Re-export for convenience
export { IMAGE_MIME_TYPES } from '@/features/tasks/constants/taskFiles'
