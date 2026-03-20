import { Bell, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
                <button className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted/70 text-muted-foreground relative">
                    <Bell className="w-5 h-5" />
                    {overdueCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                            {overdueCount}
                        </span>
                    )}
                </button>
                <Button onClick={onAddTask}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>
        </header>
    )
}
