import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    useClients,
    useCreateClient,
    useUpdateClient,
    useDeleteClient,
} from './useClients'
import type { Client } from '@/types'
import type { ClientFormValues } from '@/features/clients/schemas/clientSchema'
import { ROUTES } from '@/lib/constants'

interface UseClientManagementResult {
    clients: Client[]
    isLoading: boolean
    error: Error | null
    stats: {
        totalClients: number
        activeClients: number
    }
    dialogState: {
        isFormOpen: boolean
        editingClient: Client | null
        deletingClient: Client | null
    }
    handlers: {
        openCreateDialog: () => void
        openEditDialog: (client: Client) => void
        closeFormDialog: () => void
        submitClientForm: (values: ClientFormValues) => Promise<void>
        requestDeleteClient: (client: Client) => void
        cancelDeleteClient: () => void
        confirmDeleteClient: () => Promise<void>
        handleViewClient: (client: Client) => void
    }
    mutationState: {
        isCreating: boolean
        isUpdating: boolean
        isDeleting: boolean
    }
    refetch: () => void
}

export function useClientManagement(): UseClientManagementResult {
    const navigate = useNavigate()
    const { data: clients = [], isLoading, error, refetch } = useClients()
    const createClient = useCreateClient()
    const updateClient = useUpdateClient()
    const deleteClient = useDeleteClient()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [deletingClient, setDeletingClient] = useState<Client | null>(null)

    const openCreateDialog = useCallback(() => {
        setEditingClient(null)
        setIsFormOpen(true)
    }, [])

    const openEditDialog = useCallback((client: Client) => {
        setEditingClient(client)
        setIsFormOpen(true)
    }, [])

    const closeFormDialog = useCallback(() => {
        setIsFormOpen(false)
        setEditingClient(null)
    }, [])

    const submitClientForm = useCallback(
        async (values: ClientFormValues) => {
            if (editingClient) {
                await updateClient.mutateAsync({
                    id: editingClient.id,
                    ...values,
                })
            } else {
                await createClient.mutateAsync(values)
            }
            closeFormDialog()
        },
        [closeFormDialog, createClient, editingClient, updateClient],
    )

    const requestDeleteClient = useCallback((client: Client) => {
        setDeletingClient(client)
    }, [])

    const cancelDeleteClient = useCallback(() => {
        setDeletingClient(null)
    }, [])

    const confirmDeleteClient = useCallback(async () => {
        if (!deletingClient) return
        await deleteClient.mutateAsync(deletingClient.id)
        setDeletingClient(null)
    }, [deleteClient, deletingClient])

    const handleViewClient = useCallback(
        (client: Client) => {
            navigate(ROUTES.ADMIN_CLIENT_DETAIL.replace(':clientId', client.id))
        },
        [navigate],
    )

    const stats = useMemo(
        () => ({
            totalClients: clients.length,
            activeClients: clients.filter((client) => client.status === 'active').length,
        }),
        [clients],
    )

    return {
        clients,
        isLoading,
        error: error ?? null,
        stats,
        dialogState: {
            isFormOpen,
            editingClient,
            deletingClient,
        },
        handlers: {
            openCreateDialog,
            openEditDialog,
            closeFormDialog,
            submitClientForm,
            requestDeleteClient,
            cancelDeleteClient,
            confirmDeleteClient,
            handleViewClient,
        },
        mutationState: {
            isCreating: createClient.isPending,
            isUpdating: updateClient.isPending,
            isDeleting: deleteClient.isPending,
        },
        refetch,
    }
}
