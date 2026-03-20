import { Building2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ClientManagementHeaderProps {
    totalClients: number
    activeClients: number
    onCreate: () => void
    isCreating: boolean
}

export function ClientManagementHeader({ totalClients, activeClients, onCreate, isCreating }: ClientManagementHeaderProps) {
    return (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cobalt rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Client Management</h1>
                            <p className="text-sm text-slate-500">
                                {totalClients} companies • {activeClients} active
                            </p>
                        </div>
                    </div>
                    <Button onClick={onCreate} className="bg-cobalt hover:bg-cobalt-600" disabled={isCreating}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Client
                    </Button>
                </div>
            </div>
        </div>
    )
}
