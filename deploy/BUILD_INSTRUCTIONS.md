# Build Instructions - Output to dist/

## 🏗️ Build Command

Simply run:

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
npm run build
```

**This will:**
1. Build the project (outputs to `build/` folder)
2. Automatically rename `build/` to `dist/` (for Nginx compatibility)

---

## ✅ Verify Build

After build completes, check:

```powershell
dir dist
# Should see: index.html, static/ folder, etc.
```

---

## 📋 What Happens

1. **CRA builds** → Creates `build/` folder
2. **Script renames** → `build/` → `dist/`
3. **Ready for deployment** → Upload `dist/` to EC2

---

## 🚀 Build Now

Run this command:

```powershell
npm run build
```

**Wait for it to complete** (takes 1-2 minutes)

**Expected output:**
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
...
```

Then you'll have a `dist/` folder ready to upload to EC2!

---

## 📤 After Build

Once build is complete:
1. ✅ `dist/` folder will be created
2. ✅ Ready to upload to EC2 via WinSCP
3. ✅ Then we'll deploy!

---

**Run `npm run build` now!**

