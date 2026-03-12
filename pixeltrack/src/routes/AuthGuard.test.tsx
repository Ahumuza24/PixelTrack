import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthGuard } from '@/routes/AuthGuard'
import type { UserProfile } from '@/types'
import { UserRole } from '@/types'
import { AuthContext } from '@/features/auth/AuthContext'

function LoginPageStub() {
    const location = useLocation()
    return (
        <div>
            Login Page
            {location.state?.from && <span data-testid="redirect-from">{location.state.from}</span>}
        </div>
    )
}

// Helper to render AuthGuard with a mock auth context
function renderAuthGuard({
    user = null,
    loading = false,
    initialPath = '/protected',
}: {
    user?: UserProfile | null
    loading?: boolean
    initialPath?: string
}) {
    const contextValue = { user, firebaseUser: null, loading }

    return render(
        <AuthContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={[initialPath]}>
                <Routes>
                    <Route element={<AuthGuard />}>
                        <Route path="/protected" element={<div>Protected Content</div>} />
                    </Route>
                    <Route path="/login" element={<LoginPageStub />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

describe('AuthGuard', () => {
    it('shows a loading spinner when auth state is resolving', () => {
        renderAuthGuard({ loading: true })
        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('renders children when the user is authenticated', () => {
        const user: UserProfile = {
            uid: 'user-1',
            email: 'admin@test.com',
            displayName: 'Admin User',
            role: UserRole.ADMIN,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        renderAuthGuard({ user })
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects to /login when the user is not authenticated and includes origin in state', () => {
        renderAuthGuard({ user: null, initialPath: '/protected?tab=designs' })
        expect(screen.getByText('Login Page')).toBeInTheDocument()
        expect(screen.getByTestId('redirect-from').textContent).toBe('/protected?tab=designs')
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
})
