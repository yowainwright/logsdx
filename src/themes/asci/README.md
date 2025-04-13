# LogsDX Theme System

The LogsDX theme system provides a flexible and powerful way to customize the appearance of log output. It supports both built-in themes and custom themes, with comprehensive styling options for various log elements.

## Features

- **Built-in Themes**: Choose from default, dark, light, and minimal themes
- **Custom Themes**: Create and use your own themes
- **Pattern-based Styling**: Style text based on regex patterns
- **Comprehensive Styling**: Support for colors, bold, dim, italic, and hex colors
- **Efficient Caching**: Styles are cached for better performance
- **Theme Configuration**: Load themes from config files or create them programmatically

## Built-in Themes

### Default Theme
The default theme uses standard terminal colors with a balanced color scheme.

### Dark Theme
A dark theme inspired by the Dracula color palette, perfect for dark terminals.

### Light Theme
A light theme using Material Design colors, ideal for light terminals.

### Minimal Theme
A minimal theme with reduced color usage, suitable for terminals with limited color support.

## Using Themes

### Basic Usage

```typescript
import { styleLine, setTheme } from '@/src/themes/asci/styles';

// Use a built-in theme
setTheme('dark');

// Style a log line
const styledLine = styleLine('ERROR: Something went wrong', { level: 'error' });
```

### Custom Themes

You can create custom themes by extending the default theme or creating a new one from scratch:

```typescript
import { setTheme, type ThemeConfig } from '@/src/themes/asci/styles';

// Create a custom theme
const customTheme: Partial<ThemeConfig> = {
  name: 'custom',
  levels: {
    error: { color: '#ff0000', bold: true },
    warn: { color: '#ffa500', bold: true },
    info: { color: '#0000ff', italic: true },
    debug: { color: '#808080', dim: true },
    success: { color: '#00ff00', bold: true },
    trace: { color: '#ffffff', dim: true },
  },
  fields: {
    timestamp: { color: '#808080', dim: true },
    service: { color: '#00ffff', bold: true },
    // Add more field styles as needed
  },
  status: {
    success: { color: '#00ff00', bold: true },
    failure: { color: '#ff0000', bold: true },
    // Add more status styles as needed
  },
  patterns: {
    error: { regex: /\b(error|exception|failed|failure)\b/i, color: '#ff0000', bold: true },
    warning: { regex: /\b(warning|warn|caution)\b/i, color: '#ffa500', bold: true },
    // Add more pattern styles as needed
  },
  elements: {
    brackets: { color: '#808080' },
    keyValue: {
      key: { color: '#00ffff', bold: true },
      separator: { color: '#808080' },
      value: { color: '#ffffff' },
    },
  },
};

// Apply the custom theme
setTheme(customTheme);
```

### Theme Configuration Files

You can define themes in configuration files:

```json
{
  "theme": "dark",
  "customThemes": {
    "my-custom-theme": {
      "levels": {
        "error": { "color": "#ff0000", "bold": true },
        "warn": { "color": "#ffa500", "bold": true },
        "info": { "color": "#0000ff", "italic": true }
      }
    }
  }
}
```

Save this as `.logsdxrc` or `.logsdxrc.json` in your project root or as `.config/logsdx/config.json` in your home directory.

## Theme Configuration

### Theme Structure

A theme consists of the following components:

- **levels**: Styles for different log levels (error, warn, info, debug, success, trace)
- **fields**: Styles for specific log fields (timestamp, service, action, etc.)
- **status**: Styles for status indicators (success, failure, error, etc.)
- **patterns**: Regex-based pattern styling
- **elements**: Styles for UI elements (brackets, key-value pairs)

### Style Properties

Each style can have the following properties:

- **color**: A chalk color name or hex color (e.g., 'red', '#ff0000')
- **bold**: Whether to apply bold styling
- **dim**: Whether to apply dim styling
- **italic**: Whether to apply italic styling

## Advanced Usage

### Pattern-based Styling

The theme system supports regex-based pattern styling:

```typescript
import { styleManager } from '@/src/themes/asci/styles';

// Apply pattern styles to text
const styledText = styleManager.applyPatternStyles('Error occurred at https://example.com');
```

### JSON Formatting

Format JSON with theme colors:

```typescript
import { styleManager } from '@/src/themes/asci/styles';

// Format JSON with theme colors
const formattedJson = styleManager.formatJson({
  error: 'Something went wrong',
  timestamp: '2023-01-01T12:00:00Z',
  service: 'api',
});
```

### Accessing Theme Styles

Access theme styles directly:

```typescript
import { styleManager } from '@/src/themes/asci/styles';

// Get level style
const errorStyle = styleManager.getLevelStyle('error');

// Get field style
const timestampStyle = styleManager.getFieldStyle('timestamp');

// Get status style
const successStyle = styleManager.getStatusStyle('success');

// Get bracket style
const bracketStyle = styleManager.getBracketStyle();

// Get key-value styles
const { key, separator, value } = styleManager.getKeyValueStyles();
```

## Best Practices

1. **Use Built-in Themes**: Start with built-in themes before creating custom ones
2. **Extend Default Theme**: When creating custom themes, extend the default theme
3. **Use Hex Colors**: For precise color control, use hex colors
4. **Cache Styles**: The StyleManager automatically caches styles for better performance
5. **Test Themes**: Test your themes in different terminal environments

## Troubleshooting

- **Colors Not Showing**: Ensure your terminal supports ANSI colors
- **Theme Not Applying**: Check that the theme name is correct or the theme object is valid
- **Patterns Not Matching**: Verify your regex patterns are correct
- **Performance Issues**: The StyleManager caches styles, but excessive theme switching can impact performance 