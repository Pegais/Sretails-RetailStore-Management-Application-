# Fix Permission Denied Error

The error is: `Permission denied (13: Permission denied)` - Nginx can't read the `dist/` folder.

---

## ✅ Quick Fix

**On EC2, run these commands:**

```bash
# Fix permissions for dist folder
cd /home/ubuntu/smartstore/smartstore-frontend
sudo chown -R ubuntu:ubuntu dist
chmod -R 755 dist

# Also fix parent directories
cd /home/ubuntu/smartstore
sudo chown -R ubuntu:ubuntu smartstore-frontend
chmod -R 755 smartstore-frontend

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔧 Alternative: Make Nginx User Owner

**If above doesn't work:**

```bash
# Make www-data (Nginx user) the owner
cd /home/ubuntu/smartstore/smartstore-frontend
sudo chown -R www-data:www-data dist
sudo chmod -R 755 dist

# Restart Nginx
sudo systemctl restart nginx
```

---

## ✅ Verify

```bash
# Check permissions
ls -la /home/ubuntu/smartstore/smartstore-frontend/dist/

# Should show: drwxr-xr-x (755 permissions)
```

---

## 🚀 Test

After fixing permissions:
1. Restart Nginx: `sudo systemctl restart nginx`
2. Test website: `http://YOUR_EC2_IP`
3. Should work now!

---

**Run the permission fix commands above!**

