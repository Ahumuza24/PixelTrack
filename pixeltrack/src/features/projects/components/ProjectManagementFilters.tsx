import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { ProjectStatus } from '@/types'
import type { ProjectStatusFilter } from '@/features/projects/hooks/useProjectManagement'

interface StatusOption {
    value: ProjectStatus
    label: string
}

interface ProjectManagementFiltersProps {
    searchQuery: string
    statusFilter: ProjectStatusFilter
    statusOptions: StatusOption[]
    onSearchChange: (value: string) => void
    onStatusChange: (value: ProjectStatusFilter) => void
}

export function ProjectManagementFilters({
    searchQuery,
    statusFilter,
    statusOptions,
    onSearchChange,
    onStatusChange,
}: ProjectManagementFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="pl-10 bg-muted/60 border border-transparent"
                />
            </div>
            <div className="flex gap-2">
                <select
                    value={statusFilter}
                    onChange={(event) => onStatusChange(event.target.value as ProjectStatusFilter)}
                    className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">All Statuses</option>
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}
