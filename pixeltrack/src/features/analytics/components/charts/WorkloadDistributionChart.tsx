import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

interface WorkloadData {
    name: string
    assigned: number
    completed: number
    inProgress: number
}

interface WorkloadDistributionChartProps {
    assignees: Array<{
        assigneeId: string
        assigneeName?: string
        taskCount: number
        completedCount?: number
        inProgressCount?: number
    }>
}

export function WorkloadDistributionChart({ assignees }: WorkloadDistributionChartProps) {
    const data: WorkloadData[] = assignees.map((a) => ({
        name: a.assigneeName ?? a.assigneeId.slice(0, 8),
        assigned: a.taskCount,
        completed: a.completedCount ?? 0,
        inProgress: a.inProgressCount ?? Math.max(0, a.taskCount - (a.completedCount ?? 0)),
    }))

    if (data.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No workload data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Tasks', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="assigned" stackId="a" fill="#94a3b8" name="Assigned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
            </BarChart>
        </ResponsiveContainer>
    )
}
