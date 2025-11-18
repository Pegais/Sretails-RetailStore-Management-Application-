# Build Frontend Locally and Upload to EC2

This is **faster and more reliable** than building on EC2, especially if SSH is slow.

---

## 🚀 Method 1: Build Locally + Upload (Recommended)

### Step 1: Build on Your Local Machine

**On your Windows machine:**

```powershell
# Navigate to your project
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

**⏱️ This takes 1-2 minutes on your local machine!**

### Step 2: Upload dist folder to EC2

**Option A: Using SCP (PowerShell/CMD)**

```powershell
# From your local machine (PowerShell)
cd C:\Users\sneha\Desktop\Sretails

# Upload the dist folder
scp -i "path\to\your-key.pem" -r smartstore-frontend\dist ubuntu@YOUR_EC2_IP:/home/ubuntu/smartstore/smartstore-frontend/
```

**Replace:**
- `path\to\your-key.pem` - Your actual key file path
- `YOUR_EC2_IP` - Your EC2 Public IP

**Option B: Using WinSCP (GUI - Easier!)**

1. Download WinSCP: https://winscp.net/eng/download.php
2. Install and open WinSCP
3. **New Session:**
   - **File protocol:** SFTP
   - **Host name:** YOUR_EC2_IP
   - **User name:** ubuntu
   - **Private key file:** Browse and select your `.pem` file
   - Click **Login**
4. Navigate to: `/home/ubuntu/smartstore/smartstore-frontend/`
5. **Delete old `dist` folder** (if exists)
6. **Drag and drop** your local `dist` folder from `C:\Users\sneha\Desktop\Sretails\smartstore-frontend\dist`
7. Wait for upload to complete

**Option C: Using FileZilla (GUI - Also Easy!)**

1. Download FileZilla: https://filezilla-project.org/download.php?type=client
2. Install and open FileZilla
3. **File → Site Manager → New Site:**
   - **Protocol:** SFTP
   - **Host:** YOUR_EC2_IP
   - **Logon Type:** Key file
   - **User:** ubuntu
   - **Key file:** Browse and select your `.pem` file
   - Click **Connect**
4. Navigate to: `/home/ubuntu/smartstore/smartstore-frontend/`
5. Delete old `dist` folder
6. Drag and drop your local `dist` folder
7. Wait for upload

---

## 🔄 Method 2: Use Git (If SSH Works Sometimes)

### Step 1: Build Locally

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
npm run build
```

### Step 2: Commit and Push dist folder

**⚠️ Note:** Usually we don't commit `dist/`, but for this one-time upload, it's okay.

```powershell
cd C:\Users\sneha\Desktop\Sretails

# Add dist to git (temporarily)
git add smartstore-frontend/dist
git commit -m "Add built frontend for deployment"
git push origin main
```

### Step 3: Pull on EC2 (when SSH works)

```bash
cd /home/ubuntu/smartstore
git pull origin main
```

**Then remove dist from git later:**
```bash
# On your local machine
git rm -r --cached smartstore-frontend/dist
echo "smartstore-frontend/dist" >> .gitignore
git commit -m "Remove dist from git"
git push
```

---

## 📦 Method 3: Create ZIP and Upload

### Step 1: Build and ZIP Locally

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
npm run build

# Create ZIP
Compress-Archive -Path dist -DestinationPath dist.zip
```

### Step 2: Upload ZIP via WinSCP/FileZilla

1. Upload `dist.zip` to EC2: `/home/ubuntu/smartstore/smartstore-frontend/`
2. Then on EC2 (when SSH works), extract:
   ```bash
   cd /home/ubuntu/smartstore/smartstore-frontend
   unzip -o dist.zip
   rm dist.zip
   ```

---

## 🎯 Recommended: WinSCP (Easiest!)

**Why WinSCP is best:**
- ✅ GUI - Easy drag and drop
- ✅ No command line needed
- ✅ Shows progress
- ✅ Works even if SSH is slow
- ✅ Free and reliable

### Quick WinSCP Setup:

1. **Download:** https://winscp.net/eng/download.php
2. **Install** (just click Next)
3. **Open WinSCP**
4. **New Session:**
   ```
   File protocol: SFTP
   Host name: YOUR_EC2_IP
   Port number: 22
   User name: ubuntu
   ```
5. **Advanced → SSH → Authentication:**
   - **Authentication:** Public key
   - **Private key file:** Click "..." and select your `.pem` file
6. **Save** and **Login**
7. **Left side:** Your local files
8. **Right side:** EC2 files
9. Navigate to: `/home/ubuntu/smartstore/smartstore-frontend/`
10. **Delete** old `dist` folder (if exists)
11. **Drag** `dist` folder from left to right
12. **Done!**

---

## ✅ After Uploading

Once `dist` folder is uploaded, on EC2 (when SSH works):

```bash
# Verify dist folder exists
ls -la /home/ubuntu/smartstore/smartstore-frontend/dist

# Should see index.html and assets folder
```

Then restart Nginx:

```bash
sudo systemctl restart nginx
```

---

## 🔧 If You Can't Access EC2 at All

### Option: Use AWS Systems Manager Session Manager

1. **In AWS Console:**
   - Go to EC2 → Instances
   - Select your instance
   - Click **Connect**
   - Choose **Session Manager** tab
   - Click **Connect**

2. **This opens a browser-based terminal** (no SSH needed!)

3. **Then run:**
   ```bash
   cd /home/ubuntu/smartstore/smartstore-frontend
   # Upload dist folder using WinSCP/FileZilla first
   # Then verify:
   ls -la dist/
   ```

---

## 📝 Quick Checklist

- [ ] Build frontend locally: `npm run build`
- [ ] Install WinSCP or FileZilla
- [ ] Connect to EC2 via WinSCP/FileZilla
- [ ] Upload `dist` folder to `/home/ubuntu/smartstore/smartstore-frontend/`
- [ ] Verify on EC2: `ls -la dist/`
- [ ] Restart Nginx: `sudo systemctl restart nginx`
- [ ] Test in browser: `http://YOUR_EC2_IP`

---

## 🎉 That's It!

Building locally and uploading is:
- ✅ **10x faster** (1-2 min vs 10-20 min)
- ✅ **More reliable** (no SSH lag issues)
- ✅ **Easier to debug** (see errors immediately)
- ✅ **Works even if EC2 is slow**

**Recommended:** Use **WinSCP** - it's the easiest method!

