import { useCallback, useMemo, useState } from 'react'
import type { UserProfile, Client } from '@/types'
import { useClients } from '@/features/clients'
import {
    useUsers,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    useResetPassword,
} from '@/features/users'
import type { UserFormValues } from '@/features/users/schemas/userSchema'

interface UseUserManagementResult {
    users: UserProfile[]
    clients: Client[]
    isLoading: boolean
    error: Error | null
    stats: {
        totalUsers: number
    }
    dialogState: {
        isFormOpen: boolean
        editingUser: UserProfile | null
        deletingUser: UserProfile | null
        resettingUser: UserProfile | null
        resetPassword: string
    }
    handlers: {
        openCreateDialog: () => void
        openEditDialog: (user: UserProfile) => void
        closeFormDialog: () => void
        requestDeleteUser: (user: UserProfile) => void
        cancelDeleteUser: () => void
        confirmDeleteUser: () => Promise<void>
        openResetPasswordDialog: (user: UserProfile) => void
        closeResetPasswordDialog: () => void
        setResetPasswordValue: (value: string) => void
        submitResetPassword: () => Promise<void>
        submitUserForm: (values: UserFormValues) => Promise<void>
    }
    mutationState: {
        isCreating: boolean
        isUpdating: boolean
        isDeleting: boolean
        isResetting: boolean
    }
    refetch: () => void
}

export function useUserManagement(): UseUserManagementResult {
    const { data: users = [], isLoading, error, refetch } = useUsers()
    const { data: clients = [] } = useClients()
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()
    const resetPassword = useResetPassword()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
    const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null)
    const [resettingUser, setResettingUser] = useState<UserProfile | null>(null)
    const [resetPasswordValue, setResetPasswordValue] = useState('')

    const openCreateDialog = useCallback(() => {
        setEditingUser(null)
        setIsFormOpen(true)
    }, [])

    const openEditDialog = useCallback((user: UserProfile) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }, [])

    const closeFormDialog = useCallback(() => {
        setIsFormOpen(false)
        setEditingUser(null)
    }, [])

    const requestDeleteUser = useCallback((user: UserProfile) => {
        setDeletingUser(user)
    }, [])

    const cancelDeleteUser = useCallback(() => {
        setDeletingUser(null)
    }, [])

    const confirmDeleteUser = useCallback(async () => {
        if (!deletingUser) return
        await deleteUser.mutateAsync(deletingUser.uid)
        setDeletingUser(null)
    }, [deleteUser, deletingUser])

    const openResetPasswordDialog = useCallback((user: UserProfile) => {
        setResettingUser(user)
        setResetPasswordValue('')
    }, [])

    const closeResetPasswordDialog = useCallback(() => {
        setResettingUser(null)
        setResetPasswordValue('')
    }, [])

    const submitResetPassword = useCallback(async () => {
        if (!resettingUser || resetPasswordValue.length < 8) return
        await resetPassword.mutateAsync({ uid: resettingUser.uid, newPassword: resetPasswordValue })
        closeResetPasswordDialog()
    }, [resetPassword, resettingUser, resetPasswordValue, closeResetPasswordDialog])

    const submitUserForm = useCallback(
        async (data: UserFormValues) => {
            if (editingUser) {
                await updateUser.mutateAsync({
                    uid: editingUser.uid,
                    displayName: data.displayName,
                    role: data.role,
                    clientId: data.clientId,
                })
            } else {
                if (!data.password) {
                    throw new Error('Password is required for new users')
                }
                await createUser.mutateAsync({
                    email: data.email,
                    password: data.password,
                    displayName: data.displayName,
                    role: data.role,
                    clientId: data.clientId,
                })
            }
            closeFormDialog()
        },
        [closeFormDialog, createUser, editingUser, updateUser],
    )

    const stats = useMemo(() => ({ totalUsers: users.length }), [users.length])

    return {
        users,
        clients,
        isLoading,
        error,
        stats,
        dialogState: {
            isFormOpen,
            editingUser,
            deletingUser,
            resettingUser,
            resetPassword: resetPasswordValue,
        },
        handlers: {
            openCreateDialog,
            openEditDialog,
            closeFormDialog,
            requestDeleteUser,
            cancelDeleteUser,
            confirmDeleteUser,
            openResetPasswordDialog,
            closeResetPasswordDialog,
            setResetPasswordValue,
            submitResetPassword,
            submitUserForm,
        },
        mutationState: {
            isCreating: createUser.isPending,
            isUpdating: updateUser.isPending,
            isDeleting: deleteUser.isPending,
            isResetting: resetPassword.isPending,
        },
        refetch,
    }
}
