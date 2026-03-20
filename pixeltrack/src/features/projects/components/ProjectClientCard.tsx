import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProjectClientCardProps {
    clientName: string
    onViewClient: () => void
}

export function ProjectClientCard({ clientName, onViewClient }: ProjectClientCardProps) {
    return (
        <Card className="bg-card border border-border">
            <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Client</h3>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">{clientName}</p>
                        <Button variant="link" className="px-0 h-auto text-primary" onClick={onViewClient}>
                            View Client
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
