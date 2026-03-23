import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts'

interface ProjectProgressData {
    name: string
    progress: number
    total: number
    completed: number
}

interface ProjectProgressChartProps {
    projects: Array<{
        project: { id: string; title: string }
        progressPercent: number
        totals: { tasks: number; completed: number }
    }>
}

export function ProjectProgressChart({ projects }: ProjectProgressChartProps) {
    const data: ProjectProgressData[] = projects.map((p) => ({
        name: p.project.title.length > 20 ? p.project.title.slice(0, 20) + '...' : p.project.title,
        progress: p.progressPercent,
        total: p.totals.tasks,
        completed: p.totals.completed,
    }))

    if (data.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No project data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Progress %', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                    formatter={(value, _name, props) => {
                        const data = props?.payload as ProjectProgressData | undefined
                        return [`${value}% (${data?.completed ?? 0}/${data?.total ?? 0} tasks)`, 'Progress']
                    }}
                />
                <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.progress >= 80 ? '#10b981' : entry.progress >= 50 ? '#3b82f6' : '#f59e0b'}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
