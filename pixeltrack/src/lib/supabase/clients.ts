import { supabase } from './config'
import type { Client, CreateClientInput, UpdateClientInput, ClientFilters, ClientStatus } from '@/types'

/**
 * Creates a new client in the database.
 * @param data - Client data without id, createdAt, updatedAt
 * @returns The created Client with generated id and timestamps
 */
export async function createClient(data: CreateClientInput): Promise<Client> {
    const { data: client, error } = await supabase
        .from('clients')
        .insert({
            name: data.name,
            logo_url: data.logoUrl,
            primary_contact: data.primaryContact,
            email: data.email,
            status: data.status,
        })
        .select()
        .single()

    if (error) throw error
    if (!client) throw new Error('Failed to create client')

    return {
        id: client.id,
        name: client.name,
        logoUrl: client.logo_url,
        primaryContact: client.primary_contact,
        email: client.email,
        status: client.status as ClientStatus,
        createdAt: client.created_at,
        updatedAt: client.updated_at,
    }
}

/**
 * Fetches a single client by ID.
 * @param clientId - The client UUID
 * @returns The Client object or null if not found
 */
export async function getClient(clientId: string): Promise<Client | null> {
    const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }
    if (!client) return null

    return {
        id: client.id,
        name: client.name,
        logoUrl: client.logo_url,
        primaryContact: client.primary_contact,
        email: client.email,
        status: client.status as ClientStatus,
        createdAt: client.created_at,
        updatedAt: client.updated_at,
    }
}

/**
 * Updates an existing client.
 * @param data - Update data including the client id
 */
export async function updateClient(data: UpdateClientInput): Promise<void> {
    const { id, ...updates } = data

    const updateData: Record<string, unknown> = {}
    if (updates.name) updateData.name = updates.name
    if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl
    if (updates.primaryContact) updateData.primary_contact = updates.primaryContact
    if (updates.email) updateData.email = updates.email
    if (updates.status) updateData.status = updates.status

    const { error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)

    if (error) throw error
}

/**
 * Deletes a client from the database.
 * @param clientId - The client UUID to delete
 */
export async function deleteClient(clientId: string): Promise<void> {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)

    if (error) throw error
}

/**
 * Fetches all clients with optional filtering.
 * Results are ordered by name (ascending) by default.
 * @param filters - Optional filters for status and search query
 * @returns Array of Client objects
 */
export async function getClients(filters?: ClientFilters): Promise<Client[]> {
    let query = supabase.from('clients').select('*').order('name', { ascending: true })

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    const { data: clients, error } = await query

    if (error) throw error
    if (!clients) return []

    let result = clients.map((client) => ({
        id: client.id,
        name: client.name,
        logoUrl: client.logo_url,
        primaryContact: client.primary_contact,
        email: client.email,
        status: client.status as ClientStatus,
        createdAt: client.created_at,
        updatedAt: client.updated_at,
    }))

    if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase()
        result = result.filter(
            (client) =>
                client.name.toLowerCase().includes(search) ||
                client.primaryContact.toLowerCase().includes(search) ||
                client.email.toLowerCase().includes(search),
        )
    }

    return result
}

/**
 * Gets the count of all clients or filtered by status.
 * @param status - Optional status filter
 * @returns Number of matching clients
 */
export async function getClientCount(status?: ClientStatus): Promise<number> {
    let query = supabase.from('clients').select('*', { count: 'exact', head: true })

    if (status) {
        query = query.eq('status', status)
    }

    const { count, error } = await query

    if (error) throw error
    return count || 0
}
