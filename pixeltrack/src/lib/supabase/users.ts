import { supabase } from './config'
import type { UserProfile } from '@/types'
import { UserRole } from '@/types'

/**
 * Fetches a user profile from the database.
 * @param uid - The user's UUID (from auth.users)
 * @returns UserProfile if the document exists, otherwise null
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return null
        throw error
    }
    if (!profile) return null

    return {
        uid: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role as UserRole,
        photoURL: profile.photo_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    }
}

/**
 * Creates or updates a user profile in the database.
 * Uses the current timestamp for consistency.
 * @param uid - The user's UUID (from auth.users)
 * @param data - Partial profile data to merge with defaults
 */
export async function createUserProfile(
    uid: string,
    data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
    const { error } = await supabase
        .from('profiles')
        .upsert({
            id: uid,
            email: data.email,
            display_name: data.displayName,
            role: data.role ?? UserRole.EMPLOYEE,
            photo_url: data.photoURL,
        }, { onConflict: 'id' })

    if (error) throw error
}

/**
 * Updates an existing user profile.
 * @param uid - The user's UUID
 * @param data - Partial profile data to update
 */
export async function updateUserProfile(
    uid: string,
    data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
    const updateData: Record<string, unknown> = {}
    if (data.email) updateData.email = data.email
    if (data.displayName !== undefined) updateData.display_name = data.displayName
    if (data.role) updateData.role = data.role
    if (data.photoURL !== undefined) updateData.photo_url = data.photoURL

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', uid)

    if (error) throw error
}

/**
 * Fetches all user profiles.
 * @returns Array of UserProfile objects
 */
export async function getAllUserProfiles(): Promise<UserProfile[]> {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('display_name', { ascending: true })

    if (error) throw error
    if (!profiles) return []

    return profiles.map((profile) => ({
        uid: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role as UserRole,
        photoURL: profile.photo_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    }))
}

/**
 * Fetches user profiles by role.
 * @param role - The role to filter by
 * @returns Array of UserProfile objects with the specified role
 */
export async function getUserProfilesByRole(role: UserRole): Promise<UserProfile[]> {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('display_name', { ascending: true })

    if (error) throw error
    if (!profiles) return []

    return profiles.map((profile) => ({
        uid: profile.id,
        email: profile.email,
        displayName: profile.display_name,
        role: profile.role as UserRole,
        photoURL: profile.photo_url,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
    }))
}
