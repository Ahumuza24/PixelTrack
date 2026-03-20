interface EmployeeDashboardHeaderProps {
    userName: string
}

export function EmployeeDashboardHeader({ userName }: EmployeeDashboardHeaderProps) {
    return (
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back, {userName}</h1>
                    <p className="text-slate-500 mt-1">Here's your task overview for today</p>
                </div>
            </div>
        </div>
    )
}
