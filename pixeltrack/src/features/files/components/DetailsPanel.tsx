import { Link, X, Clock, Send, Check, History, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { FILE_ICONS, FILE_COLORS } from '@/features/files/constants'
import { formatDateTime, formatShortDate } from '@/lib/formatters'
import type { TaskFile } from '@/types'

interface FileWithThumbnail extends TaskFile {
    thumbnailUrl?: string | null
    clientName?: string
}

interface DetailsPanelProps {
    file: FileWithThumbnail | null
    onClose: () => void
    onView?: () => void
}

function EmptyDetailsPanel() {
    return (
        <div className="hidden lg:flex w-80 flex-col border-l bg-background p-6 items-center justify-center text-muted-foreground">
            Select a file to view details
        </div>
    )
}

function VersionHistory({ version, createdAt }: { version: number; createdAt: string }) {
    return (
        <div className="px-4 pb-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Version History
            </h4>
            <div className="space-y-3">
                <div className="flex gap-3 relative">
                    <div className="absolute left-[11px] top-6 bottom-[-12px] w-px bg-border" />
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center shrink-0 z-10">
                        <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Version {version}.0 (Current)</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(createdAt)}</p>
                    </div>
                </div>

                {version > 1 && (
                    <div className="flex gap-3">
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <History className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Version {version - 1}.0</p>
                            <p className="text-xs text-muted-foreground">Previous version</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function CommentsSection() {
    return (
        <div className="flex-1 flex flex-col px-4 min-h-0">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Comments
            </h4>
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                No comments yet
            </div>

            <div className="flex gap-2 py-4">
                <Input
                    placeholder="Add a comment..."
                    className="flex-1 h-9 text-sm"
                />
                <Button size="icon" className="h-9 w-9 shrink-0">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}

function FileThumbnail({ file, colorClass, bgClass, onClick }: { 
    file: FileWithThumbnail
    colorClass: string
    bgClass: string
    onClick?: () => void
}) {
    const isImage = file.fileType.startsWith('image/')
    const Icon = file.isExternalLink
        ? Link
        : FILE_ICONS[file.fileType] || FILE_ICONS.default

    // Show actual image thumbnail if available
    if (isImage && file.thumbnailUrl) {
        return (
            <div 
                className={`aspect-video flex items-center justify-center ${bgClass} relative group cursor-pointer overflow-hidden rounded-lg`}
                onClick={onClick}
            >
                <img
                    src={file.thumbnailUrl}
                    alt={file.fileName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                    }}
                />
                {onClick && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-8 w-8 text-white" />
                    </div>
                )}
            </div>
        )
    }

    // Show icon for non-images or images without thumbnail
    return (
        <div 
            className={`aspect-video flex items-center justify-center ${bgClass} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
            onClick={onClick}
        >
            <Icon className={`h-16 w-16 ${colorClass} opacity-20`} />
        </div>
    )
}

export function DetailsPanel({ file, onClose, onView }: DetailsPanelProps) {
    if (!file) {
        return <EmptyDetailsPanel />
    }

    const colorClass = file.isExternalLink
        ? FILE_COLORS['external-link']
        : FILE_COLORS[file.fileType] || FILE_COLORS.default
    const bgClass = colorClass.replace('text-', 'bg-').replace('500', '100')

    return (
        <div className="hidden lg:flex w-80 flex-col border-l bg-background">
            <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">Details</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4">
                <Card>
                    <CardContent className="p-0">
                        <FileThumbnail 
                            file={file} 
                            colorClass={colorClass} 
                            bgClass={bgClass}
                            onClick={onView}
                        />
                        <div className="p-4">
                            <p className="text-sm font-semibold truncate">{file.fileName}</p>
                            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span className="text-xs">
                                    Uploaded {formatShortDate(file.createdAt)}
                                </span>
                            </div>
                            {file.clientName && (
                                <div className="mt-2 pt-2 border-t">
                                    <span className="text-xs text-muted-foreground">Client: </span>
                                    <span className="text-xs font-medium">{file.clientName}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <VersionHistory version={file.version} createdAt={file.createdAt} />

            <div className="flex-1 border-t" />

            <CommentsSection />
        </div>
    )
}
