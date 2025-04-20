# LogsDX

A modern, extensible log viewer and formatter.

## Project Structure

```
packages/
├── core/           # Core package with main functionality
├── plugins/        # Official plugins
│   ├── prism/     # Prism.js syntax highlighting
│   └── shiki/     # Shiki syntax highlighting
├── themes/         # Official themes
│   └── synthwave/ # Synthwave theme
└── clients/        # Output clients
    └── html/      # HTML output client
```

## Development

```bash
# Install dependencies
bun install

# Start development environment
bun run dev

# Run tests
bun test

# Build all packages
bun run build

# Run linting and formatting
bun run check
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`bun install`)
4. Make your changes
5. Run tests (`bun test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT
