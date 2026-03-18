import { useMemo, useState } from 'react'
import { BarChart3, FileText, Download, Layers, Clock, ListChecks } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useClients } from '@/features/clients'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useUsers } from '@/features/users'
import { UserRole, type AnalyticsDatePreset, type AnalyticsDateRange } from '@/types'
import { useEmployeeAnalytics, useProjectAnalytics, useClientReport } from '../hooks/useAnalytics'
import { useAnalyticsRealtime } from '../hooks/useAnalyticsRealtime'
import { exportClientReportToPdf, exportClientReportToCsv } from '../utils/exportReport'

const DATE_PRESETS: AnalyticsDatePreset[] = ['daily', 'weekly', 'monthly', 'custom']

function formatDateInputValue(value?: string) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
}

export function AnalyticsDashboard() {
    useAnalyticsRealtime()

    const [datePreset, setDatePreset] = useState<AnalyticsDatePreset>('monthly')
    const [customRange, setCustomRange] = useState<AnalyticsDateRange | undefined>(undefined)
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [selectedClient, setSelectedClient] = useState<string | null>(null)
    const [employeeClientFilter, setEmployeeClientFilter] = useState<string | undefined>(undefined)
    const [employeeProjectFilter, setEmployeeProjectFilter] = useState<string | undefined>(undefined)

    const { data: users } = useUsers()
    const { data: projects } = useProjects()
    const { data: clients } = useClients()

    const employees = useMemo(() => (users ?? []).filter((user) => user.role === UserRole.EMPLOYEE), [users])

    const activeEmployeeId = selectedEmployee ?? employees[0]?.uid ?? null
    const activeProjectId = selectedProject ?? projects?.[0]?.id ?? null
    const activeClientId = selectedClient ?? clients?.[0]?.id ?? null

    const employeeAnalytics = useEmployeeAnalytics({
        userId: activeEmployeeId,
        preset: datePreset,
        customRange,
        clientId: employeeClientFilter,
        projectId: employeeProjectFilter,
    })

    const projectAnalytics = useProjectAnalytics({
        projectId: activeProjectId,
        preset: datePreset,
        customRange,
    })

    const clientReport = useClientReport({
        clientId: activeClientId,
        preset: datePreset,
        customRange,
    })

    const employeeData = employeeAnalytics.data
    const projectData = projectAnalytics.data
    const clientData = clientReport.data
    const clientDeliverables = clientData?.deliverables ?? []
    const clientFeedback = clientData?.feedback ?? []

    const isCustom = datePreset === 'custom'

    const handleCustomRangeChange = (key: keyof AnalyticsDateRange, value: string) => {
        if (!value) {
            setCustomRange((prev) => {
                if (!prev) return prev
                const next = { ...prev }
                delete next[key]
                if (!next.from && !next.to) return undefined
                return next
            })
            return
        }

        const isoValue = new Date(value).toISOString()
        setCustomRange((prev) => ({ ...prev, [key]: isoValue } as AnalyticsDateRange))
    }

    const canExport = Boolean(clientReport.data && !clientReport.isLoading)

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground">
            <header className="border-b border-border bg-card/90 backdrop-blur px-6 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs uppercase text-muted-foreground">Analytics</p>
                        <h1 className="text-2xl font-bold text-foreground">Performance &amp; Reporting</h1>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Select value={datePreset} onValueChange={(value) => setDatePreset(value as AnalyticsDatePreset)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Date range" />
                            </SelectTrigger>
                            <SelectContent>
                                {DATE_PRESETS.map((preset) => (
                                    <SelectItem key={preset} value={preset}>
                                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isCustom && (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={formatDateInputValue(customRange?.from)}
                                    onChange={(event) => handleCustomRangeChange('from', event.target.value)}
                                />
                                <span className="text-muted-foreground">—</span>
                                <Input
                                    type="date"
                                    value={formatDateInputValue(customRange?.to)}
                                    onChange={(event) => handleCustomRangeChange('to', event.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <section className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Employee Analytics</h2>
                            <p className="text-sm text-muted-foreground">Track workload, completion velocity, and collaboration.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            <Select value={selectedEmployee ?? activeEmployeeId ?? undefined} onValueChange={setSelectedEmployee}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.uid} value={employee.uid}>
                                            {employee.displayName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={employeeClientFilter ?? 'all'}
                                onValueChange={(value) => setEmployeeClientFilter(value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Client filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All clients</SelectItem>
                                    {(clients ?? []).map((client) => (
                                        <SelectItem key={client.id} value={client.id}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={employeeProjectFilter ?? 'all'}
                                onValueChange={(value) => setEmployeeProjectFilter(value === 'all' ? undefined : value)}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Project filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All projects</SelectItem>
                                    {(projects ?? []).map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Assigned</p>
                                        <p className="text-2xl font-semibold text-slate-900">
                                            {employeeData?.totals.assigned ?? 0}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <ListChecks className="w-5 h-5 text-slate-500" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Completed</p>
                                        <p className="text-2xl font-bold text-emerald-500">
                                            {employeeData?.totals.completed ?? 0}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <BarChart3 className="w-5 h-5 text-emerald-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {employeeData?.completedWithinRange ?? 0} within selected period
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Avg completion time</p>
                                        <p className="text-2xl font-semibold text-foreground">
                                            {employeeData?.averageCompletionTimeHours ?? 0}h
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-accent-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground">Collaboration</p>
                                        <p className="text-2xl font-semibold text-foreground">
                                            {(employeeData?.filesUploaded ?? 0) + (employeeData?.commentsAuthored ?? 0)}
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-lg bg-amber-400/20 flex items-center justify-center">
                                        <Layers className="w-5 h-5 text-amber-500" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {employeeData?.filesUploaded ?? 0} files · {employeeData?.commentsAuthored ?? 0} comments
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Task Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employeeAnalytics.isLoading ? (
                                <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
                            ) : employeeData && employeeData.tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {employeeData.tasks.slice(0, 6).map(({ task, isOverdue }) => (
                                        <div key={task.id} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">Due {new Date(task.dueDate).toLocaleDateString()}</p>
                                            </div>
                                            <Badge variant={isOverdue ? 'destructive' : 'secondary'}>
                                                {isOverdue ? 'Overdue' : task.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No tasks within the selected filters.</p>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Project Analytics</h2>
                            <p className="text-sm text-muted-foreground">Monitor task flow, progress, and workload per project.</p>
                        </div>
                        <Select value={selectedProject ?? undefined} onValueChange={setSelectedProject}>
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Total tasks</p>
                                <p className="text-2xl font-semibold text-foreground">{projectData?.totals.tasks ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Completed</p>
                                <p className="text-2xl font-semibold text-emerald-500">{projectData?.totals.completed ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">In progress</p>
                                <p className="text-2xl font-semibold text-foreground">{projectData?.totals.inProgress ?? 0}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <p className="text-xs uppercase text-muted-foreground">Revision count</p>
                                <p className="text-2xl font-semibold text-foreground">{projectData?.revisionCount ?? 0}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Progress &amp; Team Load</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {projectAnalytics.isLoading ? (
                                <div className="h-24 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
                            ) : projectData ? (
                                <>
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                                            <span>Progress</span>
                                            <span>{projectData.progressPercent}%</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                                            <div className="h-full bg-primary rounded-full" style={{ width: `${projectData.progressPercent}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase text-muted-foreground mb-2">Assignee load</p>
                                        <div className="space-y-2">
                                            {projectData.assigneeLoad.length === 0 && (
                                                <p className="text-sm text-muted-foreground">No assignees captured.</p>
                                            )}
                                            {projectData.assigneeLoad.map((entry) => (
                                                <div key={entry.assigneeId} className="flex items-center justify-between text-sm text-foreground">
                                                    <span>{entry.assigneeId}</span>
                                                    <span className="font-semibold">{entry.taskCount} tasks</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-slate-500">Select a project to view analytics.</p>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Client Reports</h2>
                            <p className="text-sm text-muted-foreground">Transparent reporting for every engagement.</p>
                        </div>
                        <Select value={selectedClient ?? activeClientId ?? undefined} onValueChange={setSelectedClient}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Select client" />
                            </SelectTrigger>
                            <SelectContent>
                                {(clients ?? []).map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Projects</p>
                                <p className="text-2xl font-semibold text-foreground">{clientData?.summary.projects ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Tasks</p>
                                <p className="text-2xl font-semibold text-foreground">{clientData?.summary.tasks ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Completed</p>
                                <p className="text-2xl font-semibold text-emerald-500">{clientData?.summary.completed ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">In progress</p>
                                <p className="text-2xl font-semibold text-foreground">{clientData?.summary.inProgress ?? 0}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Overdue</p>
                                <p className="text-2xl font-semibold text-destructive">{clientData?.summary.overdue ?? 0}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {clientReport.isLoading ? (
                                    <div className="h-24 flex items-center justify-center text-slate-400 text-sm">Loading...</div>
                                ) : clientData && clientData.projectBreakdown.length > 0 ? (
                                    clientData.projectBreakdown.map((project) => (
                                        <div key={project.project.id} className="border rounded-lg p-4 border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{project.project.title}</p>
                                                    <p className="text-xs text-muted-foreground">Client: {clientData.client?.name}</p>
                                                </div>
                                                <Badge variant="secondary">{project.progressPercent}%</Badge>
                                            </div>
                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                <span>Tasks {project.totals.tasks}</span>
                                                <span>Done {project.totals.completed}</span>
                                                <span>Overdue {project.totals.overdue}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No project data for this client.</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Deliverables &amp; Feedback</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground mb-2">Latest deliverables</p>
                                    <div className="space-y-2">
                                        {clientDeliverables.slice(0, 3).map((deliverable) => (
                                            <div key={deliverable.taskId} className="flex items-center justify-between text-sm text-foreground">
                                                <span className="truncate pr-2">{deliverable.taskTitle}</span>
                                                <span className="text-muted-foreground">v{deliverable.latestVersion}</span>
                                            </div>
                                        ))}
                                        {clientDeliverables.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No uploads yet.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground mb-2">Feedback threads</p>
                                    <div className="space-y-2">
                                        {clientFeedback.slice(0, 3).map((feedback) => (
                                            <div key={feedback.taskId} className="flex items-center justify-between text-sm text-foreground">
                                                <span className="truncate pr-2">{feedback.taskTitle}</span>
                                                <span className="text-muted-foreground">{feedback.commentCount} comments</span>
                                            </div>
                                        ))}
                                        {clientFeedback.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No feedback captured.</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Report Generator</h2>
                            <p className="text-sm text-muted-foreground">Export branded reports for client stakeholders.</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <Button onClick={() => clientData && exportClientReportToPdf(clientData)} disabled={!canExport} className="gap-2">
                                <Download className="w-4 h-4" /> Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => clientData && exportClientReportToCsv(clientData)}
                                disabled={!canExport}
                                className="gap-2"
                            >
                                <FileText className="w-4 h-4" /> Export CSV
                            </Button>
                        </div>
                    </div>
                    {!canExport && (
                        <p className="text-xs text-muted-foreground">Select a client to enable exports.</p>
                    )}
                </section>
            </div>
        </div>
    )
}
