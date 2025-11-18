# Deployment Testing Checklist

Use this checklist to test your deployment step by step.

## Pre-Deployment Checklist

- [ ] EC2 instance launched (Ubuntu 22.04 LTS)
- [ ] Security Group configured:
  - [ ] Port 22 (SSH) - Your IP only
  - [ ] Port 80 (HTTP) - 0.0.0.0/0
- [ ] EC2 Public IP noted: `_________________`
- [ ] SSH key pair ready
- [ ] Git repository URL ready

## Step 1: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

**Expected Result:** ✅ Successfully connected to EC2

**If failed:**
- Check Security Group allows SSH from your IP
- Verify key file permissions (chmod 400 on Mac/Linux)
- Check EC2 instance is running

---

## Step 2: Initial Setup

```bash
# Clone repository
cd /home/ubuntu
git clone <YOUR_REPO_URL> smartstore
cd smartstore

# Make scripts executable
chmod +x deploy/*.sh

# Run setup
sudo ./deploy/setup-ec2.sh
```

**Expected Result:** ✅ All packages installed successfully

**Check installations:**
```bash
node --version    # Should show v18.x.x
npm --version     # Should show version
python3 --version # Should show Python 3.x
nginx -v          # Should show Nginx version
pm2 --version     # Should show PM2 version
redis-cli ping    # Should return PONG
sudo systemctl status mongod  # Should be active
```

**If failed:**
- Check internet connection on EC2
- Review error messages in terminal
- MongoDB installation might take extra time

---

## Step 3: Configure Environment Variables

```bash
cd /home/ubuntu/smartstore/smartstore-backend
cp ../deploy/.env.example .env
nano .env
```

**Required variables to set:**
- [ ] `JWT_SECRET` - Generate: `openssl rand -base64 32`
- [ ] `MONGO_URI` - Use: `mongodb://localhost:27017/smartstore`
- [ ] `FRONTEND_URL` - Use: `http://YOUR_EC2_IP`
- [ ] `GOOGLE_CALLBACK_URL` - Use: `http://YOUR_EC2_IP/auth/google/callback`
- [ ] `NODE_ENV=production`

**Save:** Ctrl+X, Y, Enter

**Test MongoDB connection:**
```bash
mongosh
# In MongoDB shell:
use smartstore
db.test.insertOne({test: "connection"})
db.test.find()
exit
```

---

## Step 4: Setup Nginx

```bash
cd /home/ubuntu/smartstore

# Copy Nginx config
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore

# Enable site
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t
```

**Expected Result:** ✅ `nginx: configuration file /etc/nginx/nginx.conf test is successful`

**If failed:**
- Check for syntax errors in config file
- Verify file paths are correct

```bash
# Start Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

**Expected Result:** ✅ Nginx is active and running

---

## Step 5: Build Frontend (First Time)

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
npm install
npm run build
```

**Expected Result:** ✅ Build completes, `dist/` folder created

**Check:**
```bash
ls -la dist/
# Should see index.html and assets folder
```

**If failed:**
- Check Node.js version: `node --version`
- Check for build errors in terminal
- Verify all dependencies installed

---

## Step 6: Setup Python Flask Service

```bash
cd /home/ubuntu/smartstore
sudo ./deploy/setup-services.sh
```

**Expected Result:** ✅ Service created and started

**Check:**
```bash
sudo systemctl status smartstore-pdf-parser
```

**Expected Result:** ✅ Service is active

**If failed:**
- Check Python venv was created: `ls smartstore-backend/pdf-parser-flask/venv`
- Check service logs: `sudo journalctl -u smartstore-pdf-parser -n 50`

---

## Step 7: Start Backend with PM2

```bash
cd /home/ubuntu/smartstore/smartstore-backend

# Create logs directory
mkdir -p logs

# Start backend
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Copy and run the command it outputs
```

**Expected Result:** ✅ Backend started, PM2 shows it as online

**Check:**
```bash
pm2 status
pm2 logs smartstore-backend --lines 50
```

**Expected Result:** ✅ Backend logs show "MongoDB connected" and "Server running"

**If failed:**
- Check .env file exists and has correct values
- Check MongoDB is running: `sudo systemctl status mongod`
- Check Redis is running: `sudo systemctl status redis-server`
- Review PM2 logs for errors

---

## Step 8: Test Deployment Script

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

**Expected Result:** ✅ All steps complete successfully

**Check services after deployment:**
```bash
pm2 status
sudo systemctl status smartstore-pdf-parser
sudo systemctl status nginx
```

---

## Step 9: Test Application in Browser

1. **Open browser:** `http://YOUR_EC2_IP`

**Expected Result:** ✅ Frontend loads

**If blank page:**
- Check browser console (F12) for errors
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify frontend build exists: `ls -la smartstore-frontend/dist`

2. **Test API endpoint:** `http://YOUR_EC2_IP/api/inventory`

**Expected Result:** ✅ API responds (might be 401/403 if auth required, but should not be 502/503)

**If 502 Bad Gateway:**
- Backend not running: `pm2 status`
- Check backend logs: `pm2 logs smartstore-backend`
- Check backend is listening: `sudo netstat -tlnp | grep 5000`

**If 404 Not Found:**
- Check Nginx config routes
- Verify backend routes are correct

3. **Test login/registration**

**Expected Result:** ✅ Can create account or login

---

## Step 10: Verify All Services

```bash
# Backend
pm2 status
curl http://localhost:5000/health  # If you have health endpoint

# Python Flask
sudo systemctl status smartstore-pdf-parser
curl http://localhost:5001/parse-pdf  # Should return error (needs file), not connection refused

# Nginx
sudo systemctl status nginx
curl -I http://localhost

# MongoDB
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"

# Redis
sudo systemctl status redis-server
redis-cli ping
```

**All should be:** ✅ Active/Running

---

## Common Issues & Solutions

### Issue: "Permission denied" when running scripts
```bash
chmod +x deploy/*.sh
```

### Issue: MongoDB connection failed
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Issue: Backend won't start
```bash
# Check .env file exists
ls -la smartstore-backend/.env

# Check PM2 logs
pm2 logs smartstore-backend --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000
```

### Issue: Frontend not loading
```bash
# Rebuild frontend
cd smartstore-frontend
npm run build

# Check Nginx config
sudo nginx -t
sudo systemctl restart nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Can't access from browser
- Check Security Group allows port 80
- Check EC2 instance is running
- Verify Public IP is correct
- Check Nginx is running: `sudo systemctl status nginx`

---

## Success Criteria

✅ All services running (PM2, systemd, Nginx)  
✅ Frontend loads in browser  
✅ Backend API responds  
✅ Can login/register  
✅ MongoDB connection working  
✅ No errors in logs  

---

## Next Steps After Successful Deployment

1. [ ] Test all major features
2. [ ] Setup CI/CD pipeline
3. [ ] Add domain name (optional)
4. [ ] Setup SSL/HTTPS (optional)
5. [ ] Configure backups
6. [ ] Setup monitoring

---

## Quick Health Check Commands

```bash
# One-liner to check all services
echo "=== PM2 ===" && pm2 status && \
echo "=== PDF Parser ===" && sudo systemctl is-active smartstore-pdf-parser && \
echo "=== Nginx ===" && sudo systemctl is-active nginx && \
echo "=== MongoDB ===" && sudo systemctl is-active mongod && \
echo "=== Redis ===" && sudo systemctl is-active redis-server
```

