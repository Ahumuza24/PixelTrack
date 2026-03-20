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
import { TaskForm } from '@/features/tasks/components/TaskForm'
import { TaskManagementHeader } from '@/features/tasks/components/TaskManagementHeader'
import { TaskManagementStatsGrid } from '@/features/tasks/components/TaskManagementStatsGrid'
import { TaskManagementFilters } from '@/features/tasks/components/TaskManagementFilters'
import { TaskListView } from '@/features/tasks/components/TaskListView'
import { KanbanBoard } from '@/features/tasks/components/KanbanBoard'
import { TaskPaginationControls } from '@/features/tasks/components/TaskPaginationControls'
import { useTaskManagement } from '@/features/tasks/hooks/useTaskManagement'

export function TaskManagementPage() {
    const {
        tasksLoading,
        clients,
        projects,
        employees,
        tasks,
        paginatedTasks,
        totalPages,
        stats,
        isFormOpen,
        setIsFormOpen,
        editingTask,
        deletingTask,
        setDeletingTask,
        state,
        handlers,
        mutations,
    } = useTaskManagement()

    const allSelected = state.selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground">
            <TaskManagementHeader
                searchQuery={state.searchQuery}
                onSearchChange={state.setSearchQuery}
                overdueCount={stats.overdueTasks}
                onAddTask={handlers.handleAdd}
            />

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <TaskManagementStatsGrid stats={stats} />
                <TaskManagementFilters
                    activeTab={state.activeTab}
                    onTabChange={state.setActiveTab}
                    viewMode={state.viewMode}
                    onViewModeChange={state.setViewMode}
                />

                {tasksLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : state.viewMode === 'list' ? (
                    <>
                        <TaskListView
                            tasks={paginatedTasks}
                            clients={clients}
                            employees={employees}
                            selectedTasks={state.selectedTasks}
                            allSelected={allSelected}
                            onToggleTask={state.toggleTaskSelection}
                            onToggleAll={state.toggleSelectAll}
                            onStatusChange={handlers.handleStatusChange}
                            onViewTask={handlers.handleViewTask}
                            onEditTask={handlers.handleEdit}
                            onDeleteTask={handlers.handleDelete}
                            isStatusUpdating={mutations.updateTaskStatus.isPending}
                        />
                        <TaskPaginationControls
                            currentPage={state.currentPage}
                            totalPages={totalPages}
                            onPageChange={state.setCurrentPage}
                        />
                    </>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        clients={clients}
                        employees={employees}
                        onEdit={handlers.handleEdit}
                        onDelete={handlers.handleDelete}
                        onStatusChange={handlers.handleStatusChange}
                        onAdd={handlers.handleAdd}
                    />
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                        <DialogDescription>
                            {editingTask ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
                        </DialogDescription>
                    </DialogHeader>
                    <TaskForm
                        task={editingTask || undefined}
                        clients={clients}
                        projects={projects}
                        employees={employees}
                        onSubmit={handlers.handleSubmit}
                        onCancel={() => setIsFormOpen(false)}
                        isSubmitting={mutations.createTask.isPending || mutations.updateTask.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingTask} onOpenChange={() => setDeletingTask(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the task "{deletingTask?.title}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingTask(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlers.handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
