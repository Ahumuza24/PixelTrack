import { z } from 'zod'
import { UserRole } from '@/types'

/**
 * Zod schema for user form validation (admin creates users).
 * Used with React Hook Form for create/edit user operations.
 *
 * @example
 * ```ts
 * const form = useForm({
 *   resolver: zodResolver(userSchema),
 *   defaultValues: defaultUserValues,
 * })
 * ```
 */
export const userSchema = z.object({
    /** Display name - required, min 2 characters */
    displayName: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be 100 characters or less'),

    /** Email - required, must be valid format */
    email: z
        .string()
        .email('Please enter a valid email address')
        .max(255, 'Email must be 255 characters or less'),

    /** User role - must be one of the allowed values */
    role: z.enum([UserRole.ADMIN, UserRole.EMPLOYEE, UserRole.CLIENT]),

    /** Optional client assignment - required only when role is CLIENT */
    clientId: z.string().nullable().optional(),

    /** Initial password - required for new users, optional for edits */
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be 128 characters or less')
        .optional(),
})
    .refine(
        (data) => {
            // Client role requires clientId
            if (data.role === UserRole.CLIENT && !data.clientId) {
                return false
            }
            return true
        },
        {
            message: 'Client assignment is required for client users',
            path: ['clientId'],
        }
    )

/**
 * Type derived from userSchema for form values.
 */
export type UserFormValues = z.infer<typeof userSchema>

/**
 * Default values for the user form.
 * Use when creating a new user or reset.
 */
export const defaultUserValues: UserFormValues = {
    displayName: '',
    email: '',
    role: UserRole.EMPLOYEE,
    clientId: null,
    password: '',
}
