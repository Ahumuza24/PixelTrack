import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Shield, UserCircle, Building2, Lock, Loader2 } from 'lucide-react'
import { userSchema, defaultUserValues, type UserFormValues } from '../schemas/userSchema'
import { UserRole, type UserProfile, type Client } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface UserFormProps {
    /** Existing user data when editing, undefined when creating */
    user?: UserProfile
    /** Available clients for assignment (when role is CLIENT) */
    clients?: Client[]
    /** Called when form is submitted successfully */
    onSubmit: (data: UserFormValues) => Promise<void>
    /** Called when user cancels the form */
    onCancel: () => void
    /** Loading state during submission */
    isSubmitting?: boolean
}

/**
 * UserForm - Create or edit users (admin only).
 *
 * Features:
 * - Display name, email fields
 * - Role selector (Admin/Employee/Client)
 * - Client assignment dropdown (shown only when role is CLIENT)
 * - Password field (required for new users)
 * - Full validation with React Hook Form + Zod
 *
 * @example
 * ```tsx
 * <UserForm
 *   clients={clients}
 *   onSubmit={async (data) => {
 *     await createUser(data)
 *     toast.success('User created')
 *   }}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function UserForm({
    user,
    clients = [],
    onSubmit,
    onCancel,
    isSubmitting = false,
}: UserFormProps) {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: user
            ? {
                  displayName: user.displayName,
                  email: user.email,
                  role: user.role,
                  clientId: user.clientId ?? null,
                  password: '', // Password not shown when editing
              }
            : defaultUserValues,
    })

    const currentRole = useWatch({ control, name: 'role' }) ?? UserRole.EMPLOYEE
    const isClientRole = currentRole === UserRole.CLIENT

    const roleOptions = [
        {
            value: UserRole.ADMIN,
            label: 'Admin',
            description: 'Full access to all features',
            icon: Shield,
            color: 'bg-purple-100 text-purple-700 border-purple-200',
        },
        {
            value: UserRole.EMPLOYEE,
            label: 'Employee',
            description: 'Can manage assigned tasks',
            icon: UserCircle,
            color: 'bg-blue-100 text-blue-700 border-blue-200',
        },
        {
            value: UserRole.CLIENT,
            label: 'Client',
            description: 'Limited to their company tasks',
            icon: Building2,
            color: 'bg-green-100 text-green-700 border-green-200',
        },
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Display Name */}
            <div className="space-y-2">
                <Label htmlFor="displayName" className={cn(errors.displayName && 'text-red-500')}>
                    Full Name *
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        id="displayName"
                        placeholder="Jane Doe"
                        className={cn(
                            'pl-10',
                            errors.displayName && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        {...register('displayName')}
                    />
                </div>
                {errors.displayName && (
                    <p className="text-xs text-red-500">{errors.displayName.message}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className={cn(errors.email && 'text-red-500')}>
                    Email Address *
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="jane@company.com"
                        disabled={!!user} // Email cannot be changed after creation
                        className={cn(
                            'pl-10',
                            user && 'bg-slate-50 cursor-not-allowed',
                            errors.email && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        {...register('email')}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                {user && <p className="text-xs text-slate-500">Email cannot be changed</p>}
            </div>

            {/* Password (only for new users) */}
            {!user && (
                <div className="space-y-2">
                    <Label htmlFor="password" className={cn(errors.password && 'text-red-500')}>
                        Initial Password *
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className={cn(
                                'pl-10',
                                errors.password && 'border-red-500 focus-visible:ring-red-500'
                            )}
                            {...register('password')}
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs text-red-500">{errors.password.message}</p>
                    )}
                    <p className="text-xs text-slate-500">User will be prompted to change on first login</p>
                </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
                <Label>Role *</Label>
                <div className="grid grid-cols-1 gap-3">
                    {roleOptions.map((option) => {
                        const Icon = option.icon
                        const isSelected = currentRole === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setValue('role', option.value, { shouldValidate: true })}
                                className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all',
                                    isSelected
                                        ? option.color
                                        : 'border-slate-200 hover:border-slate-300 bg-white'
                                )}
                            >
                                <Icon className={cn('w-5 h-5 mt-0.5', isSelected ? '' : 'text-slate-400')} />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">{option.label}</div>
                                    <div className={cn('text-xs', isSelected ? '' : 'text-slate-500')}>
                                        {option.description}
                                    </div>
                                </div>
                                <div
                                    className={cn(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                                        isSelected ? 'border-current' : 'border-slate-300'
                                    )}
                                >
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                                </div>
                            </button>
                        )
                    })}
                </div>
                <input type="hidden" {...register('role')} />
                {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
            </div>

            {/* Client Assignment (only when role is CLIENT) */}
            {isClientRole && (
                <div className="space-y-2">
                    <Label htmlFor="clientId" className={cn(errors.clientId && 'text-red-500')}>
                        Assigned Client *
                    </Label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            id="clientId"
                            {...register('clientId')}
                            className={cn(
                                'w-full pl-10 pr-4 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-cobalt/20 focus:border-cobalt outline-none',
                                errors.clientId && 'border-red-500 focus-visible:ring-red-500'
                            )}
                        >
                            <option value="">Select a client company...</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.clientId && (
                        <p className="text-xs text-red-500">{errors.clientId.message}</p>
                    )}
                    {clients.length === 0 && (
                        <p className="text-xs text-amber-600">
                            No active clients available. Create clients first.
                        </p>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-cobalt hover:bg-cobalt-600"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {user ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>{user ? 'Update User' : 'Create User'}</>
                    )}
                </Button>
            </div>
        </form>
    )
}
