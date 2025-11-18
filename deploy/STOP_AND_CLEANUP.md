# Stop Build and Cleanup

## 🛑 Step 1: Stop the Build Process

### If you can access the terminal where build is running:

**Press:** `Ctrl + C` (this stops the current process)

### If terminal is completely stuck/unresponsive:

**Open a NEW SSH session** and run:

```bash
# Find and kill npm/node processes
pkill -f "npm run build"
pkill -f "vite"
pkill -f "node.*build"

# Or kill all node processes (more aggressive)
pkill node

# Verify they're stopped
ps aux | grep npm
ps aux | grep node
```

---

## 🧹 Step 2: Clean Up Build Artifacts

```bash
cd /home/ubuntu/smartstore/smartstore-frontend

# Remove dist folder (if it exists)
rm -rf dist

# Remove node_modules/.vite cache
rm -rf node_modules/.vite

# Check what's left
ls -la
```

---

## ✅ Step 3: Verify Cleanup

```bash
# Check if any build processes are still running
ps aux | grep -E "npm|vite|node" | grep -v grep

# Should return nothing (no processes)
```

---

## 📋 Complete Cleanup Commands (Copy-Paste)

Run these in order:

```bash
# 1. Kill build processes
pkill -f "npm run build" || true
pkill -f "vite" || true
pkill node || true

# 2. Navigate to frontend
cd /home/ubuntu/smartstore/smartstore-frontend

# 3. Remove build artifacts
rm -rf dist
rm -rf node_modules/.vite

# 4. Verify
ps aux | grep npm | grep -v grep
ls -la | grep dist
```

**Expected:** No npm processes, no dist folder

---

## ✅ Done!

Now you're ready to:
1. Build locally on your machine
2. Push to GitHub
3. Pull on EC2

Let's proceed with the local build approach!

