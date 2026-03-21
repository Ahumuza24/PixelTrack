import {
    ExternalLink,
    FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useSignedTaskFileUrl } from '@/features/tasks/hooks/useTaskFiles'
import { IMAGE_MIME_TYPES } from '@/features/tasks/constants/taskFiles'
import type { TaskFile } from '@/types'

interface FilePreviewDialogProps {
    file: TaskFile | null
    onClose: () => void
}

/**
 * FilePreviewDialog - Modal dialog for previewing files
 * 
 * Displays images, PDFs, and external links in a modal overlay.
 * Uses signed URLs for secure access to private storage files.
 */
export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
    const isOpen = Boolean(file)
    const isImage = file 
        ? IMAGE_MIME_TYPES.has(file.fileType) || file.fileType.startsWith('image/') 
        : false

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
                'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity',
                isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
            onClick={onClose}
        >
            <div 
                className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <p className="font-semibold text-slate-900 truncate max-w-md">{file.fileName}</p>
                        <p className="text-xs text-slate-500">Version {file.version}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {file.isExternalLink && file.externalUrl && (
                            <Button asChild size="sm">
                                <a href={file.externalUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open
                                </a>
                            </Button>
                        )}
                        {!file.isExternalLink && signedUrl && (
                            <Button asChild size="sm">
                                <a href={signedUrl} target="_blank" rel="noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open
                                </a>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </header>
                <div className="p-6 flex items-center justify-center bg-slate-50 min-h-[300px]">
                    {file.isExternalLink && file.externalUrl ? (
                        <div className="text-center space-y-3">
                            <ExternalLink className="w-12 h-12 text-slate-400 mx-auto" />
                            <p className="text-sm text-slate-600">
                                This file is an external link.
                            </p>
                            <Button asChild>
                                <a href={file.externalUrl} target="_blank" rel="noreferrer">
                                    Open link
                                </a>
                            </Button>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                            <p className="text-sm">Loading preview...</p>
                        </div>
                    ) : !signedUrl ? (
                        <div className="text-center space-y-3">
                            <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                            <p className="text-sm text-slate-600">Preview unavailable.</p>
                        </div>
                    ) : isImage ? (
                        <img
                            src={signedUrl}
                            alt={file.fileName}
                            className="max-h-[70vh] w-auto rounded-xl object-contain shadow-lg"
                        />
                    ) : (
                        <iframe
                            src={signedUrl}
                            title={file.fileName}
                            className="h-[70vh] w-full rounded-xl border border-slate-200"
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
