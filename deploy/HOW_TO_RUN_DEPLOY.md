# How to Run ./deploy/deploy.sh

## 📋 Step-by-Step Instructions

### Step 1: Connect to EC2 via SSH

**Open PowerShell or Command Prompt on your local machine:**

```powershell
ssh -i "path\to\your-key.pem" ubuntu@YOUR_EC2_IP
```

**Replace:**
- `path\to\your-key.pem` - Your actual key file path (e.g., `C:\Users\sneha\Downloads\smartstore-key.pem`)
- `YOUR_EC2_IP` - Your EC2 Public IP address

**Example:**
```powershell
ssh -i "C:\Users\sneha\Downloads\smartstore-key.pem" ubuntu@54.123.45.67
```

**Press Enter** - You should see the Ubuntu welcome message and be logged in.

---

### Step 2: Navigate to Project Directory

Once connected, you'll see a prompt like:
```
ubuntu@ip-xxx-xxx-xxx-xxx:~$
```

**Type:**
```bash
cd /home/ubuntu/smartstore
```

**Press Enter**

You should now be in: `/home/ubuntu/smartstore`

---

### Step 3: Make Script Executable (If Not Already)

```bash
chmod +x deploy/deploy.sh
```

**Press Enter**

---

### Step 4: Run the Deployment Script

```bash
./deploy/deploy.sh
```

**Press Enter**

**What this does:**
- Pulls latest code from Git
- Installs backend dependencies
- Checks for frontend build (will use your uploaded `dist/`)
- Restarts all services
- Reloads Nginx

**Wait for it to complete** (takes 1-2 minutes)

---

### Step 5: Verify Deployment

After the script completes, check:

```bash
# Check all services
pm2 status
sudo systemctl status nginx
sudo systemctl status smartstore-pdf-parser
```

---

## 📋 Complete Command Sequence

**Copy and paste these commands one by one:**

```bash
# 1. Navigate to project
cd /home/ubuntu/smartstore

# 2. Make script executable (if needed)
chmod +x deploy/deploy.sh

# 3. Run deployment
./deploy/deploy.sh

# 4. Check status (after script completes)
pm2 status
```

---

## 🐛 Troubleshooting

### "Permission denied"

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### "No such file or directory"

Make sure you're in the right directory:
```bash
pwd
# Should show: /home/ubuntu/smartstore

ls -la deploy/
# Should show: deploy.sh file
```

### Script fails

Check what went wrong:
```bash
# Run with more verbose output
bash -x ./deploy/deploy.sh
```

---

## ✅ Expected Output

You should see:
```
🚀 Starting SmartStore Deployment...
📥 Pulling latest code...
📦 Setting up backend...
🏗️  Checking frontend build...
✅ Frontend build found (from local build), skipping rebuild
🔄 Restarting services...
✅ Deployment complete!
```

---

## 🎯 Quick Reference

**Full sequence:**
1. `ssh -i "key.pem" ubuntu@EC2_IP` (from your local machine)
2. `cd /home/ubuntu/smartstore` (on EC2)
3. `./deploy/deploy.sh` (on EC2)
4. Wait for completion
5. Test: `http://YOUR_EC2_IP`

---

**Run these commands on EC2 after uploading dist/ folder!**

