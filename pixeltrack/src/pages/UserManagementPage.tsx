import { useState } from 'react'
import { Users, UserPlus, Shield } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { UserList, UserForm, useUsers, useCreateUser, useUpdateUser, useDeleteUser, useResetPassword } from '@/features/users'
import { useClients } from '@/features/clients'
import type { UserProfile } from '@/types'
import type { UserFormValues } from '@/features/users/schemas/userSchema'

/**
 * UserManagementPage - Admin page for managing user accounts.
 *
 * Features:
 * - List all users with search and role filtering
 * - Add new users via dialog form
 * - Edit existing users (role, client assignment)
 * - Delete users with confirmation
 * - Assign clients to client-role users
 *
 * Route: /admin/users
 * Access: Admin only (protected by RoleGuard)
 */
export function UserManagementPage() {
    const { data: users, isLoading, error, refetch } = useUsers()
    const { data: clients } = useClients()
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()
    const deleteUser = useDeleteUser()
    const resetPassword = useResetPassword()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
    const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null)
    const [resettingUser, setResettingUser] = useState<UserProfile | null>(null)
    const [newPassword, setNewPassword] = useState('')

    const handleAdd = () => {
        setEditingUser(null)
        setIsFormOpen(true)
    }

    const handleEdit = (user: UserProfile) => {
        setEditingUser(user)
        setIsFormOpen(true)
    }

    const handleDelete = (user: UserProfile) => {
        setDeletingUser(user)
    }

    const handleFormSubmit = async (data: UserFormValues) => {
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
        setIsFormOpen(false)
        setEditingUser(null)
    }

    const handleConfirmDelete = async () => {
        if (deletingUser) {
            await deleteUser.mutateAsync(deletingUser.uid)
            setDeletingUser(null)
        }
    }

    const handleResetPassword = async () => {
        if (resettingUser && newPassword) {
            await resetPassword.mutateAsync({ uid: resettingUser.uid, newPassword })
            setResettingUser(null)
            setNewPassword('')
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Page Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-cobalt rounded-xl flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">User Management</h1>
                                <p className="text-sm text-slate-500">
                                    {users?.length ?? 0} accounts
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleAdd}
                            className="bg-cobalt hover:bg-cobalt-600"
                            disabled={createUser.isPending}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <UserList
                        users={users ?? []}
                        clients={clients}
                        isLoading={isLoading}
                        error={error}
                        onRetry={refetch}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={handleAdd}
                        onResetPassword={setResettingUser}
                    />
                </div>
            </main>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-cobalt" />
                            {editingUser ? 'Edit User' : 'Add New User'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser
                                ? 'Update the user account information below.'
                                : 'Enter the details for the new user account.'}
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        user={editingUser ?? undefined}
                        clients={clients}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        isSubmitting={createUser.isPending || updateUser.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{' '}
                            <strong>{deletingUser?.displayName}</strong>?
                            This action cannot be undone and will permanently remove their account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteUser.isPending}
                        >
                            {deleteUser.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Password Dialog */}
            <Dialog open={!!resettingUser} onOpenChange={() => { setResettingUser(null); setNewPassword('') }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            Enter a new password for <strong>{resettingUser?.displayName}</strong>.
                            The user will need to use this password on their next login.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password (min 8 characters)"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt/50"
                                minLength={8}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => { setResettingUser(null); setNewPassword('') }}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleResetPassword}
                            disabled={resetPassword.isPending || newPassword.length < 8}
                            className="flex-1 bg-cobalt hover:bg-cobalt-600"
                        >
                            {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
