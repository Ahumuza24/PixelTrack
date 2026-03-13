import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { RoleGuard } from '@/routes/RoleGuard'
import type { UserProfile } from '@/types'
import { UserRole } from '@/types'
import { AuthContext } from '@/features/auth/AuthContext'
import type { AuthContextValue } from '@/features/auth/AuthContext'
import type { User } from 'firebase/auth'

function LoginPageStub() {
    const location = useLocation()
    return (
        <div>
            Login Page
            {location.state?.from && <span data-testid="redirect-from">{location.state.from}</span>}
        </div>
    )
}

function renderRoleGuard({
    user,
    allowedRoles,
}: {
    user: UserProfile | null
    allowedRoles: UserRole[]
}) {
    const contextValue: AuthContextValue = { user, firebaseUser: null as User | null, loading: false }

    return render(
        <AuthContext.Provider value={contextValue}>
            <MemoryRouter initialEntries={['/restricted']}>
                <Routes>
                    <Route element={<RoleGuard allowedRoles={allowedRoles} />}>
                        <Route path="/restricted" element={<div>Restricted Content</div>} />
                    </Route>
                    <Route path="/login" element={<LoginPageStub />} />
                </Routes>
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

const makeUser = (role: UserRole): UserProfile => ({
    uid: 'test-uid',
    email: 'test@test.com',
    displayName: 'Test User',
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

describe('RoleGuard', () => {
    it('renders children when user role matches allowed roles', () => {
        renderRoleGuard({ user: makeUser(UserRole.ADMIN), allowedRoles: [UserRole.ADMIN] })
        expect(screen.getByText('Restricted Content')).toBeInTheDocument()
    })

    it('redirects to /login when user role does not match and sets origin state', () => {
        renderRoleGuard({ user: makeUser(UserRole.EMPLOYEE), allowedRoles: [UserRole.ADMIN] })
        expect(screen.getByText('Login Page')).toBeInTheDocument()
        expect(screen.getByTestId('redirect-from').textContent).toBe('/restricted')
        expect(screen.queryByText('Restricted Content')).not.toBeInTheDocument()
    })

    it('redirects to /login when user is null', () => {
        renderRoleGuard({ user: null, allowedRoles: [UserRole.ADMIN] })
        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    it('allows access when user has one of multiple allowed roles', () => {
        renderRoleGuard({
            user: makeUser(UserRole.CLIENT),
            allowedRoles: [UserRole.ADMIN, UserRole.CLIENT],
        })
        expect(screen.getByText('Restricted Content')).toBeInTheDocument()
    })
})
