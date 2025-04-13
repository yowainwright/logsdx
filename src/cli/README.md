# LogsDX CLI

The LogsDX CLI is a command-line interface for processing and formatting logs with syntax highlighting and level-based styling.

## Features

- **Syntax Highlighting**: Automatically detects and highlights code blocks in logs
- **Log Level Styling**: Color-codes log entries based on their level (error, warn, info, debug, etc.)
- **Custom Parsers**: Extensible parser system for different log formats
- **Multiple Output Formats**: View logs in the terminal or save to files
- **Filtering**: Filter logs by minimum log level
- **JSON Formatting**: Pretty-prints JSON content in logs with syntax highlighting
- **Theme Support**: Multiple built-in themes and custom theme support
- **Configuration**: Customizable through config files and command-line options

## Installation

```bash
# Using npm
npm install -g logsdx

# Using yarn
yarn global add logsdx

# Using bun
bun install -g logsdx
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
