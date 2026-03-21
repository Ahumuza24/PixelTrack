import { Link, MoreVertical, ExternalLink, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

interface FileRowProps {
    file: TaskFile
    isSelected: boolean
    onClick: () => void
    onDelete: () => void
}

export function FileRow({ file, isSelected, onClick, onDelete }: FileRowProps) {
    const Icon = file.isExternalLink
        ? Link
        : FILE_ICONS[file.fileType] || FILE_ICONS.default
    const colorClass = file.isExternalLink
        ? FILE_COLORS['external-link']
        : FILE_COLORS[file.fileType] || FILE_COLORS.default

    const fileTypeLabel = file.isExternalLink
        ? 'External Link'
        : file.fileType.split('/')[1]?.toUpperCase() || 'File'

    return (
        <TableRow
            onClick={onClick}
            data-selected={isSelected}
            className="cursor-pointer hover:bg-muted/50 data-[selected=true]:bg-primary/5"
        >
            <TableCell>
                <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${colorClass}`} />
                    <span className="text-sm font-medium">{file.fileName}</span>
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
                <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {file.uploadedBy?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                </Avatar>
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
