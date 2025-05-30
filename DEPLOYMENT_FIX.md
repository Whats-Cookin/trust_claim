# Deployment Fix Guide

## Issue 1: MUI JSX Runtime Error

### Symptoms
After merging a branch, the development environment shows a blank page with the error:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'jsx')
```

### Root Causes
1. **Build Directory Mismatch**: The `amplify.yml` was configured to look for build artifacts in `build` directory, but Vite outputs to `dist` directory.
2. **JSX Runtime Loading**: The MUI vendor chunk wasn't properly loading the React JSX runtime in the production build.

### Fixes Applied
1. Updated `amplify.yml`: Changed `baseDirectory` from `build` to `dist`
2. Enhanced Vite Configuration: Added explicit `optimizeDeps.include` for React and MUI dependencies

---

## Issue 2: Shadow DOM Conflicts

### Symptoms
```
Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree.
```

### Root Causes
1. `cytoscape-node-html-label` library uses shadow DOM for custom node labels
2. Browser extensions or deployment platform scripts conflicting with shadow DOM
3. Multiple initialization of cytoscape extensions

### Fixes Applied
1. **index.html**: Added shadow DOM conflict prevention script
2. **Explore component**: Ensured cytoscape-node-html-label is only registered once

---

## Deployment Steps

1. **Clear CDN/Build Cache** (if using AWS Amplify):
   - Go to your Amplify Console
   - Navigate to your app
   - Go to "App settings" > "Build settings"
   - Click "Clear cache"

2. **Commit and Deploy**:
   ```bash
   git add .
   git commit -m "Fix: MUI JSX runtime and shadow DOM conflicts in production"
   git push origin <your-branch>
   ```

3. **If Issues Persist**:
   - Clear browser cache and test in incognito mode
   - Check CloudFront distribution cache (if using)
   - Verify Node.js version matches between local and deployment environment
   - Disable browser extensions (especially password managers and ad blockers)

## Testing Checklist
- [ ] Build locally: `yarn build`
- [ ] Test production build: `yarn preview`
- [ ] Check for console errors
- [ ] Test in incognito mode
- [ ] Test graph visualization (Explore page)
- [ ] Verify MUI components render correctly

## Prevention
- Always ensure build output directories match deployment configurations
- Test production builds locally before deploying: `yarn build && yarn preview`
- Keep dependencies properly configured in optimizeDeps when using Vite
- Be cautious when using libraries that manipulate the DOM (especially shadow DOM) 