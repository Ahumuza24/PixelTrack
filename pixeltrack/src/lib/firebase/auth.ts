import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User,
    type Unsubscribe,
} from 'firebase/auth'
import { auth } from './config'

/**
 * Signs in a user with email and password.
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Firebase UserCredential
 */
export async function signIn(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password)
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOut(): Promise<void> {
    return firebaseSignOut(auth)
}

/**
 * Subscribes to auth state changes.
 * @param callback - Called with the current User or null
 * @returns Unsubscribe function to clean up the listener
 */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback)
}
