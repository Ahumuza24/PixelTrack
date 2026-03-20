import { useProjectManagement } from '@/features/projects/hooks/useProjectManagement'
import { ProjectManagementHeader } from '@/features/projects/components/ProjectManagementHeader'
import { ProjectManagementFilters } from '@/features/projects/components/ProjectManagementFilters'
import { ProjectManagementGrid } from '@/features/projects/components/ProjectManagementGrid'
import { ProjectCreateDialog } from '@/features/projects/components/ProjectCreateDialog'
import { ProjectEditDialog } from '@/features/projects/components/ProjectEditDialog'
import { ProjectDeleteDialog } from '@/features/projects/components/ProjectDeleteDialog'

export function ProjectManagementPage() {
    const {
        projects,
        clients,
        filteredProjects,
        isLoading,
        searchQuery,
        statusFilter,
        statusOptions,
        isCreateOpen,
        editingProject,
        deletingProject,
        editingInitialValues,
        handlers,
        mutationState,
    } = useProjectManagement()

    const {
        handleSearchChange,
        handleStatusChange,
        openCreateDialog,
        closeCreateDialog,
        startEditingProject,
        closeEditDialog,
        startDeletingProject,
        closeDeleteDialog,
        handleProjectSelect,
        handleCreateProject,
        handleUpdateProject,
        handleDeleteProject,
    } = handlers

    const { isCreating, isUpdating, isDeleting } = mutationState

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ProjectManagementHeader
                totalProjects={projects.length}
                onCreate={openCreateDialog}
                isCreating={isCreating}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ProjectManagementFilters
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    statusOptions={statusOptions}
                    onSearchChange={handleSearchChange}
                    onStatusChange={handleStatusChange}
                />

                <ProjectManagementGrid
                    projects={filteredProjects}
                    isLoading={isLoading}
                    searchQuery={searchQuery}
                    statusFilter={statusFilter}
                    onCreateProject={openCreateDialog}
                    onProjectSelect={handleProjectSelect}
                    onProjectEdit={startEditingProject}
                    onProjectDelete={startDeletingProject}
                />
            </main>

            <ProjectCreateDialog
                open={isCreateOpen}
                clients={clients}
                isSubmitting={isCreating}
                onOpenChange={(open) => (open ? openCreateDialog() : closeCreateDialog())}
                onSubmit={handleCreateProject}
                onCancel={closeCreateDialog}
            />

            <ProjectEditDialog
                project={editingProject}
                clients={clients}
                initialValues={editingInitialValues}
                isSubmitting={isUpdating}
                onOpenChange={(open) => (!open ? closeEditDialog() : undefined)}
                onSubmit={handleUpdateProject}
                onCancel={closeEditDialog}
            />

            <ProjectDeleteDialog
                project={deletingProject}
                isDeleting={isDeleting}
                onOpenChange={(open) => (!open ? closeDeleteDialog() : undefined)}
                onConfirm={handleDeleteProject}
            />
        </div>
    )
}
