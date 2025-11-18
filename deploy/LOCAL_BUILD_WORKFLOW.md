# Local Build Workflow - Step by Step

After restarting the instance, follow this workflow:

---

## 📋 Step 1: Restart Instance (You're Doing This Now)

1. **Stop instance** in AWS Console
2. **Start instance** in AWS Console
3. **Note new Public IP** (if it changed)
4. **Wait for status checks: 2/2 passed**

---

## 🏗️ Step 2: Build Frontend Locally

**On your Windows machine:**

```powershell
# Navigate to frontend
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build
```

**⏱️ Takes 1-2 minutes on your local machine!**

**Verify build:**
```powershell
dir dist
# Should see index.html and assets folder
```

---

## 📤 Step 3: Upload dist/ to EC2

### Option A: Using WinSCP (Easiest!)

1. **Download WinSCP:** https://winscp.net/eng/download.php
2. **Install and open**
3. **New Session:**
   - **File protocol:** SFTP
   - **Host name:** YOUR_NEW_EC2_IP
   - **User name:** ubuntu
   - **Advanced → SSH → Authentication:**
     - **Private key file:** Browse and select your `.pem` file
   - Click **Login**
4. **Navigate to:** `/home/ubuntu/smartstore/smartstore-frontend/`
5. **Delete old `dist` folder** (if exists)
6. **Drag and drop** your local `dist` folder
7. **Wait for upload to complete**

### Option B: Using SCP (Command Line)

```powershell
# From PowerShell
cd C:\Users\sneha\Desktop\Sretails

scp -i "path\to\your-key.pem" -r smartstore-frontend\dist ubuntu@YOUR_NEW_EC2_IP:/home/ubuntu/smartstore/smartstore-frontend/
```

---

## 🔄 Step 4: Deploy on EC2

**Once you can connect via SSH:**

```bash
# Connect to EC2
ssh -i "your-key.pem" ubuntu@YOUR_NEW_EC2_IP

# Navigate to project
cd /home/ubuntu/smartstore

# Run deployment script
./deploy/deploy.sh
```

**The script will:**
- Pull latest code (if any changes)
- Install backend dependencies
- **Skip frontend build** (uses your uploaded dist/)
- Restart services
- Website is live!

---

## ✅ Step 5: Verify

1. **Open browser:** `http://YOUR_NEW_EC2_IP`
2. **Should see your application!**

---

## 🔄 Future Updates Workflow

### For Quick Updates:

```bash
# 1. Make code changes locally
# 2. Build locally
cd smartstore-frontend
npm run build

# 3. Upload dist/ via WinSCP
# 4. On EC2:
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

### For Major Changes:

```bash
# 1. Make code changes
# 2. Commit and push
git add .
git commit -m "Update feature"
git push

# 3. On EC2:
cd /home/ubuntu/smartstore
git pull origin main
./deploy/deploy.sh
# (Script will skip build if dist/ exists)
```

---

## 📝 Quick Checklist

- [ ] Instance restarted
- [ ] New Public IP noted
- [ ] Built frontend locally (`npm run build`)
- [ ] Uploaded `dist/` to EC2 via WinSCP
- [ ] Connected to EC2 via SSH
- [ ] Ran `./deploy/deploy.sh`
- [ ] Website is live!

---

## 🎯 Summary

**After restart:**
1. Build locally (1-2 min)
2. Upload `dist/` via WinSCP
3. Run `./deploy/deploy.sh` on EC2
4. Done!

**This avoids slow builds on EC2!**

