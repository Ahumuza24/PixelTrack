import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { cn } from '@/lib/utils'

/**
 * Placeholder Admin Dashboard page stub.
 * Will be replaced with the full admin layout in Phase 2+.
 */
export function AdminDashboardPage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <div className={cn('flex h-screen w-full items-center justify-center bg-slate-50')}>
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-cobalt rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-cobalt/20">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 48 48">
                        <path
                            clipRule="evenodd"
                            d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262Z"
                            fill="currentColor"
                            fillRule="evenodd"
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-navy-500">Admin Dashboard</h1>
                <p className="text-slate-muted text-sm">Welcome back, {user?.displayName}. Your workspace is being built.</p>
                <button
                    onClick={() => navigate('/', { replace: true })}
                    className="text-cobalt text-sm hover:underline cursor-pointer"
                >
                    Sign out
                </button>
            </div>
        </div>
    )
}
