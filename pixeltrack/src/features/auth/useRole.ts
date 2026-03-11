import { useAuth } from './useAuth'
import type { UserRole } from '@/types'

/**
 * Returns the current user's role.
 * Returns null if the user is not authenticated.
 */
export function useRole(): UserRole | null {
    const { user } = useAuth()
    return user?.role ?? null
}
