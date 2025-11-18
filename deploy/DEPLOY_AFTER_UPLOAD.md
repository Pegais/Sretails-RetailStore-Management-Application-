# Deploy After Uploading dist/ to EC2

Once you've uploaded the `dist/` folder to EC2, follow these steps:

---

## 📋 Step 1: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

---

## 📋 Step 2: Verify dist/ Folder

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
ls -la dist/
```

**Expected:** Should see `index.html` and `static/` folder

---

## 📋 Step 3: Run Deployment Script

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

**This will:**
- Pull latest code (if any changes)
- Install backend dependencies
- **Skip frontend build** (uses your uploaded dist/)
- Restart all services
- Reload Nginx

---

## 📋 Step 4: Verify Services

```bash
# Check backend
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check PDF Parser
sudo systemctl status smartstore-pdf-parser
```

All should be **active/running**

---

## 📋 Step 5: Test Website

1. **Open browser:** `http://YOUR_EC2_IP`
2. **Should see your application!**

---

## 🐛 If Something Goes Wrong

### Frontend not loading?

```bash
# Check if dist exists
ls -la /home/ubuntu/smartstore/smartstore-frontend/dist/

# Check Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Backend not working?

```bash
# Check PM2
pm2 status
pm2 logs smartstore-backend --lines 50

# Restart backend
pm2 restart smartstore-backend
```

---

## ✅ Success!

Once you see your application in the browser, deployment is complete! 🎉

---

**After uploading dist/, connect to EC2 and run `./deploy/deploy.sh`**

