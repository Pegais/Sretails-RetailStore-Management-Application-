# Clean Install - Switch to Create React App

## 🧹 Step 1: Clean Everything

Run these commands in PowerShell:

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Remove all Vite-related files
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force index.html -ErrorAction SilentlyContinue
Remove-Item -Force vite.config.js -ErrorAction SilentlyContinue

# Remove old main.jsx (we created index.jsx)
Remove-Item -Force src\main.jsx -ErrorAction SilentlyContinue

# Clear npm cache
npm cache clean --force
```

---

## 📦 Step 2: Install New Dependencies

```powershell
# Install with Create React App
npm install
```

**This will install:**
- `react-scripts` (Create React App)
- All your existing dependencies
- No Vite!

---

## 🏗️ Step 3: Build

```powershell
npm run build
```

**Expected output:**
```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:
...
```

**Build output will be in `build/` folder** (not `dist/`)

---

## ✅ Step 4: Verify Build

```powershell
dir build
# Should see: index.html, static/ folder, etc.
```

---

## 📤 Step 5: Upload to EC2

**Option A: Rename build to dist (for Nginx compatibility)**

```powershell
# After build, rename for Nginx
Rename-Item -Path build -NewName dist
```

**Then upload `dist/` folder via WinSCP to:**
`/home/ubuntu/smartstore/smartstore-frontend/`

**Option B: Upload build/ and create symlink on EC2**

Upload `build/` folder, then on EC2:
```bash
cd /home/ubuntu/smartstore/smartstore-frontend
ln -s build dist
```

---

## 🎯 Complete Commands (Copy-Paste All)

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force index.html -ErrorAction SilentlyContinue
Remove-Item -Force vite.config.js -ErrorAction SilentlyContinue
Remove-Item -Force src\main.jsx -ErrorAction SilentlyContinue
npm cache clean --force
npm install
npm run build
Rename-Item -Path build -NewName dist
```

**Then upload `dist/` folder to EC2 via WinSCP!**

---

## ✅ Done!

- ✅ Vite removed
- ✅ Create React App installed
- ✅ Build should work without errors
- ✅ Ready to upload to EC2

**The build will be much more stable now!**

