# Speeding Up Frontend Build on EC2

If `npm run build` is taking too long, here are solutions:

---

## ⏱️ Normal Build Times

- **First build (with npm install):** 5-15 minutes (depends on instance size)
- **Subsequent builds:** 1-3 minutes
- **On t2.micro:** Can take 10-20 minutes
- **On t3.small:** Usually 3-8 minutes

---

## 🔍 Check If It's Actually Running

### Option 1: Check Process

Open a **new SSH session** (keep the build running) and check:

```bash
ps aux | grep npm
# or
ps aux | grep vite
```

If you see the process, it's still running!

### Option 2: Check CPU/Memory Usage

```bash
htop
# or if htop not installed:
top
```

Press `q` to exit.

### Option 3: Check Network Activity

```bash
sudo iftop
# Shows network traffic
```

---

## 🚀 Speed Up Build - Quick Fixes

### 1. Increase Node.js Memory (if build fails)

```bash
cd /home/ubuntu/smartstore/smartstore-frontend

# Build with more memory
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### 2. Skip Source Maps (faster build)

Temporarily modify `vite.config.js`:

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
nano vite.config.js
```

Add or modify:
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,  // Skip source maps for faster build
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
})
```

Then rebuild:
```bash
npm run build
```

### 3. Use Production Mode Explicitly

```bash
NODE_ENV=production npm run build
```

---

## ⚡ Faster Alternative: Build Locally

If EC2 is too slow, build on your local machine and upload:

### On Your Local Machine:

```bash
cd smartstore-frontend
npm install
npm run build
```

### Upload to EC2:

**Option A: Using SCP (from your local machine):**
```bash
# From your local machine (PowerShell/CMD)
scp -i "your-key.pem" -r smartstore-frontend/dist ubuntu@YOUR_EC2_IP:/home/ubuntu/smartstore/smartstore-frontend/
```

**Option B: Using Git (push dist folder):**
```bash
# Add dist to git (temporarily)
git add smartstore-frontend/dist
git commit -m "Add built frontend"
git push

# On EC2:
cd /home/ubuntu/smartstore
git pull origin main
```

**Option C: Using rsync (from your local machine):**
```bash
rsync -avz -e "ssh -i your-key.pem" smartstore-frontend/dist/ ubuntu@YOUR_EC2_IP:/home/ubuntu/smartstore/smartstore-frontend/dist/
```

---

## 🔧 Optimize Vite Build

### Update vite.config.js for faster builds:

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
nano vite.config.js
```

Replace with:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: 'terser',  // Faster than esbuild for large projects
    terserOptions: {
      compress: {
        drop_console: true,  // Remove console.logs
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,  // Single bundle (faster)
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
})
```

---

## 📊 Monitor Build Progress

### Check Build Logs in Real-Time

If build seems stuck, check what it's doing:

```bash
# In another terminal, watch the process
watch -n 1 'ps aux | grep -E "npm|vite|node" | grep -v grep'
```

### Check Disk Space

```bash
df -h
# Make sure you have enough space
```

### Check if npm is downloading packages

```bash
# Check network activity
sudo netstat -tulpn | grep node
```

---

## 🐌 If Build is Stuck

### Check for Errors

```bash
# Look for error messages
tail -f ~/.npm/_logs/*-debug.log
```

### Kill and Restart

If truly stuck:
```bash
# Press Ctrl+C to stop
# Then:
cd /home/ubuntu/smartstore/smartstore-frontend
rm -rf node_modules/.vite  # Clear Vite cache
npm run build
```

---

## 💡 Best Practice: Build in Background

Run build in background so you can do other things:

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
nohup npm run build > build.log 2>&1 &
```

Check progress:
```bash
tail -f build.log
```

Check if still running:
```bash
ps aux | grep npm
```

---

## ⚙️ Optimize npm Install (if that's slow)

### Use npm cache

```bash
npm config set cache /tmp/npm-cache
npm install
```

### Use yarn instead (often faster)

```bash
# Install yarn
sudo npm install -g yarn

# Use yarn
cd /home/ubuntu/smartstore/smartstore-frontend
yarn install
yarn build
```

---

## 🎯 Recommended Approach

**For first-time deployment:**
1. **Be patient** - First build takes 10-20 minutes on t2.micro
2. **Monitor** - Open another SSH session to check progress
3. **Don't cancel** - Let it finish

**For future updates:**
1. Build locally (much faster)
2. Upload `dist/` folder to EC2
3. Or use CI/CD (we'll set this up next!)

---

## 📝 Quick Commands

```bash
# Check if build is running
ps aux | grep npm

# Check build progress (if using nohup)
tail -f build.log

# Kill stuck build
pkill -f "npm run build"

# Clear cache and rebuild
cd smartstore-frontend
rm -rf node_modules/.vite dist
npm run build

# Build with more memory
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

---

## ⏰ Expected Times by Instance Type

- **t2.micro:** 15-25 minutes (first build)
- **t3.small:** 5-10 minutes (first build)
- **t3.medium:** 3-5 minutes (first build)
- **Local machine:** 1-2 minutes

---

**Bottom line:** If it's your first build on a small EC2 instance, **10-20 minutes is normal**. Be patient, or build locally and upload!

