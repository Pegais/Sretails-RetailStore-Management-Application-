# Complete Fix for 500 Error

Let's check everything step by step:

---

## 🔍 Step 1: Verify dist/ Folder Exists

**On EC2, run:**

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
ls -la dist/
```

**Expected:** Should see `index.html` and `static/` folder

**If dist/ doesn't exist or is empty:**
- The upload didn't work
- Need to re-upload

---

## 🔍 Step 2: Check Current Permissions

```bash
ls -la /home/ubuntu/smartstore/smartstore-frontend/
ls -la /home/ubuntu/smartstore/smartstore-frontend/dist/
```

**Check:** What permissions do you see?

---

## 🔧 Step 3: Fix All Permissions

**Run these commands:**

```bash
# Fix ownership
cd /home/ubuntu/smartstore
sudo chown -R ubuntu:ubuntu smartstore-frontend
sudo chown -R ubuntu:ubuntu smartstore-backend

# Fix permissions
chmod -R 755 smartstore-frontend
chmod -R 755 smartstore-frontend/dist

# Make sure Nginx can read
sudo chmod -R o+r smartstore-frontend/dist

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔧 Step 4: Check Nginx User

```bash
# Check what user Nginx runs as
ps aux | grep nginx

# Usually it's www-data
# Make sure www-data can read the files
sudo chmod -R o+r /home/ubuntu/smartstore/smartstore-frontend/dist
```

---

## 🔧 Step 5: Test File Access

```bash
# Test if you can read the file
cat /home/ubuntu/smartstore/smartstore-frontend/dist/index.html | head -5

# Test as www-data user
sudo -u www-data cat /home/ubuntu/smartstore/smartstore-frontend/dist/index.html | head -5
```

**If second command fails:** Permission issue
**If both work:** Nginx config issue

---

## 🔧 Step 6: Check Nginx Config

```bash
# Test config
sudo nginx -t

# Check the actual config
cat /etc/nginx/sites-available/smartstore | grep -A 5 "root"
```

---

## 🚨 Nuclear Option: Move to Standard Location

**If nothing works, move to /var/www (standard Nginx location):**

```bash
# Create standard web directory
sudo mkdir -p /var/www/smartstore

# Copy dist files
sudo cp -r /home/ubuntu/smartstore/smartstore-frontend/dist/* /var/www/smartstore/

# Fix permissions
sudo chown -R www-data:www-data /var/www/smartstore
sudo chmod -R 755 /var/www/smartstore

# Update Nginx config
sudo nano /etc/nginx/sites-available/smartstore
# Change: root /var/www/smartstore;
# Save: Ctrl+X, Y, Enter

# Test and restart
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📋 Complete Diagnostic

**Run all of these and share output:**

```bash
# 1. Check if dist exists
ls -la /home/ubuntu/smartstore/smartstore-frontend/dist/

# 2. Check permissions
ls -la /home/ubuntu/smartstore/smartstore-frontend/ | grep dist

# 3. Test file access
cat /home/ubuntu/smartstore/smartstore-frontend/dist/index.html | head -3

# 4. Test as www-data
sudo -u www-data cat /home/ubuntu/smartstore/smartstore-frontend/dist/index.html | head -3

# 5. Check Nginx config
sudo nginx -t

# 6. Check Nginx error log again
sudo tail -5 /var/log/nginx/error.log
```

---

**Run the diagnostic commands and share the output!**

