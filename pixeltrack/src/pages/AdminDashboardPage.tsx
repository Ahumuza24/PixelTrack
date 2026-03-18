import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { CheckSquare, Users, Plus, Loader2, CheckCircle, Building2, AlertCircle, ArrowRight, Search, Bell, MessageSquare, Upload, List, Eye, FolderKanban, FileText, UserCircle2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useProjectsWithAnalytics } from '@/features/projects/hooks/useProjects'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { useAdminSearch, ADMIN_SEARCH_MIN_LENGTH } from '@/features/admin/hooks/useAdminSearch'
import { useAdminActivityFeed } from '@/features/admin/hooks/useAdminActivityFeed'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createSignedTaskFileUrl } from '@/lib/supabase/taskFiles'
import { TaskStatus, UserRole, ProjectStatus, type AdminSearchResultItem, type SearchResultType, type NotificationType, type Notification } from '@/types'

const SEARCH_TYPE_CONFIG: Record<SearchResultType, { icon: LucideIcon; accentClass: string; backgroundClass: string; label: string }> = {
    task: {
        icon: CheckSquare,
        accentClass: 'text-[#0048ad]',
        backgroundClass: 'bg-[#0048ad]/10',
        label: 'Task',
    },
    project: {
        icon: FolderKanban,
        accentClass: 'text-indigo-600',
        backgroundClass: 'bg-indigo-50',
        label: 'Project',
    },
    client: {
        icon: UserCircle2,
        accentClass: 'text-emerald-600',
        backgroundClass: 'bg-emerald-50',
        label: 'Client',
    },
    file: {
        icon: FileText,
        accentClass: 'text-slate-600',
        backgroundClass: 'bg-slate-100',
        label: 'File',
    },
}

type ActivityDisplayConfig = {
    icon: LucideIcon
    backgroundClass: string
    accentClass: string
    action: string
}

const ACTIVITY_TYPE_CONFIG: Partial<Record<NotificationType, ActivityDisplayConfig>> = {
    comment_added: {
        icon: MessageSquare,
        backgroundClass: 'bg-[#0048ad]/10',
        accentClass: 'text-[#0048ad]',
        action: 'commented on',
    },
    file_uploaded: {
        icon: Upload,
        backgroundClass: 'bg-slate-100',
        accentClass: 'text-slate-500',
        action: 'uploaded files to',
    },
    task_status_updated: {
        icon: CheckCircle,
        backgroundClass: 'bg-green-100',
        accentClass: 'text-green-600',
        action: 'updated',
    },
    task_assigned: {
        icon: Users,
        backgroundClass: 'bg-orange-100',
        accentClass: 'text-orange-600',
        action: 'assigned teammates to',
    },
}

const DEFAULT_ACTIVITY_CONFIG: ActivityDisplayConfig = {
    icon: Bell,
    backgroundClass: 'bg-slate-100',
    accentClass: 'text-slate-500',
    action: 'shared an update about',
}

type AdminActivityItem = {
    id: string
    icon: LucideIcon
    backgroundClass: string
    accentClass: string
    actor: string
    action: string
    target: string
    preview?: string | null
    timestamp: string
}

export function AdminDashboardPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: tasks } = useTasks()
    const { data: projects, isLoading: projectsLoading } = useProjectsWithAnalytics()
    const { data: clients } = useClients()
    const { data: users } = useUsers()
    const { data: activityNotifications, isLoading: activityLoading, isError: activityError } = useAdminActivityFeed({ limit: 6 })
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const { data: searchResults, isLoading: searchLoading, isError: searchError } = useAdminSearch(searchQuery)

    const trimmedSearch = searchQuery.trim()
    const showSearchDropdown = isSearchFocused && trimmedSearch.length > 0
    const canTriggerSearch = trimmedSearch.length >= ADMIN_SEARCH_MIN_LENGTH
    const normalizedSearchResults = searchResults ?? []

    const activityItems: AdminActivityItem[] = useMemo(() => {
        if (!activityNotifications) return []

        return activityNotifications.map((notification: Notification) => {
            const config = ACTIVITY_TYPE_CONFIG[notification.type] ?? DEFAULT_ACTIVITY_CONFIG
            const metadata = notification.metadata || {}
            const actor = typeof metadata.actorName === 'string' && metadata.actorName.trim().length > 0 ? metadata.actorName : 'Team member'
            const target =
                (typeof metadata.taskTitle === 'string' && metadata.taskTitle.trim().length > 0 && metadata.taskTitle) ||
                (typeof metadata.fileName === 'string' && metadata.fileName.trim().length > 0 && metadata.fileName) ||
                notification.relatedEntityType ||
                'this item'
            const preview =
                (typeof metadata.commentSnippet === 'string' && metadata.commentSnippet.trim().length > 0 && metadata.commentSnippet) ||
                notification.body

            return {
                id: notification.id,
                icon: config.icon,
                backgroundClass: config.backgroundClass,
                accentClass: config.accentClass,
                actor,
                action: config.action,
                target,
                preview,
                timestamp: formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }),
            }
        })
    }, [activityNotifications])

    const handleResultNavigation = useCallback(
        async (result: AdminSearchResultItem) => {
            try {
                if (result.type === 'file') {
                    if (result.isExternalLink && result.externalUrl) {
                        window.open(result.externalUrl, '_blank', 'noopener,noreferrer')
                        return
                    }

                    if (result.storagePath) {
                        const signedUrl = await createSignedTaskFileUrl(result.storagePath)
                        window.open(signedUrl, '_blank', 'noopener,noreferrer')
                        return
                    }
                }

                if (result.navigationTarget) {
                    navigate(result.navigationTarget)
                }
            } catch (error) {
                console.error('Failed to open search result', error)
            } finally {
                setSearchQuery('')
                setIsSearchFocused(false)
            }
        },
        [navigate]
    )

    const handleSearchBlur = () => {
        window.setTimeout(() => setIsSearchFocused(false), 120)
    }

    const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape') {
            setIsSearchFocused(false)
            setSearchQuery('')
            return
        }

        if (event.key === 'Enter' && canTriggerSearch && normalizedSearchResults.length > 0) {
            event.preventDefault()
            void handleResultNavigation(normalizedSearchResults[0])
        }
    }

    // Stats calculation
    const totalTasks = tasks?.length || 0
    const inProgressTasks = tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS).length || 0
    const overdueTasks = tasks?.filter((t) => {
        const due = new Date(t.dueDate)
        return due < new Date() && t.status !== TaskStatus.COMPLETE
    }).length || 0

    const totalClients = clients?.length || 0
    const totalEmployees = users?.filter((u) => u.role === UserRole.EMPLOYEE).length || 0
    const totalProjects = projects?.length || 0
    const activeProjects = projects?.filter((p) => p.status === ProjectStatus.ACTIVE).slice(0, 3) || []

    const todoTasks = tasks?.filter((t) => t.status === TaskStatus.NOT_STARTED) || []
    const inProgressTasksList = tasks?.filter((t) => t.status === TaskStatus.IN_PROGRESS) || []
    const reviewTasksList = tasks?.filter((t) => t.status === TaskStatus.IN_REVIEW) || []

    const quickActions = [
        { icon: Plus, label: 'New Project', href: '/admin/projects', color: 'bg-[#0048ad]' },
        { icon: Plus, label: 'New Task', href: '/admin/tasks', color: 'bg-emerald-600' },
        { icon: Building2, label: 'Add Client', href: '/admin/clients', color: 'bg-violet-600' },
        { icon: Users, label: 'Add Team Member', href: '/admin/users', color: 'bg-orange-600' },
    ]

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f7f8]">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                            placeholder="Search projects, tasks, or files..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={handleSearchBlur}
                            onKeyDown={handleSearchKeyDown}
                            autoComplete="off"
                            className="w-full bg-slate-100 border-none pl-10 focus:ring-2 focus:ring-[#0048ad]/50"
                        />
                        {showSearchDropdown && (
                            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
                                <div className="max-h-96 overflow-y-auto">
                                    {!canTriggerSearch ? (
                                        <p className="p-4 text-sm text-slate-500">
                                            Type at least {ADMIN_SEARCH_MIN_LENGTH} characters to search tasks, projects, clients, and files.
                                        </p>
                                    ) : searchLoading ? (
                                        <div className="p-4 text-sm text-slate-500 flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#0048ad]" />
                                            Searching...
                                        </div>
                                    ) : searchError ? (
                                        <p className="p-4 text-sm text-red-500">Unable to load search results. Please try again.</p>
                                    ) : normalizedSearchResults.length === 0 ? (
                                        <p className="p-4 text-sm text-slate-500">
                                            No matches for <span className="font-semibold text-slate-900">“{trimmedSearch}”</span>
                                        </p>
                                    ) : (
                                        <ul className="divide-y divide-slate-100" role="listbox" aria-label="Admin search results">
                                            {normalizedSearchResults.map((result) => {
                                                const config = SEARCH_TYPE_CONFIG[result.type]
                                                const Icon = config.icon

                                                return (
                                                    <li key={`${result.type}-${result.id}`}>
                                                        <button
                                                            type="button"
                                                            className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors"
                                                            onMouseDown={(event) => event.preventDefault()}
                                                            onClick={() => handleResultNavigation(result)}
                                                            aria-label={`Open ${config.label} ${result.title}`}
                                                            role="option"
                                                        >
                                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.backgroundClass} ${config.accentClass}`}>
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-900 truncate">{result.title}</p>
                                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                                    {result.subtitle && <span className="truncate">{result.subtitle}</span>}
                                                                    {result.subtitle && result.metadata && <span>•</span>}
                                                                    {result.metadata && <span className="truncate">{result.metadata}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right text-[10px] uppercase font-bold tracking-wide text-slate-400">
                                                                {config.label}
                                                                {result.type === 'file' && (
                                                                    <p className="text-[10px] font-normal normal-case text-slate-500">{result.isExternalLink ? 'External link' : 'Storage file'}</p>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                                        </button>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600 relative">
                        <Bell className="w-5 h-5" />
                        {overdueTasks > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                                {overdueTasks}
                            </span>
                        )}
                    </button>
                    <Button className="bg-[#0048ad] text-white hover:bg-[#003d8f]" onClick={() => navigate('/admin/projects')}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </div>
            </header>

            {/* Dashboard Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Welcome Section */}
                    <section>
                        <h2 className="text-3xl font-black tracking-tight">Agency Dashboard</h2>
                        <p className="text-slate-500 mt-1">
                            Welcome back, {user?.displayName?.split(' ')[0] || 'Admin'}. Here's what's happening today.
                        </p>
                    </section>

                    {/* Stats Cards */}
                    <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Projects</p>
                                        <p className="text-2xl font-bold">{totalProjects}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <FolderKanban className="w-5 h-5 text-indigo-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Total Tasks</p>
                                        <p className="text-2xl font-bold">{totalTasks}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-[#0048ad]/10 rounded-lg flex items-center justify-center">
                                        <CheckSquare className="w-5 h-5 text-[#0048ad]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">In Progress</p>
                                        <p className="text-2xl font-bold">{inProgressTasks}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Clients</p>
                                        <p className="text-2xl font-bold">{totalClients}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-500">Team Members</p>
                                        <p className="text-2xl font-bold">{totalEmployees}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-violet-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Quick Actions */}
                    <section>
                        <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                        <div className="flex flex-wrap gap-3">
                            {quickActions.map((action) => (
                                <Button
                                    key={action.label}
                                    onClick={() => navigate(action.href)}
                                    className={`${action.color} text-white hover:opacity-90`}
                                >
                                    <action.icon className="w-4 h-4 mr-2" />
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </section>

                    {/* Overdue Tasks Alert */}
                    {overdueTasks > 0 && (
                        <section>
                            <Card className="border-red-200 bg-red-50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-red-900">{overdueTasks} Overdue Task{overdueTasks > 1 ? 's' : ''}</p>
                                        <p className="text-sm text-red-700">Some tasks need immediate attention</p>
                                    </div>
                                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => navigate('/admin/tasks')}>
                                        View Tasks
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* Active Projects */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Active Projects</h3>
                            <button onClick={() => navigate('/admin/projects')} className="text-[#0048ad] text-sm font-semibold hover:underline">
                                View all
                            </button>
                        </div>

                        {projectsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-48 bg-white rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : activeProjects.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeProjects.map((project) => {
                                    const progress = project.progress
                                    const statusConfig: Record<string, { label: string; bg: string; color: string; dot: string }> = {
                                        not_started: { label: 'Not Started', bg: 'bg-slate-100', color: 'text-slate-700', dot: 'bg-slate-500' },
                                        active: { label: 'Active', bg: 'bg-blue-100', color: 'text-blue-700', dot: 'bg-blue-500' },
                                        on_hold: { label: 'On Hold', bg: 'bg-yellow-100', color: 'text-yellow-700', dot: 'bg-yellow-500' },
                                        completed: { label: 'Completed', bg: 'bg-green-100', color: 'text-green-700', dot: 'bg-green-500' },
                                        cancelled: { label: 'Cancelled', bg: 'bg-red-100', color: 'text-red-700', dot: 'bg-red-500' },
                                    }
                                    const config = statusConfig[project.status] || statusConfig.not_started

                                    return (
                                        <div
                                            key={project.id}
                                            className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#0048ad]/50 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/admin/projects/${project.id}`)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="h-12 w-12 rounded-lg bg-[#0048ad]/10 flex items-center justify-center text-[#0048ad]">
                                                    <FolderKanban className="w-6 h-6" />
                                                </div>
                                                <Badge className={`${config.bg} ${config.color}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot} mr-1`} />
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <h4 className="font-bold text-lg mb-1 group-hover:text-[#0048ad] transition-colors">{project.title}</h4>
                                            <p className="text-sm text-slate-500 mb-6">
                                                Client: {project.clientName || 'Unknown'}
                                            </p>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span>{project.completedTasks}/{project.totalTasks} tasks</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#0048ad] rounded-full" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <Card className="bg-white">
                                <CardContent className="p-8 text-center">
                                    <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">No active projects</h3>
                                    <p className="text-slate-500 mb-4">Create your first project to get started</p>
                                    <Button onClick={() => navigate('/admin/projects')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Project
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </section>

                    {/* Task Overview & Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Task Overview */}
                        <div className="lg:col-span-2 space-y-6">
                            <h3 className="text-xl font-bold">Task Overview</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {/* To Do Column */}
                                <div className="bg-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <List className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">To Do</span>
                                        <Badge variant="secondary" className="ml-auto">{todoTasks.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {todoTasks.slice(0, 3).map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <p className="text-sm font-medium truncate">{task.title}</p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    Due {new Date(task.dueDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                        {todoTasks.length === 0 && <p className="text-sm text-slate-400 italic">No tasks</p>}
                                    </div>
                                </div>

                                {/* In Progress Column */}
                                <div className="bg-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Loader2 className="w-5 h-5 text-[#0048ad]" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">In Progress</span>
                                        <Badge variant="secondary" className="ml-auto">{inProgressTasksList.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {inProgressTasksList.slice(0, 3).map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-l-[#0048ad] cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <p className="text-sm font-medium truncate">{task.title}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="h-5 w-5 rounded-full bg-[#0048ad]/20 flex items-center justify-center text-[10px] text-[#0048ad] font-medium">
                                                        {task.assignees?.[0]?.charAt(0) || 'A'}
                                                    </div>
                                                    <span className="text-xs text-slate-400 italic">In progress</span>
                                                </div>
                                            </div>
                                        ))}
                                        {inProgressTasksList.length === 0 && <p className="text-sm text-slate-400 italic">No tasks</p>}
                                    </div>
                                </div>

                                {/* Review Column */}
                                <div className="bg-slate-100 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Eye className="w-5 h-5 text-indigo-500" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Review</span>
                                        <Badge variant="secondary" className="ml-auto">{reviewTasksList.length}</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {reviewTasksList.slice(0, 3).map((task) => (
                                            <div
                                                key={task.id}
                                                className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/tasks/${task.id}`)}
                                            >
                                                <p className="text-sm font-medium truncate">{task.title}</p>
                                                <p className="text-xs text-indigo-500 mt-1 font-bold">Needs Approval</p>
                                            </div>
                                        ))}
                                        {reviewTasksList.length === 0 && <p className="text-sm text-slate-400 italic">No tasks</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold">Recent Activity</h3>
                            <Card className="border border-slate-200 overflow-hidden">
                                <CardContent className="p-5 space-y-6">
                                    {activityLoading ? (
                                        <div className="space-y-4">
                                            {[0, 1, 2].map((index) => (
                                                <div key={index} className={`flex gap-4 ${index > 0 ? 'border-t border-slate-100 pt-6' : ''}`}>
                                                    <div className="flex-shrink-0">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse" />
                                                        <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : activityError ? (
                                        <p className="text-sm text-red-500">Unable to load activity. Please refresh.</p>
                                    ) : activityItems.length === 0 ? (
                                        <p className="text-sm text-slate-500">No recent activity yet. Updates from comments, files, and task changes will appear here.</p>
                                    ) : (
                                        activityItems.map((activity, index) => {
                                            const ActivityIcon = activity.icon
                                            return (
                                                <div key={activity.id} className={`flex gap-4 ${index > 0 ? 'border-t border-slate-100 pt-6' : ''}`}>
                                                    <div className="flex-shrink-0">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.backgroundClass} ${activity.accentClass}`}>
                                                            <ActivityIcon className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm">
                                                            <span className="font-bold">{activity.actor}</span>{' '}
                                                            {activity.action}{' '}
                                                            <span className="text-[#0048ad] font-medium">{activity.target}</span>
                                                        </p>
                                                        {activity.preview && (
                                                            <p className="text-xs text-slate-500 mt-1 italic">{activity.preview}</p>
                                                        )}
                                                        <p className="text-[10px] text-slate-400 mt-2">{activity.timestamp}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </CardContent>
                                <button className="w-full py-3 text-sm font-semibold bg-slate-50 border-t border-slate-200 hover:bg-slate-100 transition-colors">
                                    View All Activity
                                </button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
     
    )
}
