import { useContext } from 'react'
import { AuthContext } from './AuthContext'

/**
 * Returns the current authentication context.
 * Must be used inside an AuthProvider.
 * @throws If used outside of AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
