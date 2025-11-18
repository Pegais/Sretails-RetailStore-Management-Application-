# Fix npm install Error - TypeScript Conflict

The error is due to TypeScript version conflict. Fixed it by adding `.npmrc` file.

---

## ✅ Solution Applied

I've created `.npmrc` file with `legacy-peer-deps=true` which will fix the dependency conflict.

---

## 🚀 Run These Commands

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Install with legacy peer deps (now automatic via .npmrc)
npm install

# If still fails, try:
npm install --legacy-peer-deps

# Then build
npm run build
```

---

## 📝 What I Fixed

1. **Created `.npmrc` file** - Automatically uses `--legacy-peer-deps` flag
2. **Added TypeScript override** - Forces compatible TypeScript version

---

## ✅ After Install

Once `npm install` completes successfully:

```powershell
# Build the project
npm run build

# Rename build to dist
Rename-Item -Path build -NewName dist
```

---

**Run `npm install` now - it should work!**

