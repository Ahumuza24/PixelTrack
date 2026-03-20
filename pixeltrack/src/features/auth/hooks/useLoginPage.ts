import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { ROLE_HOME } from '@/lib/constants'
import { useAuth } from '@/features/auth/useAuth'
import { signIn } from '@/lib/supabase/auth'

type LoginLocationState = {
    from?: string
}

interface UseLoginPageResult {
    form: UseFormReturn<LoginFormValues>
    showPassword: boolean
    toggleShowPassword: () => void
    redirectTarget: string | null
    handlers: {
        handleSubmitForm: (values: LoginFormValues) => Promise<void>
        handleForgotPassword: () => void
    }
}

export function useLoginPage(): UseLoginPageResult {
    const location = useLocation()
    const { user } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const redirectTarget = useMemo(() => {
        if (!user) return null
        const state = location.state as LoginLocationState | null
        return state?.from ?? ROLE_HOME[user.role]
    }, [location.state, user])

    const toggleShowPassword = useCallback(() => {
        setShowPassword((prev) => !prev)
    }, [])

    const handleForgotPassword = useCallback(() => {
        toast.info('Password reset is not yet available. Contact your admin.')
    }, [])

    const handleSubmitForm = useCallback(async (data: LoginFormValues) => {
        try {
            await signIn(data.email, data.password)
        } catch (err: unknown) {
            const message =
                err instanceof Error && err.message.includes('invalid-credential')
                    ? 'Invalid email or password. Please try again.'
                    : 'Sign in failed. Please try again.'
            toast.error(message)
        }
    }, [])

    return {
        form,
        showPassword,
        toggleShowPassword,
        redirectTarget,
        handlers: {
            handleSubmitForm,
            handleForgotPassword,
        },
    }
}
