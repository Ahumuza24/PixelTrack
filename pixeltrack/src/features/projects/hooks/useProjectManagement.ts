import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import {
    useProjectsWithAnalytics,
    useCreateProject,
    useUpdateProject,
    useDeleteProject,
} from './useProjects'
import { useClients } from '@/features/clients'
import { PROJECT_STATUS_CONFIG } from '@/features/projects/constants/projectDetail'
import type { ProjectFormValues } from '@/features/projects/components/ProjectForm'
import { ProjectStatus } from '@/types'
import type { ProjectWithClientAndAnalytics } from '@/types'

export type ProjectStatusFilter = ProjectStatus | 'all'

export function useProjectManagement() {
    const navigate = useNavigate()
    const { data: projects = [], isLoading } = useProjectsWithAnalytics()
    const { data: clients = [] } = useClients()
    const createProject = useCreateProject()
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<ProjectWithClientAndAnalytics | null>(null)
    const [deletingProject, setDeletingProject] = useState<ProjectWithClientAndAnalytics | null>(null)

    const filteredProjects = useMemo(() => {
        if (!projects) return []
        return projects.filter((project) => {
            const normalizedQuery = searchQuery.trim().toLowerCase()
            const matchesSearch = normalizedQuery
                ? project.title.toLowerCase().includes(normalizedQuery) ||
                  project.clientName.toLowerCase().includes(normalizedQuery)
                : true
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [projects, searchQuery, statusFilter])

    const statusOptions = useMemo(
        () =>
            Object.entries(PROJECT_STATUS_CONFIG).map(([value, config]) => ({
                value: value as ProjectStatus,
                label: config.label,
            })),
        [],
    )

    const editingInitialValues: ProjectFormValues | undefined = useMemo(() => {
        if (!editingProject) return undefined
        return {
            title: editingProject.title,
            description: editingProject.description ?? '',
            clientId: editingProject.clientId,
            status: editingProject.status,
            dueDate: editingProject.dueDate ?? '',
        }
    }, [editingProject])

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value)
    }, [])

    const handleStatusChange = useCallback((value: ProjectStatusFilter) => {
        setStatusFilter(value)
    }, [])

    const openCreateDialog = useCallback(() => setIsCreateOpen(true), [])
    const closeCreateDialog = useCallback(() => setIsCreateOpen(false), [])

    const startEditingProject = useCallback((project: ProjectWithClientAndAnalytics) => {
        setEditingProject(project)
    }, [])
    const closeEditDialog = useCallback(() => setEditingProject(null), [])

    const startDeletingProject = useCallback((project: ProjectWithClientAndAnalytics) => {
        setDeletingProject(project)
    }, [])
    const closeDeleteDialog = useCallback(() => setDeletingProject(null), [])

    const handleProjectSelect = useCallback(
        (projectId: string) => {
            navigate(ROUTES.ADMIN_PROJECT_DETAIL.replace(':projectId', projectId))
        },
        [navigate],
    )

    const handleCreateProject = useCallback(
        async (values: ProjectFormValues) => {
            await createProject.mutateAsync({
                ...values,
                startDate: values.status === ProjectStatus.ACTIVE ? new Date().toISOString() : undefined,
            })
            closeCreateDialog()
        },
        [closeCreateDialog, createProject],
    )

    const handleUpdateProject = useCallback(
        async (values: ProjectFormValues) => {
            if (!editingProject) return
            await updateProject.mutateAsync({
                id: editingProject.id,
                ...values,
                startDate:
                    values.status === ProjectStatus.ACTIVE && !editingProject.startDate
                        ? new Date().toISOString()
                        : editingProject.startDate,
            })
            closeEditDialog()
        },
        [closeEditDialog, editingProject, updateProject],
    )

    const handleDeleteProject = useCallback(async () => {
        if (!deletingProject) return
        await deleteProject.mutateAsync(deletingProject.id)
        closeDeleteDialog()
    }, [closeDeleteDialog, deleteProject, deletingProject])

    return {
        projects,
        clients,
        filteredProjects,
        isLoading,
        searchQuery,
        statusFilter,
        statusOptions,
        isCreateOpen,
        editingProject,
        deletingProject,
        editingInitialValues,
        handlers: {
            handleSearchChange,
            handleStatusChange,
            openCreateDialog,
            closeCreateDialog,
            startEditingProject,
            closeEditDialog,
            startDeletingProject,
            closeDeleteDialog,
            handleProjectSelect,
            handleCreateProject,
            handleUpdateProject,
            handleDeleteProject,
        },
        mutationState: {
            isCreating: createProject.isPending,
            isUpdating: updateProject.isPending,
            isDeleting: deleteProject.isPending,
        },
    }
}
