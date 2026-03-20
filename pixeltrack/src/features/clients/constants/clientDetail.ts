import type { ClientStatus } from '@/types'

export interface ClientStatusDisplayConfig {
    label: string
    badgeClass: string
}

export const CLIENT_STATUS_CONFIG: Record<ClientStatus, ClientStatusDisplayConfig> = {
    active: {
        label: 'Active',
        badgeClass: 'bg-emerald-500/15 text-emerald-500',
    },
    inactive: {
        label: 'Inactive',
        badgeClass: 'bg-muted text-muted-foreground',
    },
    archived: {
        label: 'Archived',
        badgeClass: 'bg-amber-100 text-amber-800',
    },
}
