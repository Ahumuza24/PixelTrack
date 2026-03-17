import type { AnalyticsDatePreset, AnalyticsDateRange } from '@/types'

function formatIso(date: Date): string {
    return date.toISOString()
}

export function resolveAnalyticsRange(
    preset: AnalyticsDatePreset = 'monthly',
    override?: AnalyticsDateRange,
): AnalyticsDateRange {
    if (preset === 'custom' && override) {
        return override
    }

    const now = new Date()
    const range: AnalyticsDateRange = {
        from: formatIso(now),
        to: formatIso(now),
    }

    const start = new Date(now)

    switch (preset) {
        case 'daily':
            start.setHours(0, 0, 0, 0)
            break
        case 'weekly':
            start.setDate(start.getDate() - 6)
            start.setHours(0, 0, 0, 0)
            break
        case 'monthly':
        default:
            start.setDate(start.getDate() - 29)
            start.setHours(0, 0, 0, 0)
            break
    }

    range.from = formatIso(start)
    range.to = formatIso(now)
    return range
}
