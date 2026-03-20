import type { ProjectStatus } from '@/types'

export interface ProjectStatusDisplayConfig {
    label: string
    bgClass: string
    textClass: string
}

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, ProjectStatusDisplayConfig> = {
    not_started: { label: 'Not Started', bgClass: 'bg-muted', textClass: 'text-muted-foreground' },
    active: { label: 'Active', bgClass: 'bg-primary/10', textClass: 'text-primary' },
    completed: { label: 'Completed', bgClass: 'bg-emerald-500/15', textClass: 'text-emerald-500' },
    on_hold: { label: 'On Hold', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
    cancelled: { label: 'Cancelled', bgClass: 'bg-destructive/15', textClass: 'text-destructive' },
}
