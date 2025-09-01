# LogsDX Interactive Theme Creator

The LogsDX theme creator is an interactive CLI tool that guides you through creating custom themes for your log styling needs.

## Getting Started

Run the theme creator with:

```bash
bun run create-theme
```

> **Note:** The theme creator uses `@inquirer/prompts` for an enhanced interactive experience. This dependency is automatically installed with LogsDX.

## Features

### 🎨 Interactive Color Selection

- Choose from predefined color presets (Vibrant, Pastel, Neon, Earth, Ocean)
- Customize each color individually with live preview
- Supports hex color codes

### 📋 Feature Presets

Select which log features to highlight:

- Log levels (ERROR, WARN, INFO, DEBUG)
- Numbers and numeric values
- Dates and timestamps
- Boolean values (true, false, null)
- Brackets and punctuation
- Quoted strings

### 🔍 Custom Patterns

Add custom regex patterns to highlight specific text:

- IP addresses
- UUIDs
- Email addresses
- Custom identifiers

### ✨ Custom Word Highlighting

Highlight specific words with custom colors and styles:

- Choose color from theme palette
- Add styles: bold, italic, underline, blink

### ♿ Accessibility Features

- Automatic WCAG compliance checking
- Shows accessibility score and level (A, AA, AAA)
- Auto-fix option for contrast issues
- Validates theme colors for readability

### 💾 Export Options

Save your theme in multiple formats:

- **JSON file**: For direct use with `--config`
- **TypeScript file**: For importing in code
- **Clipboard**: Quick copy for sharing
- **Register**: Use immediately in current session

## Example Workflow

1. **Theme Information**

   ```
   Theme name: my-awesome-theme
   Description: A vibrant theme for production logs
   Mode: Dark
   ```

2. **Color Configuration**
   - Select a preset or start from scratch
   - Customize each color with live preview
   - See sample logs rendered with your colors

3. **Feature Selection**
   - Choose which log features to highlight
   - Add custom regex patterns for your use case
   - Define custom words with special styling

4. **Accessibility Check**
   - Review WCAG compliance score
   - Auto-fix contrast issues if needed
   - Ensure readability across different displays

5. **Save & Use**

   ```bash
   # Save as JSON
   logsdx --config ./themes/my-awesome-theme.json input.log

   # Or register for immediate use
   logsdx --theme my-awesome-theme input.log
   ```

## Color Presets

### Vibrant

Bright, high-contrast colors perfect for dark terminals

### Pastel

Soft, muted colors that are easy on the eyes

### Neon

Bold, fluorescent colors for maximum visibility

### Earth

Natural, warm tones inspired by nature

### Ocean

Cool blues and teals with calming effect

## Tips

- Use the live preview to see how your theme looks with real log data
- Test your theme with both light and dark terminal backgrounds
- Consider accessibility - aim for at least AA compliance
- Export to TypeScript for version control and sharing
- Use custom patterns to highlight domain-specific content

## Advanced Usage

### Extending Existing Themes

After creating a theme, you can extend it programmatically:

```typescript
import { extendTheme } from "logsdx";
import { myAwesomeTheme } from "./themes/my-awesome-theme";

const extendedTheme = extendTheme(myAwesomeTheme, {
  customWords: {
    CRITICAL: { color: "error", styleCodes: ["bold", "blink"] },
  },
});
```

### Batch Theme Creation

Create multiple theme variants:

```typescript
import { generateThemeVariants } from "logsdx";

const { light, dark } = generateThemeVariants({
  name: "my-theme",
  colors: {
    /* ... */
  },
});
```

## Integration

Themes created with the interactive tool are fully compatible with:

- LogsDX CLI (`--theme` flag)
- Configuration files (`.logsdxrc`)
- Programmatic API
- Web browser rendering
- CI/CD pipelines
