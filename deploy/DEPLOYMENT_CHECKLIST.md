# Deployment Checklist ✅

Use this checklist to track your progress. Check off each item as you complete it.

## 📋 Pre-Deployment

- [ ] AWS account created and logged in
- [ ] EC2 instance launched (Ubuntu 22.04)
- [ ] Security Group configured (ports 22, 80)
- [ ] Key pair (.pem file) downloaded and saved
- [ ] EC2 Public IP noted: `_________________`
- [ ] Connected to EC2 via SSH

## 📋 Part 1: EC2 Setup

- [ ] Navigated to `/home/ubuntu`
- [ ] Cloned repository: `git clone <repo-url> smartstore`
- [ ] Verified repository cloned: `ls -la smartstore`
- [ ] Made scripts executable: `chmod +x deploy/*.sh`
- [ ] Ran setup script: `sudo ./deploy/setup-ec2.sh`
- [ ] Setup completed successfully
- [ ] Verified Node.js: `node --version` (v18+)
- [ ] Verified Python: `python3 --version`
- [ ] Verified Nginx: `nginx -v`
- [ ] Verified PM2: `pm2 --version`
- [ ] Verified Redis: `redis-cli ping` (returns PONG)
- [ ] Verified MongoDB: `sudo systemctl status mongod` (active)

## 📋 Part 2: Configuration

- [ ] Navigated to backend: `cd smartstore-backend`
- [ ] Copied .env template: `cp ../deploy/.env.example .env`
- [ ] Edited .env file: `nano .env`
- [ ] Set `NODE_ENV=production`
- [ ] Set `PORT=5000`
- [ ] Generated JWT secret: `openssl rand -base64 32`
- [ ] Set `JWT_SECRET=<generated-value>`
- [ ] Set `MONGO_URI=mongodb://localhost:27017/smartstore`
- [ ] Set `FRONTEND_URL=http://YOUR_EC2_IP`
- [ ] Set `GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP/auth/google/callback`
- [ ] Saved .env file (Ctrl+X, Y, Enter)
- [ ] Tested MongoDB connection: `mongosh`

## 📋 Part 3: Nginx Setup

- [ ] Navigated to project root: `cd /home/ubuntu/smartstore`
- [ ] Copied Nginx config: `sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore`
- [ ] Enabled site: `sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/`
- [ ] Removed default: `sudo rm /etc/nginx/sites-enabled/default`
- [ ] Tested config: `sudo nginx -t` (successful)
- [ ] Started Nginx: `sudo systemctl restart nginx`
- [ ] Enabled Nginx: `sudo systemctl enable nginx`
- [ ] Verified Nginx: `sudo systemctl status nginx` (active)

## 📋 Part 4: Frontend Build

- [ ] Navigated to frontend: `cd smartstore-frontend`
- [ ] Installed dependencies: `npm install` (completed)
- [ ] Built frontend: `npm run build` (completed)
- [ ] Verified build: `ls -la dist/` (index.html exists)

## 📋 Part 5: Services Setup

- [ ] Navigated to project root: `cd /home/ubuntu/smartstore`
- [ ] Ran service setup: `sudo ./deploy/setup-services.sh`
- [ ] Verified PDF Parser: `sudo systemctl status smartstore-pdf-parser` (active)
- [ ] Navigated to backend: `cd smartstore-backend`
- [ ] Created logs directory: `mkdir -p logs`
- [ ] Started backend: `pm2 start ecosystem.config.js`
- [ ] Verified PM2: `pm2 status` (smartstore-backend online)
- [ ] Checked logs: `pm2 logs smartstore-backend` (no errors)
- [ ] Saved PM2: `pm2 save`
- [ ] Setup PM2 startup: `pm2 startup` (command executed)

## 📋 Part 6: Testing

- [ ] Ran test script: `./deploy/test-deployment.sh` (all ✅)
- [ ] Tested frontend in browser: `http://YOUR_EC2_IP` (loads)
- [ ] Tested health endpoint: `http://YOUR_EC2_IP/health` (returns JSON)
- [ ] Tested API endpoint: `http://YOUR_EC2_IP/api/inventory` (responds)
- [ ] Tested login/registration (works)
- [ ] Verified all services running:
  - [ ] PM2: `pm2 status` (online)
  - [ ] PDF Parser: `sudo systemctl status smartstore-pdf-parser` (active)
  - [ ] Nginx: `sudo systemctl status nginx` (active)
  - [ ] MongoDB: `sudo systemctl status mongod` (active)
  - [ ] Redis: `sudo systemctl status redis-server` (active)

## 🎉 Deployment Complete!

- [ ] Application is live and accessible
- [ ] All features tested and working
- [ ] Ready for CI/CD setup (next step)

---

## 📝 Notes

**EC2 Public IP:** `_________________`  
**Key File Location:** `_________________`  
**Repository URL:** `_________________`  
**Issues Encountered:** `_________________`

---

## 🐛 Issues to Fix Later

- [ ] Issue 1: `_________________`
- [ ] Issue 2: `_________________`
- [ ] Issue 3: `_________________`

