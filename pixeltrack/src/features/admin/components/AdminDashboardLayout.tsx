import { ReactNode } from 'react'

interface AdminDashboardLayoutProps {
    header: ReactNode
    main: ReactNode
    rightRail: ReactNode
}

export function AdminDashboardLayout({ header, main, rightRail }: AdminDashboardLayoutProps) {
    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground">
            {header}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-8 lg:grid-cols-[2fr,1fr] xl:grid-cols-[5fr,2fr]">
                    <div className="space-y-8">{main}</div>
                    {rightRail}
                </div>
            </div>
        </div>
    )
}
