import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/cli/index.ts', 
    'src/clients/react/index.tsx', 
    'src/themes/asci/index.ts',
    'src/logenhancer.ts',
    'src/plugins/shikiPlugin.ts',
    'src/plugins/prismPlugin.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  loader: {
    '.css': 'css',
  },
  onSuccess: 'bun run build:css',
}); 