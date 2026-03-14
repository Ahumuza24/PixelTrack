import { createContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { onAuthChange } from '@/lib/supabase/auth'
import { getUserProfile, createUserProfile } from '@/lib/supabase/users'
import type { UserProfile } from '@/types'

export interface AuthContextValue {
    user: UserProfile | null
    supabaseUser: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

/**
 * Provides authentication state to the entire application.
 * Subscribes to Supabase Auth state, loads the user profile,
 * and creates a profile document on first login.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthChange(async (sbUser) => {
            setSupabaseUser(sbUser)

            if (!sbUser) {
                setUser(null)
                setLoading(false)
                return
            }

            try {
                let profile = await getUserProfile(sbUser.id)

                // First login — create a profile with default employee role
                if (!profile) {
                    await createUserProfile(sbUser.id, {
                        email: sbUser.email ?? '',
                        displayName: sbUser.user_metadata?.display_name ?? sbUser.email ?? 'Unknown',
                    })
                    profile = await getUserProfile(sbUser.id)
                }

                setUser(profile)
            } catch (err) {
                console.error('[AuthProvider] Failed to load user profile:', err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        })

        return unsubscribe
    }, [])

    return (
        <AuthContext.Provider value={{ user, supabaseUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext }
