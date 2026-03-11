import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { AuthContext } from '@/features/auth/AuthContext'
import * as firebaseAuth from '@/lib/firebase/auth'

// Mock Firebase auth service
vi.mock('@/lib/firebase/auth')

const renderLoginPage = (user = null) => {
    const contextValue = { user, firebaseUser: null, loading: false }
    return render(
        <AuthContext.Provider value={contextValue}>
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        </AuthContext.Provider>,
    )
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('renders the login form', () => {
        renderLoginPage()
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows an email validation error when email is empty and form is submitted', async () => {
        renderLoginPage()
        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText('Email is required')).toBeInTheDocument()
        })
    })

    it('shows an email format error when email is invalid', async () => {
        renderLoginPage()
        const user = userEvent.setup()
        await user.type(screen.getByLabelText(/email/i), 'notanemail')
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
        })
    })

    it('shows a password error when password is too short', async () => {
        renderLoginPage()
        const user = userEvent.setup()
        await user.type(screen.getByLabelText(/email/i), 'test@test.com')
        await user.type(screen.getByLabelText(/^password$/i), '123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
        })
    })

    it('disables the submit button while submitting', async () => {
        vi.mocked(firebaseAuth.signIn).mockImplementation(
            () => new Promise<never>(() => { }), // Never resolves — simulates pending
        )
        renderLoginPage()
        const user = userEvent.setup()
        await user.type(screen.getByLabelText(/email/i), 'admin@test.com')
        await user.type(screen.getByLabelText(/^password$/i), 'password123')
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
        })
    })

    it('calls signIn with correct credentials on valid submission', async () => {
        vi.mocked(firebaseAuth.signIn).mockResolvedValue({} as never)
        renderLoginPage()
        const user = userEvent.setup()
        await user.type(screen.getByLabelText(/email/i), 'admin@agency.com')
        await user.type(screen.getByLabelText(/^password$/i), 'securepass')
        await user.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(firebaseAuth.signIn).toHaveBeenCalledWith('admin@agency.com', 'securepass')
        })
    })
})
