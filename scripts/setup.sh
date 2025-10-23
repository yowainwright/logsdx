#!/bin/bash

set -e

echo "🚀 Setting up LogsDX development environment..."
echo ""

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed!"
    echo "📦 Please install Bun first: https://bun.sh"
    echo "   Run: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "✅ Bun found: $(bun --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
bun install

echo ""
echo "🔨 Building main package..."
bun run build

echo ""
echo "🎣 Setting up git hooks..."
bunx husky

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   • Run 'bun run dev' to start development server"
echo "   • Run 'bun test' to run tests"
echo "   • Run 'bun run lint' to check code quality"
echo "   • Run 'bun run format' to format code"
echo ""
echo "🌐 The site will be available at http://localhost:8573"
echo ""
