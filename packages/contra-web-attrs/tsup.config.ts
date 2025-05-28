import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  minify: true,
  globalName: 'ContraWebAttrs',
  external: [],
  noExternal: ['@contra/contra-core'],
  outExtension({ format }) {
    return {
      js: format === 'iife' ? '.min.js' : format === 'esm' ? '.module.js' : '.js'
    }
  }
}) 