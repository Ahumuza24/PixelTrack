interface AdminDashboardWelcomeProps {
    firstName: string
}

export function AdminDashboardWelcome({ firstName }: AdminDashboardWelcomeProps) {
    return (
        <section>
            <h2 className="text-3xl font-black tracking-tight text-foreground">Agency Dashboard</h2>
            <p className="text-muted-foreground mt-1">Welcome back, {firstName}. Here's what's happening today.</p>
        </section>
    )
}
