import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
} from '@/lib/supabase/clients'
import type { CreateClientInput, UpdateClientInput, ClientFilters } from '@/types'

const CLIENTS_QUERY_KEY = 'clients'

/**
 * Hook to fetch all clients with optional filtering.
 * Cached for 5 minutes (staleTime).
 *
 * @example
 * ```ts
 * const { data: clients, isLoading } = useClients()
 * const { data: activeClients } = useClients({ status: ClientStatus.ACTIVE })
 * ```
 */
export function useClients(filters?: ClientFilters) {
    return useQuery({
        queryKey: [CLIENTS_QUERY_KEY, filters],
        queryFn: () => getClients(filters),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook to fetch a single client by ID.
 *
 * @example
 * ```ts
 * const { data: client } = useClient('client-123')
 * ```
 */
export function useClient(clientId: string | null) {
    return useQuery({
        queryKey: [CLIENTS_QUERY_KEY, clientId],
        queryFn: () => (clientId ? getClient(clientId) : null),
        enabled: !!clientId,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Hook to create a new client.
 * Invalidates clients cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: create } = useCreateClient()
 * const newClient = await create({
 *   name: 'Acme Co',
 *   primaryContact: 'John Doe',
 *   email: 'john@acme.com',
 *   status: ClientStatus.ACTIVE,
 * })
 * ```
 */
export function useCreateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateClientInput) => createClient(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
            toast.success('Client created successfully')
        },
        onError: (error) => {
            toast.error(`Failed to create client: ${error.message}`)
        },
    })
}

/**
 * Hook to update an existing client.
 * Invalidates clients cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: update } = useUpdateClient()
 * await update({
 *   id: 'client-123',
 *   status: ClientStatus.INACTIVE,
 * })
 * ```
 */
export function useUpdateClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateClientInput) => updateClient(data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
            queryClient.invalidateQueries({
                queryKey: [CLIENTS_QUERY_KEY, variables.id],
            })
            toast.success('Client updated successfully')
        },
        onError: (error) => {
            toast.error(`Failed to update client: ${error.message}`)
        },
    })
}

/**
 * Hook to delete a client.
 * Invalidates clients cache on success.
 *
 * @example
 * ```ts
 * const { mutateAsync: remove } = useDeleteClient()
 * await remove('client-123')
 * ```
 */
export function useDeleteClient() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (clientId: string) => deleteClient(clientId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] })
            toast.success('Client deleted successfully')
        },
        onError: (error) => {
            toast.error(`Failed to delete client: ${error.message}`)
        },
    })
}
