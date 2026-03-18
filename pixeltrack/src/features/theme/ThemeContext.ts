import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark'

export interface ThemeContextValue {
    theme: ThemeMode
    setTheme: (mode: ThemeMode) => void
    toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useThemeMode(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider')
    }
    return context
}
