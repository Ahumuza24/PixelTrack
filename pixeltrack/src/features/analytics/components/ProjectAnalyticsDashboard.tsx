import { useState } from 'react'
import { Loader2, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useProjectAnalytics } from '../hooks/useAnalytics'
import { useAnalyticsRealtime } from '../hooks/useAnalyticsRealtime'
import type { AnalyticsDatePreset } from '@/types'

const DATE_PRESETS: AnalyticsDatePreset[] = ['weekly', 'monthly']

export function ProjectAnalyticsDashboard() {
    useAnalyticsRealtime()
    const [preset, setPreset] = useState<AnalyticsDatePreset>('monthly')
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    const { data: projects, isLoading: projectsLoading } = useProjects()

    const projectId = selectedProjectId ?? projects?.[0]?.id ?? null
    const { data, isLoading } = useProjectAnalytics({ projectId, preset })

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase text-slate-500">Project Analytics</p>
                    <h1 className="text-2xl font-semibold text-slate-900">Task flow &amp; progress</h1>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <Select value={projectId ?? undefined} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                            {(projects ?? []).map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={preset} onValueChange={(value) => setPreset(value as AnalyticsDatePreset)}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Range" />
                        </SelectTrigger>
                        <SelectContent>
                            {DATE_PRESETS.map((value) => (
                                <SelectItem key={value} value={value}>
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {projectsLoading ? (
                <div className="flex items-center justify-center h-32 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : !projectId ? (
                <p className="text-sm text-slate-500">Create a project to view analytics.</p>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Tasks</p>
                                <p className="text-2xl font-semibold text-slate-900">{data?.totals.tasks ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Completed</p>
                                <p className="text-2xl font-semibold text-green-600">{data?.totals.completed ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">In progress</p>
                                <p className="text-2xl font-semibold">{data?.totals.inProgress ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-slate-500">Revision count</p>
                                <p className="text-2xl font-semibold">{data?.revisionCount ?? 0}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-24 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : data ? (
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                                            <span>Completion</span>
                                            <span>{data.progressPercent}%</span>
                                        </div>
                                        <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                                            <div
                                                className="h-full bg-[#0048ad] rounded-full"
                                                style={{ width: `${data.progressPercent}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-slate-500 mb-2">Assignee load</p>
                                        <div className="space-y-2">
                                            {data.assigneeLoad.length === 0 && (
                                                <p className="text-sm text-slate-500">No assignees captured.</p>
                                            )}
                                            {data.assigneeLoad.map((entry) => (
                                                <div key={entry.assigneeId} className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <Users className="w-4 h-4 text-slate-400" />
                                                        {entry.assigneeId}
                                                    </span>
                                                    <span className="font-semibold">{entry.taskCount} tasks</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No analytics for selected project.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Task list</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-24 text-slate-400">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                </div>
                            ) : data && data.tasks.length > 0 ? (
                                <div className="space-y-2">
                                    {data.tasks.slice(0, 8).map((task) => (
                                        <div key={task.id} className="flex items-center justify-between text-sm">
                                            <span>{task.title}</span>
                                            <span className="text-slate-500">{task.status.replace('_', ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500">No tasks captured.</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
