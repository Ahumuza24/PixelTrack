import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeMode } from './ThemeContext'

const THEME_STORAGE_KEY = 'pixeltrack-theme'

function getPreferredTheme(): ThemeMode {
    if (typeof window === 'undefined') {
        return 'light'
    }

    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
        return stored
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
}

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme())

    const applyTheme = useCallback((mode: ThemeMode) => {
        if (typeof document === 'undefined') return
        const root = document.documentElement
        if (mode === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }
        root.style.colorScheme = mode
    }, [])

    useEffect(() => {
        applyTheme(theme)
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme)
        }
    }, [applyTheme, theme])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const listener = (event: MediaQueryListEvent) => {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
            if (!stored) {
                setTheme(event.matches ? 'dark' : 'light')
            }
        }

        media.addEventListener('change', listener)
        return () => media.removeEventListener('change', listener)
    }, [])

    const value = useMemo(() => {
        const toggleTheme = () => {
            setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
        return { theme, setTheme, toggleTheme }
    }, [theme])

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
