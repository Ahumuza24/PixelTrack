import {
    EmployeeDashboardHeader,
    EmployeeDashboardStats,
    EmployeeDashboardTasks,
    useEmployeeDashboard,
} from '@/features/users'

/**
 * EmployeeDashboardPage - Dashboard for employees showing their assigned tasks
 *
 * Route: /dashboard
 * Access: Employee only
 */
export function EmployeeDashboardPage() {
    const { userName, tasks, stats, isLoading, handlers } = useEmployeeDashboard()
    const { handleViewTask } = handlers

    return (
        <div className="min-h-screen bg-slate-50">
            <EmployeeDashboardHeader userName={userName} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <EmployeeDashboardStats stats={stats} />
                <EmployeeDashboardTasks tasks={tasks} isLoading={isLoading} onViewTask={handleViewTask} />
            </div>
        </div>
    )
}
