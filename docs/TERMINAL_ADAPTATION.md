# Terminal Background Adaptation

LogsDX automatically detects your terminal's background color and adjusts themes for optimal visibility. This prevents issues like dark text on dark backgrounds.

## The Problem

Light themes (like `github-light` or `solarized-light`) use dark text colors designed for light backgrounds. When used in dark terminals, the text becomes nearly invisible.

## The Solution

LogsDX includes automatic terminal background detection that:

1. **Detects Terminal Background** - Checks environment variables and terminal programs
2. **Adjusts Theme Selection** - Automatically uses dark variants in dark terminals
3. **Modifies Text Colors** - Ensures text remains visible regardless of theme

## How It Works

```typescript
// Automatic adjustment (default behavior)
const logger = getLogsDX({ theme: 'github-light' })
// In dark terminal: automatically uses github-dark

// Disable auto-adjustment if needed
const logger = getLogsDX({ 
  theme: 'github-light',
  autoAdjustTerminal: false 
})
```

## Terminal Detection

LogsDX detects dark terminals by checking:

- `COLORFGBG` environment variable
- `TERM_PROGRAM` (iTerm, Hyper, VSCode, etc.)
- `TERMINAL_EMULATOR` settings
- Common terminal indicators

## Theme Mappings

| Requested Theme | Dark Terminal | Light Terminal |
|----------------|---------------|----------------|
| github-light   | github-dark   | github-light   |
| solarized-light| solarized-dark| solarized-light|
| github-dark    | github-dark   | github-dark    |
| solarized-dark | solarized-dark| solarized-dark |
| dracula        | dracula       | dracula        |
| oh-my-zsh      | oh-my-zsh     | oh-my-zsh      |

## Examples

### Before (No Adaptation)
```
# github-light in dark terminal
[Nearly invisible dark text on dark background]
```

### After (With Adaptation)
```
# github-light → github-dark (auto-adjusted)
[Clearly visible light text on dark background]
```

## Configuration Options

```typescript
interface LogsDXOptions {
  // Enable/disable automatic terminal adaptation
  autoAdjustTerminal?: boolean // default: true
}
```

## Testing Your Terminal

Run this command to see what LogsDX detects:

```bash
bun run scripts/test-terminal-adaptation.ts
```

This will show:
- Your terminal environment variables
- The original vs adjusted theme
- Side-by-side comparison of outputs

## Best Practices

1. **Use Theme Pairs** - Always provide both light and dark variants
2. **Test Both Modes** - Check your logs in both light and dark terminals
3. **Document Behavior** - Let users know about automatic adjustments
4. **Provide Override** - Allow users to disable auto-adjustment if needed

## Manual Theme Selection

If you prefer manual control:

```typescript
// Detect terminal yourself
const isDarkTerminal = process.env.COLORFGBG?.includes('0;')

// Choose theme accordingly
const themeName = isDarkTerminal ? 'github-dark' : 'github-light'
const logger = getLogsDX({ 
  theme: themeName,
  autoAdjustTerminal: false 
})
```