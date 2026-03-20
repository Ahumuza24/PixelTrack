import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Client, ProjectStatus } from '@/types'
import { ProjectStatus as ProjectStatusEnum } from '@/types'

export interface ProjectFormValues {
    title: string
    description: string
    clientId: string
    status: ProjectStatus
    dueDate: string
}

interface ProjectFormProps {
    clients: Client[]
    initialData?: Partial<ProjectFormValues>
    isEditing?: boolean
    isSubmitting?: boolean
    onSubmit: (values: ProjectFormValues) => void
    onCancel: () => void
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: ProjectStatusEnum.NOT_STARTED, label: 'Not Started' },
    { value: ProjectStatusEnum.ACTIVE, label: 'Active' },
    { value: ProjectStatusEnum.ON_HOLD, label: 'On Hold' },
    { value: ProjectStatusEnum.COMPLETED, label: 'Completed' },
    { value: ProjectStatusEnum.CANCELLED, label: 'Cancelled' },
]

export function ProjectForm({ clients, initialData, isEditing, isSubmitting, onSubmit, onCancel }: ProjectFormProps) {
    const [formData, setFormData] = useState<ProjectFormValues>({
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        clientId: initialData?.clientId ?? '',
        status: initialData?.status ?? ProjectStatusEnum.NOT_STARTED,
        dueDate: initialData?.dueDate ? initialData.dueDate.split('T')[0] : '',
    })

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (!formData.title || !formData.clientId) return
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Project Title *</label>
                <Input
                    value={formData.title}
                    onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="e.g., Brand Design, Website Redesign"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Client *</label>
                <select
                    value={formData.clientId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, clientId: event.target.value }))}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                            {client.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Brief description of the project scope..."
                    rows={3}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(event) =>
                            setFormData((prev) => ({ ...prev, status: event.target.value as ProjectStatus }))
                        }
                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
                    <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(event) => setFormData((prev) => ({ ...prev, dueDate: event.target.value }))}
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border/70">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.title || !formData.clientId} className="flex-1">
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save Changes' : 'Create Project'}
                </Button>
            </div>
        </form>
    )
}
