# Fix CORS Error

The error: `CORS blocked origin in production: http://13.126.159.215`

---

## ✅ Solution 1: Update .env File (Recommended)

**On EC2, check and update .env file:**

```bash
cd /home/ubuntu/smartstore/smartstore-backend
nano .env
```

**Make sure this line is set:**
```bash
FRONTEND_URL=http://13.126.159.215
```

**Save:** Ctrl+X, Y, Enter

**Then restart backend:**
```bash
pm2 restart smartstore-backend
pm2 logs smartstore-backend --lines 10
```

---

## ✅ Solution 2: I've Fixed the Code

I've updated the CORS logic to better handle IP addresses. After pulling the code:

```bash
cd /home/ubuntu/smartstore
git pull origin main
pm2 restart smartstore-backend
```

---

## 🔧 Quick Fix (If .env is correct)

**If FRONTEND_URL is already set correctly, the code fix should work after restart:**

```bash
pm2 restart smartstore-backend
pm2 logs smartstore-backend --lines 10
```

**Check logs - should see allowed origins listed.**

---

## 📋 Verify .env File

```bash
cd /home/ubuntu/smartstore/smartstore-backend
cat .env | grep FRONTEND_URL
```

**Should show:** `FRONTEND_URL=http://13.126.159.215`

**If not set or wrong:**
```bash
nano .env
# Add or update: FRONTEND_URL=http://13.126.159.215
# Save: Ctrl+X, Y, Enter
pm2 restart smartstore-backend
```

---

**Update .env file and restart backend - CORS should work!**

