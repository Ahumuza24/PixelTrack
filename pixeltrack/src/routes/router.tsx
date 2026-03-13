import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { RoleGuard } from './RoleGuard'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { LoginPage } from '@/pages/LoginPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { ClientManagementPage } from '@/pages/ClientManagementPage'
import { UserManagementPage } from '@/pages/UserManagementPage'
import { ProjectManagementPage } from '@/pages/ProjectManagementPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { TaskManagementPage } from '@/pages/TaskManagementPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { EmployeeDashboardPage } from '@/pages/EmployeeDashboardPage'
import { ClientDashboardPage } from '@/pages/ClientDashboardPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ROUTES } from '@/lib/constants'
import { UserRole } from '@/types'

export const router = createBrowserRouter([
    // Public routes
    {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
    },

    // Root redirect
    {
        path: '/',
        element: <Navigate to={ROUTES.LOGIN} replace />,
    },

    // Admin-only routes
    {
        element: <AuthGuard />,
        children: [
            {
                element: <RoleGuard allowedRoles={[UserRole.ADMIN]} />,
                children: [
                    {
                        element: <SidebarLayout><Outlet /></SidebarLayout>,
                        children: [
                            { path: ROUTES.ADMIN, element: <AdminDashboardPage /> },
                            { path: ROUTES.ADMIN_CLIENTS, element: <ClientManagementPage /> },
                            { path: ROUTES.ADMIN_USERS, element: <UserManagementPage /> },
                            { path: ROUTES.ADMIN_PROJECTS, element: <ProjectManagementPage /> },
                            { path: ROUTES.ADMIN_PROJECT_DETAIL, element: <ProjectDetailPage /> },
                            { path: ROUTES.ADMIN_TASKS, element: <TaskManagementPage /> },
                            { path: ROUTES.ADMIN_REPORTS, element: <AdminDashboardPage /> },
                            { path: ROUTES.ANALYTICS, element: <AnalyticsPage /> },
                        ],
                    },
                ],
            },

            // Employee-only routes
            {
                element: <RoleGuard allowedRoles={[UserRole.EMPLOYEE]} />,
                children: [
                    { path: ROUTES.DASHBOARD, element: <EmployeeDashboardPage /> },
                ],
            },

            // Client-only routes
            {
                element: <RoleGuard allowedRoles={[UserRole.CLIENT]} />,
                children: [
                    { path: ROUTES.CLIENT, element: <ClientDashboardPage /> },
                ],
            },

            // Routes accessible by all authenticated roles
            {
                element: <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT]} />,
                children: [
                    { path: ROUTES.TASK_DETAIL, element: <TaskDetailPage /> },
                    { path: ROUTES.DESIGN_PREVIEW, element: <AdminDashboardPage /> },
                ],
            },
        ],
    },

    // 404
    {
        path: '*',
        element: <NotFoundPage />,
    },
])
