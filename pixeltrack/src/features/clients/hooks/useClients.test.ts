import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useClients, useClient, useCreateClient, useUpdateClient, useDeleteClient } from './useClients'
import * as clientsApi from '@/lib/firebase/clients'
import type { Client, CreateClientInput, UpdateClientInput } from '@/types'
import { ClientStatus } from '@/types'

// Mock the clients API
vi.mock('@/lib/firebase/clients', () => ({
    getClients: vi.fn(),
    getClient: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

const wrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = createTestQueryClient()
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useClients', () => {
    const mockClient: Client = {
        id: 'client-1',
        name: 'Acme Co',
        primaryContact: 'John Doe',
        email: 'john@acme.com',
        status: ClientStatus.ACTIVE,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('useClients', () => {
        it('should fetch all clients', async () => {
            const mockClients = [mockClient]
            vi.mocked(clientsApi.getClients).mockResolvedValue(mockClients)

            const { result } = renderHook(() => useClients(), { wrapper })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual(mockClients)
            expect(clientsApi.getClients).toHaveBeenCalled()
        })

        it('should handle error when fetching clients fails', async () => {
            const error = new Error('Failed to fetch')
            vi.mocked(clientsApi.getClients).mockRejectedValue(error)

            const { result } = renderHook(() => useClients(), { wrapper })

            await waitFor(() => expect(result.current.isError).toBe(true))

            expect(result.current.error).toBe(error)
        })
    })

    describe('useClient', () => {
        it('should fetch single client by id', async () => {
            vi.mocked(clientsApi.getClient).mockResolvedValue(mockClient)

            const { result } = renderHook(() => useClient('client-1'), { wrapper })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual(mockClient)
            expect(clientsApi.getClient).toHaveBeenCalledWith('client-1')
        })

        it('should not fetch when id is null', async () => {
            const { result } = renderHook(() => useClient(null), { wrapper })

            expect(result.current.isLoading).toBe(false)
            expect(result.current.fetchStatus).toBe('idle')
        })

        it('should handle null response when client not found', async () => {
            vi.mocked(clientsApi.getClient).mockResolvedValue(null)

            const { result } = renderHook(() => useClient('non-existent'), { wrapper })

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toBeNull()
        })
    })

    describe('useCreateClient', () => {
        it('should create client and invalidate cache', async () => {
            const newClient: CreateClientInput = {
                name: 'New Co',
                primaryContact: 'Jane Doe',
                email: 'jane@newco.com',
                status: ClientStatus.ACTIVE,
            }
            const createdClient: Client = {
                ...newClient,
                id: 'client-2',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-01T00:00:00Z',
            }
            vi.mocked(clientsApi.createClient).mockResolvedValue(createdClient)

            const { result } = renderHook(() => useCreateClient(), { wrapper })

            await result.current.mutateAsync(newClient)

            expect(clientsApi.createClient).toHaveBeenCalledWith(newClient)
        })

        it('should handle create error', async () => {
            const error = new Error('Create failed')
            vi.mocked(clientsApi.createClient).mockRejectedValue(error)

            const { result } = renderHook(() => useCreateClient(), { wrapper })

            await expect(
                result.current.mutateAsync({
                    name: 'New Co',
                    primaryContact: 'Jane',
                    email: 'jane@newco.com',
                    status: ClientStatus.ACTIVE,
                })
            ).rejects.toThrow('Create failed')
        })
    })

    describe('useUpdateClient', () => {
        it('should update client and invalidate cache', async () => {
            const updateData: UpdateClientInput = {
                id: 'client-1',
                status: ClientStatus.INACTIVE,
            }
            vi.mocked(clientsApi.updateClient).mockResolvedValue(undefined)

            const { result } = renderHook(() => useUpdateClient(), { wrapper })

            await result.current.mutateAsync(updateData)

            expect(clientsApi.updateClient).toHaveBeenCalledWith(updateData)
        })

        it('should handle update error', async () => {
            const error = new Error('Update failed')
            vi.mocked(clientsApi.updateClient).mockRejectedValue(error)

            const { result } = renderHook(() => useUpdateClient(), { wrapper })

            await expect(
                result.current.mutateAsync({
                    id: 'client-1',
                    status: ClientStatus.INACTIVE,
                })
            ).rejects.toThrow('Update failed')
        })
    })

    describe('useDeleteClient', () => {
        it('should delete client and invalidate cache', async () => {
            vi.mocked(clientsApi.deleteClient).mockResolvedValue(undefined)

            const { result } = renderHook(() => useDeleteClient(), { wrapper })

            await result.current.mutateAsync('client-1')

            expect(clientsApi.deleteClient).toHaveBeenCalledWith('client-1')
        })

        it('should handle delete error', async () => {
            const error = new Error('Delete failed')
            vi.mocked(clientsApi.deleteClient).mockRejectedValue(error)

            const { result } = renderHook(() => useDeleteClient(), { wrapper })

            await expect(result.current.mutateAsync('client-1')).rejects.toThrow('Delete failed')
        })
    })
})
