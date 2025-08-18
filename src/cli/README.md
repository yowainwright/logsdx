# LogsDX CLI

LogsDX CLI provides command-line tools for applying isomorphic themes to logs, with features for theme creation, real-time processing, and multi-format output.

## File Structure

```
src/cli/
├── index.ts              # Main CLI entry point and command definitions
├── interactive.ts        # Interactive mode for live log viewing
├── ui.ts                # UI components (banners, spinners, boxes)
├── types.ts             # TypeScript types and interfaces
├── theme/               # Theme management
│   ├── generator.ts     # Interactive theme creator
│   └── transporter.ts   # Theme import/export functionality
└── commands/            # Command implementations
    └── theme.ts         # Theme command with subcommands
```

## Features

- **Isomorphic Themes**: Themes work identically in terminal (ANSI) and browser (HTML)
- **Theme Creation**: Interactive wizard for creating custom themes with live preview
- **Real-time Processing**: Stream and process logs as they're generated
- **Multi-format Output**: ANSI for terminal, HTML with CSS or class names for web
- **Interactive Mode**: Live viewing with theme switching and keyboard navigation
- **Import/Export**: Share themes as JSON or TypeScript modules
- **WCAG Compliance**: Built-in accessibility checking for color contrast
- **Pattern Matching**: Regex-based highlighting with multiple matching strategies

## Installation

```bash
# Using npm
npm install -g logsdx
```

## Usage

### Basic Usage

```bash
# Process a log file
logsdx input.log

# Process stdin
cat input.log | logsdx

# Save output to a file
logsdx input.log --output formatted.log
```

### Command Line Options

- `-q, --quiet`: Suppress all output except errors
- `-d, --debug`: Enable debug mode
- `-l, --level <level>`: Minimum log level to display (default: "info")
- `-p, --parser <parser>`: Parser to use for log parsing (default: "default")
- `-r, --rules <file>`: Path to custom rules file
- `-o, --output <file>`: Path to output file
- `--list-parsers`: List available parsers
- `-t, --theme <theme>`: Theme to use (default, dark, light, minimal, or custom theme name)
- `--list-themes`: List available themes

### Log Levels

The following log levels are supported, in order of increasing priority:

- `debug`: Detailed information for debugging
- `info`: General information about program execution
- `warn`: Warning messages for potentially harmful situations
- `error`: Error events that might still allow the application to continue running
- `success`: Successful operations
- `trace`: More detailed information than debug

## Examples

### Filtering by Log Level

```bash
# Only show error and warning messages
logsdx input.log --level warn
```

### Using a Custom Parser

```bash
# List available parsers
logsdx --list-parsers

# Use a specific parser
logsdx input.log --parser json
```

### Using Themes

```bash
# List available themes
logsdx --list-themes

# Use a specific theme
logsdx input.log --theme dark

# Use a custom theme
logsdx input.log --theme my-custom-theme
```

### Custom Rules

```bash
# Use custom parsing rules
logsdx input.log --rules my-rules.json
```
