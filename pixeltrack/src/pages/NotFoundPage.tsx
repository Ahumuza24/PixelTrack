import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

/**
 * 404 Not Found page.
 */
export function NotFoundPage() {
    const navigate = useNavigate()
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <p className="text-7xl font-bold text-cobalt">404</p>
                <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
                <p className="text-slate-500 text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
                <button
                    onClick={() => navigate(ROUTES.LOGIN)}
                    className="mt-4 px-6 py-2.5 bg-cobalt text-white rounded-lg text-sm font-medium hover:bg-cobalt-600 transition-colors cursor-pointer"
                >
                    Go to Login
                </button>
            </div>
        </div>
    )
}
