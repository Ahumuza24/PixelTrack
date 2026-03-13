import { supabase } from './config'
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectFilters, ProjectStatus, ProjectWithClient } from '@/types'

/**
 * Creates a new project in the database.
 * @param data - Project data without id and timestamps
 * @returns The created Project with generated id and timestamps
 */
export async function createProject(data: CreateProjectInput): Promise<Project> {
    const { data: project, error } = await supabase
        .from('projects')
        .insert({
            client_id: data.clientId,
            title: data.title,
            description: data.description,
            status: data.status ?? 'active',
            start_date: data.startDate,
            due_date: data.dueDate,
        })
        .select()
        .single()

    if (error) throw error
    if (!project) throw new Error('Failed to create project')

    return {
        id: project.id,
        clientId: project.client_id,
        title: project.title,
        description: project.description,
        status: project.status as ProjectStatus,
        startDate: project.start_date,
        dueDate: project.due_date,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
    }
}

/**
 * Fetches a single project by ID.
 * @param projectId - The project UUID
 * @returns The Project object or null if not found
 */
export async function getProject(projectId: string): Promise<Project | null> {
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }
    if (!project) return null

    return {
        id: project.id,
        clientId: project.client_id,
        title: project.title,
        description: project.description,
        status: project.status as ProjectStatus,
        startDate: project.start_date,
        dueDate: project.due_date,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
    }
}

/**
 * Updates an existing project.
 * @param data - Update data including the project id
 */
export async function updateProject(data: UpdateProjectInput): Promise<void> {
    const { id, ...updates } = data

    const updateData: Record<string, unknown> = {}
    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.status) updateData.status = updates.status
    if (updates.startDate) updateData.start_date = updates.startDate
    if (updates.dueDate) updateData.due_date = updates.dueDate

    const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)

    if (error) throw error
}

/**
 * Deletes a project from the database.
 * @param projectId - The project UUID to delete
 */
export async function deleteProject(projectId: string): Promise<void> {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

    if (error) throw error
}

/**
 * Fetches all projects with optional filtering.
 * Results are ordered by due date (ascending) by default.
 * @param filters - Optional filters for client, status, or search
 * @returns Array of Project objects
 */
export async function getProjects(filters?: ProjectFilters): Promise<Project[]> {
    let query = supabase.from('projects').select('*').order('due_date', { ascending: true })

    if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId)
    }

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    const { data: projects, error } = await query

    if (error) throw error
    if (!projects) return []

    let result = projects.map((project) => ({
        id: project.id,
        clientId: project.client_id,
        title: project.title,
        description: project.description,
        status: project.status as ProjectStatus,
        startDate: project.start_date,
        dueDate: project.due_date,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
    }))

    if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase()
        result = result.filter((project) => project.title.toLowerCase().includes(search))
    }

    return result
}

/**
 * Fetches all projects with client name included.
 * @param filters - Optional filters
 * @returns Array of ProjectWithClient objects
 */
export async function getProjectsWithClient(filters?: ProjectFilters): Promise<ProjectWithClient[]> {
    let query = supabase
        .from('projects')
        .select(`
            *,
            clients(name)
        `)
        .order('due_date', { ascending: true })

    if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId)
    }

    if (filters?.status) {
        query = query.eq('status', filters.status)
    }

    const { data: projects, error } = await query

    if (error) throw error
    if (!projects) return []

    let result = projects.map((project) => ({
        id: project.id,
        clientId: project.client_id,
        title: project.title,
        description: project.description,
        status: project.status as ProjectStatus,
        startDate: project.start_date,
        dueDate: project.due_date,
        createdBy: project.created_by,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        clientName: project.clients?.name ?? 'Unknown',
    }))

    if (filters?.searchQuery) {
        const search = filters.searchQuery.toLowerCase()
        result = result.filter(
            (project) =>
                project.title.toLowerCase().includes(search) ||
                project.clientName.toLowerCase().includes(search)
        )
    }

    return result
}

/**
 * Fetches projects for a specific client.
 * @param clientId - The client ID to filter by
 * @returns Array of Project objects for the client
 */
export async function getProjectsByClient(clientId: string): Promise<Project[]> {
    return getProjects({ clientId })
}

/**
 * Gets the count of tasks in a project.
 * @param projectId - The project UUID
 * @returns Object with total and completed task counts
 */
export async function getProjectTaskCounts(projectId: string): Promise<{ total: number; completed: number }> {
    const { data, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId)

    if (error) throw error
    if (!data) return { total: 0, completed: 0 }

    const total = data.length
    const completed = data.filter((task) => task.status === 'complete').length

    return { total, completed }
}
