import { useMemo } from 'react'
import { Building2, FileText, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useClientFiles } from '@/features/clients/hooks/useClientFiles'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/formatters'

function getFileIcon(fileType: string) {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('video')) return '🎬'
    if (fileType.includes('audio')) return '🎵'
    return '📎'
}

export function ClientFilesPage() {
    const { clientName, files, isLoading, notFound } = useClientFiles()
    const navigate = useNavigate()

    // Calculate recent uploads count - moved before conditional to comply with hooks rules
    const recentUploadsCount = useMemo(() => {
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now()
        return files.filter(f => {
            const daysSinceUpload = (now - new Date(f.uploadedAt).getTime()) / (1000 * 60 * 60 * 24)
            return daysSinceUpload <= 7
        }).length
    }, [files])

    const handleViewTask = (taskId: string) => {
        navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-semibold text-foreground mb-2">Client workspace not found</h1>
                <p className="text-muted-foreground max-w-md">
                    We couldn't load your client workspace. Please contact support if this issue persists.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cobalt/10">
                            <FileText className="h-6 w-6 text-cobalt" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Files</h1>
                            <p className="text-sm text-muted-foreground">{clientName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Total Files</p>
                            <div className="text-2xl font-semibold text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : files.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Recent Uploads</p>
                            <div className="text-2xl font-semibold text-cobalt">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : recentUploadsCount}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Files List */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Your Files</h2>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : files.length > 0 ? (
                        <div className="space-y-3">
                            {files.map((file) => (
                                <Card key={file.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl">{getFileIcon(file.fileType)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">{file.fileName}</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>{file.taskTitle}</span>
                                                    <span>•</span>
                                                    <span>{formatRelativeTime(file.uploadedAt)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
                                                    onClick={() => handleViewTask(file.taskId)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No files found</p>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    )
}
