import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { AdminActivityState } from '@/features/admin/hooks/useAdminDashboard'

interface AdminDashboardActivityFeedProps {
    activityState: AdminActivityState
    onViewAll: () => void
}

export function AdminDashboardActivityFeed({ activityState, onViewAll }: AdminDashboardActivityFeedProps) {
    const { activityItems, activityLoading, activityError } = activityState

    return (
        <section className="space-y-6">
            <h3 className="text-xl font-bold text-foreground">Recent Activity</h3>
            <Card className="border border-border overflow-hidden bg-card">
                <CardContent className="p-5 space-y-6">
                    {activityLoading ? (
                        <div className="space-y-4">
                            {[0, 1, 2].map((index) => (
                                <div key={index} className={`flex gap-4 ${index > 0 ? 'border-t border-border/60 pt-6' : ''}`}>
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                                        <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : activityError ? (
                        <p className="text-sm text-destructive">Unable to load activity. Please refresh.</p>
                    ) : activityItems.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No recent activity yet. Updates from comments, files, and task changes will appear here.
                        </p>
                    ) : (
                        activityItems.map((activity, index) => {
                            const ActivityIcon = activity.icon
                            return (
                                <div key={activity.id} className={`flex gap-4 ${index > 0 ? 'border-t border-border/60 pt-6' : ''}`}>
                                    <div className="flex-shrink-0">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.backgroundClass} ${activity.accentClass}`}>
                                            <ActivityIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-foreground">
                                            <span className="font-bold">{activity.actor}</span> {activity.action}{' '}
                                            <span className="text-primary font-medium">{activity.target}</span>
                                        </p>
                                        {activity.preview && <p className="text-xs text-muted-foreground mt-1 italic">{activity.preview}</p>}
                                        <p className="text-[10px] text-muted-foreground/70 mt-2">{activity.timestamp}</p>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </CardContent>
                <Button
                    type="button"
                    onClick={onViewAll}
                    className="w-full justify-center rounded-none border-t border-border"
                    variant="ghost"
                >
                    View All Activity
                </Button>
            </Card>
        </section>
    )
}
