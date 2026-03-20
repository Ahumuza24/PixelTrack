import { useState, useMemo, useCallback, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { createSignedTaskFileUrl } from '@/lib/supabase/taskFiles'
import { useAuth } from '@/features/auth/useAuth'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useProjectsWithAnalytics } from '@/features/projects/hooks/useProjects'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { useAdminActivityFeed } from './useAdminActivityFeed'
import { useAdminSearch, ADMIN_SEARCH_MIN_LENGTH } from './useAdminSearch'
import { DASHBOARD_QUICK_ACTIONS, ACTIVITY_TYPE_CONFIG, DEFAULT_ACTIVITY_CONFIG } from '../constants/dashboard'
import { ROUTES } from '@/lib/constants'
import { TaskStatus, UserRole, type Notification, type AdminSearchResultItem } from '@/types'

export interface AdminActivityItem {
    id: string
    icon: React.ComponentType<{ className?: string }>
    backgroundClass: string
    accentClass: string
    actor: string
    action: string
    target: string
    preview?: string | null
    timestamp: string
}

export function useAdminDashboard() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: tasks } = useTasks()
    const { data: projects, isLoading: projectsLoading } = useProjectsWithAnalytics()
    const { data: clients } = useClients()
    const { data: users } = useUsers()
    const {
        data: activityNotifications,
        isLoading: activityLoading,
        isError: activityError,
    } = useAdminActivityFeed({ limit: 6 })

    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const trimmedSearch = searchQuery.trim()
    const showSearchDropdown = isSearchFocused && trimmedSearch.length > 0
    const canTriggerSearch = trimmedSearch.length >= ADMIN_SEARCH_MIN_LENGTH
    const {
        data: searchResults,
        isLoading: searchLoading,
        isError: searchError,
    } = useAdminSearch(searchQuery)
    const normalizedSearchResults = useMemo(() => searchResults ?? [], [searchResults])

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
        [navigate],
    )

    const handleSearchKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Escape') {
                setIsSearchFocused(false)
                setSearchQuery('')
                return
            }

            if (event.key === 'Enter' && canTriggerSearch && normalizedSearchResults.length > 0) {
                event.preventDefault()
                void handleResultNavigation(normalizedSearchResults[0])
            }
        },
        [canTriggerSearch, normalizedSearchResults, handleResultNavigation],
    )

    const handleSearchBlur = useCallback(() => {
        window.setTimeout(() => setIsSearchFocused(false), 120)
    }, [])

    const stats = useMemo(() => {
        const totalTasks = tasks?.length ?? 0
        const inProgressTasks = tasks?.filter((task) => task.status === TaskStatus.IN_PROGRESS).length ?? 0
        const overdueTasks =
            tasks?.filter((task) => {
                const due = new Date(task.dueDate)
                return due < new Date() && task.status !== TaskStatus.COMPLETE
            }).length ?? 0

        const totalClients = clients?.length ?? 0
        const totalEmployees = users?.filter((u) => u.role === UserRole.EMPLOYEE).length ?? 0
        const totalProjects = projects?.length ?? 0

        return {
            totalTasks,
            inProgressTasks,
            overdueTasks,
            totalClients,
            totalEmployees,
            totalProjects,
        }
    }, [tasks, clients, users, projects])

    const taskColumns = useMemo(() => {
        const todo = tasks?.filter((task) => task.status === TaskStatus.NOT_STARTED) ?? []
        const inProgress = tasks?.filter((task) => task.status === TaskStatus.IN_PROGRESS) ?? []
        const review = tasks?.filter((task) => task.status === TaskStatus.IN_REVIEW) ?? []

        return { todo, inProgress, review }
    }, [tasks])

    const activeProjects = useMemo(() => {
        if (!projects) return []
        return projects.filter((project) => project.status === 'active').slice(0, 3)
    }, [projects])

    const activityItems: AdminActivityItem[] = useMemo(() => {
        if (!activityNotifications) return []

        return activityNotifications.map((notification: Notification) => {
            const config = ACTIVITY_TYPE_CONFIG[notification.type] ?? DEFAULT_ACTIVITY_CONFIG
            const metadata = notification.metadata || {}
            const actor =
                typeof metadata.actorName === 'string' && metadata.actorName.trim().length > 0
                    ? metadata.actorName
                    : 'Team member'
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

    const handleQuickActionNavigate = useCallback((href: string) => navigate(href), [navigate])
    const handleProjectSelect = useCallback(
        (projectId: string) => {
            navigate(ROUTES.ADMIN_PROJECT_DETAIL.replace(':projectId', projectId))
        },
        [navigate],
    )

    const handleTasksNavigate = useCallback(() => navigate(ROUTES.ADMIN_TASKS), [navigate])
    const handleProjectsNavigate = useCallback(() => navigate(ROUTES.ADMIN_PROJECTS), [navigate])
    const handleTaskSelect = useCallback((taskId: string) => navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId)), [navigate])
    const handleViewAllActivity = useCallback(() => navigate(ROUTES.ADMIN_REPORTS), [navigate])

    const userFirstName = useMemo(() => user?.displayName?.split(' ')[0] ?? 'Admin', [user?.displayName])

    return {
        userFirstName,
        searchState: {
            searchQuery,
            setSearchQuery,
            showSearchDropdown,
            trimmedSearch,
            canTriggerSearch,
            searchResults: normalizedSearchResults,
            searchLoading,
            searchError,
            isSearchFocused,
            setIsSearchFocused,
            handleSearchBlur,
            handleSearchKeyDown,
            handleResultNavigation,
        },
        stats,
        quickActions: DASHBOARD_QUICK_ACTIONS,
        taskColumns,
        projectsState: {
            activeProjects,
            projectsLoading,
        },
        activityState: {
            activityItems,
            activityLoading,
            activityError,
        },
        handlers: {
            handleQuickActionNavigate,
            handleProjectsNavigate,
            handleProjectSelect,
            handleTasksNavigate,
            handleTaskSelect,
            handleViewAllActivity,
        },
        overdueCount: stats.overdueTasks,
    }
}

export type AdminDashboardHookReturn = ReturnType<typeof useAdminDashboard>
export type AdminTaskColumns = AdminDashboardHookReturn['taskColumns']
export type AdminProjectsState = AdminDashboardHookReturn['projectsState']
export type AdminActivityState = AdminDashboardHookReturn['activityState']
export type AdminDashboardStats = AdminDashboardHookReturn['stats']
export type AdminDashboardSearchState = AdminDashboardHookReturn['searchState']
