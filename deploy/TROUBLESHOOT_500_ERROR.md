# Troubleshoot 500 Internal Server Error

## 🔍 Step 1: Check PM2 Logs (Most Important!)

**On EC2, run:**

```bash
pm2 logs smartstore-backend --lines 50
```

**This will show the actual error!** Look for:
- MongoDB connection errors
- Missing environment variables
- Port conflicts
- Module errors

**Share the error message with me!**

---

## 🔍 Step 2: Check Backend Status

```bash
pm2 status
pm2 describe smartstore-backend
```

**Check:**
- Status (should be "online", not "errored")
- Restarts count
- Error logs

---

## 🔍 Step 3: Check Environment Variables

```bash
cd /home/ubuntu/smartstore/smartstore-backend
cat .env
```

**Verify:**
- `MONGO_URI` is set correctly
- `JWT_SECRET` is set
- `NODE_ENV=production`
- All required variables are present

---

## 🔍 Step 4: Check MongoDB Connection

```bash
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

**Should return:** `{ ok: 1 }`

---

## 🔍 Step 5: Check Nginx Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

**Look for:**
- 502 Bad Gateway (backend not responding)
- Connection refused errors

---

## 🔍 Step 6: Check if Backend is Listening

```bash
sudo netstat -tlnp | grep 5000
```

**Should show:** Node.js process listening on port 5000

---

## 🔧 Common Fixes

### Fix 1: Restart Backend

```bash
pm2 restart smartstore-backend
pm2 logs smartstore-backend --lines 20
```

### Fix 2: Check .env File

```bash
cd /home/ubuntu/smartstore/smartstore-backend
ls -la .env
cat .env | grep -v "^#" | grep -v "^$"
```

**If .env is missing:**
```bash
cp ../deploy/.env.example .env
nano .env
# Edit and save (Ctrl+X, Y, Enter)
pm2 restart smartstore-backend
```

### Fix 3: Check MongoDB

```bash
# Start MongoDB if not running
sudo systemctl start mongod
sudo systemctl status mongod

# Test connection
mongosh
# In MongoDB shell:
use smartstore
db.test.insertOne({test: "connection"})
exit
```

### Fix 4: Check Redis (for Bull queue)

```bash
sudo systemctl status redis-server
redis-cli ping
# Should return: PONG
```

---

## 🚨 Quick Diagnostic Commands

**Run all of these and share the output:**

```bash
# 1. PM2 status
pm2 status

# 2. PM2 logs (last 30 lines)
pm2 logs smartstore-backend --lines 30

# 3. Check .env exists
ls -la /home/ubuntu/smartstore/smartstore-backend/.env

# 4. Check MongoDB
sudo systemctl status mongod

# 5. Check Redis
sudo systemctl status redis-server

# 6. Check if port 5000 is in use
sudo netstat -tlnp | grep 5000

# 7. Nginx error log
sudo tail -20 /var/log/nginx/error.log
```

---

## 📋 Most Common Issues

### Issue 1: Missing .env file
**Fix:** Create `.env` file with required variables

### Issue 2: MongoDB not running
**Fix:** `sudo systemctl start mongod`

### Issue 3: Wrong MONGO_URI
**Fix:** Check `.env` file, should be `mongodb://localhost:27017/smartstore`

### Issue 4: Port 5000 already in use
**Fix:** `sudo lsof -i :5000` and kill the process

### Issue 5: Missing dependencies
**Fix:** `cd smartstore-backend && npm install`

---

**Run `pm2 logs smartstore-backend --lines 50` first and share the error!**

