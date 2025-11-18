# Using AWS Console Terminal (No SSH Needed!)

When SSH is stuck, use AWS's built-in terminal - it works through the browser!

---

## 🖥️ Method 1: AWS Systems Manager Session Manager (Recommended)

### Step 1: Enable Session Manager (If Not Already Enabled)

1. Go to **AWS Console** → **EC2** → **Instances**
2. Select your instance
3. Click **Connect** button (top right)
4. You'll see multiple connection options

### Step 2: Connect via Session Manager

1. Click **Session Manager** tab
2. Click **Connect** button
3. **A browser-based terminal will open!** (No SSH needed!)

### Step 3: Stop the Build Process

In the browser terminal, run:

```bash
# Kill all npm/node processes
pkill -f "npm run build"
pkill -f "vite"
pkill node

# Verify they're stopped
ps aux | grep npm | grep -v grep
```

### Step 4: Clean Up

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
rm -rf dist
rm -rf node_modules/.vite
ls -la | grep dist
```

---

## 🖥️ Method 2: EC2 Instance Connect (Alternative)

### Step 1: Connect

1. Go to **AWS Console** → **EC2** → **Instances**
2. Select your instance
3. Click **Connect** button
4. Choose **EC2 Instance Connect** tab
5. Click **Connect**

### Step 2: Stop Build

Same commands as above:

```bash
pkill -f "npm run build"
pkill -f "vite"
pkill node
cd /home/ubuntu/smartstore/smartstore-frontend
rm -rf dist node_modules/.vite
```

---

## 🎯 Quick Steps Summary

1. **AWS Console** → **EC2** → **Instances**
2. **Select your instance**
3. **Click "Connect"**
4. **Choose "Session Manager"** (or "EC2 Instance Connect")
5. **Click "Connect"**
6. **Run cleanup commands**

---

## 📋 Complete Cleanup Commands (Copy-Paste)

Once connected via AWS Console terminal:

```bash
# Stop all build processes
pkill -f "npm run build" || true
pkill -f "vite" || true
pkill node || true

# Clean up build artifacts
cd /home/ubuntu/smartstore/smartstore-frontend
rm -rf dist
rm -rf node_modules/.vite

# Verify cleanup
ps aux | grep npm | grep -v grep
ls -la | grep dist

echo "✅ Cleanup complete!"
```

---

## ✅ After Cleanup

Once you've stopped the build and cleaned up, we can:
1. Build locally on your machine
2. Push to GitHub
3. Pull on EC2 (when SSH works again)

---

## 🔧 If Session Manager Doesn't Work

**Enable it manually:**

1. Go to **EC2** → **Instances** → Select instance
2. **Actions** → **Security** → **Modify IAM role**
3. Attach IAM role with `AmazonSSMManagedInstanceCore` policy
4. Or use **EC2 Instance Connect** (works without IAM setup)

---

**Try Session Manager first - it's the easiest!**

