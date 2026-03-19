import { AdminDashboardActivityFeed } from './AdminDashboardActivityFeed'
import type { AdminActivityState } from '@/features/admin/hooks/useAdminDashboard'

interface AdminDashboardRightRailProps {
    activityState: AdminActivityState
    onViewAllActivity: () => void
}

export function AdminDashboardRightRail({ activityState, onViewAllActivity }: AdminDashboardRightRailProps) {
    return (
        <aside className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-3">Team Pulse</h3>
                <p className="text-sm text-muted-foreground">
                    Stay on top of feedback, file uploads, and status updates without leaving the dashboard.
                </p>
            </div>

            <AdminDashboardActivityFeed activityState={activityState} onViewAll={onViewAllActivity} />
        </aside>
    )
}
