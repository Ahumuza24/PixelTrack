import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { useClient } from '@/features/clients/hooks/useClients'
import { useProjectsByClient } from '@/features/projects/hooks/useProjects'
import { ROUTES } from '@/lib/constants'
import type { Project } from '@/types'

interface ClientProjectsStats {
    total: number
    active: number
    completed: number
}

interface ProjectWithProgress extends Project {
    progressPercent: number
    taskCount: number
    completedTasks: number
}

interface UseClientProjectsResult {
    clientName: string
    projects: ProjectWithProgress[]
    stats: ClientProjectsStats
    isLoading: boolean
    notFound: boolean
    handlers: {
        handleViewProject: (projectId: string) => void
    }
}

export function useClientProjects(): UseClientProjectsResult {
    const { user } = useAuth()
    const clientId = user?.clientId ?? null
    const navigate = useNavigate()
    const { data: client, isLoading: clientLoading } = useClient(clientId)
    const { data: projects = [], isLoading: projectsLoading } = useProjectsByClient(clientId)

    const projectsWithProgress = useMemo<ProjectWithProgress[]>(() => {
        return projects.map((project) => ({
            ...project,
            progressPercent: project.progressPercent ?? 0,
            taskCount: project.taskCount ?? 0,
            completedTasks: project.completedTasks ?? 0,
        }))
    }, [projects])

    const stats = useMemo<ClientProjectsStats>(() => {
        const total = projects.length
        const active = projects.filter((p) => p.status === 'active').length
        const completed = projects.filter((p) => p.status === 'completed').length
        return { total, active, completed }
    }, [projects])

    const handleViewProject = (projectId: string) => {
        navigate(ROUTES.CLIENT_PROJECT_DETAIL.replace(':projectId', projectId))
    }

    const isLoading = clientLoading || projectsLoading
    const notFound = !!clientId && !client && !isLoading

    return {
        clientName: client?.name ?? 'Client Portal',
        projects: projectsWithProgress,
        stats,
        isLoading,
        notFound,
        handlers: {
            handleViewProject,
        },
    }
}
