import type { LucideIcon } from 'lucide-react'
import {
    Folder,
    FileText,
    Image,
    FileImage,
    Archive,
    Link,
} from 'lucide-react'

export const FILE_ICONS: Record<string, LucideIcon> = {
    folder: Folder,
    'image/png': Image,
    'image/jpeg': Image,
    'image/svg+xml': FileImage,
    'application/pdf': FileText,
    'application/zip': Archive,
    'external-link': Link,
    default: FileText,
}

export const FILE_COLORS: Record<string, string> = {
    folder: 'text-yellow-500',
    'image/png': 'text-blue-500',
    'image/jpeg': 'text-blue-500',
    'image/svg+xml': 'text-purple-500',
    'application/pdf': 'text-red-500',
    'application/zip': 'text-slate-500',
    'external-link': 'text-purple-500',
    default: 'text-slate-500',
}

export const FileFilterType = {
    IMAGE: 'image',
    DOCUMENT: 'document',
    SOURCE: 'source',
} as const

export type FileFilterType = typeof FileFilterType[keyof typeof FileFilterType]

export const FILE_TYPE_LABELS: Record<FileFilterType, string> = {
    [FileFilterType.IMAGE]: 'Images',
    [FileFilterType.DOCUMENT]: 'Documents',
    [FileFilterType.SOURCE]: 'Source Files',
}
