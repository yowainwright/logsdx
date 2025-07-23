# LogsDX Demo

This is a demonstration of LogsDX - a beautiful log styling library for terminal and browser.

## Features Demonstrated

- ✨ Built-in themes (oh-my-zsh, dracula, github-dark, solarized-light)
- 🎨 Custom theme creation with word and pattern matching
- 📱 HTML output for web environments
- 🎯 Pattern matching for IPs, timestamps, HTTP methods, status codes

## Usage

```bash
npm start
```

## What LogsDX Does

LogsDX transforms plain log text into beautifully styled output:

### Before (Plain logs)
```
2024-01-15 10:30:45 ERROR Database connection failed
GET /api/users/123 200 45ms
```

### After (Styled with LogsDX)
- **ERROR** appears in bold red
- **GET** appears in cyan
- **200** appears in bold green
- IP addresses are highlighted in cyan
- Timestamps are muted gray

## Output Formats

### Terminal/ANSI
Perfect for CLI tools and terminal applications with ANSI escape codes.

### HTML with CSS
Great for web applications - generates HTML with inline styles.

### HTML with Classes
Ideal for custom styling - generates HTML with CSS classes you can style.

## Learn More

- [LogsDX Documentation](https://github.com/your-repo/logsdx)
- [Theme Creation Guide](https://github.com/your-repo/logsdx/docs/themes)
- [API Reference](https://github.com/your-repo/logsdx/docs/api)