import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { signIn } from '@/lib/firebase/auth'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { useAuth } from '@/features/auth/useAuth'
import { ROLE_HOME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

/**
 * Login page — the entry point for all unauthenticated users.
 * Implements email/password auth with React Hook Form + Zod validation.
 */
export function LoginPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [showPassword, setShowPassword] = useState(false)

    // Redirect already-authenticated users to their home
    if (user) {
        navigate(ROLE_HOME[user.role], { replace: true })
    }

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await signIn(data.email, data.password)
            // AuthContext will update; redirect happens via AuthGuard / useEffect in AuthContext
            // We explicitly navigate after auth resolves in context, handled below
        } catch (err: unknown) {
            const message =
                err instanceof Error && err.message.includes('invalid-credential')
                    ? 'Invalid email or password. Please try again.'
                    : 'Sign in failed. Please try again.'
            toast.error(message)
        }
    }

    return (
        <div className="relative flex h-screen w-full flex-col bg-white overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-cobalt/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-cobalt/5 rounded-full blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(#0047AB 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex h-full grow flex-col items-center justify-center px-4">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10">
                    <div className="flex items-center gap-3 text-slate-900 mb-2">
                        <div className="w-10 h-10 bg-cobalt flex items-center justify-center rounded-xl shadow-lg shadow-cobalt/20">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    clipRule="evenodd"
                                    d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Pixel Track</h1>
                    </div>
                    <p className="text-slate-500 text-sm">Design agency management simplified.</p>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-xl shadow-2xl p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                        <p className="text-slate-500 mt-1">Please enter your details to sign in.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@agency.com"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? 'email-error' : undefined}
                                    className={cn(
                                        'w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cobalt/20 focus:border-cobalt outline-none transition-all text-sm',
                                        errors.email ? 'border-red-400' : 'border-slate-200',
                                    )}
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && (
                                <p id="email-error" className="text-xs text-red-500 mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-xs font-semibold text-cobalt hover:underline transition-all"
                                    onClick={() => toast.info('Password reset is not yet available. Contact your admin.')}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? 'password-error' : undefined}
                                    className={cn(
                                        'w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cobalt/20 focus:border-cobalt outline-none transition-all text-sm',
                                        errors.password ? 'border-red-400' : 'border-slate-200',
                                    )}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    onClick={() => setShowPassword((v) => !v)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p id="password-error" className="text-xs text-red-500 mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            aria-busy={isSubmitting}
                            className={cn(
                                'w-full bg-cobalt hover:bg-cobalt-600 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-cobalt/20 flex items-center justify-center gap-2 cursor-pointer',
                                isSubmitting && 'opacity-70 cursor-not-allowed',
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    <span>Signing in…</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <span className="font-semibold text-cobalt">Contact your admin</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 flex items-center gap-6 text-xs text-slate-400 font-medium uppercase tracking-widest">
                    <button type="button" className="hover:text-cobalt transition-colors cursor-pointer">Privacy Policy</button>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <button type="button" className="hover:text-cobalt transition-colors cursor-pointer">Terms of Service</button>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <button type="button" className="hover:text-cobalt transition-colors cursor-pointer">Support</button>
                </div>
            </div>
        </div>
    )
}
