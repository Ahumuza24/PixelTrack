import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import { type UserProfile, UserRole } from '@/types'

/**
 * Fetches a user profile document from Firestore.
 * @param uid - Firebase Auth UID
 * @returns UserProfile if the document exists, otherwise null
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as UserProfile
}

/**
 * Creates or overwrites a user profile document in Firestore.
 * Uses serverTimestamp() for consistency — never new Date() on the client.
 * @param uid - Firebase Auth UID
 * @param data - Partial profile data to merge with defaults
 */
export async function createUserProfile(
    uid: string,
    data: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>,
): Promise<void> {
    const ref = doc(db, 'users', uid)
    await setDoc(ref, {
        ...data,
        uid,
        role: data.role ?? UserRole.EMPLOYEE,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    })
}
