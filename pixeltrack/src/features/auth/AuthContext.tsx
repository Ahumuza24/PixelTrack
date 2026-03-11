import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import { onAuthChange } from '@/lib/firebase/auth'
import { getUserProfile, createUserProfile } from '@/lib/firebase/users'
import type { UserProfile } from '@/types'
import { UserRole } from '@/types'

interface AuthContextValue {
    user: UserProfile | null
    firebaseUser: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

/**
 * Provides authentication state to the entire application.
 * Subscribes to Firebase Auth state, loads the Firestore user profile,
 * and creates a profile document on first login.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthChange(async (fbUser) => {
            setFirebaseUser(fbUser)

            if (!fbUser) {
                setUser(null)
                setLoading(false)
                return
            }

            try {
                let profile = await getUserProfile(fbUser.uid)

                // First login — create a profile with default employee role
                if (!profile) {
                    await createUserProfile(fbUser.uid, {
                        email: fbUser.email ?? '',
                        displayName: fbUser.displayName ?? fbUser.email ?? 'Unknown',
                        role: UserRole.EMPLOYEE,
                    })
                    profile = await getUserProfile(fbUser.uid)
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
        <AuthContext.Provider value={{ user, firebaseUser, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext }
