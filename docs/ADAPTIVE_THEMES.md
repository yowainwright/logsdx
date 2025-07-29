# Adaptive Themes Guide

LogsDX supports creating themes that automatically adapt to user preferences and system settings. This guide shows you how to create themes that respond to:

- System color scheme (light/dark mode)
- User accessibility preferences (high contrast, reduced motion)
- Terminal capabilities and environments
- Custom application themes

## Table of Contents

1. [System Color Scheme Detection](#system-color-scheme-detection)
2. [Creating Theme Variants](#creating-theme-variants)
3. [Dynamic Theme Switching](#dynamic-theme-switching)
4. [CSS Custom Properties](#css-custom-properties)
5. [Accessibility Considerations](#accessibility-considerations)
6. [Examples](#examples)

## System Color Scheme Detection

LogsDX can automatically detect and respond to system color preferences:

```typescript
import { getLogsDX } from 'logsdx'

// Automatically use light/dark variant based on system preference
const logger = getLogsDX({
  theme: 'auto', // Will use github-light or github-dark based on system
  autoDetect: true
})

// Or manually check preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const themeName = prefersDark ? 'github-dark' : 'github-light'
const logger = getLogsDX({ theme: themeName })
```

## Creating Theme Variants

### Method 1: Paired Themes

Create light and dark variants of your theme:

```typescript
import { createTheme } from 'logsdx'

// Light variant
const myThemeLight = createTheme({
  name: 'my-theme-light',
  description: 'Light variant of my custom theme',
  mode: 'light',
  colors: {
    primary: '#0969da',
    secondary: '#8250df',
    background: '#ffffff',
    text: '#1f2328',
    error: '#d1242f',
    warning: '#9a6700',
    success: '#1a7f37',
    info: '#0969da',
    muted: '#656d76'
  }
})

// Dark variant
const myThemeDark = createTheme({
  name: 'my-theme-dark',
  description: 'Dark variant of my custom theme',
  mode: 'dark',
  colors: {
    primary: '#58a6ff',
    secondary: '#bc8cff',
    background: '#0d1117',
    text: '#e6edf3',
    error: '#ff7b72',
    warning: '#d29922',
    success: '#3fb950',
    info: '#58a6ff',
    muted: '#8b949e'
  }
})
```

### Method 2: Adaptive Theme Class

Create a theme that adapts dynamically:

```typescript
class AdaptiveTheme {
  private lightTheme: Theme
  private darkTheme: Theme
  
  constructor(lightTheme: Theme, darkTheme: Theme) {
    this.lightTheme = lightTheme
    this.darkTheme = darkTheme
  }
  
  getCurrentTheme(): Theme {
    if (typeof window !== 'undefined') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return isDark ? this.darkTheme : this.lightTheme
    }
    
    // For Node.js, check environment variables
    const isDark = process.env.THEME_MODE === 'dark' || 
                   process.env.TERM_PROGRAM === 'iTerm.app'
    return isDark ? this.darkTheme : this.lightTheme
  }
  
  // Listen for theme changes
  watchChanges(callback: (theme: Theme) => void) {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        callback(e.matches ? this.darkTheme : this.lightTheme)
      })
    }
  }
}
```

## Dynamic Theme Switching

### React Hook Example

```typescript
import { useState, useEffect } from 'react'
import { getLogsDX, Theme } from 'logsdx'

export function useAdaptiveLogger(lightTheme: string, darkTheme: string) {
  const [logger, setLogger] = useState(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return getLogsDX({ theme: isDark ? darkTheme : lightTheme })
  })
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      const themeName = e.matches ? darkTheme : lightTheme
      setLogger(getLogsDX({ theme: themeName }))
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [lightTheme, darkTheme])
  
  return logger
}

// Usage
function MyComponent() {
  const logger = useAdaptiveLogger('github-light', 'github-dark')
  
  // Logger automatically switches between themes
  logger.processLine('INFO: Adaptive theming active')
}
```

### Vue Composable Example

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import { getLogsDX } from 'logsdx'

export function useAdaptiveLogger(lightTheme: string, darkTheme: string) {
  const logger = ref(null)
  
  const updateLogger = () => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    logger.value = getLogsDX({ theme: isDark ? darkTheme : lightTheme })
  }
  
  onMounted(() => {
    updateLogger()
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', updateLogger)
    
    onUnmounted(() => {
      mediaQuery.removeEventListener('change', updateLogger)
    })
  })
  
  return logger
}
```

## CSS Custom Properties

For browser environments, use CSS custom properties for dynamic theming:

```typescript
import { getLogsDX, getAllThemes } from 'logsdx'

// Generate CSS variables from theme
function generateThemeCSS(themeName: string): string {
  const themes = getAllThemes()
  const theme = themes[themeName]
  
  if (!theme || !theme.colorPalette) return ''
  
  const css = [`[data-theme="${themeName}"] {`]
  
  // Add color variables
  Object.entries(theme.colorPalette).forEach(([key, value]) => {
    css.push(`  --logsdx-${key}: ${value};`)
  })
  
  // Add semantic variables
  css.push(`  --logsdx-bg: var(--logsdx-background, ${theme.colorPalette.background || '#ffffff'});`)
  css.push(`  --logsdx-fg: var(--logsdx-text, ${theme.colorPalette.text || '#000000'});`)
  
  css.push('}')
  
  return css.join('\n')
}

// Apply to document
function applyThemeCSS() {
  const style = document.createElement('style')
  style.id = 'logsdx-theme-vars'
  
  // Generate CSS for all themes
  const themes = ['github-light', 'github-dark', 'dracula', 'solarized-light', 'solarized-dark']
  const css = themes.map(generateThemeCSS).join('\n\n')
  
  // Add media queries
  const adaptiveCSS = `
    @media (prefers-color-scheme: light) {
      :root { ${generateThemeCSS('github-light')} }
    }
    
    @media (prefers-color-scheme: dark) {
      :root { ${generateThemeCSS('github-dark')} }
    }
  `
  
  style.textContent = css + adaptiveCSS
  document.head.appendChild(style)
}
```

## Accessibility Considerations

### High Contrast Mode

```typescript
function createHighContrastTheme(baseTheme: Theme): Theme {
  return {
    ...baseTheme,
    name: `${baseTheme.name}-high-contrast`,
    colorPalette: {
      ...baseTheme.colorPalette,
      // Increase contrast for all colors
      primary: increaseContrast(baseTheme.colorPalette.primary),
      secondary: increaseContrast(baseTheme.colorPalette.secondary),
      // Use pure black/white for maximum contrast
      background: baseTheme.mode === 'dark' ? '#000000' : '#ffffff',
      text: baseTheme.mode === 'dark' ? '#ffffff' : '#000000'
    }
  }
}

// Detect high contrast preference
const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
```

### Reduced Motion

```typescript
// Detect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Apply to animations
const animationDuration = prefersReducedMotion ? '0s' : '0.3s'
```

## Examples

### Complete Adaptive Theme Setup

```typescript
import { getLogsDX, Theme } from 'logsdx'

class ThemeManager {
  private themes: Map<string, Theme> = new Map()
  private currentTheme: string
  private listeners: ((theme: string) => void)[] = []
  
  constructor() {
    // Register default theme pairs
    this.registerThemePair('github', 'github-light', 'github-dark')
    this.registerThemePair('solarized', 'solarized-light', 'solarized-dark')
    
    // Detect initial theme
    this.currentTheme = this.detectTheme()
    
    // Watch for changes
    this.watchSystemChanges()
  }
  
  registerThemePair(name: string, lightTheme: string, darkTheme: string) {
    this.themes.set(`${name}-light`, lightTheme)
    this.themes.set(`${name}-dark`, darkTheme)
  }
  
  detectTheme(): string {
    // Check user preference first
    const saved = localStorage.getItem('logsdx-theme')
    if (saved) return saved
    
    // Then check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches
    
    if (isHighContrast) {
      return isDark ? 'high-contrast-dark' : 'high-contrast-light'
    }
    
    return isDark ? 'github-dark' : 'github-light'
  }
  
  watchSystemChanges() {
    // Watch color scheme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', () => {
        this.updateTheme(this.detectTheme())
      })
    
    // Watch contrast changes
    window.matchMedia('(prefers-contrast: high)')
      .addEventListener('change', () => {
        this.updateTheme(this.detectTheme())
      })
  }
  
  updateTheme(theme: string) {
    this.currentTheme = theme
    document.documentElement.setAttribute('data-theme', theme)
    
    // Notify listeners
    this.listeners.forEach(listener => listener(theme))
  }
  
  getLogger() {
    return getLogsDX({ theme: this.currentTheme })
  }
  
  onChange(listener: (theme: string) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

// Usage
const themeManager = new ThemeManager()
const logger = themeManager.getLogger()

// React component
function App() {
  const [logger, setLogger] = useState(themeManager.getLogger())
  
  useEffect(() => {
    return themeManager.onChange(() => {
      setLogger(themeManager.getLogger())
    })
  }, [])
  
  return <div>{/* Your app */}</div>
}
```

### Terminal Adaptive Theming

```typescript
// For Node.js/Terminal environments
function getTerminalTheme(): string {
  // Check terminal color capability
  const colorSupport = process.stdout.isTTY && 
    (process.env.COLORTERM === 'truecolor' || 
     process.env.TERM_PROGRAM === 'vscode')
  
  if (!colorSupport) {
    return 'no-color' // Minimal theme without colors
  }
  
  // Check terminal background
  const isDarkTerminal = 
    process.env.COLORFGBG?.includes('0;15') || // Dark background
    process.env.TERM_PROGRAM === 'iTerm.app' ||
    process.env.TERMINAL_EMULATOR === 'JetBrains-JediTerm'
  
  return isDarkTerminal ? 'dracula' : 'github-light'
}

const logger = getLogsDX({ theme: getTerminalTheme() })
```

## Best Practices

1. **Always provide theme pairs** - Create both light and dark variants
2. **Test contrast ratios** - Ensure WCAG compliance for accessibility
3. **Cache theme preference** - Store user's choice in localStorage
4. **Provide manual override** - Let users choose their preferred theme
5. **Consider performance** - Don't recreate loggers unnecessarily
6. **Support no-preference** - Have a sensible default when no preference is set

## Theme Configuration Schema

```typescript
interface AdaptiveThemeConfig {
  // Base theme name
  name: string
  
  // Theme variants
  variants: {
    light: Theme
    dark: Theme
    highContrastLight?: Theme
    highContrastDark?: Theme
  }
  
  // Auto-detection settings
  autoDetect: {
    colorScheme: boolean
    contrast: boolean
    terminal: boolean
  }
  
  // Fallback theme
  fallback: 'light' | 'dark'
}
```