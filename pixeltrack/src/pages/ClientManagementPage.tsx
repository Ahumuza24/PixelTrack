import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import {
    ClientList,
    ClientForm,
    ClientManagementHeader,
    useClientManagement,
} from '@/features/clients'

/**
 * ClientManagementPage - Admin page for managing client companies.
 *
 * Features:
 * - List all clients with search and filter
 * - Add new clients via dialog form
 * - Edit existing clients inline
 * - Delete clients with confirmation
 * - Logo upload to Supabase Storage
 *
 * Route: /admin/clients
 * Access: Admin only (protected by RoleGuard)
 */
export function ClientManagementPage() {
    const {
        clients,
        isLoading,
        error,
        stats,
        dialogState,
        handlers,
        mutationState,
        refetch,
    } = useClientManagement()

    const { isFormOpen, editingClient, deletingClient } = dialogState
    const {
        openCreateDialog,
        openEditDialog,
        closeFormDialog,
        submitClientForm,
        requestDeleteClient,
        cancelDeleteClient,
        confirmDeleteClient,
        handleViewClient,
    } = handlers
    const { isCreating, isUpdating, isDeleting } = mutationState

    return (
        <div className="min-h-screen bg-slate-50">
            <ClientManagementHeader
                totalClients={stats.totalClients}
                activeClients={stats.activeClients}
                onCreate={openCreateDialog}
                isCreating={isCreating}
            />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <ClientList
                        clients={clients}
                        isLoading={isLoading}
                        error={error}
                        onRetry={refetch}
                        onEdit={openEditDialog}
                        onDelete={requestDeleteClient}
                        onView={handleViewClient}
                        onAdd={openCreateDialog}
                    />
                </div>
            </main>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={(open) => (open ? openCreateDialog() : closeFormDialog())}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingClient ? 'Edit Client' : 'Add New Client'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingClient
                                ? 'Update the client company information below.'
                                : 'Enter the details for the new client company.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ClientForm
                        client={editingClient ?? undefined}
                        onSubmit={submitClientForm}
                        onCancel={closeFormDialog}
                        isSubmitting={isCreating || isUpdating}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingClient} onOpenChange={(open) => (!open ? cancelDeleteClient() : undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingClient?.name}</strong>?
                            This action cannot be undone. All associated tasks and files will remain
                            but may become orphaned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDeleteClient}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteClient}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
