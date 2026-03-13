/**
 * Client status values for lifecycle management
 * @example
 * ```ts
 * const isActive = client.status === ClientStatus.ACTIVE
 * ```
 */
export const ClientStatus = {
    /** Client is actively working with the agency */
    ACTIVE: 'active',
    /** Client relationship is paused or on hold */
    INACTIVE: 'inactive',
    /** Client engagement has ended */
    ARCHIVED: 'archived',
} as const

export type ClientStatus = typeof ClientStatus[keyof typeof ClientStatus]

/**
 * Represents a client company in the PixelTrack platform.
 * Stored in Supabase PostgreSQL at `clients` table
 *
 * @example
 * ```ts
 * const client: Client = {
 *   id: 'client-123',
 *   name: 'Acme Design Co',
 *   logoUrl: 'https://storage.../logo.png',
 *   primaryContact: 'Jane Doe',
 *   email: 'jane@acme.com',
 *   status: ClientStatus.ACTIVE,
 *   createdAt: '2024-01-15T10:00:00Z',
 *   updatedAt: '2024-01-15T10:00:00Z',
 * }
 * ```
 */
export interface Client {
    /** Unique identifier (PostgreSQL UUID) */
    id: string

    /** Company name as displayed throughout the platform */
    name: string

    /** Optional URL to company logo in Supabase Storage */
    logoUrl?: string | null

    /** Primary contact person name */
    primaryContact: string

    /** Primary contact email address */
    email: string

    /** Current status of the client relationship */
    status: ClientStatus

    /** ISO 8601 timestamp when the client was created */
    createdAt: string

    /** ISO 8601 timestamp when the client was last updated */
    updatedAt: string
}

/**
 * Data required to create a new client.
 * Omit system-managed fields (id, createdAt, updatedAt)
 */
export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>

/**
 * Data allowed when updating an existing client.
 * Partial fields with id excluded
 */
export type UpdateClientInput = Partial<Omit<Client, 'id' | 'createdAt'>> & {
    /** Required for identifying which client to update */
    id: string
}

/**
 * Client filter options for search and filtering operations
 *
 * @example
 * ```ts
 * const filters: ClientFilters = {
 *   status: ClientStatus.ACTIVE,
 *   searchQuery: 'acme'
 * }
 * ```
 */
export interface ClientFilters {
    /** Filter by specific status */
    status?: ClientStatus
    /** Case-insensitive search across name, primaryContact, and email */
    searchQuery?: string
}
