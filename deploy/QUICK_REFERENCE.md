# Quick Reference - Deployment Commands

## 🚀 Initial Setup (One Time)

```bash
# Connect to EC2
ssh -i "key.pem" ubuntu@YOUR_EC2_IP

# Clone repo
cd /home/ubuntu && git clone <REPO_URL> smartstore && cd smartstore

# Setup EC2
chmod +x deploy/*.sh
sudo ./deploy/setup-ec2.sh

# Configure environment
cd smartstore-backend
cp ../deploy/.env.example .env
nano .env  # Edit and save

# Setup Nginx
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Setup services
cd /home/ubuntu/smartstore
sudo ./deploy/setup-services.sh

# Start backend
cd smartstore-backend
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run the command it outputs

# Build frontend
cd ../smartstore-frontend
npm install && npm run build
```

---

## 🔄 Daily Operations

### Deploy Updates
```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

### Check Status
```bash
pm2 status
sudo systemctl status smartstore-pdf-parser
sudo systemctl status nginx
```

### View Logs
```bash
# Backend
pm2 logs smartstore-backend

# PDF Parser
sudo journalctl -u smartstore-pdf-parser -f

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
pm2 restart smartstore-backend
sudo systemctl restart smartstore-pdf-parser
sudo systemctl restart nginx
```

---

## 🧪 Testing

### Run Test Script
```bash
cd /home/ubuntu/smartstore
./deploy/test-deployment.sh
```

### Manual Tests
```bash
# Health check
curl http://localhost:5000/health

# Frontend
curl http://localhost

# API
curl http://localhost/api/inventory
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
pm2 logs smartstore-backend --lines 50
cd smartstore-backend && cat .env  # Check env file
```

### Frontend not loading
```bash
ls -la smartstore-frontend/dist  # Check build exists
cd smartstore-frontend && npm run build  # Rebuild
sudo nginx -t  # Check Nginx config
```

### MongoDB issues
```bash
sudo systemctl status mongod
sudo systemctl restart mongod
mongosh  # Test connection
```

### Port conflicts
```bash
sudo lsof -i :5000  # Check what's using port
sudo netstat -tlnp | grep 5000
```

---

## 📍 Important Paths

- **App Directory:** `/home/ubuntu/smartstore`
- **Backend:** `/home/ubuntu/smartstore/smartstore-backend`
- **Frontend Build:** `/home/ubuntu/smartstore/smartstore-frontend/dist`
- **Nginx Config:** `/etc/nginx/sites-available/smartstore`
- **Environment:** `/home/ubuntu/smartstore/smartstore-backend/.env`
- **PM2 Logs:** `/home/ubuntu/smartstore/smartstore-backend/logs/`

---

## 🔐 Security

### Firewall (UFW)
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw enable
sudo ufw status
```

### Generate JWT Secret
```bash
openssl rand -base64 32
```

---

## 📊 Monitoring

### Service Status
```bash
pm2 monit  # PM2 monitoring dashboard
pm2 list
```

### System Resources
```bash
htop  # Install: sudo apt install htop
df -h  # Disk space
free -h  # Memory
```

---

## 🔄 Update Process

1. **Pull latest code:**
   ```bash
   cd /home/ubuntu/smartstore
   git pull origin main
   ```

2. **Deploy:**
   ```bash
   ./deploy/deploy.sh
   ```

3. **Verify:**
   ```bash
   ./deploy/test-deployment.sh
   ```

---

## 📞 Emergency Commands

### Stop Everything
```bash
pm2 stop all
sudo systemctl stop smartstore-pdf-parser
sudo systemctl stop nginx
```

### Start Everything
```bash
pm2 start all
sudo systemctl start smartstore-pdf-parser
sudo systemctl start nginx
```

### Full Reset (if needed)
```bash
cd /home/ubuntu/smartstore
pm2 delete all
sudo systemctl stop smartstore-pdf-parser
./deploy/deploy.sh
```

