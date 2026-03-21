import { useState } from 'react'
import {
    Search,
    Upload,
    FolderPlus,
    Share2,
    List,
    LayoutGrid,
    ChevronRight,
    ExternalLink,
    FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { FileRow } from '@/features/files/components/FileRow'
import { DetailsPanel } from '@/features/files/components/DetailsPanel'
import { useFiles } from '@/features/files/hooks/useFiles'
import { useSignedTaskFileUrl } from '@/features/tasks/hooks/useTaskFiles'
import { FileFilterType, FILE_TYPE_LABELS } from '@/features/files/constants'
import type { TaskFile } from '@/types'

interface FileWithClient extends TaskFile {
    clientName?: string
    clientId?: string
    thumbnailUrl?: string | null
}

const IMAGE_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml'])

interface FilePreviewDialogProps {
    file: FileWithClient | null
    onClose: () => void
}

function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
    const isOpen = Boolean(file)
    const isImage = file ? IMAGE_MIME_TYPES.has(file.fileType) || file.fileType.startsWith('image/') : false

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

export function FilesPage() {
    const {
        tasks,
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
    } = useFiles()

    const [previewFile, setPreviewFile] = useState<FileWithClient | null>(null)

    const handleViewFile = (file: FileWithClient) => {
        setPreviewFile(file)
    }

    const handleCloseView = () => {
        setPreviewFile(null)
    }

    const renderFilterBadge = (type: FileFilterType) => (
        <Badge
            variant={filterType === type ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFilterType(filterType === type ? null : type)}
        >
            {FILE_TYPE_LABELS[type]}
        </Badge>
    )

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card/50">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                        All Files
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Files</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <FolderPlus className="h-4 w-4 mr-2" />
                        New Folder
                    </Button>
                    <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                        Filter by:
                    </span>
                    {renderFilterBadge(FileFilterType.IMAGE)}
                    {renderFilterBadge(FileFilterType.DOCUMENT)}
                    {renderFilterBadge(FileFilterType.SOURCE)}
                </div>

                <Tabs value={viewMode} onValueChange={(v: string) => v && setViewMode(v as 'list' | 'grid')}>
                    <TabsList className="h-8">
                        <TabsTrigger value="list" className="px-2">
                            <List className="h-4 w-4" />
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="px-2">
                            <LayoutGrid className="h-4 w-4" />
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Search */}
            <div className="px-6 py-3 border-b">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files, folders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold">Name</TableHead>
                                <TableHead className="font-semibold">Size</TableHead>
                                <TableHead className="font-semibold">Type</TableHead>
                                <TableHead className="font-semibold">Modified</TableHead>
                                <TableHead className="font-semibold">Client</TableHead>
                                <TableHead className="font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Loading files...
                                    </TableCell>
                                </TableRow>
                            ) : tasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No files found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tasks.map((file) => (
                                    <FileRow
                                        key={file.id}
                                        file={file}
                                        isSelected={selectedFileId === file.id}
                                        onClick={() => setSelectedFileId(file.id)}
                                        onDelete={() => handleDeleteFile(file.id, file.taskId)}
                                        onView={() => handleViewFile(file)}
                                    />
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <DetailsPanel 
                    file={selectedFile} 
                    onClose={() => setSelectedFileId(null)} 
                    onView={() => selectedFile && handleViewFile(selectedFile)}
                />
            </div>

            {/* File Preview Dialog */}
            <FilePreviewDialog
                file={previewFile}
                onClose={handleCloseView}
            />
        </div>
    )
}
