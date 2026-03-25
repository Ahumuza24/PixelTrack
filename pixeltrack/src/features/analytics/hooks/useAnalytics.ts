import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import type {
    AnalyticsDatePreset,
    AnalyticsDateRange,
    EmployeeAnalyticsSummary,
    ProjectAnalyticsSummary,
    ClientReportData,
} from '@/types'
import { getEmployeeAnalytics, getProjectAnalytics, getClientReport } from '@/lib/supabase/analytics'
import { resolveAnalyticsRange } from '@/lib/dateRanges'

export const ANALYTICS_QUERY_KEY = 'analytics'

interface BaseRangeOptions {
    preset?: AnalyticsDatePreset
    customRange?: AnalyticsDateRange
}

interface UseEmployeeAnalyticsOptions extends BaseRangeOptions {
    userId: string | null
    clientId?: string
    projectId?: string
}

interface UseProjectAnalyticsOptions extends BaseRangeOptions {
    projectId: string | null
}


function useResolvedRange(preset: AnalyticsDatePreset = 'monthly', customRange?: AnalyticsDateRange) {
    return useMemo(() => resolveAnalyticsRange(preset, customRange), [preset, customRange])
}

export function useEmployeeAnalytics(options: UseEmployeeAnalyticsOptions) {
    const range = useResolvedRange(options.preset, options.customRange)

    return useQuery<EmployeeAnalyticsSummary>({
        queryKey: [
            ANALYTICS_QUERY_KEY,
            'employee',
            options.userId,
            options.clientId ?? 'all',
            options.projectId ?? 'all',
            range.from,
            range.to,
        ],
        queryFn: () =>
            options.userId
                ? getEmployeeAnalytics({
                      userId: options.userId,
                      clientId: options.clientId,
                      projectId: options.projectId,
                      range,
                  })
                : Promise.resolve({
                      totals: { assigned: 0, completed: 0, inProgress: 0, overdue: 0 },
                      completedWithinRange: 0,
                      averageCompletionTimeHours: null,
                      filesUploaded: 0,
                      commentsAuthored: 0,
                      tasks: [],
                  }),
        enabled: Boolean(options.userId),
        staleTime: 1000 * 60 * 2,
    })
}

export function useProjectAnalytics(options: UseProjectAnalyticsOptions) {
    const range = useResolvedRange(options.preset, options.customRange)

    return useQuery<ProjectAnalyticsSummary>({
        queryKey: [
            ANALYTICS_QUERY_KEY,
            'project',
            options.projectId,
            range.from,
            range.to,
        ],
        queryFn: () =>
            options.projectId
                ? getProjectAnalytics({ projectId: options.projectId, range })
                : Promise.resolve({
                      project: null,
                      totals: { tasks: 0, completed: 0, inProgress: 0, overdue: 0 },
                      progressPercent: 0,
                      averageTaskDurationHours: null,
                      revisionCount: 0,
                      assigneeLoad: [],
                      tasks: [],
                  }),
        enabled: Boolean(options.projectId),
        staleTime: 1000 * 60 * 2,
    })
}

export function useClientReport(options: { clientId: string | null; from: string; to: string }) {
    const { clientId, from, to } = options
    const range: AnalyticsDateRange = { from, to }

    return useQuery<ClientReportData>({
        queryKey: [
            ANALYTICS_QUERY_KEY,
            'client-report',
            clientId,
            range.from,
            range.to,
        ],
        queryFn: () =>
            clientId
                ? getClientReport({ clientId, range })
                : Promise.resolve({
                      client: null,
                      range,
                      summary: { projects: 0, tasks: 0, completed: 0, inProgress: 0, overdue: 0 },
                      projectBreakdown: [],
                      tasksByProject: {},
                      standaloneTasks: [],
                      deliverables: [],
                      feedback: [],
                  }),
        enabled: Boolean(clientId),
        staleTime: 1000 * 60 * 2,
    })
}
