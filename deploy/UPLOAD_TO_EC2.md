# Upload dist/ Folder to EC2

## 🚀 Method 1: Using WinSCP (Easiest - Recommended!)

### Step 1: Download WinSCP

1. Go to: https://winscp.net/eng/download.php
2. Download and install WinSCP
3. Open WinSCP

### Step 2: Connect to EC2

1. **New Session** (or click the "New Site" button)
2. **Fill in details:**
   - **File protocol:** SFTP
   - **Host name:** YOUR_EC2_PUBLIC_IP
   - **Port number:** 22
   - **User name:** ubuntu
3. **Click "Advanced..." button**
4. **Go to:** SSH → Authentication
5. **Authentication:** Public key
6. **Private key file:** Click "..." and browse to your `.pem` file
   - Example: `C:\Users\sneha\Downloads\smartstore-key.pem`
7. **Click OK**
8. **Click "Save"** (optional - to save for future)
9. **Click "Login"**

### Step 3: Upload dist/ Folder

1. **Left side:** Your local files (navigate to your project)
   - Navigate to: `C:\Users\sneha\Desktop\Sretails\smartstore-frontend\`
2. **Right side:** EC2 files
   - Navigate to: `/home/ubuntu/smartstore/smartstore-frontend/`
3. **On right side (EC2):**
   - **Delete old `dist/` folder** if it exists (right-click → Delete)
   - **Delete old `build/` folder** if it exists
4. **On left side (Local):**
   - Find the `dist/` folder
5. **Drag and drop** `dist/` folder from left to right
6. **Wait for upload to complete** (shows progress bar)

### Step 4: Verify Upload

On right side (EC2), you should see:
- `dist/` folder
- Inside: `index.html`, `static/` folder

**✅ Upload complete!**

---

## 🔧 Method 2: Using SCP (Command Line)

**From PowerShell on your local machine:**

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend

# Upload dist folder
scp -i "path\to\your-key.pem" -r dist ubuntu@YOUR_EC2_IP:/home/ubuntu/smartstore/smartstore-frontend/
```

**Replace:**
- `path\to\your-key.pem` - Your actual key file path
- `YOUR_EC2_IP` - Your EC2 Public IP

---

## 🔧 Method 3: Using FileZilla

1. Download FileZilla: https://filezilla-project.org/download.php?type=client
2. Install and open
3. **File → Site Manager → New Site:**
   - **Protocol:** SFTP
   - **Host:** YOUR_EC2_IP
   - **Logon Type:** Key file
   - **User:** ubuntu
   - **Key file:** Browse and select your `.pem` file
4. **Connect**
5. Navigate to `/home/ubuntu/smartstore/smartstore-frontend/`
6. Delete old `dist/` folder
7. Drag and drop your local `dist/` folder

---

## ✅ After Upload

Once `dist/` is uploaded to EC2, we'll:
1. Connect to EC2 via SSH
2. Run deployment script
3. Restart services
4. Test the website

---

## 📋 Quick Checklist

- [ ] WinSCP installed
- [ ] Connected to EC2
- [ ] Navigated to `/home/ubuntu/smartstore/smartstore-frontend/`
- [ ] Deleted old `dist/` folder (if exists)
- [ ] Uploaded new `dist/` folder
- [ ] Verified `dist/` contains `index.html` and `static/` folder

---

**Use WinSCP - it's the easiest method!**

