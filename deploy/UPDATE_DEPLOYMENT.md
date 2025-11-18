# How to Update Deployment with Latest Changes

If you've already deployed and pushed new changes to your repository, follow these steps to update your EC2 deployment.

---

## 🔄 Quick Update (If Already Deployed)

### Step 1: Connect to EC2

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

### Step 2: Navigate to Project Directory

```bash
cd /home/ubuntu/smartstore
```

### Step 3: Pull Latest Changes

```bash
git pull origin main
```

**Or if your default branch is `master`:**
```bash
git pull origin master
```

**Expected output:**
```
Updating abc1234..def5678
Fast-forward
 deploy/new-file.sh | 10 ++++++++++
 1 file changed, 10 insertions(+)
```

### Step 4: Run Deployment Script

After pulling changes, run the deployment script to rebuild and restart services:

```bash
./deploy/deploy.sh
```

This will:
- Install any new dependencies
- Rebuild the frontend
- Restart backend services
- Reload Nginx

**✅ Done! Your changes are now live!**

---

## 🔍 Verify Changes Were Pulled

### Check Git Status

```bash
cd /home/ubuntu/smartstore
git status
```

**Expected:** `Your branch is up to date with 'origin/main'`

### Check Recent Commits

```bash
git log --oneline -5
```

This shows the last 5 commits to verify your changes are there.

---

## 🐛 Troubleshooting

### Issue: "Your local changes would be overwritten"

If you have local changes on EC2 that conflict:

**Option 1: Stash local changes (recommended)**
```bash
git stash
git pull origin main
git stash pop  # If you need those local changes
```

**Option 2: Discard local changes**
```bash
git reset --hard
git pull origin main
```

**⚠️ Warning:** `git reset --hard` will delete any local changes!

### Issue: "Permission denied" when running deploy.sh

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

### Issue: Changes not showing after deployment

1. **Check if frontend was rebuilt:**
   ```bash
   ls -la smartstore-frontend/dist/
   # Check the timestamp of files
   ```

2. **Check if backend restarted:**
   ```bash
   pm2 logs smartstore-backend --lines 20
   ```

3. **Clear browser cache:**
   - Press `Ctrl+Shift+R` (hard refresh) in browser
   - Or open in incognito/private mode

4. **Manually rebuild frontend:**
   ```bash
   cd smartstore-frontend
   npm run build
   ```

5. **Manually restart backend:**
   ```bash
   pm2 restart smartstore-backend
   ```

---

## 📋 Complete Update Workflow

Here's the complete process from local to EC2:

### On Your Local Machine:

1. **Make changes to your code**
2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Your commit message"
   ```
3. **Push to repository:**
   ```bash
   git push origin main
   ```

### On EC2:

1. **Connect to EC2:**
   ```bash
   ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
   ```

2. **Pull and deploy:**
   ```bash
   cd /home/ubuntu/smartstore
   git pull origin main
   ./deploy/deploy.sh
   ```

3. **Verify:**
   ```bash
   ./deploy/test-deployment.sh
   ```

---

## 🚀 Automated Update Script

You can create a simple update script to make this easier:

```bash
cd /home/ubuntu/smartstore
cat > update.sh << 'EOF'
#!/bin/bash
echo "🔄 Updating deployment..."
cd /home/ubuntu/smartstore
git pull origin main
./deploy/deploy.sh
echo "✅ Update complete!"
EOF

chmod +x update.sh
```

**Then in the future, just run:**
```bash
./update.sh
```

---

## 🔄 What Gets Updated?

When you run `./deploy/deploy.sh` after pulling changes:

✅ **Backend:**
- Pulls latest code
- Installs new npm packages (if package.json changed)
- Restarts backend service

✅ **Frontend:**
- Pulls latest code
- Installs new npm packages (if package.json changed)
- Rebuilds frontend (creates new dist/)
- Nginx serves the new build

✅ **Python Flask:**
- Pulls latest code
- Installs new Python packages (if requirements.txt changed)
- Restarts PDF parser service

---

## ⚠️ Important Notes

1. **Environment Variables:** If you added new environment variables, update `.env` file:
   ```bash
   cd /home/ubuntu/smartstore/smartstore-backend
   nano .env
   # Add new variables
   pm2 restart smartstore-backend
   ```

2. **Database Migrations:** If you have database changes, you may need to run migrations manually

3. **Dependencies:** If you added new npm packages, the deploy script will install them automatically

4. **Configuration Changes:** If you changed Nginx config, you'll need to:
   ```bash
   sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 📝 Quick Reference

**Pull and deploy in one go:**
```bash
cd /home/ubuntu/smartstore && git pull origin main && ./deploy/deploy.sh
```

**Check what branch you're on:**
```bash
git branch
```

**See what changed:**
```bash
git log --oneline -10
git diff HEAD~1  # Compare with previous commit
```

---

## ✅ Summary

**To update your deployment with latest changes:**

1. `cd /home/ubuntu/smartstore`
2. `git pull origin main`
3. `./deploy/deploy.sh`

That's it! Your changes will be live in 2-3 minutes.

