import { useMemo, useState } from 'react'
import { Search, Plus, MoreHorizontal, User, Mail, Building2, Shield, UserCircle } from 'lucide-react'
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
import { UserRole, type UserProfile, type Client } from '@/types'
import { cn } from '@/lib/utils'

interface UserListProps {
    /** Array of users to display */
    users: UserProfile[]
    /** Loading state */
    isLoading?: boolean
    /** Called when user clicks edit action */
    onEdit: (user: UserProfile) => void
    /** Called when user clicks delete action */
    onDelete: (user: UserProfile) => void
    /** Called when user clicks add new user */
    onAdd: () => void
    /** Optional client data for displaying client names */
    clients?: Client[]
    /** Optional error state */
    error?: Error | null
}

/**
 * UserList - Data table displaying users with search and filtering.
 *
 * Features:
 * - Real-time search across name and email
 * - Role filter buttons with color-coded badges
 * - Shows assigned client for client-role users
 * - Responsive table with action dropdown
 * - Empty state when no users
 *
 * @example
 * ```tsx
 * <UserList
 *   users={users}
 *   clients={clients}
 *   onEdit={(user) => openEditModal(user)}
 *   onDelete={(user) => confirmDelete(user)}
 *   onAdd={() => openAddModal()}
 * />
 * ```
 */
export function UserList({
    users,
    isLoading = false,
    onEdit,
    onDelete,
    onAdd,
    clients = [],
    error = null,
}: UserListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<UserRole | null>(null)

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesRole = roleFilter ? user.role === roleFilter : true
            const matchesSearch = searchQuery
                ? user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchQuery.toLowerCase())
                : true
            return matchesRole && matchesSearch
        })
    }, [users, searchQuery, roleFilter])

    const roleConfig = {
        [UserRole.ADMIN]: {
            label: 'Admin',
            color: 'bg-purple-100 text-purple-700 border-purple-200',
            icon: Shield,
        },
        [UserRole.EMPLOYEE]: {
            label: 'Employee',
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: User,
        },
        [UserRole.CLIENT]: {
            label: 'Client',
            color: 'bg-green-100 text-green-700 border-green-200',
            icon: Building2,
        },
    }

    const roleFilters = [
        { value: null as UserRole | null, label: 'All', count: users.length },
        { value: UserRole.ADMIN, label: 'Admins', count: users.filter((u) => u.role === UserRole.ADMIN).length },
        { value: UserRole.EMPLOYEE, label: 'Employees', count: users.filter((u) => u.role === UserRole.EMPLOYEE).length },
        { value: UserRole.CLIENT, label: 'Clients', count: users.filter((u) => u.role === UserRole.CLIENT).length },
    ]

    const getClientName = (clientId?: string) => {
        if (!clientId) return null
        return clients.find((c) => c.id === clientId)?.name ?? 'Unknown Client'
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <UserCircle className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Failed to load users</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-md">{error.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Retry
                </Button>
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
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button onClick={onAdd} className="bg-cobalt hover:bg-cobalt-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Role Filter Chips */}
            <div className="flex flex-wrap gap-2">
                <Shield className="w-4 h-4 text-slate-400 mt-1.5" />
                {roleFilters.map((filter) => (
                    <button
                        key={filter.label}
                        onClick={() => setRoleFilter(filter.value)}
                        className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                            roleFilter === filter.value
                                ? 'bg-cobalt text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                        {filter.label}
                        <span
                            className={cn(
                                'text-xs px-1.5 py-0.5 rounded-full',
                                roleFilter === filter.value ? 'bg-white/20' : 'bg-white'
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
                            <TableHead className="w-[50px]">Avatar</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Assigned Client</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            // Loading skeleton rows
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="animate-pulse">
                                    <TableCell>
                                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-slate-200 rounded w-32" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-slate-200 rounded w-40" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-6 bg-slate-200 rounded w-20" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 bg-slate-200 rounded w-28" />
                                    </TableCell>
                                    <TableCell />
                                </TableRow>
                            ))
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <UserCircle className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">
                                            {searchQuery || roleFilter
                                                ? 'No users match your filters'
                                                : 'No users yet'}
                                        </p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {searchQuery || roleFilter
                                                ? 'Try adjusting your search or filters'
                                                : 'Get started by adding your first user'}
                                        </p>
                                        {!searchQuery && !roleFilter && (
                                            <Button onClick={onAdd} variant="outline" className="mt-4">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add User
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => {
                                const RoleIcon = roleConfig[user.role].icon
                                return (
                                    <TableRow key={user.uid} className="group">
                                        <TableCell>
                                            <div className="w-10 h-10 bg-cobalt/10 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-semibold text-cobalt">
                                                    {user.displayName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{user.displayName}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="w-3.5 h-3.5" />
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'flex items-center gap-1.5 w-fit',
                                                    roleConfig[user.role].color
                                                )}
                                            >
                                                <RoleIcon className="w-3 h-3" />
                                                {roleConfig[user.role].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.clientId ? (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Building2 className="w-3.5 h-3.5" />
                                                    {getClientName(user.clientId)}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">—</span>
                                            )}
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
                                                    <DropdownMenuItem onClick={() => onEdit(user)}>
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(user)}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer summary */}
            {!isLoading && filteredUsers.length > 0 && (
                <div className="flex justify-between items-center text-sm text-slate-500 px-1">
                    <span>
                        Showing {filteredUsers.length} of {users.length} users
                    </span>
                    {(searchQuery || roleFilter) && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setRoleFilter(null)
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
