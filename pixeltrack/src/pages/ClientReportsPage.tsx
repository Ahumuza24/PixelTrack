import { useState, useMemo } from 'react'
import { Building2, FileText, Download, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientReport } from '@/features/analytics/hooks/useAnalytics'
import { useAuth } from '@/features/auth/useAuth'
import { useClient } from '@/features/clients/hooks/useClients'
import { exportClientReportToPdf, exportClientReportToCsv } from '@/features/analytics/utils/exportReport'
import type { AnalyticsDateRange } from '@/types'

function formatRangeLabel(range: AnalyticsDateRange) {
    const from = new Date(range.from).toLocaleDateString()
    const to = new Date(range.to).toLocaleDateString()
    return `${from} – ${to}`
}

export function ClientReportsPage() {
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const { data: client, isLoading: clientLoading } = useClient(clientId)

    const [dateRange, setDateRange] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly')
    const [customRange] = useState<AnalyticsDateRange>(() => {
        const to = new Date().toISOString()
        const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        return { from, to }
    })

    const range: AnalyticsDateRange = useMemo(() => {
        const to = new Date().toISOString()
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now()
        switch (dateRange) {
            case 'daily':
                return { from: new Date(now - 24 * 60 * 60 * 1000).toISOString(), to }
            case 'weekly':
                return { from: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), to }
            case 'monthly':
                return { from: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(), to }
            case 'custom':
                return customRange
            default:
                return { from: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(), to }
        }
    }, [dateRange, customRange])

    const { data: reportData, isLoading: reportLoading } = useClientReport({ clientId, ...range })

    const isLoading = clientLoading || reportLoading

    const handleExportPdf = () => {
        if (reportData) {
            exportClientReportToPdf(reportData)
        }
    }

    const handleExportCsv = () => {
        if (reportData) {
            exportClientReportToCsv(reportData)
        }
    }

    if (!clientId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-semibold text-foreground mb-2">No Client Association</h1>
                <p className="text-muted-foreground max-w-md">
                    Your account is not associated with any client workspace.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cobalt/10">
                                <FileText className="h-6 w-6 text-cobalt" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Reports</h1>
                                <p className="text-sm text-muted-foreground">{client?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={handleExportCsv}
                                disabled={!reportData || isLoading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                CSV
                            </Button>
                            <Button
                                onClick={handleExportPdf}
                                disabled={!reportData || isLoading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Date Range:</span>
                            </div>
                            <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Last 24 Hours</SelectItem>
                                    <SelectItem value="weekly">Last 7 Days</SelectItem>
                                    <SelectItem value="monthly">Last 30 Days</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                            {dateRange === 'custom' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{formatRangeLabel(customRange)}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Projects</p>
                            <div className="text-2xl font-semibold text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : reportData?.summary.projects ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Tasks</p>
                            <div className="text-2xl font-semibold text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : reportData?.summary.tasks ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Completed</p>
                            <div className="text-2xl font-semibold text-emerald-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : reportData?.summary.completed ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">In Progress</p>
                            <div className="text-2xl font-semibold text-blue-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : reportData?.summary.inProgress ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-muted-foreground">Overdue</p>
                            <div className="text-2xl font-semibold text-red-600">
                                {isLoading ? <Skeleton className="h-8 w-12" /> : reportData?.summary.overdue ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Project Breakdown */}
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4">Project Breakdown</h2>
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : reportData?.projectBreakdown && reportData.projectBreakdown.length > 0 ? (
                        <div className="space-y-3">
                            {reportData.projectBreakdown.map((project) => (
                                <Card key={project.project.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-foreground">{project.project.title}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {project.totals.tasks} tasks • {project.totals.completed} completed
                                                </p>
                                            </div>
                                            <Badge variant={project.progressPercent === 100 ? 'default' : 'secondary'}>
                                                {project.progressPercent}%
                                            </Badge>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div
                                                className="h-full bg-cobalt rounded-full transition-all"
                                                style={{ width: `${project.progressPercent}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No project data available</p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Deliverables & Feedback */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Recent Deliverables</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : reportData?.deliverables && reportData.deliverables.length > 0 ? (
                                <div className="space-y-3">
                                    {reportData.deliverables.slice(0, 5).map((deliverable) => (
                                        <div key={deliverable.taskId} className="flex items-center justify-between p-3 rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium text-foreground">{deliverable.taskTitle}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {deliverable.fileCount} files • Version {deliverable.latestVersion}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No deliverables yet</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Feedback Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : reportData?.feedback && reportData.feedback.length > 0 ? (
                                <div className="space-y-3">
                                    {reportData.feedback.slice(0, 5).map((feedback) => (
                                        <div key={feedback.taskId} className="flex items-center justify-between p-3 rounded-lg border border-border">
                                            <div>
                                                <p className="font-medium text-foreground">{feedback.taskTitle}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {feedback.commentCount} comments
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No feedback yet</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
