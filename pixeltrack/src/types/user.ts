/**
 * User roles available in the PixelTrack platform
 */
export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
    CLIENT = 'client',
}

/**
 * Full user profile stored in Firestore /users/{uid}
 */
export interface UserProfile {
    uid: string
    email: string
    displayName: string
    role: UserRole
    /** Present only for client-role users */
    clientId?: string
    createdAt: string
    updatedAt: string
}
