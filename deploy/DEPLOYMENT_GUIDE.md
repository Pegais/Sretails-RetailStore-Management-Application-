# SmartStore EC2 Deployment Guide

This guide will help you deploy SmartStore on an AWS EC2 instance step by step.

## Prerequisites

- AWS Account
- EC2 Instance (Ubuntu 22.04 LTS recommended)
- Git repository with your code
- Domain name (optional - can use IP address)

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Choose **Ubuntu Server 22.04 LTS**
3. Select instance type: **t2.micro** (free tier) or **t3.small** (recommended)
4. Configure Security Group:
   - **SSH (22)** - Your IP only
   - **HTTP (80)** - 0.0.0.0/0 (or specific IPs)
   - **HTTPS (443)** - 0.0.0.0/0 (if using SSL)
5. Create/Select Key Pair for SSH access
6. Launch instance

## Step 2: Connect to EC2 Instance

```bash
# On Windows (PowerShell)
ssh -i "your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP

# On Mac/Linux
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

## Step 3: Initial EC2 Setup

Once connected to EC2, run the setup script:

```bash
# Clone your repository first
cd /home/ubuntu
git clone <your-repo-url> smartstore
cd smartstore

# Make scripts executable
chmod +x deploy/*.sh

# Run initial setup
sudo ./deploy/setup-ec2.sh
```

This will install:
- Node.js 18.x
- Python 3
- Nginx
- PM2
- Redis
- MongoDB

**Note:** Setup takes 5-10 minutes.

## Step 4: Configure Environment Variables

```bash
cd /home/ubuntu/smartstore/smartstore-backend
cp ../../deploy/.env.example .env
nano .env  # or use vi
```

**Important variables to update:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Generate a strong random string
- `GOOGLE_CALLBACK_URL` - Use your EC2 IP: `http://YOUR_EC2_IP/auth/google/callback`
- `FRONTEND_URL` - Use your EC2 IP: `http://YOUR_EC2_IP`
- AWS/Cloudinary credentials if using

## Step 5: Setup Nginx

```bash
# Copy Nginx configuration
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore

# Create symlink
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/

# Remove default config
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 6: Setup Services

### Backend (PM2)

```bash
cd /home/ubuntu/smartstore/smartstore-backend

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs
```

### Python Flask PDF Parser (systemd)

```bash
cd /home/ubuntu/smartstore
sudo ./deploy/setup-services.sh
```

## Step 7: Deploy Application

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

This script will:
- Pull latest code
- Install dependencies
- Build frontend
- Restart all services

## Step 8: Verify Deployment

1. **Check services:**
   ```bash
   pm2 status
   sudo systemctl status smartstore-pdf-parser
   sudo systemctl status nginx
   ```

2. **Check logs:**
   ```bash
   pm2 logs smartstore-backend
   sudo journalctl -u smartstore-pdf-parser -f
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Test in browser:**
   - Open: `http://YOUR_EC2_PUBLIC_IP`
   - Should see your frontend
   - Try logging in

## Step 9: Update Frontend API Configuration

The frontend should automatically detect production mode. But verify in:
`smartstore-frontend/src/api/axiosInstance.js`

In production, it will use `VITE_API_URL` environment variable or default to relative paths (which works with Nginx).

## Troubleshooting

### Backend not starting
```bash
cd /home/ubuntu/smartstore/smartstore-backend
pm2 logs smartstore-backend
# Check for errors in logs
```

### Frontend not loading
```bash
# Check if frontend is built
ls -la /home/ubuntu/smartstore/smartstore-frontend/dist

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB connection issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Port already in use
```bash
# Check what's using port 5000
sudo lsof -i :5000
# Kill the process if needed
```

## Security Checklist

- [ ] Change default MongoDB password
- [ ] Use strong JWT_SECRET
- [ ] Restrict SSH access to your IP only
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Setup firewall (UFW): `sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw enable`
- [ ] Use MongoDB Atlas instead of local MongoDB (recommended)
- [ ] Setup SSL/HTTPS (Let's Encrypt) if you have a domain

## Updating Application

To update your application after making changes:

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

Or manually:
```bash
git pull
cd smartstore-backend && npm install
cd ../smartstore-frontend && npm run build
pm2 restart smartstore-backend
sudo systemctl restart smartstore-pdf-parser
sudo nginx -s reload
```

## Useful Commands

```bash
# PM2
pm2 status
pm2 logs smartstore-backend
pm2 restart smartstore-backend
pm2 stop smartstore-backend

# Services
sudo systemctl status smartstore-pdf-parser
sudo systemctl restart smartstore-pdf-parser
sudo systemctl restart nginx
sudo systemctl restart mongod
sudo systemctl restart redis-server

# Logs
pm2 logs
sudo journalctl -u smartstore-pdf-parser -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Next Steps

1. **Setup CI/CD Pipeline** - See CI/CD guide (coming next)
2. **Add Domain Name** - Point domain to EC2 IP
3. **Setup SSL** - Use Let's Encrypt for HTTPS
4. **Monitoring** - Setup PM2 monitoring or CloudWatch
5. **Backups** - Setup MongoDB backups

