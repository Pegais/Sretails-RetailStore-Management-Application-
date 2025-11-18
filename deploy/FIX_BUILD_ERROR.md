# Fix Build Error: "Cannot add property 0, object is not extensible"

This is a Vite/Rollup compatibility issue. Try these solutions in order:

---

## 🔧 Solution 1: Clean Install (Most Common Fix)

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Delete node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Try build again
npm run build
```

---

## 🔧 Solution 2: Update Vite Config

The issue might be with Vite 7.0.4. Let's add build optimizations:

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
})
```

---

## 🔧 Solution 3: Downgrade Vite (If Solution 1 & 2 Don't Work)

Vite 7.0.4 might be too new. Try Vite 6:

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Remove current vite
npm uninstall vite

# Install Vite 6
npm install vite@^6.0.0 --save-dev

# Try build
npm run build
```

---

## 🔧 Solution 4: Check Node.js Version

Vite 7 requires Node.js 18+. Check your version:

```powershell
node --version
```

**If below 18:**
- Update Node.js: https://nodejs.org/
- Install LTS version (20.x recommended)

---

## 🔧 Solution 5: Use Legacy OpenSSL (Windows Specific)

Sometimes Windows has OpenSSL issues:

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Set environment variable
$env:NODE_OPTIONS="--openssl-legacy-provider"

# Try build
npm run build
```

---

## 🎯 Quick Fix (Try This First!)

**Copy-paste this entire block:**

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
npm run build
```

---

## ✅ If Still Not Working

Try building with different options:

```powershell
# Build with verbose output to see exact error
npm run build -- --debug

# Or try with legacy mode
npm run build -- --mode production --legacy
```

---

## 🔄 Alternative: Build on EC2 Instead

If local build keeps failing, we can:
1. Skip local build
2. Let EC2 build it (even if slow)
3. Or set up CI/CD to build on GitHub Actions

---

**Try Solution 1 first (clean install) - it fixes 90% of these errors!**

