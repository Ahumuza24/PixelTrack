import { LayoutGrid, List } from 'lucide-react'
import { TASK_FILTER_TABS } from '@/features/tasks/constants/taskManagement'
import type { TaskFilterTab, TaskViewMode } from '@/features/tasks/constants/taskManagement'

interface TaskManagementFiltersProps {
    activeTab: TaskFilterTab
    onTabChange: (tab: TaskFilterTab) => void
    viewMode: TaskViewMode
    onViewModeChange: (mode: TaskViewMode) => void
}

export function TaskManagementFilters({ activeTab, onTabChange, viewMode, onViewModeChange }: TaskManagementFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
                {TASK_FILTER_TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-primary text-primary-foreground shadow'
                                : 'bg-card text-muted-foreground hover:bg-muted/60'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="flex gap-2 ml-auto">
                <button
                    onClick={() => onViewModeChange('list')}
                    className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list'
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'bg-card text-muted-foreground hover:bg-muted/60'
                    }`}
                    aria-label="Switch to list view"
                >
                    <List className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onViewModeChange('kanban')}
                    className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'kanban'
                            ? 'bg-primary text-primary-foreground shadow'
                            : 'bg-card text-muted-foreground hover:bg-muted/60'
                    }`}
                    aria-label="Switch to Kanban view"
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
