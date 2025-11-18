# Restart EC2 Instance - Fresh Start

Stopping and restarting will kill all processes and give you a clean slate.

---

## 🛑 Step 1: Stop the Instance

1. Go to **AWS Console** → **EC2** → **Instances**
2. **Select your instance** (check the box)
3. Click **Instance state** → **Stop instance**
4. Confirm by clicking **Stop**
5. Wait 1-2 minutes for instance to stop (status will show "stopped")

---

## ▶️ Step 2: Start the Instance

1. **Select your instance** (still checked)
2. Click **Instance state** → **Start instance**
3. Wait 1-2 minutes for instance to start (status will show "running")
4. **Note the new Public IP** (it might have changed!)

---

## ⚠️ Important: Check Public IP

When you restart, the Public IP might change!

1. Check the **Public IPv4 address** in the instance details
2. Update your SSH connection if needed:
   ```bash
   ssh -i "your-key.pem" ubuntu@NEW_PUBLIC_IP
   ```

---

## ✅ Step 3: Verify Instance is Running

1. Status should show: **"running"**
2. Status checks: **2/2 checks passed** (wait a minute if not)
3. Note the **Public IPv4 address**

---

## 🧹 Step 4: Clean Up (After Restart)

Once instance is running and you can connect:

```bash
# Connect via SSH (with new IP if it changed)
ssh -i "your-key.pem" ubuntu@YOUR_NEW_PUBLIC_IP

# Clean up any leftover build artifacts
cd /home/ubuntu/smartstore/smartstore-frontend
rm -rf dist
rm -rf node_modules/.vite

# Verify
ls -la | grep dist
```

---

## ✅ Ready for Fresh Start!

After restart, we'll:
1. Build frontend locally on your machine
2. Push to GitHub
3. Pull on EC2
4. Deploy

---

## 📋 Quick Checklist

- [ ] Instance stopped
- [ ] Instance started
- [ ] New Public IP noted
- [ ] Can connect via SSH
- [ ] Cleaned up dist folder
- [ ] Ready for local build

---

**After restart, let me know and we'll proceed with the local build approach!**

