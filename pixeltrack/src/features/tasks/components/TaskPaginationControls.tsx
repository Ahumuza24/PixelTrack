import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TaskPaginationControlsProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function TaskPaginationControls({ currentPage, totalPages, onPageChange }: TaskPaginationControlsProps) {
    if (totalPages <= 1) {
        return null
    }

    const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1))
    const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1))

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/70">
            <button
                onClick={handlePrevious}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
                <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50"
            >
                Next <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    )
}
