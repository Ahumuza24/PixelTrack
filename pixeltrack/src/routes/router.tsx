import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from './AuthGuard'
import { RoleGuard } from './RoleGuard'
import { LoginPage } from '@/pages/LoginPage'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { EmployeeDashboardPage } from '@/pages/EmployeeDashboardPage'
import { ClientDashboardPage } from '@/pages/ClientDashboardPage'
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
                    { path: ROUTES.ADMIN, element: <AdminDashboardPage /> },
                    { path: ROUTES.ADMIN_CLIENTS, element: <AdminDashboardPage /> },
                    { path: ROUTES.ADMIN_USERS, element: <AdminDashboardPage /> },
                    { path: ROUTES.ADMIN_TASKS, element: <AdminDashboardPage /> },
                    { path: ROUTES.ADMIN_REPORTS, element: <AdminDashboardPage /> },
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
                    { path: ROUTES.TASK_DETAIL, element: <AdminDashboardPage /> },
                    { path: ROUTES.DESIGN_PREVIEW, element: <AdminDashboardPage /> },
                    { path: ROUTES.ANALYTICS, element: <AdminDashboardPage /> },
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
