import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import {
    useProject,
    useUpdateProject,
    useDeleteProject,
} from './useProjects'
import { useTasks, useCreateTask } from '@/features/tasks/hooks/useTasks'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { PROJECT_STATUS_CONFIG } from '@/features/projects/constants/projectDetail'
import type { ProjectTaskStats } from '@/features/projects/types'
import { TaskStatus, UserRole } from '@/types'
import type { ProjectFormValues } from '@/features/projects/components/ProjectForm'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'

export function useProjectDetail(projectId?: string) {
    const navigate = useNavigate()
    const { data: project, isLoading: projectLoading } = useProject(projectId ?? null)
    const taskFilters = useMemo(() => (projectId ? { projectId } : undefined), [projectId])
    const { data: projectTasks = [], isLoading: tasksLoading } = useTasks(taskFilters)
    const { data: clients = [] } = useClients()
    const { data: users = [] } = useUsers()
    const deleteProject = useDeleteProject()
    const updateProject = useUpdateProject()
    const createTask = useCreateTask()

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

    const openEditDialog = useCallback(() => setIsEditOpen(true), [])
    const closeEditDialog = useCallback(() => setIsEditOpen(false), [])
    const openDeleteDialog = useCallback(() => setIsDeleteOpen(true), [])
    const closeDeleteDialog = useCallback(() => setIsDeleteOpen(false), [])
    const openTaskForm = useCallback(() => setIsTaskFormOpen(true), [])
    const closeTaskForm = useCallback(() => setIsTaskFormOpen(false), [])

    const employees = useMemo(() => users.filter((user) => user.role !== UserRole.CLIENT), [users])

    const projectProgress = useMemo(() => {
        if (projectTasks.length === 0) return 0
        const completed = projectTasks.filter((task) => task.status === TaskStatus.COMPLETE).length
        return Math.round((completed / projectTasks.length) * 100)
    }, [projectTasks])

    const taskStats: ProjectTaskStats = useMemo(() => {
        return {
            total: projectTasks.length,
            completed: projectTasks.filter((task) => task.status === TaskStatus.COMPLETE).length,
            inProgress: projectTasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length,
            notStarted: projectTasks.filter((task) => task.status === TaskStatus.NOT_STARTED).length,
            blocked: projectTasks.filter((task) => task.status === TaskStatus.BLOCKED).length,
        }
    }, [projectTasks])

    const clientName = useMemo(() => {
        if (!project) return 'Unknown Client'
        return clients.find((client) => client.id === project.clientId)?.name ?? 'Unknown Client'
    }, [clients, project])

    const statusMeta = project ? PROJECT_STATUS_CONFIG[project.status] : undefined

    const isLoading = projectLoading || tasksLoading

    const formatDate = useCallback((value?: string) => {
        if (!value) return 'TBD'
        const parsed = new Date(value)
        return Number.isNaN(parsed.getTime()) ? 'TBD' : parsed.toLocaleDateString()
    }, [])

    const taskFormInitialValues = useMemo(() => {
        if (!project) return undefined
        return { projectId: project.id, clientId: project.clientId }
    }, [project])

    const handleBack = useCallback(() => {
        navigate(ROUTES.ADMIN_PROJECTS)
    }, [navigate])

    const projectClientId = project?.clientId

    const handleViewClient = useCallback(() => {
        if (!projectClientId) return
        navigate(ROUTES.ADMIN_CLIENT_DETAIL.replace(':clientId', projectClientId))
    }, [navigate, projectClientId])

    const handleTaskSelect = useCallback(
        (taskId: string) => {
            navigate(ROUTES.TASK_DETAIL.replace(':taskId', taskId))
        },
        [navigate],
    )

    const handleDeleteProject = useCallback(async () => {
        if (!projectId) return
        await deleteProject.mutateAsync(projectId)
        navigate(ROUTES.ADMIN_PROJECTS)
        closeDeleteDialog()
    }, [closeDeleteDialog, deleteProject, navigate, projectId])

    const handleUpdateProject = useCallback(
        async (data: ProjectFormValues) => {
            if (!projectId) return
            await updateProject.mutateAsync({
                id: projectId,
                ...data,
                startDate:
                    data.status === 'active' && !project?.startDate
                        ? new Date().toISOString()
                        : project?.startDate,
            })
            closeEditDialog()
        },
        [closeEditDialog, project?.startDate, projectId, updateProject],
    )

    const handleCreateTask = useCallback(
        async (values: TaskFormValues) => {
            if (!projectId) return
            await createTask.mutateAsync({ ...values, projectId })
            closeTaskForm()
        },
        [closeTaskForm, createTask, projectId],
    )

    return {
        project,
        clients,
        employees,
        projectTasks,
        projectProgress,
        taskStats,
        clientName,
        statusMeta,
        formatDate,
        taskFormInitialValues,
        isLoading,
        mutationState: {
            isUpdating: updateProject.isPending,
            isDeleting: deleteProject.isPending,
            isCreatingTask: createTask.isPending,
        },
        dialogState: {
            isEditOpen,
            openEditDialog,
            closeEditDialog,
            isDeleteOpen,
            openDeleteDialog,
            closeDeleteDialog,
            isTaskFormOpen,
            openTaskForm,
            closeTaskForm,
        },
        handlers: {
            handleBack,
            handleViewClient,
            handleTaskSelect,
            handleDeleteProject,
            handleUpdateProject,
            handleCreateTask,
        },
    }
}
