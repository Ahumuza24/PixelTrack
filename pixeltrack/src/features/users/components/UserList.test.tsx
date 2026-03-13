import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserList } from './UserList'
import { UserRole } from '@/types'
import type { UserProfile, Client } from '@/types'

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(
            BrowserRouter,
            {},
            React.createElement(QueryClientProvider, { client: queryClient }, children)
        )
}

const mockUsers: UserProfile[] = [
    {
        uid: 'user-1',
        displayName: 'John Admin',
        email: 'john@example.com',
        role: UserRole.ADMIN,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        uid: 'user-2',
        displayName: 'Jane Employee',
        email: 'jane@example.com',
        role: UserRole.EMPLOYEE,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
    {
        uid: 'user-3',
        displayName: 'Bob Client',
        email: 'bob@client.com',
        role: UserRole.CLIENT,
        clientId: 'client-1',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
    },
]

const mockClients: Client[] = [
    {
        id: 'client-1',
        name: 'Acme Co',
        primaryContact: 'Bob Client',
        email: 'bob@client.com',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
]

describe('UserList', () => {
    const mockOnEdit = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnAdd = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders user data correctly', () => {
        render(
            React.createElement(UserList, {
                users: mockUsers,
                clients: mockClients,
                onEdit: mockOnEdit,
                onDelete: mockOnDelete,
                onAdd: mockOnAdd,
            }),
            { wrapper: createWrapper() }
        )

        expect(screen.getByText('John Admin')).toBeInTheDocument()
        expect(screen.getByText('jane@example.com')).toBeInTheDocument()
        expect(screen.getByText('Acme Co')).toBeInTheDocument()
    })

    it('displays correct role badges', () => {
        render(
            React.createElement(UserList, {
                users: mockUsers,
                clients: mockClients,
                onEdit: mockOnEdit,
                onDelete: mockOnDelete,
                onAdd: mockOnAdd,
            }),
            { wrapper: createWrapper() }
        )

        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.getByText('Employee')).toBeInTheDocument()
        expect(screen.getByText('Client')).toBeInTheDocument()
    })

    it('filters users by search query', () => {
        render(
            React.createElement(UserList, {
                users: mockUsers,
                clients: mockClients,
                onEdit: mockOnEdit,
                onDelete: mockOnDelete,
                onAdd: mockOnAdd,
            }),
            { wrapper: createWrapper() }
        )

        const searchInput = screen.getByPlaceholderText('Search users...')
        fireEvent.change(searchInput, { target: { value: 'john' } })

        expect(screen.getByText('John Admin')).toBeInTheDocument()
        expect(screen.queryByText('Jane Employee')).not.toBeInTheDocument()
    })

    it('shows empty state when no users', () => {
        render(
            React.createElement(UserList, {
                users: [],
                clients: mockClients,
                onEdit: mockOnEdit,
                onDelete: mockOnDelete,
                onAdd: mockOnAdd,
            }),
            { wrapper: createWrapper() }
        )

        expect(screen.getByText('No users yet')).toBeInTheDocument()
    })

    it('shows loading state', () => {
        render(
            React.createElement(UserList, {
                users: [],
                clients: mockClients,
                isLoading: true,
                onEdit: mockOnEdit,
                onDelete: mockOnDelete,
                onAdd: mockOnAdd,
            }),
            { wrapper: createWrapper() }
        )

        const skeletons = document.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('calls onAdd when add button clicked', () => {
        render(
            React.createElement(UserList, {
                users: mockUsers,
                clients: mockClients,
                onEdit: mockOnEdit,
                onDelete: mockOnDelete,
                onAdd: mockOnAdd,
            }),
            { wrapper: createWrapper() }
        )

        const addButton = screen.getByText('Add User')
        fireEvent.click(addButton)

        expect(mockOnAdd).toHaveBeenCalled()
    })
})
