// Task Management Feature Exports

export { TaskForm } from './components/TaskForm'
export { TaskList } from './components/TaskList'
export { KanbanBoard } from './components/KanbanBoard'

export {
    useTasks,
    useTask,
    useTasksByAssignee,
    useTasksByClient,
    useCreateTask,
    useUpdateTask,
    useDeleteTask,
    useUpdateTaskStatus,
} from './hooks/useTasks'

export { taskSchema, defaultTaskValues, taskToFormValues } from './schemas/taskSchema'
export type { TaskFormValues } from './schemas/taskSchema'
