import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from '@/lib/constants'
import type { UserRole } from '@/types'

interface RoleGuardProps {
    allowedRoles: UserRole[]
}

/**
 * Role guard that restricts access to routes based on the user's role.
 * Must be nested inside an AuthGuard (user is guaranteed to be non-null here).
 * Redirects to /login if the user's role is not in the allowedRoles list.
 */
export function RoleGuard({ allowedRoles }: RoleGuardProps) {
    const { user } = useAuth()
    const location = useLocation()

    if (!user || !allowedRoles.includes(user.role)) {
        const from = `${location.pathname}${location.search}`
        return <Navigate to={ROUTES.LOGIN} state={{ from }} replace />
    }

    return <Outlet />
}
