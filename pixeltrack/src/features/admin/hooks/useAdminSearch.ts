import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { searchAdminEntities } from '@/lib/supabase/search'
import type { AdminSearchResultItem } from '@/types/search'

export const ADMIN_SEARCH_MIN_LENGTH = 3

export function useAdminSearch(query: string) {
    const debouncedQuery = useDebouncedValue(query, 300)
    const trimmed = debouncedQuery.trim()

    return useQuery<AdminSearchResultItem[]>({
        queryKey: ['admin-search', trimmed],
        queryFn: async () => {
            const response = await searchAdminEntities(trimmed)
            return response.results
        },
        enabled: trimmed.length >= ADMIN_SEARCH_MIN_LENGTH,
        staleTime: 1000 * 30,
        gcTime: 1000 * 60,
    })
}
