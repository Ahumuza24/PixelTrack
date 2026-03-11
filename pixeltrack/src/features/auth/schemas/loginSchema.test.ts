import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/features/auth/schemas/loginSchema'

describe('loginSchema', () => {
    it('accepts valid email and password', () => {
        const result = loginSchema.safeParse({
            email: 'admin@agency.com',
            password: 'password123',
        })
        expect(result.success).toBe(true)
    })

    it('fails when email is empty', () => {
        const result = loginSchema.safeParse({ email: '', password: 'password123' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toBeDefined()
        }
    })

    it('fails when email format is invalid', () => {
        const result = loginSchema.safeParse({ email: 'notanemail', password: 'password123' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.email).toContain(
                'Please enter a valid email address',
            )
        }
    })

    it('fails when password is shorter than 6 characters', () => {
        const result = loginSchema.safeParse({ email: 'admin@agency.com', password: '123' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toContain(
                'Password must be at least 6 characters',
            )
        }
    })

    it('fails when password is missing', () => {
        const result = loginSchema.safeParse({ email: 'admin@agency.com', password: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.flatten().fieldErrors.password).toBeDefined()
        }
    })
})
