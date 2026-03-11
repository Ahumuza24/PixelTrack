import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase config module to prevent initialization errors in tests.
// Tests that need Firebase behaviour should mock specific service files independently.
vi.mock('@/lib/firebase/config', () => ({
    auth: {},
    db: {},
    storage: {},
}))

// Mock Firebase auth service
vi.mock('@/lib/firebase/auth', () => ({
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthChange: vi.fn(() => () => { }),
}))

// Mock Firebase users service
vi.mock('@/lib/firebase/users', () => ({
    getUserProfile: vi.fn(),
    createUserProfile: vi.fn(),
}))
