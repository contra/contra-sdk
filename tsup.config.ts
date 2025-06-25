import { defineConfig } from 'tsup';

export default defineConfig([
  // Config 1: Build the standard NPM package
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true, // Clean the dist directory before this build
  },
  // Config 2: Build the CDN version of the runtime
  {
    entry: ['src/runtime.ts'],
    format: 'iife',
    globalName: 'ContraWebflow',
    outExtension() {
      return { js: `.min.js` };
    },
    minify: true,
    sourcemap: true,
    clean: false, // Don't clean the dist directory again
  }
]); 