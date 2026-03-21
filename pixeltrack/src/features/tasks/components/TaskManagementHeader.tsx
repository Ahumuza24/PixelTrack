import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/NotificationBell'

interface TaskManagementHeaderProps {
    searchQuery: string
    onSearchChange: (value: string) => void
    overdueCount: number
    onAddTask: () => void
}

export function TaskManagementHeader({ searchQuery, onSearchChange, overdueCount, onAddTask }: TaskManagementHeaderProps) {
    return (
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(event) => onSearchChange(event.target.value)}
                        className="w-full bg-muted/60 border border-transparent pl-10 focus:ring-2 focus:ring-ring/60"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <NotificationBell overdueCount={overdueCount} />
                <Button onClick={onAddTask}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>
        </header>
    )
}
