import { useState } from 'react'
import { Building2, Users } from 'lucide-react'
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
import { ClientList, ClientForm, useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/features/clients'
import type { Client } from '@/types'
import type { ClientFormValues } from '@/features/clients/schemas/clientSchema'

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
    const { data: clients, isLoading, error } = useClients()
    const createClient = useCreateClient()
    const updateClient = useUpdateClient()
    const deleteClient = useDeleteClient()

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingClient, setEditingClient] = useState<Client | null>(null)
    const [deletingClient, setDeletingClient] = useState<Client | null>(null)

    const handleAdd = () => {
        setEditingClient(null)
        setIsFormOpen(true)
    }

    const handleEdit = (client: Client) => {
        setEditingClient(client)
        setIsFormOpen(true)
    }

    const handleDelete = (client: Client) => {
        setDeletingClient(client)
    }

    const handleFormSubmit = async (data: ClientFormValues) => {
        if (editingClient) {
            await updateClient.mutateAsync({
                id: editingClient.id,
                ...data,
            })
        } else {
            await createClient.mutateAsync(data)
        }
        setIsFormOpen(false)
        setEditingClient(null)
    }

    const handleConfirmDelete = async () => {
        if (deletingClient) {
            await deleteClient.mutateAsync(deletingClient.id)
            setDeletingClient(null)
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
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Client Management</h1>
                                <p className="text-sm text-slate-500">
                                    {clients?.length ?? 0} companies
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleAdd}
                            className="bg-cobalt hover:bg-cobalt-600"
                            disabled={createClient.isPending}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Add Client
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <ClientList
                        clients={clients ?? []}
                        isLoading={isLoading}
                        error={error}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onAdd={handleAdd}
                    />
                </div>
            </main>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-cobalt" />
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
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        isSubmitting={createClient.isPending || updateClient.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingClient} onOpenChange={() => setDeletingClient(null)}>
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
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={deleteClient.isPending}
                        >
                            {deleteClient.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
