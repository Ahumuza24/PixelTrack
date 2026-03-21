import {
    Search,
    Upload,
    FolderPlus,
    Share2,
    List,
    LayoutGrid,
    ChevronRight,
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
import { FileRow } from '@/features/files/components/FileRow'
import { FilePreviewDialog } from '@/features/files/components/FilePreviewDialog'
import { DetailsPanel } from '@/features/files/components/DetailsPanel'
import { useFiles } from '@/features/files/hooks/useFiles'
import { FileFilterType, FILE_TYPE_LABELS } from '@/features/files/constants'

/**
 * FilesPage - Presentational component for file management
 * 
 * All business logic is handled by useFiles hook.
 * This component only handles rendering and user interaction callbacks.
 */
export function FilesPage() {
    const {
        files,
        isLoading,
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        selectedFileId,
        setSelectedFileId,
        selectedFile,
        viewMode,
        setViewMode,
        handleDeleteFile,
        previewFile,
        handleViewFile,
        handleClosePreview,
    } = useFiles()

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
                            ) : files.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No files found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                files.map((file) => (
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
                onClose={handleClosePreview}
            />
        </div>
    )
}
