import {
    ClientDashboardHeader,
    ClientDashboardStats,
    ClientDashboardTasks,
    useClientDashboard,
} from '@/features/clients'
import { Building2 } from 'lucide-react'

/**
 * ClientDashboardPage - Dashboard for clients showing their company tasks
 *
 * Route: /client
 * Access: Client only
 */
export function ClientDashboardPage() {
    const { clientName, userName, tasks, stats, isLoading, notFound, handlers } = useClientDashboard()
    const { handleViewTask } = handlers

    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
                <Building2 className="w-12 h-12 text-slate-400 mb-4" />
                <h1 className="text-2xl font-semibold text-slate-900 mb-2">Client workspace not found</h1>
                <p className="text-slate-500 max-w-md">
                    We couldn't load your client workspace. Please contact support if this issue persists.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <ClientDashboardHeader clientName={clientName} userName={userName} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <ClientDashboardStats stats={stats} />
                <ClientDashboardTasks tasks={tasks} isLoading={isLoading} onViewTask={handleViewTask} />
            </div>
        </div>
    )
}
