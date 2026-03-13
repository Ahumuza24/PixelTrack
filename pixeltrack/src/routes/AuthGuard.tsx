import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { ROUTES } from '@/lib/constants'

/**
 * Auth guard that protects routes from unauthenticated access.
 * Renders a full-page spinner while Supabase resolves its auth state.
 * Redirects to /login if the user is not authenticated.
 */
export function AuthGuard() {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-white" role="status" aria-label="Loading">
                <svg
                    className="animate-spin h-10 w-10 text-cobalt"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            </div>
        )
    }

    if (!user) {
        const from = `${location.pathname}${location.search}`
        return <Navigate to={ROUTES.LOGIN} state={{ from }} replace />
    }

    return <Outlet />
}
