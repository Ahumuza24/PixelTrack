import { useParams } from 'react-router-dom'
import { Building2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    ClientDetailHeader,
    ClientOverviewStats,
    ClientPrimaryDetails,
    ClientTasksCard,
    ClientProjectsCard,
    useClientDetail,
} from '@/features/clients'

export function ClientDetailPage() {
    const { clientId } = useParams<{ clientId: string }>()
    const {
        client,
        tasks,
        projects,
        isLoading,
        notFound,
        overviewStats,
        taskStats,
        statusConfig,
        isTasksLoading,
        isProjectsLoading,
        handlers,
    } =
        useClientDetail(clientId)

    const { handleBack, handleTaskSelect, handleProjectSelect } = handlers

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (notFound || !client) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center text-foreground">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h1 className="text-2xl font-semibold">Client not found</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    We couldn't find the client you're looking for. It may have been deleted or you might have an outdated
                    link.
                </p>
                <Button className="mt-6" onClick={handleBack}>
                    Return to Client Directory
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <ClientDetailHeader name={client.name} onBack={handleBack} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <ClientOverviewStats stats={overviewStats} taskStats={taskStats} />
                    <ClientPrimaryDetails client={client} statusConfig={statusConfig} />
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <ClientTasksCard
                        clientName={client.name}
                        tasks={tasks}
                        isLoading={isTasksLoading}
                        onSelectTask={handleTaskSelect}
                    />
                    <ClientProjectsCard
                        projects={projects}
                        isLoading={isProjectsLoading}
                        onSelectProject={handleProjectSelect}
                        clientName={client.name}
                    />
                </section>
            </main>
        </div>
    )
}
