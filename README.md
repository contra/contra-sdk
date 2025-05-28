# Contra SDK Monorepo – v0.2 (attribute‑driven)

A comprehensive SDK for integrating Contra's expert marketplace across different platforms.

## Packages

### 📦 [@contra/contra-core](./packages/contra-core)
Typed fetch wrapper and core API client for Contra's services.

### 🌐 [@contra/contra-web-attrs](./packages/contra-web-attrs)  
Finsweet-style attribute runtime for Webflow and any HTML platform. Design in Webflow, tag once, runtime clones.

### ⚛️ [@contra/contra-react-framer](./packages/contra-react-framer)
React wrapper components optimized for Framer projects.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build all packages:**
   ```bash
   npm run build
   ```

3. **Development mode:**
   ```bash
   npm run dev
   ```

## Build Scripts

- `npm run build` - Build all packages
- `npm run build:core` - Build core package only
- `npm run build:web-attrs` - Build web attributes package only  
- `npm run build:react-framer` - Build React/Framer package only
- `npm run clean` - Clean all build outputs
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all packages

## Usage

Each package has its own README with detailed usage instructions:

- [Core API Client](./packages/contra-core/README.md)
- [Web Attributes Runtime](./packages/contra-web-attrs/README.md)
- [React/Framer Components](./packages/contra-react-framer/README.md)

## Architecture

The SDK follows an attribute-driven design philosophy where configuration happens through data attributes rather than imperative JavaScript APIs. This makes it perfect for no-code platforms like Webflow while maintaining developer flexibility. 