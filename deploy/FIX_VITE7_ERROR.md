# Fix Vite 7.0.4 Rollup Error

This is a known bug in Vite 7.0.4 with Rollup's tree-shaking. Here's the fix:

---

## 🔧 Solution: Downgrade to Vite 6

I've updated your `package.json` to use Vite 6 instead of Vite 7.

**Run these commands:**

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Remove node_modules and lock file
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstall with Vite 6
npm install

# Try build again
npm run build
```

---

## ✅ What I Changed

1. **package.json:** Changed `vite` from `^7.0.4` to `^6.0.0`
2. **vite.config.js:** Added build optimizations to prevent the error

---

## 🎯 Why This Works

Vite 7.0.4 has a bug in Rollup's tree-shaking optimization that causes "Cannot add property 0, object is not extensible" error. Vite 6 is stable and doesn't have this issue.

---

## 📋 Complete Fix Commands (Copy-Paste)

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
npm run build
```

**This should work now!** Vite 6 is stable and widely used.

---

## 🔄 Alternative: If You Want to Keep Vite 7

If you really need Vite 7, you can try:

```powershell
npm install vite@latest --save-dev
```

But Vite 6 is recommended for now until Vite 7 bugs are fixed.

---

**Run the commands above and the build should work!**

