import { Building2 } from 'lucide-react'

interface ClientDashboardHeaderProps {
    clientName: string
    userName: string
}

export function ClientDashboardHeader({ clientName, userName }: ClientDashboardHeaderProps) {
    return (
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cobalt rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{clientName}</h1>
                        <p className="text-slate-500 mt-1">Welcome back, {userName}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
