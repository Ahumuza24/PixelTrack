import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getProjects,
    getProjectsWithClient,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectTaskCounts,
} from '@/lib/supabase/projects'
import type { ProjectFilters } from '@/types'

const PROJECTS_QUERY_KEY = 'projects'

/**
 * Hook to fetch all projects.
 * Cached for 5 minutes (staleTime).
 *
 * @example
 * ```ts
 * const { data: projects, isLoading } = useProjects()
 * ```
 */
export function useProjects(filters?: ProjectFilters) {
    return useQuery({
        queryKey: [PROJECTS_QUERY_KEY, filters],
        queryFn: () => getProjects(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to fetch all projects with client names and analytics.
 *
 * @example
 * ```ts
 * const { data: projects, isLoading } = useProjectsWithAnalytics()
 * ```
 */
export function useProjectsWithAnalytics(filters?: ProjectFilters) {
    return useQuery({
        queryKey: [PROJECTS_QUERY_KEY, 'with-analytics', filters],
        queryFn: async () => {
            const projectsWithClient = await getProjectsWithClient(filters)
            const enriched = await Promise.all(
                projectsWithClient.map(async (project) => {
                    const { total, completed } = await getProjectTaskCounts(project.id)
                    const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                    return {
                        ...project,
                        totalTasks: total,
                        completedTasks: completed,
                        progress,
                    }
                })
            )
            return enriched
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    })
}

/**
 * Hook to fetch a single project by ID.
 *
 * @example
 * ```ts
 * const { data: project } = useProject('project-123')
 * ```
 */
export function useProject(projectId: string | null) {
    return useQuery({
        queryKey: [PROJECTS_QUERY_KEY, projectId],
        queryFn: () => (projectId ? getProject(projectId) : null),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook to create a new project.
 * Invalidates projects cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: create } = useCreateProject()
 * const newProject = await create({
 *   clientId: 'client-123',
 *   title: 'Brand Design',
 *   description: 'Complete brand identity',
 *   status: ProjectStatus.ACTIVE,
 *   dueDate: '2024-12-31',
 * })
 * ```
 */
export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
            toast.success('Project created successfully')
        },
        onError: (error) => {
            toast.error(`Failed to create project: ${error.message}`)
        },
    })
}

/**
 * Hook to update an existing project.
 * Invalidates projects cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: update } = useUpdateProject()
 * await update({
 *   id: 'project-123',
 *   status: ProjectStatus.COMPLETED,
 * })
 * ```
 */
export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateProject,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
            queryClient.invalidateQueries({
                queryKey: [PROJECTS_QUERY_KEY, variables.id],
            })
            toast.success('Project updated successfully')
        },
        onError: (error) => {
            toast.error(`Failed to update project: ${error.message}`)
        },
    })
}

/**
 * Hook to delete a project.
 * Invalidates projects cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: remove } = useDeleteProject()
 * await remove('project-123')
 * ```
 */
export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PROJECTS_QUERY_KEY] })
            toast.success('Project deleted successfully')
        },
        onError: (error) => {
            toast.error(`Failed to delete project: ${error.message}`)
        },
    })
}
