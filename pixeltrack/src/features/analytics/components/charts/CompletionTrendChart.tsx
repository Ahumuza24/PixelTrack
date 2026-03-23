import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

interface CompletionTrendData {
    date: string
    completed: number
    cumulative: number
}

interface CompletionTrendChartProps {
    tasks: Array<{
        updatedAt: string
        status: string
    }>
    days?: number
}

export function CompletionTrendChart({ tasks, days = 30 }: CompletionTrendChartProps) {
    // Generate date range
    const dates: string[] = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        dates.push(date.toISOString().split('T')[0])
    }

    // Count completions per day (tasks marked complete on that day based on updatedAt)
    const completionsByDate = new Map<string, number>()
    tasks.forEach((task) => {
        if (task.status === 'complete') {
            const date = task.updatedAt.split('T')[0]
            if (dates.includes(date)) {
                completionsByDate.set(date, (completionsByDate.get(date) ?? 0) + 1)
            }
        }
    })

    // Build data with cumulative count
    let cumulative = 0
    const data: CompletionTrendData[] = dates.map((date) => {
        const completed = completionsByDate.get(date) ?? 0
        cumulative += completed
        return {
            date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            completed,
            cumulative,
        }
    })

    if (tasks.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No completion data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    stroke="hsl(var(--muted-foreground))"
                    interval="preserveStartEnd"
                />
                <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                />
                <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    name="Daily Completed"
                />
                <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorCumulative)"
                    name="Cumulative"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
