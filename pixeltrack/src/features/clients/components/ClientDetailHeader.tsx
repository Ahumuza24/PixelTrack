import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClientDetailHeaderProps {
    name: string
    onBack: () => void
}

export function ClientDetailHeader({ name, onBack }: ClientDetailHeaderProps) {
    return (
        <header className="bg-card/90 border-b border-border backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to clients">
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Client Detail</p>
                    <h1 className="text-2xl font-bold text-foreground leading-tight">{name}</h1>
                </div>
            </div>
        </header>
    )
}
