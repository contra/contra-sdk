# Contributing to the Contra Webflow SDK

This guide provides instructions for developers who are maintaining and contributing to this SDK.

## Project Structure

This is a **single-package TypeScript project** that builds both an NPM package and a CDN-ready runtime script:

- **`/src`**: Contains all the TypeScript source code
  - `runtime.ts`: The main runtime script for Webflow (builds to `runtime.min.js`)
  - `index.ts`: The main entry point for the NPM package
  - `client.ts`: API client with caching and retry logic
  - `types.ts`: TypeScript type definitions
- **`/dist`**: Contains the final, built JavaScript files (**tracked by Git**)
  - `runtime.min.js`: The CDN runtime script
  - `index.js`, `index.mjs`: NPM package builds
  - `*.d.ts`: TypeScript declarations
- **`package.json`**: Project definition, dependencies, and build scripts
- **`tsup.config.ts`**: Build configuration for both NPM and CDN builds

## Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Development with Watch Mode:**
   ```bash
   npm run dev
   ```
   This watches for changes in the `src` directory and automatically rebuilds.

3. **Build for Production:**
   ```bash
   npm run build
   ```
   This generates all files in the `dist` directory.

## Publishing a New Version (via GitHub Tags)

This project uses **Git tags** for versioning releases that are automatically available via the jsDelivr CDN. **This process does not involve `npm publish`.**

### Current Version

- **Latest Published:** `v1.0.0`
- **CDN URL:** `https://cdn.jsdelivr.net/gh/contra/contra-sdk@v1.0.0/dist/runtime.min.js`

### Release Process

#### Step 1: Prepare Your Changes

Ensure your local code is clean and all changes are committed:

```bash
git status
# Should show clean working directory
```

#### Step 2: Update Version Numbers

Update the version in `package.json` to match your intended release:

```json
{
  "version": "1.1.0"
}
```

#### Step 3: Build the Project

Generate the final `dist` files with your latest changes:

```bash
npm run build
```

#### Step 4: Commit the Built Files

The `dist` directory is tracked by Git. Add the newly built files to a commit:

```bash
git add dist/
git add package.json
git commit -m "build: Generate distribution files for v1.1.0"
```

#### Step 5: Create and Push Git Tag

Create a new Git tag that matches your version:

```bash
# For a new feature (e.g., v1.0.0 -> v1.1.0):
git tag v1.1.0

# For a bug fix (e.g., v1.0.0 -> v1.0.1):
git tag v1.0.1

# For a major version (e.g., v1.0.0 -> v2.0.0):
git tag v2.0.0
```

Push your commits and the new tag to GitHub:

```bash
git push && git push --tags
```

#### Step 6: Verify CDN Availability

Wait 2-5 minutes for jsDelivr to pick up the new tag. Verify the new version is available:

```bash
# Test the new CDN URL
curl -I https://cdn.jsdelivr.net/gh/contra/contra-sdk@v1.1.0/dist/runtime.min.js

# Should return HTTP 200 with the correct content-length
```

### Version Management

- **Git Tags:** Used for CDN versioning (e.g., `v1.1.0`)
- **Package.json:** Should match the git tag version
- **CDN URLs:** Available at `https://cdn.jsdelivr.net/gh/contra/contra-sdk@<TAG>/dist/runtime.min.js`

### Troubleshooting

**CDN Not Updating:**
- Ensure your tag was pushed: `git ls-remote --tags origin`
- Check jsDelivr cache: `https://cdn.jsdelivr.net/gh/contra/contra-sdk@<TAG>/dist/`
- Wait longer - jsDelivr can take up to 10 minutes to update

**Build Issues:**
- Clean and rebuild: `rm -rf dist/ && npm run build`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all source files are committed

**Wrong Version Deployed:**
- Check that package.json version matches your git tag
- Verify the correct files are in the dist directory
- Ensure you committed the built files before tagging

### Best Practices

1. **Test Before Release:** Always test your changes locally first
2. **Semantic Versioning:** Use proper semver (major.minor.patch)
3. **Clean Builds:** Always rebuild before releasing
4. **Documentation:** Update README.md examples with new version numbers
5. **Verification:** Always verify the CDN URL works after release

### Example: Complete Release Flow

```bash
# 1. Prepare
git status  # Should be clean
git pull origin main

# 2. Update version
# Edit package.json: "version": "1.1.0"

# 3. Build
npm run build

# 4. Commit
git add .
git commit -m "build: Release v1.1.0"

# 5. Tag and push
git tag v1.1.0
git push && git push --tags

# 6. Verify (after 2-5 minutes)
curl -I https://cdn.jsdelivr.net/gh/contra/contra-sdk@v1.1.0/dist/runtime.min.js
```

---

## Code Quality

### TypeScript

- All code should be properly typed
- Use `npm run dev` for type checking during development
- No TypeScript errors allowed in builds

### Testing

Currently no automated tests are configured. Manual testing should include:

- Testing the CDN script in a real Webflow environment
- Verifying all documented features work as expected
- Testing with different API keys and program IDs

### Documentation

- Update README.md when adding new features
- Keep attribute documentation accurate to the runtime implementation
- Update examples to use the latest version numbers 