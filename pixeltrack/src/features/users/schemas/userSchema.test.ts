import { describe, it, expect } from 'vitest'
import { userSchema, defaultUserValues } from './userSchema'
import { UserRole } from '@/types'

describe('userSchema', () => {
    describe('validation', () => {
        it('should validate a valid employee user', () => {
            const validUser = {
                displayName: 'John Doe',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(validUser)
            expect(result.success).toBe(true)
        })

        it('should validate a valid admin user', () => {
            const validUser = {
                displayName: 'Admin User',
                email: 'admin@example.com',
                role: UserRole.ADMIN,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(validUser)
            expect(result.success).toBe(true)
        })

        it('should validate a valid client user with clientId', () => {
            const validUser = {
                displayName: 'Client User',
                email: 'client@example.com',
                role: UserRole.CLIENT,
                clientId: 'client-123',
                password: 'securePass123',
            }

            const result = userSchema.safeParse(validUser)
            expect(result.success).toBe(true)
        })

        it('should reject client user without clientId', () => {
            const invalidUser = {
                displayName: 'Client User',
                email: 'client@example.com',
                role: UserRole.CLIENT,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Client assignment is required')
            }
        })

        it('should reject empty display name', () => {
            const invalidUser = {
                displayName: '',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
        })

        it('should reject display name shorter than 2 characters', () => {
            const invalidUser = {
                displayName: 'J',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 2 characters')
            }
        })

        it('should reject display name longer than 100 characters', () => {
            const invalidUser = {
                displayName: 'A'.repeat(101),
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
        })

        it('should reject invalid email format', () => {
            const invalidUser = {
                displayName: 'John Doe',
                email: 'not-an-email',
                role: UserRole.EMPLOYEE,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
        })

        it('should reject empty email', () => {
            const invalidUser = {
                displayName: 'John Doe',
                email: '',
                role: UserRole.EMPLOYEE,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
        })

        it('should reject password shorter than 8 characters', () => {
            const invalidUser = {
                displayName: 'John Doe',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                password: 'short',
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 8 characters')
            }
        })

        it('should reject password longer than 128 characters', () => {
            const invalidUser = {
                displayName: 'John Doe',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                password: 'A'.repeat(129),
            }

            const result = userSchema.safeParse(invalidUser)
            expect(result.success).toBe(false)
        })

        it('should accept all valid role values', () => {
            const roles = [UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT]

            roles.forEach((role) => {
                const user = {
                    displayName: 'Test User',
                    email: 'test@example.com',
                    role,
                    password: 'securePass123',
                    ...(role === UserRole.CLIENT && { clientId: 'client-123' }),
                }

                const result = userSchema.safeParse(user)
                expect(result.success).toBe(true)
            })
        })

        it('should accept editing without password', () => {
            const editingUser = {
                displayName: 'John Doe',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
            }

            const result = userSchema.safeParse(editingUser)
            expect(result.success).toBe(true)
        })

        it('should accept null clientId for non-client roles', () => {
            const user = {
                displayName: 'John Doe',
                email: 'john@example.com',
                role: UserRole.EMPLOYEE,
                clientId: null,
                password: 'securePass123',
            }

            const result = userSchema.safeParse(user)
            expect(result.success).toBe(true)
        })
    })

    describe('defaultUserValues', () => {
        it('should have correct default values', () => {
            expect(defaultUserValues).toEqual({
                displayName: '',
                email: '',
                role: UserRole.EMPLOYEE,
                clientId: null,
                password: '',
            })
        })

        it('should not validate with default values', () => {
            const result = userSchema.safeParse(defaultUserValues)
            expect(result.success).toBe(false)
        })
    })
})
