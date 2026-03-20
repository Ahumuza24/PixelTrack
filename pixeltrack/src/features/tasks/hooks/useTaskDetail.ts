import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/features/auth/useAuth'
import { useTask, useUpdateTask, useDeleteTask } from '@/features/tasks/hooks/useTasks'
import { useTaskFiles } from '@/features/tasks/hooks/useTaskFiles'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { useProjects } from '@/features/projects/hooks/useProjects'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'
import { getTaskProgress, UserRole, type Client, type Project, type Task, type TaskFile, type UserProfile } from '@/types'

interface UseTaskDetailResult {
    task: Task | null
    client?: Client
    project?: Project
    users: UserProfile[]
    assignees: UserProfile[]
    employees: UserProfile[]
    taskFiles: TaskFile[]
    isTaskFilesLoading: boolean
    isLoading: boolean
    notFound: boolean
    progressPercent: number
    canEdit: boolean
    canManageFiles: boolean
    dialogState: {
        isEditOpen: boolean
        openEditDialog: () => void
        closeEditDialog: () => void
        isDeleteOpen: boolean
        openDeleteDialog: () => void
        closeDeleteDialog: () => void
    }
    handlers: {
        handleBack: () => void
        handleEditSubmit: (values: TaskFormValues) => Promise<void>
        handleDeleteTask: () => Promise<void>
    }
    clients: Client[]
    projects: Project[]
    currentUser: UserProfile | null
    mutationState: {
        isUpdating: boolean
        isDeleting: boolean
    }
}

export function useTaskDetail(taskId?: string): UseTaskDetailResult {
    const navigate = useNavigate()
    const { user } = useAuth()

    const taskQueryId = taskId ?? null
    const { data: task, isLoading } = useTask(taskQueryId)
    const { data: clients = [] } = useClients()
    const { data: users = [] } = useUsers()
    const { data: projects = [] } = useProjects()
    const { data: taskFiles = [], isLoading: isTaskFilesLoading } = useTaskFiles(task?.id ?? null)

    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const client = useMemo(() => clients.find((c) => c.id === task?.clientId), [clients, task?.clientId])
    const project = useMemo(() => projects.find((p) => p.id === task?.projectId), [projects, task?.projectId])

    const assignees = useMemo(() => {
        if (!task) return []
        return users.filter((u) => task.assignees.includes(u.uid))
    }, [task, users])

    const employees = useMemo(() => users.filter((u) => u.role !== UserRole.CLIENT), [users])

    const progressPercent = useMemo(() => (task ? getTaskProgress(task.status) : 0), [task])

    const canEdit = useMemo(() => {
        if (!task || !user) return false
        if (user.role === UserRole.ADMIN) return true
        if (user.role === UserRole.EMPLOYEE) {
            return task.assignees.includes(user.uid)
        }
        return false
    }, [task, user])

    const canManageFiles = useMemo(() => {
        if (!task || !user) return false
        if (user.role === UserRole.ADMIN) return true
        if (user.role === UserRole.EMPLOYEE) {
            return task.assignees.includes(user.uid)
        }
        return false
    }, [task, user])

    const openEditDialog = useCallback(() => setIsEditOpen(true), [])
    const closeEditDialog = useCallback(() => setIsEditOpen(false), [])
    const openDeleteDialog = useCallback(() => setIsDeleteOpen(true), [])
    const closeDeleteDialog = useCallback(() => setIsDeleteOpen(false), [])

    const handleBack = useCallback(() => navigate(-1), [navigate])

    const handleEditSubmit = useCallback(
        async (values: TaskFormValues) => {
            if (!task) return
            await updateTask.mutateAsync({ id: task.id, ...values })
            closeEditDialog()
        },
        [closeEditDialog, task, updateTask],
    )

    const handleDeleteTask = useCallback(async () => {
        if (!task) return
        await deleteTask.mutateAsync(task.id)
        closeDeleteDialog()
        navigate(ROUTES.ADMIN_TASKS)
    }, [closeDeleteDialog, deleteTask, navigate, task])

    return {
        task: task ?? null,
        client,
        project,
        users,
        assignees,
        employees,
        taskFiles,
        isTaskFilesLoading,
        isLoading,
        notFound: !isLoading && !task,
        progressPercent,
        canEdit,
        canManageFiles,
        dialogState: {
            isEditOpen,
            openEditDialog,
            closeEditDialog,
            isDeleteOpen,
            openDeleteDialog,
            closeDeleteDialog,
        },
        handlers: {
            handleBack,
            handleEditSubmit,
            handleDeleteTask,
        },
        clients,
        projects,
        currentUser: user ?? null,
        mutationState: {
            isUpdating: updateTask.isPending,
            isDeleting: deleteTask.isPending,
        },
    }
}
