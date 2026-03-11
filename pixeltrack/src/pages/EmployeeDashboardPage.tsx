import { useAuth } from '@/features/auth/useAuth'

/**
 * Placeholder Employee Dashboard page stub.
 * Will be replaced with the full employee layout in Phase 3+.
 */
export function EmployeeDashboardPage() {
    const { user } = useAuth()
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-navy-500">Employee Dashboard</h1>
                <p className="text-slate-muted text-sm">Welcome, {user?.displayName}.</p>
            </div>
        </div>
    )
}
