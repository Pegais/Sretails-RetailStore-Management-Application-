# Step-by-Step Deployment Test Guide

Follow these steps in order to test your deployment.

## 🎯 Prerequisites

Before starting, make sure you have:
- [ ] AWS account with EC2 access
- [ ] EC2 instance launched (Ubuntu 22.04 LTS)
- [ ] EC2 Public IP address
- [ ] SSH key pair (.pem file)
- [ ] Security Group configured (ports 22, 80)
- [ ] Git repository URL

---

## 📋 Step 1: Launch & Connect to EC2

### 1.1 Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. **Name:** smartstore-production
3. **AMI:** Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance Type:** t3.small (or t2.micro for free tier)
5. **Key Pair:** Create new or select existing
6. **Network Settings:**
   - Create Security Group
   - SSH (22) - My IP
   - HTTP (80) - Anywhere (0.0.0.0/0)
7. **Launch Instance**

### 1.2 Note Your EC2 Details

- **Public IP:** `_________________`
- **Key Pair File:** `_________________`

### 1.3 Connect to EC2

**Windows (PowerShell):**
```powershell
ssh -i "path\to\your-key.pem" ubuntu@YOUR_EC2_IP
```

**Mac/Linux:**
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

**Expected:** You should see the Ubuntu welcome message and be logged in.

---

## 📋 Step 2: Clone Repository

```bash
cd /home/ubuntu
git clone <YOUR_REPO_URL> smartstore
cd smartstore
```

**Verify:**
```bash
ls -la
# Should see: smartstore-backend, smartstore-frontend, deploy folders
```

---

## 📋 Step 3: Run Initial Setup

```bash
# Make scripts executable
chmod +x deploy/*.sh

# Run setup (takes 5-10 minutes)
sudo ./deploy/setup-ec2.sh
```

**What it does:**
- Updates system packages
- Installs Node.js 18.x
- Installs Python 3
- Installs Nginx
- Installs PM2
- Installs Redis
- Installs MongoDB
- Installs build tools

**Wait for completion** - You'll see "✅ EC2 setup complete!"

**Verify installations:**
```bash
node --version    # v18.x.x
npm --version
python3 --version
nginx -v
pm2 --version
redis-cli ping   # Should return: PONG
sudo systemctl status mongod  # Should be active
```

---

## 📋 Step 4: Configure Environment Variables

```bash
cd /home/ubuntu/smartstore/smartstore-backend

# Copy template
cp ../deploy/.env.example .env

# Edit .env file
nano .env
```

### Required Variables to Set:

```bash
NODE_ENV=production
PORT=5000

# Generate JWT secret
JWT_SECRET=<generate-random-string>
# To generate: openssl rand -base64 32

# MongoDB (local)
MONGO_URI=mongodb://localhost:27017/smartstore

# Frontend URL (use your EC2 IP)
FRONTEND_URL=http://YOUR_EC2_IP

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP/auth/google/callback
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

**Test MongoDB:**
```bash
mongosh
# In MongoDB shell:
use smartstore
db.test.insertOne({message: "test"})
db.test.find()
exit
```

---

## 📋 Step 5: Setup Nginx

```bash
cd /home/ubuntu/smartstore

# Copy Nginx configuration
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore

# Enable the site
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

**Expected output:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**Start Nginx:**
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

**Expected:** `Active: active (running)`

---

## 📋 Step 6: Build Frontend

```bash
cd /home/ubuntu/smartstore/smartstore-frontend

# Install dependencies
npm install

# Build for production
npm run build
```

**Expected:** Build completes successfully, creates `dist/` folder

**Verify:**
```bash
ls -la dist/
# Should see: index.html, assets/ folder
```

---

## 📋 Step 7: Setup Python Flask Service

```bash
cd /home/ubuntu/smartstore
sudo ./deploy/setup-services.sh
```

**Expected:** Service created and started

**Verify:**
```bash
sudo systemctl status smartstore-pdf-parser
```

**Expected:** `Active: active (running)`

**Check logs:**
```bash
sudo journalctl -u smartstore-pdf-parser -n 20
```

---

## 📋 Step 8: Start Backend with PM2

```bash
cd /home/ubuntu/smartstore/smartstore-backend

# Create logs directory
mkdir -p logs

# Start backend
pm2 start ecosystem.config.js

# Check status
pm2 status
```

**Expected:** `smartstore-backend` shows as `online`

**Check logs:**
```bash
pm2 logs smartstore-backend --lines 20
```

**Expected to see:**
- ✅ MongoDB connected
- 🚀 Server running on http://localhost:5000
- 🔥 Background worker started

**If errors:**
- Check `.env` file exists and has correct values
- Check MongoDB: `sudo systemctl status mongod`
- Check Redis: `sudo systemctl status redis-server`

**Save PM2 configuration:**
```bash
pm2 save
pm2 startup
# Copy and run the command it outputs (starts with: sudo env PATH=...)
```

---

## 📋 Step 9: Test Deployment Script

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

**Expected:** All steps complete successfully

**This script:**
- Pulls latest code
- Installs dependencies
- Builds frontend
- Restarts services

---

## 📋 Step 10: Run Test Script

```bash
cd /home/ubuntu/smartstore
chmod +x deploy/test-deployment.sh
./deploy/test-deployment.sh
```

**Expected:** All tests show ✅ (green checkmarks)

---

## 📋 Step 11: Test in Browser

### 11.1 Test Frontend

1. Open browser
2. Go to: `http://YOUR_EC2_IP`

**Expected:** Frontend loads (login page or dashboard)

**If blank page:**
- Check browser console (F12) for errors
- Check Nginx: `sudo systemctl status nginx`
- Check frontend build: `ls -la smartstore-frontend/dist`

### 11.2 Test Backend API

1. Go to: `http://YOUR_EC2_IP/health`

**Expected:** JSON response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...,
  "environment": "production"
}
```

2. Test API endpoint: `http://YOUR_EC2_IP/api/inventory`

**Expected:** 
- If no auth: Returns data or empty array
- If auth required: Returns 401/403 (not 502/503)

**If 502 Bad Gateway:**
- Backend not running: `pm2 status`
- Check logs: `pm2 logs smartstore-backend`

### 11.3 Test Application Features

1. **Registration/Login**
   - Try creating an account
   - Try logging in

2. **Inventory**
   - Try adding an item
   - Try viewing inventory

3. **Other features**
   - Test all major features

---

## 📋 Step 12: Verify All Services

Run this comprehensive check:

```bash
# Quick health check
echo "=== Services ==="
sudo systemctl is-active nginx && echo "✅ Nginx" || echo "❌ Nginx"
sudo systemctl is-active mongod && echo "✅ MongoDB" || echo "❌ MongoDB"
sudo systemctl is-active redis-server && echo "✅ Redis" || echo "❌ Redis"
sudo systemctl is-active smartstore-pdf-parser && echo "✅ PDF Parser" || echo "❌ PDF Parser"

echo ""
echo "=== PM2 ==="
pm2 status

echo ""
echo "=== Ports ==="
sudo netstat -tlnp | grep -E ":(80|5000|5001)" || echo "Check ports manually"

echo ""
echo "=== API Test ==="
curl -s http://localhost:5000/health | head -5
```

**All should show ✅**

---

## 🎉 Success Criteria

Your deployment is successful if:

- [x] All services are running (PM2, systemd, Nginx)
- [x] Frontend loads in browser
- [x] Backend health endpoint responds
- [x] Can access API endpoints
- [x] Can login/register
- [x] No errors in logs
- [x] MongoDB connection working

---

## 🐛 Troubleshooting

### Can't connect via SSH
- Check Security Group allows port 22 from your IP
- Verify EC2 instance is running
- Check key file permissions

### Services won't start
- Check logs: `pm2 logs`, `sudo journalctl -u service-name`
- Verify .env file exists and has correct values
- Check MongoDB/Redis are running

### Frontend blank page
- Rebuild: `cd smartstore-frontend && npm run build`
- Check Nginx: `sudo nginx -t && sudo systemctl restart nginx`
- Check browser console for errors

### Backend 502 error
- Check PM2: `pm2 status`
- Check logs: `pm2 logs smartstore-backend`
- Verify backend is listening: `sudo netstat -tlnp | grep 5000`

### Can't access from browser
- Check Security Group allows port 80
- Verify Public IP is correct
- Check Nginx is running: `sudo systemctl status nginx`

---

## 📞 Need Help?

Check these logs:
```bash
# Backend logs
pm2 logs smartstore-backend

# PDF Parser logs
sudo journalctl -u smartstore-pdf-parser -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

---

## ✅ Next Steps

Once deployment is successful:
1. Test all features thoroughly
2. Setup CI/CD pipeline
3. Add domain name (optional)
4. Setup SSL/HTTPS (optional)
5. Configure monitoring
6. Setup backups

