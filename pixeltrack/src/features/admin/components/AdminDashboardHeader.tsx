import { Loader2, Search, Plus, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/NotificationBell'
import { ADMIN_SEARCH_MIN_LENGTH } from '@/features/admin/hooks/useAdminSearch'
import { SEARCH_TYPE_CONFIG } from '@/features/admin/constants/dashboard'
import type { AdminDashboardSearchState } from '@/features/admin/hooks/useAdminDashboard'

interface AdminDashboardHeaderProps {
    searchState: AdminDashboardSearchState
    overdueCount: number
    onCreateProject: () => void
}

export function AdminDashboardHeader({ searchState, overdueCount, onCreateProject }: AdminDashboardHeaderProps) {
    const {
        searchQuery,
        setSearchQuery,
        showSearchDropdown,
        trimmedSearch,
        canTriggerSearch,
        searchResults,
        searchLoading,
        searchError,
        setIsSearchFocused,
        handleSearchBlur,
        handleSearchKeyDown,
        handleResultNavigation,
    } = searchState

    return (
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search projects, tasks, or files..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={handleSearchBlur}
                        onKeyDown={handleSearchKeyDown}
                        autoComplete="off"
                        className="w-full bg-muted/60 border border-transparent pl-10 focus:ring-2 focus:ring-ring/60"
                    />
                    {showSearchDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-border bg-card shadow-xl z-50">
                            <div className="max-h-96 overflow-y-auto">
                                {!canTriggerSearch ? (
                                    <p className="p-4 text-sm text-muted-foreground">
                                        Type at least {ADMIN_SEARCH_MIN_LENGTH} characters to search tasks, projects, clients, and files.
                                    </p>
                                ) : searchLoading ? (
                                    <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        Searching...
                                    </div>
                                ) : searchError ? (
                                    <p className="p-4 text-sm text-destructive">Unable to load search results. Please try again.</p>
                                ) : searchResults.length === 0 ? (
                                    <p className="p-4 text-sm text-muted-foreground">
                                        No matches for <span className="font-semibold text-foreground">“{trimmedSearch}”</span>
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-border/70" role="listbox" aria-label="Admin search results">
                                        {searchResults.map((result) => {
                                            const config = SEARCH_TYPE_CONFIG[result.type]
                                            const Icon = config.icon

                                            return (
                                                <li key={`${result.type}-${result.id}`}>
                                                    <button
                                                        type="button"
                                                        className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/40 focus:bg-muted/40 focus:outline-none transition-colors"
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={() => handleResultNavigation(result)}
                                                        aria-label={`Open ${config.label} ${result.title}`}
                                                        role="option"
                                                    >
                                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.backgroundClass} ${config.accentClass}`}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-foreground truncate">{result.title}</p>
                                                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                {result.subtitle && <span className="truncate">{result.subtitle}</span>}
                                                                {result.subtitle && result.metadata && <span>•</span>}
                                                                {result.metadata && <span className="truncate">{result.metadata}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
                                                            {config.label}
                                                            {result.type === 'file' && (
                                                                <p className="text-[10px] font-normal normal-case text-muted-foreground">
                                                                    {result.isExternalLink ? 'External link' : 'Storage file'}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-muted-foreground/70" />
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <NotificationBell overdueCount={overdueCount} />
                <Button onClick={onCreateProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                </Button>
            </div>
        </header>
    )
}
