import { Link, MoreVertical, ExternalLink, Download, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FILE_ICONS, FILE_COLORS } from '@/features/files/constants'
import { formatFileSize, formatShortDate } from '@/lib/formatters'
import type { TaskFile } from '@/types'

interface FileWithThumbnail extends TaskFile {
    clientName?: string
    thumbnailUrl?: string | null
}

interface FileRowProps {
    file: FileWithThumbnail
    isSelected: boolean
    onClick: () => void
    onDelete: () => void
    onView: () => void
}

function FileThumbnail({ file }: { file: FileWithThumbnail }) {
    const isImage = file.fileType.startsWith('image/')
    const Icon = file.isExternalLink
        ? Link
        : FILE_ICONS[file.fileType] || FILE_ICONS.default
    const colorClass = file.isExternalLink
        ? FILE_COLORS['external-link']
        : FILE_COLORS[file.fileType] || FILE_COLORS.default
    const bgClass = colorClass.replace('text-', 'bg-').replace('500', '100').replace('600', '100')

    // Show actual image thumbnail if available
    if (isImage && file.thumbnailUrl) {
        return (
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                <img
                    src={file.thumbnailUrl}
                    alt={file.fileName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                            parent.classList.add('flex', 'items-center', 'justify-center', bgClass)
                            const icon = document.createElement('div')
                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-3.09-3.09a2 2 0 0 0-2.83 0L10 18"/></svg>'
                            parent.appendChild(icon.firstChild as Node)
                        }
                    }}
                />
            </div>
        )
    }

    // Show icon for non-images or images without thumbnail
    return (
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
    )
}

export function FileRow({ file, isSelected, onClick, onDelete, onView }: FileRowProps) {
    const fileTypeLabel = file.isExternalLink
        ? 'External Link'
        : file.fileType.split('/')[1]?.toUpperCase() || 'File'

    return (
        <TableRow
            onClick={onClick}
            data-selected={isSelected}
            className="cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-primary/5 group"
        >
            <TableCell>
                <div className="flex items-center gap-3">
                    <FileThumbnail file={file} />
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.fileName}</span>
                </div>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">
                    {formatFileSize(file.fileSize)}
                </span>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">{fileTypeLabel}</span>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">{formatShortDate(file.createdAt)}</span>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                    {file.clientName || 'Unknown Client'}
                </span>
            </TableCell>
            <TableCell align="right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                            e.stopPropagation()
                            onView()
                        }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        {file.isExternalLink ? (
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                window.open(file.externalUrl || '#', '_blank')
                            }}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Link
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                // TODO: Implement download
                            }}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation()
                                onDelete()
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}
