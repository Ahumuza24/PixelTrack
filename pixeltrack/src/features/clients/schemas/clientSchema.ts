import { z } from 'zod'
import { ClientStatus } from '@/types'

/**
 * Zod schema for client form validation.
 * Used with React Hook Form for create/edit client operations.
 *
 * @example
 * ```ts
 * const form = useForm({
 *   resolver: zodResolver(clientSchema),
 *   defaultValues: defaultClientValues,
 * })
 * ```
 */
export const clientSchema = z.object({
    /** Company name - required, min 2 characters */
    name: z
        .string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must be 100 characters or less'),

    /** Primary contact person - required */
    primaryContact: z
        .string()
        .min(2, 'Contact name must be at least 2 characters')
        .max(100, 'Contact name must be 100 characters or less'),

    /** Contact email - required, must be valid format */
    email: z
        .string()
        .email('Please enter a valid email address')
        .max(255, 'Email must be 255 characters or less'),

    /** Client status - must be one of the allowed values */
    status: z.enum([ClientStatus.ACTIVE, ClientStatus.INACTIVE, ClientStatus.ARCHIVED]),

    /** Optional logo URL - validated if provided */
    logoUrl: z
        .string()
        .url('Logo URL must be a valid URL')
        .nullable()
        .optional(),
})

/**
 * Type derived from clientSchema for form values.
 */
export type ClientFormValues = z.infer<typeof clientSchema>

/**
 * Default values for the client form.
 * Use when creating a new client or reset.
 */
export const defaultClientValues: ClientFormValues = {
    name: '',
    primaryContact: '',
    email: '',
    status: ClientStatus.ACTIVE,
    logoUrl: null,
}
