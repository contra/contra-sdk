import { defineConfig } from 'tsup';

export default defineConfig([
  // ES modules and CommonJS
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    treeshake: true,
    minify: true,
    external: ['@contra/types', '@contra/client'],
  },
  // IIFE for CDN (bundles everything)
  {
    entry: ['src/runtime.ts'],
    format: ['iife'],
    globalName: 'ContraWebflow',
    outDir: 'dist',
    outExtension: () => ({ js: '.min.js' }),
    minify: true,
    sourcemap: true,
    noExternal: ['@contra/types', '@contra/client'],
  }
]); 