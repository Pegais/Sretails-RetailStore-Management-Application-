# Complete Step-by-Step Deployment Guide

This guide will walk you through everything from creating an AWS EC2 instance to deploying your application.

---

## 📋 Part 1: Create AWS EC2 Instance

### Step 1.1: Login to AWS Console

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click **"Sign In to the Console"**
3. Enter your AWS account credentials
4. You'll be in the AWS Management Console

### Step 1.2: Navigate to EC2

1. In the AWS Console search bar at the top, type **"EC2"**
2. Click on **"EC2"** service
3. You'll see the EC2 Dashboard

### Step 1.3: Launch Instance

1. Click the big orange button **"Launch Instance"** (or click "Instances" → "Launch Instance")
2. You'll see a form to configure your instance

### Step 1.4: Configure Instance Details

#### **Name and tags:**
- **Name:** Enter `smartstore-production` (or any name you like)

#### **Application and OS Images (Amazon Machine Image - AMI):**
- Click **"Browse more AMIs"** or look for **"Ubuntu"**
- Select **"Ubuntu Server 22.04 LTS"** (Free tier eligible)
- Make sure it says **"Free tier eligible"** if you want to use free tier

#### **Instance type:**
- Click **"See all instance types"**
- For free tier: Select **"t2.micro"** (Free tier eligible)
- For better performance: Select **"t3.small"** (not free, but better)
- Click **"Next: Configure Instance Details"**

#### **Key pair (login):**
- Click **"Create new key pair"**
- **Key pair name:** `smartstore-key` (or any name)
- **Key pair type:** RSA
- **Private key file format:** `.pem` (for Linux/Mac) or `.ppk` (for Windows PuTTY)
- Click **"Create key pair"**
- **IMPORTANT:** The `.pem` file will download automatically - **SAVE IT SAFELY!** You'll need it to connect.

#### **Network settings:**
- **VPC:** Leave default
- **Subnet:** Leave default
- **Auto-assign Public IP:** Enable
- **Firewall (security groups):**
  - Select **"Create security group"**
  - **Security group name:** `smartstore-sg`
  - **Description:** `Security group for SmartStore application`
  
  **Add rules:**
  1. **SSH (port 22):**
     - Type: SSH
     - Port: 22
     - Source: **My IP** (click the dropdown, it will auto-detect)
   
  2. **HTTP (port 80):**
     - Click **"Add security group rule"**
     - Type: HTTP
     - Port: 80
     - Source: **Anywhere-IPv4** (0.0.0.0/0)
     - Description: `Allow HTTP traffic`

#### **Configure storage:**
- **Volume size:** 20 GB (or 8 GB for free tier)
- **Volume type:** gp3 (default)
- Click **"Launch Instance"**

### Step 1.5: Instance Launching

1. You'll see a success message: **"Successfully initiated launch of instance"**
2. Click **"View all instances"** at the bottom
3. Wait 1-2 minutes for the instance to start
4. The instance state will change from **"pending"** to **"running"**
5. Once running, note down:
   - **Instance ID:** (e.g., i-0123456789abcdef0)
   - **Public IPv4 address:** (e.g., 54.123.45.67) ← **THIS IS IMPORTANT!**
   - **Public IPv4 DNS:** (e.g., ec2-54-123-45-67.compute-1.amazonaws.com)

**✅ Part 1 Complete!** You now have an EC2 instance running.

---

## 📋 Part 2: Connect to EC2 Instance

### Step 2.1: Locate Your Key File

- Find the `.pem` file you downloaded (e.g., `smartstore-key.pem`)
- Note its location (e.g., `C:\Users\YourName\Downloads\smartstore-key.pem`)

### Step 2.2: Connect via SSH

#### **For Windows (PowerShell or Command Prompt):**

1. Open **PowerShell** or **Command Prompt**
2. Navigate to where your `.pem` file is:
   ```powershell
   cd C:\Users\YourName\Downloads
   ```
3. Connect to EC2:
   ```powershell
   
   ```
   Replace `YOUR_PUBLIC_IP` with your actual EC2 Public IP from Step 1.5

4. If you see a security warning, type **"yes"** and press Enter
5. You should see: `Welcome to Ubuntu...` and a command prompt like `ubuntu@ip-xxx-xxx-xxx-xxx:~$`

**✅ Connected!**

#### **For Mac/Linux:**

1. Open **Terminal**
2. Navigate to where your `.pem` file is:
   ```bash
   cd ~/Downloads
   ```
3. Set proper permissions:
   ```bash
   chmod 400 smartstore-key.pem
   ```
4. Connect to EC2:
   ```bash
   ssh -i smartstore-key.pem ubuntu@YOUR_PUBLIC_IP
   ```
   Replace `YOUR_PUBLIC_IP` with your actual EC2 Public IP

5. Type **"yes"** if asked
6. You should see the Ubuntu welcome message

**✅ Connected!**

---

## 📋 Part 3: Clone Your Repository

### Step 3.1: Navigate to Home Directory

```bash
cd /home/ubuntu
```

### Step 3.2: Clone Repository

**Option A: If your repo is on GitHub (Public):**
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git smartstore
```

**Option B: If your repo is on GitHub (Private):**
```bash
# First, you'll need to set up SSH keys or use personal access token
git clone git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git smartstore
```

**Option C: If your repo is on GitLab:**
```bash
git clone https://gitlab.com/YOUR_USERNAME/YOUR_REPO_NAME.git smartstore
```

**Replace:**
- `YOUR_USERNAME` with your GitHub/GitLab username
- `YOUR_REPO_NAME` with your repository name

### Step 3.3: Verify Clone

```bash
cd smartstore
ls -la
```

**Expected output:** You should see:
- `smartstore-backend/`
- `smartstore-frontend/`
- `deploy/`
- Other files from your repo

**✅ Repository cloned!**

---

## 📋 Part 4: Initial EC2 Setup

### Step 4.1: Make Scripts Executable

```bash
chmod +x deploy/*.sh
```

### Step 4.2: Run Setup Script

```bash
sudo ./deploy/setup-ec2.sh
```

**This will:**
- Update system packages
- Install Node.js 18.x
- Install Python 3
- Install Nginx
- Install PM2
- Install Redis
- Install MongoDB
- Install build tools

**⏱️ This takes 5-10 minutes. Be patient!**

You'll see output like:
```
🚀 Starting SmartStore EC2 Setup...
📦 Updating system packages...
📦 Installing Node.js...
...
✅ EC2 setup complete!
```

### Step 4.3: Verify Installations

After setup completes, verify everything is installed:

```bash
# Check Node.js
node --version
# Expected: v18.x.x or higher

# Check npm
npm --version
# Expected: 9.x.x or higher

# Check Python
python3 --version
# Expected: Python 3.10.x or higher

# Check Nginx
nginx -v
# Expected: nginx version: 1.18.x or higher

# Check PM2
pm2 --version
# Expected: 5.x.x or higher

# Check Redis
redis-cli ping
# Expected: PONG

# Check MongoDB
sudo systemctl status mongod
# Expected: Active: active (running)
```

**✅ All installations verified!**

---

## 📋 Part 5: Configure Environment Variables

### Step 5.1: Navigate to Backend Directory

```bash
cd /home/ubuntu/smartstore/smartstore-backend
```

### Step 5.2: Copy Environment Template

```bash
cp ../deploy/.env.example .env
```

### Step 5.3: Edit Environment File

```bash
nano .env
```

**You'll see a text editor. Use arrow keys to navigate.**

### Step 5.4: Set Required Variables

Find and update these lines (use arrow keys, delete old values, type new ones):

```bash
# Set to production
NODE_ENV=production
PORT=5000

# Generate JWT Secret (run this command in another terminal or later)
# For now, use a temporary value, we'll generate proper one next
JWT_SECRET=change-this-to-random-string

# MongoDB (local - use this for now)
MONGO_URI=mongodb://localhost:27017/smartstore

# Frontend URL - REPLACE YOUR_EC2_IP with your actual EC2 Public IP
FRONTEND_URL=http://YOUR_EC2_IP

# Google OAuth Callback - REPLACE YOUR_EC2_IP with your actual EC2 Public IP
GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP/auth/google/callback
```

**Important:** Replace `YOUR_EC2_IP` with your actual EC2 Public IP address!

### Step 5.5: Generate JWT Secret

Open a **new terminal/SSH session** (keep nano open), or exit nano temporarily:

1. Press `Ctrl+X` to exit nano
2. Type `Y` to save
3. Press `Enter` to confirm

Then generate a secure JWT secret:

```bash
openssl rand -base64 32
```

**Copy the output** (it will be a long random string)

Edit `.env` again:

```bash
nano .env
```

Find `JWT_SECRET=` and replace the value with the generated string.

### Step 5.6: Save and Exit

1. Press `Ctrl+X` to exit
2. Press `Y` to save
3. Press `Enter` to confirm filename

### Step 5.7: Verify Environment File

```bash
cat .env | grep -v "^#" | grep -v "^$"
```

You should see your configured values.

**✅ Environment configured!**

---

## 📋 Part 6: Setup Nginx

### Step 6.1: Copy Nginx Configuration

```bash
cd /home/ubuntu/smartstore
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore
```

### Step 6.2: Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default
```

### Step 6.3: Test Nginx Configuration

```bash
sudo nginx -t
```

**Expected output:**
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

If you see errors, let me know and we'll fix them.

### Step 6.4: Start Nginx

```bash
# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

**Expected:** `Active: active (running)`

Press `q` to exit the status view.

**✅ Nginx configured!**

---

## 📋 Part 7: Build Frontend

### Step 7.1: Navigate to Frontend Directory

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
```

### Step 7.2: Install Dependencies

```bash
npm install
```

**⏱️ This takes 2-5 minutes.**

### Step 7.3: Build for Production

```bash
npm run build
```

**⏱️ This takes 1-2 minutes.**

**Expected output:**
```
vite v7.x.x building for production...
✓ built in X.XXs
```

### Step 7.4: Verify Build

```bash
ls -la dist/
```

**Expected:** You should see `index.html` and `assets/` folder

**✅ Frontend built!**

---

## 📋 Part 8: Setup Python Flask Service

### Step 8.1: Navigate to Project Root

```bash
cd /home/ubuntu/smartstore
```

### Step 8.2: Run Service Setup Script

```bash
sudo ./deploy/setup-services.sh
```

**Expected output:**
```
🔧 Creating systemd service for PDF Parser...
✅ PDF Parser service created and started!
```

### Step 8.3: Verify Service

```bash
sudo systemctl status smartstore-pdf-parser
```

**Expected:** `Active: active (running)`

Press `q` to exit.

**✅ Python Flask service configured!**

---

## 📋 Part 9: Start Backend with PM2

### Step 9.1: Navigate to Backend Directory

```bash
cd /home/ubuntu/smartstore/smartstore-backend
```

### Step 9.2: Create Logs Directory

```bash
mkdir -p logs
```

### Step 9.3: Start Backend

```bash
pm2 start ecosystem.config.js
```

**Expected output:**
```
[PM2] Starting ecosystem.config.js
[PM2] Process launched
┌─────┬──────────────────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ status  │ restart │ uptime   │
├─────┼──────────────────────┼─────────┼─────────┼──────────┤
│ 0   │ smartstore-backend   │ online  │ 0       │ 0s       │
└─────┴──────────────────────┴─────────┴─────────┴──────────┘
```

### Step 9.4: Check Backend Logs

```bash
pm2 logs smartstore-backend --lines 20
```

**Expected to see:**
- ✅ MongoDB connected
- 🚀 Server running on http://localhost:5000
- 🔥 Background worker started

If you see errors, let me know!

### Step 9.5: Save PM2 Configuration

```bash
pm2 save
```

### Step 9.6: Setup PM2 to Start on Boot

```bash
pm2 startup
```

**Expected output:**
```
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Copy the entire command it shows** (it will be different for you) and run it:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

**Expected:** `[PM2] Startup script added`

**✅ Backend started!**

---

## 📋 Part 10: Test Deployment

### Step 10.1: Run Test Script

```bash
cd /home/ubuntu/smartstore
chmod +x deploy/test-deployment.sh
./deploy/test-deployment.sh
```

**Expected:** All tests should show ✅ (green checkmarks)

### Step 10.2: Test in Browser

1. Open your web browser
2. Go to: `http://YOUR_EC2_IP` (replace with your actual IP)
3. **Expected:** Your application frontend should load!

### Step 10.3: Test Health Endpoint

In browser, go to: `http://YOUR_EC2_IP/health`

**Expected:** JSON response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "uptime": ...,
  "environment": "production"
}
```

### Step 10.4: Test API

In browser, go to: `http://YOUR_EC2_IP/api/inventory`

**Expected:** 
- If no auth required: Returns data or empty array
- If auth required: Returns 401/403 (not 502/503)

**✅ Application is live!**

---

## 📋 Part 11: Verify Everything

### Quick Status Check

```bash
# Check all services
echo "=== Services ==="
pm2 status
sudo systemctl status smartstore-pdf-parser --no-pager
sudo systemctl status nginx --no-pager
sudo systemctl status mongod --no-pager
sudo systemctl status redis-server --no-pager
```

All should show as **active/running**.

---

## 🎉 Congratulations!

Your application is now deployed and running on EC2!

**Your application URL:** `http://YOUR_EC2_IP`

---

## 🐛 Troubleshooting

### Can't connect via SSH
- Check Security Group allows port 22 from your IP
- Verify EC2 instance is running
- Check key file path is correct

### Services not starting
- Check logs: `pm2 logs smartstore-backend`
- Verify `.env` file exists: `ls -la smartstore-backend/.env`
- Check MongoDB: `sudo systemctl status mongod`

### Frontend blank page
- Rebuild: `cd smartstore-frontend && npm run build`
- Check Nginx: `sudo nginx -t`
- Check browser console (F12) for errors

### Backend 502 error
- Check PM2: `pm2 status`
- Check logs: `pm2 logs smartstore-backend --lines 50`

---

## 📞 Need Help?

If you encounter any issues at any step, let me know:
1. Which step you're on
2. The exact error message
3. What command you ran

I'll help you fix it!

---

## ✅ Next Steps

Once everything is working:
1. Test all application features
2. Setup CI/CD pipeline (we'll do this next!)
3. Add domain name (optional)
4. Setup SSL/HTTPS (optional)

