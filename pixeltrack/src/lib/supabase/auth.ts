import { supabase } from './config'
import type { User } from '@supabase/supabase-js'

/**
 * Signs in a user with email and password.
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Supabase User and Session
 */
export async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut(): Promise<void> {
    await supabase.auth.signOut()
}

/**
 * Subscribes to auth state changes.
 * @param callback - Called with the current User or null
 * @returns Unsubscribe function to clean up the listener
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        callback(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
}

/**
 * Gets the current session.
 * @returns Current session or null
 */
export async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
}

/**
 * Gets the current user.
 * @returns Current user or null
 */
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}
