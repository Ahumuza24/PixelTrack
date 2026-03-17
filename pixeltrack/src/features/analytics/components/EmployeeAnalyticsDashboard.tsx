import { useState } from 'react'
import { Loader2, Clock, CheckCircle, FileText } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEmployeeAnalytics } from '../hooks/useAnalytics'
import { useAnalyticsRealtime } from '../hooks/useAnalyticsRealtime'
import { useAuth } from '@/features/auth/useAuth'
import type { AnalyticsDatePreset } from '@/types'

const DATE_PRESETS: AnalyticsDatePreset[] = ['daily', 'weekly', 'monthly']

export function EmployeeAnalyticsDashboard() {
    useAnalyticsRealtime()
    const { user } = useAuth()
    const [preset, setPreset] = useState<AnalyticsDatePreset>('weekly')

    const { data, isLoading } = useEmployeeAnalytics({ userId: user?.uid ?? null, preset })

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">Sign in to view your analytics.</p>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase text-slate-500">Employee Analytics</p>
                    <h1 className="text-2xl font-semibold text-slate-900">Your performance snapshot</h1>
                </div>
                <div className="flex gap-2">
                    {DATE_PRESETS.map((value) => (
                        <Button
                            key={value}
                            size="sm"
                            variant={preset === value ? 'default' : 'outline'}
                            onClick={() => setPreset(value)}
                        >
                            {value.charAt(0).toUpperCase() + value.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-32 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs uppercase text-slate-500">Assigned</p>
                            <p className="text-2xl font-semibold">{data?.totals.assigned ?? 0}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase text-slate-500">Completed</p>
                                    <p className="text-2xl font-semibold text-green-600">{data?.totals.completed ?? 0}</p>
                                </div>
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {data?.completedWithinRange ?? 0} within range
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase text-slate-500">Avg completion time</p>
                                    <p className="text-2xl font-semibold">{data?.averageCompletionTimeHours ?? 0}h</p>
                                </div>
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase text-slate-500">Collaboration</p>
                                    <p className="text-2xl font-semibold">
                                        {(data?.filesUploaded ?? 0) + (data?.commentsAuthored ?? 0)}
                                    </p>
                                </div>
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                {data?.filesUploaded ?? 0} files · {data?.commentsAuthored ?? 0} comments
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Recent tasks</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-24 text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : data && data.tasks.length > 0 ? (
                        <div className="space-y-2">
                            {data.tasks.slice(0, 6).map(({ task, isOverdue }) => (
                                <div key={task.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-slate-900">{task.title}</p>
                                        <p className="text-xs text-slate-500">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                        {isOverdue ? 'Overdue' : task.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500">No tasks recorded for this period.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
