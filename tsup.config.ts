import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts', // Main library entry
    'src/cli/index.ts', // CLI entry
    'src/clients/react/index.tsx', // React client entry
    'src/themes/asci/styles.ts', // ASCII theme styles
    'src/logenhancer.ts', // LogEnhancer
    'src/plugins/shikiPlugin.ts', // Shiki plugin entry
    'src/plugins/prismPlugin.ts', // Prism plugin entry
    // Add other specific entry points needed by consumers
  ],
  format: ['esm', 'cjs'], // Output both ESModules and CommonJS
  dts: true, // Generate declaration files (.d.ts)
  splitting: true, // Code splitting for better tree-shaking
  sourcemap: true, // Generate sourcemaps
  clean: true, // Clean dist directory before build
  // If you have CSS that needs to be bundled with components:
  // loader: {
  //   '.css': 'css',
  // },
  // onSuccess: 'bun run build:css', // Optionally run tailwind build after tsup
}); 