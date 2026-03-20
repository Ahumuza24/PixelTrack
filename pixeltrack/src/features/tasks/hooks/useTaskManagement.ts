import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import {
    useTasks,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useUpdateTaskStatus,
} from './useTasks'
import { useProjects } from '@/features/projects/hooks/useProjects'
import { useClients } from '@/features/clients'
import { useUsers } from '@/features/users'
import { TASK_ITEMS_PER_PAGE } from '@/features/tasks/constants/taskManagement'
import type { TaskFilterTab, TaskViewMode } from '@/features/tasks/constants/taskManagement'
import { TaskStatus, TaskPriority, UserRole } from '@/types'
import type { Task } from '@/types'
import type { TaskFormValues } from '@/features/tasks/schemas/taskSchema'

export interface TaskManagementStats {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    overdueTasks: number
}

export interface TaskManagementState {
    viewMode: TaskViewMode
    setViewMode: (mode: TaskViewMode) => void
    activeTab: TaskFilterTab
    setActiveTab: (tab: TaskFilterTab) => void
    searchQuery: string
    setSearchQuery: (value: string) => void
    currentPage: number
    setCurrentPage: (page: number) => void
    selectedTasks: Set<string>
    toggleTaskSelection: (taskId: string) => void
    toggleSelectAll: () => void
}

export interface TaskManagementHandlers {
    handleAdd: () => void
    handleEdit: (task: Task) => void
    handleDelete: (task: Task) => void
    handleConfirmDelete: () => Promise<void>
    handleSubmit: (values: TaskFormValues) => Promise<void>
    handleStatusChange: (taskId: string, status: TaskStatus) => Promise<void>
    handleViewTask: (taskId: string) => void
}

export function useTaskManagement() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { data: tasks = [], isLoading: tasksLoading } = useTasks()
    const { data: projects = [] } = useProjects()
    const { data: clients = [] } = useClients()
    const { data: users = [] } = useUsers()

    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()
    const updateTaskStatus = useUpdateTaskStatus()

    const [viewMode, setViewMode] = useState<TaskViewMode>('list')
    const [activeTab, setActiveTab] = useState<TaskFilterTab>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [deletingTask, setDeletingTask] = useState<Task | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const employees = useMemo(() => users.filter((u) => u.role !== UserRole.CLIENT), [users])

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value)
        setCurrentPage(1)
    }, [])

    const handleActiveTabChange = useCallback((tab: TaskFilterTab) => {
        setActiveTab(tab)
        setCurrentPage(1)
    }, [])

    const filteredTasks = useMemo(() => {
        const threeDaysFromNow = new Date()
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

        return tasks.filter((task) => {
            if (activeTab === 'my-tasks' && !task.assignees.includes(user?.uid ?? '')) {
                return false
            }

            if (activeTab === 'due-soon') {
                const dueDate = new Date(task.dueDate)
                if (dueDate > threeDaysFromNow || task.status === TaskStatus.COMPLETE) {
                    return false
                }
            }

            if (
                activeTab === 'high-priority' &&
                !(task.priority === TaskPriority.HIGH || task.priority === TaskPriority.URGENT)
            ) {
                return false
            }

            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matches =
                    task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query)
                if (!matches) return false
            }

            return true
        })
    }, [tasks, activeTab, searchQuery, user?.uid])

    const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTasks.length / TASK_ITEMS_PER_PAGE)), [filteredTasks.length])

    const paginatedTasks = useMemo(() => {
        const start = (currentPage - 1) * TASK_ITEMS_PER_PAGE
        return filteredTasks.slice(start, start + TASK_ITEMS_PER_PAGE)
    }, [filteredTasks, currentPage])

    const stats: TaskManagementStats = useMemo(() => {
        const overdueTasks = tasks.filter(
            (task) => new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETE,
        ).length

        return {
            totalTasks: tasks.length,
            completedTasks: tasks.filter((task) => task.status === TaskStatus.COMPLETE).length,
            inProgressTasks: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length,
            overdueTasks,
        }
    }, [tasks])

    const toggleTaskSelection = useCallback((taskId: string) => {
        setSelectedTasks((prev) => {
            const next = new Set(prev)
            if (next.has(taskId)) {
                next.delete(taskId)
            } else {
                next.add(taskId)
            }
            return next
        })
    }, [])

    const toggleSelectAll = useCallback(() => {
        setSelectedTasks((prev) => {
            if (prev.size === paginatedTasks.length) {
                return new Set()
            }
            return new Set(paginatedTasks.map((task) => task.id))
        })
    }, [paginatedTasks])

    const handleAdd = useCallback(() => {
        setEditingTask(null)
        setIsFormOpen(true)
    }, [])

    const handleEdit = useCallback((task: Task) => {
        setEditingTask(task)
        setIsFormOpen(true)
    }, [])

    const handleDelete = useCallback((task: Task) => {
        setDeletingTask(task)
    }, [])

    const handleConfirmDelete = useCallback(async () => {
        if (!deletingTask) return
        await deleteTask.mutateAsync(deletingTask.id)
        setDeletingTask(null)
    }, [deleteTask, deletingTask])

    const handleSubmit = useCallback(async (values: TaskFormValues) => {
        if (editingTask) {
            await updateTask.mutateAsync({ id: editingTask.id, ...values })
        } else {
            await createTask.mutateAsync(values)
        }
        setIsFormOpen(false)
        setEditingTask(null)
    }, [createTask, updateTask, editingTask])

    const handleStatusChange = useCallback(
        async (taskId: string, status: TaskStatus) => {
            await updateTaskStatus.mutateAsync({ taskId, status })
        },
        [updateTaskStatus],
    )

    const handleViewTask = useCallback(
        (taskId: string) => {
            navigate(`/tasks/${taskId}`)
        },
        [navigate],
    )

    const state: TaskManagementState = {
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab: handleActiveTabChange,
        searchQuery,
        setSearchQuery: handleSearchChange,
        currentPage,
        setCurrentPage,
        selectedTasks,
        toggleTaskSelection,
        toggleSelectAll,
    }

    const handlers: TaskManagementHandlers = {
        handleAdd,
        handleEdit,
        handleDelete,
        handleConfirmDelete,
        handleSubmit,
        handleStatusChange,
        handleViewTask,
    }

    return {
        tasksLoading,
        clients,
        projects,
        employees,
        tasks,
        filteredTasks,
        paginatedTasks,
        totalPages,
        stats,
        isFormOpen,
        setIsFormOpen,
        editingTask,
        deletingTask,
        setDeletingTask,
        state,
        handlers,
        mutations: {
            createTask,
            updateTask,
            deleteTask,
            updateTaskStatus,
        },
    }
}

export type UseTaskManagementReturn = ReturnType<typeof useTaskManagement>
