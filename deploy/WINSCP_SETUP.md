# WinSCP Setup - Fix Username Issue

WinSCP needs both the username AND the key file. Here's how to set it up correctly:

---

## 🔧 Step-by-Step WinSCP Configuration

### Step 1: Open WinSCP

1. Open WinSCP
2. Click **"New Site"** or **"New Session"** button

### Step 2: Basic Connection Settings

**Fill in these fields:**

- **File protocol:** `SFTP` (or `SCP`)
- **Host name:** `13.126.159.215` (your EC2 IP)
- **Port number:** `22`
- **User name:** `ubuntu` ← **THIS IS IMPORTANT!**

**DO NOT click Login yet!**

---

### Step 3: Configure SSH Authentication

1. Click **"Advanced..."** button (bottom left)
2. In the left panel, expand **"SSH"**
3. Click **"Authentication"**

### Step 4: Set Private Key File

1. Under **"Authentication parameters"**, select:
   - **Authentication:** `Public key`
   - **Private key file:** Click **"..."** button
2. Browse to your `.pem` file:
   - Example: `C:\Users\sneha\Downloads\smartstore-key.pem`
3. Select the file and click **"Open"**
4. Click **"OK"** to close Advanced settings

---

### Step 5: Save and Login

1. **Optional:** Click **"Save"** to save this session for future use
2. Click **"Login"** button

**You should now connect successfully!**

---

## 🔍 If Still Asking for Password

### Option 1: Check Key File Format

WinSCP might need the key in `.ppk` format. Convert it:

1. In WinSCP, go to **Tools** → **Run PuTTYgen**
2. Click **"Load"**
3. Select your `.pem` file
4. Change **"Files of type"** to **"All Files (*.*)"**
5. Select your `.pem` file
6. Click **"Save private key"**
7. Save as `.ppk` file
8. Use this `.ppk` file in WinSCP instead

### Option 2: Use Pageant (SSH Agent)

1. Download **PuTTY** suite (includes Pageant)
2. Run **Pageant**
3. Right-click Pageant icon → **Add Key**
4. Select your `.pem` file (convert to `.ppk` first if needed)
5. WinSCP will use Pageant automatically

---

## ✅ Quick Setup Checklist

- [ ] File protocol: **SFTP**
- [ ] Host name: **13.126.159.215**
- [ ] Port: **22**
- [ ] User name: **ubuntu** ← Must be set!
- [ ] Authentication: **Public key**
- [ ] Private key file: **Your .pem file path**

---

## 🚀 Alternative: Use FileZilla

If WinSCP keeps giving issues, try **FileZilla**:

1. Download: https://filezilla-project.org/download.php?type=client
2. **File** → **Site Manager** → **New Site**
3. **Protocol:** SFTP
4. **Host:** 13.126.159.215
5. **Logon Type:** Key file
6. **User:** ubuntu
7. **Key file:** Browse to your `.pem` file
8. **Connect**

---

## 📋 Complete WinSCP Settings Summary

```
File protocol: SFTP
Host name: 13.126.159.215
Port number: 22
User name: ubuntu

Advanced → SSH → Authentication:
  Authentication: Public key
  Private key file: C:\Users\sneha\Downloads\smartstore-key.pem
```

---

**Make sure "User name" is set to "ubuntu" - that's the key!**



