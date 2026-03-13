/**
 * User roles available in the PixelTrack platform
 */
export const UserRole = {
    ADMIN: 'admin',
    EMPLOYEE: 'employee',
    CLIENT: 'client',
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

/**
 * Full user profile stored in PostgreSQL at `profiles` table
 */
export interface UserProfile {
    uid: string
    email: string
    displayName: string
    role: UserRole
    /** Present only for client-role users */
    clientId?: string
    /** User's profile photo URL */
    photoURL?: string
    createdAt: string
    updatedAt: string
}
