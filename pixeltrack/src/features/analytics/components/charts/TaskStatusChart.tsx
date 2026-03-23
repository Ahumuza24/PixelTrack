import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts'

interface TaskStatusData {
    name: string
    value: number
    color: string
}

interface TaskStatusChartProps {
    assigned: number
    completed: number
    inProgress: number
    overdue: number
}

const COLORS = {
    completed: '#10b981', // emerald-500
    inProgress: '#3b82f6', // blue-500
    overdue: '#ef4444', // red-500
    assigned: '#94a3b8', // slate-400
}

export function TaskStatusChart({
    assigned,
    completed,
    inProgress,
    overdue,
}: TaskStatusChartProps) {
    const data: TaskStatusData[] = [
        { name: 'Completed', value: completed, color: COLORS.completed },
        { name: 'In Progress', value: inProgress, color: COLORS.inProgress },
        { name: 'Overdue', value: overdue, color: COLORS.overdue },
        { name: 'Assigned', value: assigned, color: COLORS.assigned },
    ].filter((item) => item.value > 0)

    const total = assigned + completed + inProgress + overdue

    if (total === 0) {
        return (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                No task data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                    }}
                    formatter={(value) => {
                        const numValue = typeof value === 'number' ? value : Number(value)
                        return [`${numValue} tasks`, '']
                    }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
