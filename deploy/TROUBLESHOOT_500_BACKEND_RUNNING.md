# Troubleshoot 500 Error - Backend Running

If backend is running but you still get 500 error, check these:

---

## 🔍 Step 1: Check Nginx Error Logs

**On EC2, run:**

```bash
sudo tail -f /var/log/nginx/error.log
```

**Then try accessing the website** - you'll see the actual error in real-time.

**Look for:**
- 502 Bad Gateway (backend not responding)
- Connection refused
- Timeout errors

---

## 🔍 Step 2: Check Backend Logs

```bash
pm2 logs smartstore-backend --lines 30
```

**Look for:**
- Any errors when requests come in
- Database connection issues
- Route errors

---

## 🔍 Step 3: Test Backend Directly

```bash
# Test if backend responds directly (bypassing Nginx)
curl http://localhost:5000/health
```

**Expected:** JSON response with status "healthy"

**If this fails:** Backend has an issue
**If this works:** Nginx configuration issue

---

## 🔍 Step 4: Check Nginx Configuration

```bash
# Test Nginx config
sudo nginx -t

# Check if Nginx is proxying correctly
sudo tail -f /var/log/nginx/access.log
```

**Then access the website** - you should see requests in the log.

---

## 🔍 Step 5: Check What Error You're Getting

**In browser:**
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Click on the failed request
5. Check **Response** tab - what error message do you see?

---

## 🔧 Common Fixes

### Fix 1: Restart Nginx

```bash
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Fix 2: Check Nginx Proxy Configuration

```bash
cat /etc/nginx/sites-available/smartstore | grep proxy_pass
```

**Should show:** `proxy_pass http://localhost:5000;`

### Fix 3: Check if Backend is Actually Listening

```bash
sudo netstat -tlnp | grep 5000
```

**Should show:** Node.js process on port 5000

### Fix 4: Test API Endpoint

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test API endpoint
curl http://localhost:5000/api/inventory
```

---

## 🎯 Quick Diagnostic

**Run all of these:**

```bash
# 1. Check backend status
pm2 status

# 2. Check backend logs
pm2 logs smartstore-backend --lines 20

# 3. Test backend directly
curl http://localhost:5000/health

# 4. Check Nginx error log
sudo tail -20 /var/log/nginx/error.log

# 5. Check Nginx access log
sudo tail -20 /var/log/nginx/access.log

# 6. Test Nginx config
sudo nginx -t

# 7. Check if port 5000 is listening
sudo netstat -tlnp | grep 5000
```

---

## 📋 Most Likely Issues

### Issue 1: Nginx not proxying correctly
**Check:** `sudo tail -f /var/log/nginx/error.log`

### Issue 2: Backend returning errors
**Check:** `pm2 logs smartstore-backend`

### Issue 3: CORS issues
**Check:** Browser console (F12) for CORS errors

### Issue 4: Wrong Nginx root path
**Check:** `cat /etc/nginx/sites-available/smartstore | grep root`

---

**Run `sudo tail -f /var/log/nginx/error.log` and try accessing the site - share what error you see!**

