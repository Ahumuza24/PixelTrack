import { describe, it, expect } from 'vitest'
import { clientSchema, defaultClientValues } from './clientSchema'
import { ClientStatus } from '@/types'

describe('clientSchema', () => {
    describe('validation', () => {
        it('should validate a valid client', () => {
            const validClient = {
                name: 'Acme Design Co',
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
                logoUrl: null,
            }

            const result = clientSchema.safeParse(validClient)
            expect(result.success).toBe(true)
        })

        it('should reject empty company name', () => {
            const invalidClient = {
                name: '',
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
            }

            const result = clientSchema.safeParse(invalidClient)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('name')
            }
        })

        it('should reject company name shorter than 2 characters', () => {
            const invalidClient = {
                name: 'A',
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
            }

            const result = clientSchema.safeParse(invalidClient)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('at least 2 characters')
            }
        })

        it('should reject company name longer than 100 characters', () => {
            const invalidClient = {
                name: 'A'.repeat(101),
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
            }

            const result = clientSchema.safeParse(invalidClient)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('100 characters or less')
            }
        })

        it('should reject empty primary contact', () => {
            const invalidClient = {
                name: 'Acme Design Co',
                primaryContact: '',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
            }

            const result = clientSchema.safeParse(invalidClient)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].path).toContain('primaryContact')
            }
        })

        it('should reject invalid email format', () => {
            const invalidClient = {
                name: 'Acme Design Co',
                primaryContact: 'Jane Doe',
                email: 'invalid-email',
                status: ClientStatus.ACTIVE,
            }

            const result = clientSchema.safeParse(invalidClient)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('valid email')
            }
        })

        it('should reject empty email', () => {
            const invalidClient = {
                name: 'Acme Design Co',
                primaryContact: 'Jane Doe',
                email: '',
                status: ClientStatus.ACTIVE,
            }

            const result = clientSchema.safeParse(invalidClient)
            expect(result.success).toBe(false)
        })

        it('should accept all valid status values', () => {
            const statuses = [ClientStatus.ACTIVE, ClientStatus.INACTIVE, ClientStatus.ARCHIVED]

            statuses.forEach((status) => {
                const client = {
                    name: 'Acme Design Co',
                    primaryContact: 'Jane Doe',
                    email: 'jane@acme.com',
                    status,
                }

                const result = clientSchema.safeParse(client)
                expect(result.success).toBe(true)
            })
        })

        it('should accept null logoUrl', () => {
            const client = {
                name: 'Acme Design Co',
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
                logoUrl: null,
            }

            const result = clientSchema.safeParse(client)
            expect(result.success).toBe(true)
        })

        it('should accept valid logoUrl', () => {
            const client = {
                name: 'Acme Design Co',
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
                logoUrl: 'https://example.com/logo.png',
            }

            const result = clientSchema.safeParse(client)
            expect(result.success).toBe(true)
        })

        it('should reject invalid logoUrl', () => {
            const client = {
                name: 'Acme Design Co',
                primaryContact: 'Jane Doe',
                email: 'jane@acme.com',
                status: ClientStatus.ACTIVE,
                logoUrl: 'not-a-url',
            }

            const result = clientSchema.safeParse(client)
            expect(result.success).toBe(false)
        })
    })

    describe('defaultClientValues', () => {
        it('should have correct default values', () => {
            expect(defaultClientValues).toEqual({
                name: '',
                primaryContact: '',
                email: '',
                status: ClientStatus.ACTIVE,
                logoUrl: null,
            })
        })

        it('should validate with default values', () => {
            const result = clientSchema.safeParse(defaultClientValues)
            expect(result.success).toBe(false)
            expect(result.error?.issues.length).toBeGreaterThan(0)
        })
    })
})
