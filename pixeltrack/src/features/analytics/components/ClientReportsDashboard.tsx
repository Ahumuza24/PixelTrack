import { useMemo, useState } from 'react'
import { Loader2, FileText, FolderKanban, Download } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useClientReport } from '../hooks/useAnalytics'
import { useAnalyticsRealtime } from '../hooks/useAnalyticsRealtime'
import type { AnalyticsDatePreset } from '@/types'
import { useAuth } from '@/features/auth/useAuth'
import { exportClientReportToPdf, exportClientReportToCsv } from '../utils/exportReport'

const DATE_PRESETS: AnalyticsDatePreset[] = ['weekly', 'monthly', 'custom']

function toIsoDate(value: string) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString()
}

export function ClientReportsDashboard() {
    useAnalyticsRealtime()
    const { user } = useAuth()
    const [preset, setPreset] = useState<AnalyticsDatePreset>('monthly')
    const [customFrom, setCustomFrom] = useState<string>('')
    const [customTo, setCustomTo] = useState<string>('')

    const clientId = user?.clientId ?? null
    const customRange = useMemo(() => {
        if (preset !== 'custom' || !customFrom || !customTo) {
            return undefined
        }
        return { from: toIsoDate(customFrom), to: toIsoDate(customTo) }
    }, [preset, customFrom, customTo])

    const { data, isLoading } = useClientReport({ clientId, preset, customRange })

    const canExport = Boolean(data && !isLoading)

    if (!clientId) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">No client assigned to this account.</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase text-slate-500">Client Reports</p>
                    <h1 className="text-2xl font-semibold text-slate-900">{data?.client?.name ?? 'Your Company'}</h1>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        {DATE_PRESETS.map((value) => (
                            <Button
                                key={value}
                                variant={preset === value ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setPreset(value)}
                                className="rounded-none"
                            >
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                            </Button>
                        ))}
                    </div>
                    {preset === 'custom' && (
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={customFrom}
                                onChange={(event) => setCustomFrom(event.target.value)}
                            />
                            <input
                                type="date"
                                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                                value={customTo}
                                onChange={(event) => setCustomTo(event.target.value)}
                            />
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="gap-2"
                            disabled={!canExport}
                            onClick={() => data && exportClientReportToPdf(data)}
                        >
                            <Download className="w-4 h-4" /> PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            disabled={!canExport}
                            onClick={() => data && exportClientReportToCsv(data)}
                        >
                            <FileText className="w-4 h-4" /> CSV
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading || !data ? (
                <div className="flex items-center justify-center h-40 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Projects</p>
                                <p className="text-2xl font-semibold text-slate-900">{data.summary.projects}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Tasks</p>
                                <p className="text-2xl font-semibold text-slate-900">{data.summary.tasks}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Completed</p>
                                <p className="text-2xl font-semibold text-green-600">{data.summary.completed}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">In Progress</p>
                                <p className="text-2xl font-semibold text-blue-600">{data.summary.inProgress}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Overdue</p>
                                <p className="text-2xl font-semibold text-red-600">{data.summary.overdue}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.projectBreakdown.length === 0 ? (
                                    <p className="text-sm text-slate-500">No active projects.</p>
                                ) : (
                                    data.projectBreakdown.map((project) => (
                                        <div key={project.project.id} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {project.project.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {project.totals.completed}/{project.totals.tasks} tasks complete
                                                    </p>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-500">
                                                    {project.progressPercent}%
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>In progress {project.totals.inProgress}</span>
                                                <span>Overdue {project.totals.overdue}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Deliverables</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {data.deliverables.length === 0 ? (
                                    <p className="text-sm text-slate-500">No files uploaded yet.</p>
                                ) : (
                                    data.deliverables.slice(0, 8).map((deliverable) => (
                                        <div key={deliverable.taskId} className="flex items-center justify-between text-sm">
                                            <span className="truncate pr-2 flex items-center gap-2">
                                                <FolderKanban className="w-4 h-4 text-slate-400" />
                                                {deliverable.taskTitle}
                                            </span>
                                            <span className="text-slate-500">v{deliverable.latestVersion}</span>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Feedback threads</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.feedback.length === 0 ? (
                                <p className="text-sm text-slate-500">No comments recorded.</p>
                            ) : (
                                <div className="space-y-2">
                                    {data.feedback.slice(0, 10).map((feedback) => (
                                        <div key={feedback.taskId} className="flex items-center justify-between text-sm">
                                            <span>{feedback.taskTitle}</span>
                                            <span className="text-slate-500">{feedback.commentCount} comments</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
