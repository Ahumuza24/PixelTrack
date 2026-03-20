import { Building2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Client } from '@/types'
import type { ClientStatusDisplayConfig } from '@/features/clients/constants/clientDetail'

interface ClientPrimaryDetailsProps {
    client: Client
    statusConfig: ClientStatusDisplayConfig | null
}

export function ClientPrimaryDetails({ client, statusConfig }: ClientPrimaryDetailsProps) {
    return (
        <Card className="shadow-sm bg-card border border-border">
            <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Primary Details</h2>
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 text-primary flex items-center justify-center">
                        {client.logoUrl ? (
                            <img
                                src={client.logoUrl}
                                alt={`${client.name} logo`}
                                className="w-10 h-10 object-contain rounded-lg border border-border"
                            />
                        ) : (
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-base font-semibold text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {client.id}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs uppercase text-muted-foreground">Primary Contact</p>
                    <p className="text-base font-semibold text-foreground">{client.primaryContact}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                    </p>
                </div>
                <div>
                    <p className="text-xs uppercase text-muted-foreground">Status</p>
                    <Badge className={statusConfig?.badgeClass}>{statusConfig?.label ?? client.status}</Badge>
                </div>
                <div>
                    <p className="text-xs uppercase text-muted-foreground">Member Since</p>
                    <p className="text-base font-semibold text-foreground">
                        {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
