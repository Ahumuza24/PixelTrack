export type SearchResultType = 'task' | 'project' | 'client' | 'file'

export interface AdminSearchResultItem {
    id: string
    type: SearchResultType
    title: string
    subtitle?: string | null
    metadata?: string | null
    navigationTarget?: string
    storagePath?: string | null
    externalUrl?: string | null
    isExternalLink?: boolean
    score: number
}

export interface AdminSearchResults {
    results: AdminSearchResultItem[]
}
