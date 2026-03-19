import { AdminDashboardLayout } from '@/features/admin/components/AdminDashboardLayout'
import { AdminDashboardHeader } from '@/features/admin/components/AdminDashboardHeader'
import { AdminDashboardWelcome } from '@/features/admin/components/AdminDashboardWelcome'
import { AdminDashboardStatsGrid } from '@/features/admin/components/AdminDashboardStatsGrid'
import { AdminDashboardQuickActions } from '@/features/admin/components/AdminDashboardQuickActions'
import { AdminDashboardOverdueAlert } from '@/features/admin/components/AdminDashboardOverdueAlert'
import { AdminDashboardActiveProjects } from '@/features/admin/components/AdminDashboardActiveProjects'
import { AdminDashboardTaskOverview } from '@/features/admin/components/AdminDashboardTaskOverview'
import { AdminDashboardRightRail } from '@/features/admin/components/AdminDashboardRightRail'
import { useAdminDashboard } from '@/features/admin/hooks/useAdminDashboard'

export function AdminDashboardPage() {
    const {
        userFirstName,
        searchState,
        stats,
        quickActions,
        taskColumns,
        projectsState,
        activityState,
        handlers,
        overdueCount,
    } = useAdminDashboard()

    return (
        <AdminDashboardLayout
            header={
                <AdminDashboardHeader
                    searchState={searchState}
                    overdueCount={overdueCount}
                    onCreateProject={handlers.handleProjectsNavigate}
                />
            }
            main={
                <>
                    <AdminDashboardWelcome firstName={userFirstName} />
                    <AdminDashboardStatsGrid stats={stats} />
                    <AdminDashboardQuickActions actions={quickActions} onNavigate={handlers.handleQuickActionNavigate} />
                    <AdminDashboardOverdueAlert overdueCount={overdueCount} onViewTasks={handlers.handleTasksNavigate} />
                    <AdminDashboardActiveProjects
                        projects={projectsState.activeProjects}
                        loading={projectsState.projectsLoading}
                        onSelect={handlers.handleProjectSelect}
                        onViewAll={handlers.handleProjectsNavigate}
                    />
                    <AdminDashboardTaskOverview taskColumns={taskColumns} onTaskSelect={handlers.handleTaskSelect} />
                </>
            }
            rightRail={<AdminDashboardRightRail activityState={activityState} onViewAllActivity={handlers.handleViewAllActivity} />}
        />
    )
}
