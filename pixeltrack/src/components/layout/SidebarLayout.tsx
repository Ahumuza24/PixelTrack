import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Building2,
    Users,
    FolderOpen,
    CheckSquare,
    BarChart3,
    FileText,
    Bell,
    Menu,
    X,
    LogOut,
    ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { signOut } from '@/lib/supabase/auth'
import { UserRole } from '@/types'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    children: React.ReactNode
}

interface NavItem {
    label: string
    path: string
    icon: React.ElementType
    roles: UserRole[]
    badge?: number
}

const navigation: NavItem[] = [
    {
        label: 'Dashboard',
        path: ROUTES.ADMIN,
        icon: LayoutDashboard,
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Tasks',
        path: ROUTES.ADMIN_TASKS,
        icon: CheckSquare,
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Projects',
        path: ROUTES.ADMIN_PROJECTS,
        icon: FolderOpen,
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Clients',
        path: ROUTES.ADMIN_CLIENTS,
        icon: Building2,
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Team',
        path: ROUTES.ADMIN_USERS,
        icon: Users,
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Files',
        path: ROUTES.ADMIN_REPORTS,
        icon: FileText,
        roles: [UserRole.ADMIN],
    },
    {
        label: 'Notifications',
        path: ROUTES.ADMIN,
        icon: Bell,
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT],
    },
    {
        label: 'Analytics',
        path: ROUTES.ANALYTICS,
        icon: BarChart3,
        roles: [UserRole.ADMIN, UserRole.EMPLOYEE],
    },
]

/**
 * SidebarLayout - Main application layout with navigation sidebar.
 *
 * Features:
 * - Fixed left sidebar on desktop (collapses to bottom nav on mobile)
 * - Role-based navigation filtering
 * - User avatar and info in footer
 * - Active state styling with brand colors
 * - Notification badge support
 * - Responsive design with 768px breakpoint
 *
 * @example
 * ```tsx
 * <SidebarLayout>
 *   <YourPageContent />
 * </SidebarLayout>
 * ```
 */
export function SidebarLayout({ children }: SidebarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { user } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate(ROUTES.LOGIN)
    }

    // Filter navigation based on user role
    const filteredNav = navigation.filter((item) =>
        user?.role ? item.roles.includes(user.role) : false
    )

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white md:flex">
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cobalt shadow-lg shadow-cobalt/20">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 48 48">
                            <path
                                clipRule="evenodd"
                                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262Z"
                                fill="currentColor"
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                    <span className="text-lg font-bold text-slate-900">Pixel Track</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    <ul className="space-y-1">
                        {filteredNav.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.path

                            return (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={cn(
                                            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                            isActive
                                                ? 'bg-cobalt/10 text-cobalt'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                'h-5 w-5 transition-colors',
                                                isActive ? 'text-cobalt' : 'text-slate-400 group-hover:text-slate-600'
                                            )}
                                        />
                                        <span className="flex-1">{item.label}</span>
                                        {item.badge && (
                                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
                                                {item.badge}
                                            </span>
                                        )}
                                        {isActive && (
                                            <ChevronRight className="h-4 w-4 text-cobalt" />
                                        )}
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* User Footer */}
                <div className="border-t border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cobalt/10">
                            <span className="text-sm font-semibold text-cobalt">
                                {user?.displayName ? getInitials(user.displayName) : '?'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                                {user?.displayName || 'Unknown User'}
                            </p>
                            <p className="truncate text-xs text-slate-500 capitalize">
                                {user?.role || 'Unknown Role'}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600"
                            aria-label="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cobalt">
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 48 48">
                            <path
                                clipRule="evenodd"
                                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262Z"
                                fill="currentColor"
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                    <span className="font-semibold text-slate-900">Pixel Track</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5 text-slate-600" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileMenuOpen(true)}
                        className="h-8 w-8 p-0"
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5 text-slate-600" />
                    </Button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className="absolute right-0 top-0 h-full w-64 bg-white p-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-semibold text-slate-900">Menu</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMobileMenuOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="space-y-1">
                            {filteredNav.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.path

                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                                            isActive
                                                ? 'bg-cobalt/10 text-cobalt'
                                                : 'text-slate-600 hover:bg-slate-100'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.label}
                                    </NavLink>
                                )
                            })}
                        </nav>
                        <div className="mt-6 border-t border-slate-200 pt-4">
                            <button
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="h-5 w-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
                <div className="flex items-center justify-around px-2 py-2">
                    {filteredNav.slice(0, 5).map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-all',
                                    isActive ? 'text-cobalt' : 'text-slate-500'
                                )}
                            >
                                <Icon className={cn('h-5 w-5', isActive ? 'text-cobalt' : 'text-slate-400')} />
                                <span className="text-[10px]">{item.label}</span>
                            </NavLink>
                        )
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className="md:ml-64 min-h-screen pt-16 md:pt-0 pb-20 md:pb-0">
                {children}
            </main>
        </div>
    )
}
