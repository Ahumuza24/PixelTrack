import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, User, Mail, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { clientSchema, defaultClientValues, type ClientFormValues } from '../schemas/clientSchema'
import { ClientStatus, type Client } from '@/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ClientFormProps {
    /** Existing client data when editing, undefined when creating */
    client?: Client
    /** Called when form is submitted successfully */
    onSubmit: (data: ClientFormValues) => Promise<void>
    /** Called when user cancels the form */
    onCancel: () => void
    /** Loading state during submission */
    isSubmitting?: boolean
}

/**
 * ClientForm - Create or edit client companies.
 *
 * Features:
 * - Company name, primary contact, email fields
 * - Status selector (Active/Inactive/Archived)
 * - Logo upload with preview
 * - Full validation with React Hook Form + Zod
 *
 * @example
 * ```tsx
 * <ClientForm
 *   onSubmit={async (data) => {
 *     await createClient(data)
 *     toast.success('Client created')
 *   }}
 *   onCancel={() => setIsOpen(false)}
 * />
 * ```
 */
export function ClientForm({ client, onSubmit, onCancel, isSubmitting = false }: ClientFormProps) {
    const [logoPreview, setLogoPreview] = useState<string | null>(client?.logoUrl ?? null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: client
            ? {
                  name: client.name,
                  primaryContact: client.primaryContact,
                  email: client.email,
                  status: client.status,
                  logoUrl: client.logoUrl,
              }
            : defaultClientValues,
    })

    const currentStatus = watch('status')

    const handleLogoUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Logo must be less than 5MB')
            return
        }

        setIsUploading(true)
        try {
            const reader = new FileReader()
            reader.onload = (e) => {
                const result = e.target?.result as string
                setLogoPreview(result)
                setValue('logoUrl', result)
            }
            reader.readAsDataURL(file)
            toast.success('Logo preview loaded')
        } catch {
            toast.error('Failed to process logo')
        } finally {
            setIsUploading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleLogoUpload(file)
        }
    }

    const clearLogo = () => {
        setLogoPreview(null)
        setValue('logoUrl', null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const statusOptions = [
        { value: ClientStatus.ACTIVE, label: 'Active', color: 'bg-green-100 text-green-700' },
        { value: ClientStatus.INACTIVE, label: 'Inactive', color: 'bg-slate-100 text-slate-600' },
        { value: ClientStatus.ARCHIVED, label: 'Archived', color: 'bg-gray-100 text-gray-600' },
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Logo Upload Section */}
            <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                    {logoPreview ? (
                        <div className="relative">
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-20 h-20 object-contain rounded-lg border border-slate-200 bg-white"
                            />
                            <button
                                type="button"
                                onClick={clearLogo}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                aria-label="Remove logo"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-slate-300" />
                        </div>
                    )}
                    <div className="flex-1">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="logo-upload"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="w-full justify-center"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, or WebP up to 5MB</p>
                    </div>
                </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
                <Label htmlFor="name" className={cn(errors.name && 'text-red-500')}>
                    Company Name *
                </Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        id="name"
                        placeholder="Acme Design Co"
                        className={cn('pl-10', errors.name && 'border-red-500 focus-visible:ring-red-500')}
                        {...register('name')}
                    />
                </div>
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Primary Contact */}
            <div className="space-y-2">
                <Label htmlFor="primaryContact" className={cn(errors.primaryContact && 'text-red-500')}>
                    Primary Contact *
                </Label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        id="primaryContact"
                        placeholder="Jane Doe"
                        className={cn('pl-10', errors.primaryContact && 'border-red-500 focus-visible:ring-red-500')}
                        {...register('primaryContact')}
                    />
                </div>
                {errors.primaryContact && (
                    <p className="text-xs text-red-500">{errors.primaryContact.message}</p>
                )}
            </div>

            {/* Email */}
            <div className="space-y-2">
                <Label htmlFor="email" className={cn(errors.email && 'text-red-500')}>
                    Contact Email *
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="jane@acme.com"
                        className={cn('pl-10', errors.email && 'border-red-500 focus-visible:ring-red-500')}
                        {...register('email')}
                    />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setValue('status', option.value)}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                currentStatus === option.value
                                    ? option.color
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
                <input type="hidden" {...register('status')} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1 bg-cobalt hover:bg-cobalt-600">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {client ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>{client ? 'Update Client' : 'Create Client'}</>
                    )}
                </Button>
            </div>
        </form>
    )
}
