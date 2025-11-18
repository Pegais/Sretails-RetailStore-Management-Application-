# Fix: www-data Cannot Read Files

The issue: Nginx runs as `www-data` user, but it can't read the files.

---

## ✅ Solution: Fix Permissions for www-data

**On EC2, run these commands:**

```bash
# Make files readable by www-data
cd /home/ubuntu/smartstore/smartstore-frontend
sudo chmod -R o+r dist
sudo chmod -R o+x dist
sudo chmod -R o+x .

# Also fix parent directories (www-data needs to traverse the path)
sudo chmod o+x /home/ubuntu
sudo chmod o+x /home/ubuntu/smartstore
sudo chmod o+x /home/ubuntu/smartstore/smartstore-frontend

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔧 Alternative: Change Ownership to www-data

**If above doesn't work:**

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
sudo chown -R www-data:www-data dist
sudo chmod -R 755 dist

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🚀 Best Solution: Move to /var/www

**This is the standard location and avoids permission issues:**

```bash
# Create web directory
sudo mkdir -p /var/www/smartstore

# Copy files
sudo cp -r /home/ubuntu/smartstore/smartstore-frontend/dist/* /var/www/smartstore/

# Fix ownership and permissions
sudo chown -R www-data:www-data /var/www/smartstore
sudo chmod -R 755 /var/www/smartstore

# Update Nginx config
sudo nano /etc/nginx/sites-available/smartstore
```

**Change:**
```nginx
root /home/ubuntu/smartstore/smartstore-frontend/dist;
```

**To:**
```nginx
root /var/www/smartstore;
```

**Save:** Ctrl+X, Y, Enter

**Then:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

**Try the first solution first, if it doesn't work, use the /var/www method!**

