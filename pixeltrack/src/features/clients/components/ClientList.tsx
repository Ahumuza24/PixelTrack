import { useState, useMemo } from 'react'
import { Search, Plus, MoreHorizontal, Building2, Mail, User, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ClientStatus, type Client } from '@/types'
import { cn } from '@/lib/utils'

interface ClientListProps {
    /** Array of clients to display */
    clients: Client[]
    /** Loading state */
    isLoading?: boolean
    /** Called when user clicks edit action */
    onEdit: (client: Client) => void
    /** Called when user clicks delete action */
    onDelete: (client: Client) => void
    /** Called when user clicks add new client */
    onAdd: () => void
    /** Optional error state */
    error?: Error | null
    /** Optional retry handler */
    onRetry?: () => void
}

/**
 * ClientList - Data table displaying client companies with search and filtering.
 *
 * Features:
 * - Real-time search across name, contact, and email
 * - Status filter buttons
 * - Responsive table with status badges
 * - Action dropdown for edit/delete
 * - Empty state when no clients
 *
 * @example
 * ```tsx
 * <ClientList
 *   clients={clients}
 *   onEdit={(client) => openEditModal(client)}
 *   onDelete={(client) => confirmDelete(client)}
 *   onAdd={() => openAddModal()}
 * />
 * ```
 */
export function ClientList({
    clients,
    isLoading = false,
    onEdit,
    onDelete,
    onAdd,
    error = null,
    onRetry,
}: ClientListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ClientStatus | null>(null)

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            const matchesStatus = statusFilter ? client.status === statusFilter : true
            const matchesSearch = searchQuery
                ? client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  client.primaryContact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  client.email.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            return matchesStatus && matchesSearch
        })
    }, [clients, searchQuery, statusFilter])

    const statusConfig = {
        [ClientStatus.ACTIVE]: { label: 'Active', variant: 'default' as const },
        [ClientStatus.INACTIVE]: { label: 'Inactive', variant: 'secondary' as const },
        [ClientStatus.ARCHIVED]: { label: 'Archived', variant: 'outline' as const },
    }

    const statusFilters = [
        { value: null as ClientStatus | null, label: 'All', count: clients.length },
        { value: ClientStatus.ACTIVE, label: 'Active', count: clients.filter((c) => c.status === ClientStatus.ACTIVE).length },
        { value: ClientStatus.INACTIVE, label: 'Inactive', count: clients.filter((c) => c.status === ClientStatus.INACTIVE).length },
        { value: ClientStatus.ARCHIVED, label: 'Archived', count: clients.filter((c) => c.status === ClientStatus.ARCHIVED).length },
    ]

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Failed to load clients</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">{error.message}</p>
                {onRetry && (
                    <Button variant="outline" className="mt-4" onClick={onRetry}>
                        Retry
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with Search and Add */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search clients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={onAdd} className="bg-cobalt hover:bg-cobalt-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap gap-2">
                <Filter className="w-4 h-4 text-slate-400 mt-1.5" />
                {statusFilters.map((filter) => (
                    <button
                        key={filter.label}
                        onClick={() => setStatusFilter(filter.value)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                            statusFilter === filter.value
                                ? 'bg-cobalt text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                        {filter.label}
                        <span
                            className={cn(
                                'text-xs px-1.5 py-0.5 rounded-full',
                                statusFilter === filter.value ? 'bg-white/20' : 'bg-white'
                            )}
                        >
                            {filter.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div className="border rounded-xl overflow-hidden bg-white">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[50px]">Logo</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Primary Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Loading skeleton rows
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell>
                                        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-slate-200 rounded w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-slate-200 rounded w-24" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-slate-200 rounded w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-6 bg-slate-200 rounded w-20" />
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            ))
                        ) : filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Building2 className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">
                                            {searchQuery || statusFilter
                                                ? 'No clients match your filters'
                                                : 'No clients yet'}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {searchQuery || statusFilter
                                                ? 'Try adjusting your search or filters'
                                                : 'Get started by adding your first client'}
                                        </p>
                                        {!searchQuery && !statusFilter && (
                                            <Button onClick={onAdd} variant="outline" className="mt-4">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Client
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow key={client.id} className="group">
                                    <TableCell>
                                        {client.logoUrl ? (
                                            <img
                                                src={client.logoUrl}
                                                alt={`${client.name} logo`}
                                                className="w-10 h-10 object-contain rounded-lg border border-slate-100"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-slate-400" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{client.name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <User className="w-3.5 h-3.5" />
                                            {client.primaryContact}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail className="w-3.5 h-3.5" />
                                            {client.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={statusConfig[client.status].variant}
                                            className={cn(
                                                client.status === ClientStatus.ACTIVE && 'bg-green-100 text-green-700 hover:bg-green-100',
                                                client.status === ClientStatus.INACTIVE && 'bg-slate-100 text-slate-700 hover:bg-slate-100',
                                                client.status === ClientStatus.ARCHIVED && 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                                            )}
                                        >
                                            {statusConfig[client.status].label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(client)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(client)}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer summary */}
            {!isLoading && filteredClients.length > 0 && (
                <div className="flex justify-between items-center text-sm text-slate-500 px-1">
                    <span>
                        Showing {filteredClients.length} of {clients.length} clients
                    </span>
                    {(searchQuery || statusFilter) && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setStatusFilter(null)
                            }}
                            className="text-cobalt hover:underline"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
