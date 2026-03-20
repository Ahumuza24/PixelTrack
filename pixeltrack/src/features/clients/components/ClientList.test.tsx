import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import type { ComponentProps } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientList } from './ClientList'
import { ClientStatus } from '@/types'
import type { Client } from '@/types'

// Create test wrapper with providers
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })

    return ({ children }: { children: React.ReactNode }) =>
        React.createElement(
            BrowserRouter,
            {},
            React.createElement(QueryClientProvider, { client: queryClient }, children)
        )
}

const mockClients: Client[] = [
    {
        id: 'client-1',
        name: 'Acme Design Co',
        primaryContact: 'John Doe',
        email: 'john@acme.com',
        status: ClientStatus.ACTIVE,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
    },
    {
        id: 'client-2',
        name: 'Beta Corporation',
        primaryContact: 'Jane Smith',
        email: 'jane@beta.com',
        status: ClientStatus.INACTIVE,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
    },
    {
        id: 'client-3',
        name: 'Gamma Solutions',
        primaryContact: 'Bob Wilson',
        email: 'bob@gamma.com',
        status: ClientStatus.ARCHIVED,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
    },
]

describe('ClientList', () => {
    const mockOnEdit = vi.fn()
    const mockOnDelete = vi.fn()
    const mockOnAdd = vi.fn()
    const mockOnView = vi.fn()

    const baseHandlers = {
        onEdit: mockOnEdit,
        onDelete: mockOnDelete,
        onAdd: mockOnAdd,
        onView: mockOnView,
    }

    type ClientListProps = ComponentProps<typeof ClientList>

    const renderClientList = (props?: Partial<ClientListProps>) => {
        const finalProps: ClientListProps = {
            clients: [],
            ...baseHandlers,
            ...props,
        }

        return render(React.createElement(ClientList, finalProps), { wrapper: createWrapper() })
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render client data correctly', () => {
        renderClientList({ clients: mockClients })

        expect(screen.getByText('Acme Design Co')).toBeInTheDocument()
        expect(screen.getByText('Beta Corporation')).toBeInTheDocument()
        expect(screen.getByText('john@acme.com')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should display correct status badges', () => {
        renderClientList({ clients: mockClients })

        expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Archived').length).toBeGreaterThan(0)
    })

    it('should filter clients by search query', () => {
        renderClientList({ clients: mockClients })

        const searchInput = screen.getByPlaceholderText('Search clients...')
        fireEvent.change(searchInput, { target: { value: 'acme' } })

        expect(screen.getByText('Acme Design Co')).toBeInTheDocument()
        expect(screen.queryByText('Beta Corporation')).not.toBeInTheDocument()
    })

    it('should show empty state when no clients', () => {
        renderClientList({ clients: [] })

        expect(screen.getByText('No clients yet')).toBeInTheDocument()
        expect(screen.getByText('Get started by adding your first client')).toBeInTheDocument()
    })

    it('should show loading state', () => {
        renderClientList({ clients: [], isLoading: true })

        // Loading skeletons should be present
        const skeletons = document.querySelectorAll('.animate-pulse')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should show error state', () => {
        const error = new Error('Failed to load')
        renderClientList({ clients: [], error })

        expect(screen.getByText('Failed to load clients')).toBeInTheDocument()
        expect(screen.getByText('Failed to load')).toBeInTheDocument()
    })

    it('should call onAdd when add button clicked', () => {
        renderClientList({ clients: mockClients })

        const addButton = screen.getByText('Add Client')
        fireEvent.click(addButton)

        expect(mockOnAdd).toHaveBeenCalled()
    })

    it('should filter by status', () => {
        renderClientList({ clients: mockClients })

        // Click on Active filter button (disambiguate from table labels)
        const activeFilterButton = screen.getByTestId('status-filter-active')

        fireEvent.click(activeFilterButton)

        // Should show count in badge inside the Active filter chip
        expect(activeFilterButton).toHaveTextContent(/1/)
    })
})
