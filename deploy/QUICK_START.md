# Quick Start Deployment Guide

## 🚀 Fast Track Deployment (30 minutes)

### Step 1: Launch EC2 Instance (5 min)

1. AWS Console → EC2 → Launch Instance
2. **AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t3.small (or t2.micro for free tier)
4. **Security Group**: 
   - SSH (22) - Your IP
   - HTTP (80) - 0.0.0.0/0
5. **Key Pair**: Create/Select one
6. Launch and note the **Public IP**

### Step 2: Connect to EC2 (2 min)

```bash
# Windows PowerShell
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Mac/Linux
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Step 3: Clone and Setup (10 min)

```bash
# Clone your repository
cd /home/ubuntu
git clone <YOUR_REPO_URL> smartstore
cd smartstore

# Make scripts executable
chmod +x deploy/*.sh

# Run initial setup (installs Node, Python, Nginx, etc.)
sudo ./deploy/setup-ec2.sh
```

**Wait 5-10 minutes for installation to complete.**

### Step 4: Configure Environment (5 min)

```bash
cd smartstore-backend
cp ../deploy/.env.example .env
nano .env
```

**Minimum required changes:**
- `JWT_SECRET` - Generate random string
- `MONGO_URI` - Use `mongodb://localhost:27017/smartstore` for local MongoDB
- `FRONTEND_URL` - Set to `http://YOUR_EC2_IP`
- `GOOGLE_CALLBACK_URL` - Set to `http://YOUR_EC2_IP/auth/google/callback`

Save and exit (Ctrl+X, Y, Enter)

### Step 5: Setup Nginx (3 min)

```bash
cd /home/ubuntu/smartstore

# Copy and enable Nginx config
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and start
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Step 6: Start Services (3 min)

```bash
cd /home/ubuntu/smartstore

# Create logs directory
mkdir -p smartstore-backend/logs

# Start backend with PM2
cd smartstore-backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow the command it outputs

# Setup Python Flask service
cd ..
sudo ./deploy/setup-services.sh
```

### Step 7: Deploy Application (2 min)

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

### Step 8: Verify (2 min)

1. **Check services:**
   ```bash
   pm2 status
   sudo systemctl status smartstore-pdf-parser
   ```

2. **Open in browser:**
   - Go to: `http://YOUR_EC2_IP`
   - Should see your application!

## ✅ Done!

Your application is now live at `http://YOUR_EC2_IP`

## 🔧 Common Issues

### Can't access the site
- Check Security Group allows port 80
- Check Nginx: `sudo systemctl status nginx`
- Check logs: `sudo tail -f /var/log/nginx/error.log`

### Backend not working
- Check PM2: `pm2 logs smartstore-backend`
- Check MongoDB: `sudo systemctl status mongod`
- Check .env file has correct values

### Frontend shows blank page
- Check if built: `ls -la smartstore-frontend/dist`
- Rebuild: `cd smartstore-frontend && npm run build`

## 📝 Next Steps

- Setup CI/CD pipeline (see next guide)
- Add domain name
- Setup SSL/HTTPS
- Configure MongoDB Atlas (recommended)

