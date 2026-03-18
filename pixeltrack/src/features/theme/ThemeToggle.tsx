import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeMode } from './ThemeContext'

interface ThemeToggleProps {
    className?: string
    size?: 'sm' | 'default'
}

export function ThemeToggle({ className, size = 'default' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useThemeMode()
    const isDark = theme === 'dark'

    return (
        <Button
            type="button"
            variant="ghost"
            size={size === 'sm' ? 'sm' : 'icon'}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
            className={className}
        >
            <Sun className={`h-4 w-4 ${isDark ? 'hidden' : 'block'}`} />
            <Moon className={`h-4 w-4 ${isDark ? 'block' : 'hidden'}`} />
        </Button>
    )
}
