import { Users } from 'lucide-react'
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
import { UserList, UserForm } from '@/features/users'
import { useUserManagement } from '@/features/users/hooks/useUserManagement'
import { UserManagementHeader } from '@/features/users/components/UserManagementHeader'

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
    const {
        users,
        clients,
        isLoading,
        error,
        stats,
        dialogState,
        handlers,
        mutationState,
        refetch,
    } = useUserManagement()

    const {
        isFormOpen,
        editingUser,
        deletingUser,
        resettingUser,
        resetPassword,
    } = dialogState

    const {
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
    } = handlers

    const { isCreating, isUpdating, isDeleting, isResetting } = mutationState

    return (
        <div className="min-h-screen bg-slate-50">
            <UserManagementHeader totalUsers={stats.totalUsers} onCreate={openCreateDialog} isCreating={isCreating} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <UserList
                        users={users ?? []}
                        clients={clients}
                        isLoading={isLoading}
                        error={error}
                        onRetry={refetch}
                        onEdit={openEditDialog}
                        onDelete={requestDeleteUser}
                        onAdd={openCreateDialog}
                        onResetPassword={openResetPasswordDialog}
                    />
                </div>
            </main>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={(open) => (open ? openCreateDialog() : closeFormDialog())}>
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
                        onSubmit={submitUserForm}
                        onCancel={closeFormDialog}
                        isSubmitting={isCreating || isUpdating}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingUser} onOpenChange={(open) => (!open ? cancelDeleteUser() : undefined)}>
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
                        <AlertDialogCancel onClick={cancelDeleteUser}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Password Dialog */}
            <Dialog open={!!resettingUser} onOpenChange={(open) => (!open ? closeResetPasswordDialog() : undefined)}>
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
                                value={resetPassword}
                                onChange={(e) => setResetPasswordValue(e.target.value)}
                                placeholder="Enter new password (min 8 characters)"
                                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cobalt/50"
                                minLength={8}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={closeResetPasswordDialog} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={submitResetPassword}
                            disabled={isResetting || resetPassword.length < 8}
                            className="flex-1 bg-cobalt hover:bg-cobalt-600"
                        >
                            {isResetting ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
