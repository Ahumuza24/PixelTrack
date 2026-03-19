import { Button } from '@/components/ui/button'
import type { AdminDashboardQuickAction } from '@/features/admin/constants/dashboard'

interface AdminDashboardQuickActionsProps {
    actions: AdminDashboardQuickAction[]
    onNavigate: (href: string) => void
}

export function AdminDashboardQuickActions({ actions, onNavigate }: AdminDashboardQuickActionsProps) {
    return (
        <section>
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        onClick={() => onNavigate(action.href)}
                        className={`${action.className} border border-transparent shadow-sm`}
                    >
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                    </Button>
                ))}
            </div>
        </section>
    )
}
