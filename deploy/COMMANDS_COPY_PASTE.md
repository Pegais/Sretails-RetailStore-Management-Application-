# Commands to Copy-Paste

Copy and paste these commands in order. Replace placeholders with your actual values.

## 🔑 Step 1: Connect to EC2

**Windows PowerShell:**
```powershell
cd C:\Users\YourName\Downloads
ssh -i "smartstore-key.pem" ubuntu@YOUR_EC2_IP
```

**Mac/Linux:**
```bash
cd ~/Downloads
chmod 400 smartstore-key.pem
ssh -i smartstore-key.pem ubuntu@YOUR_EC2_IP
```

---

## 📥 Step 2: Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git smartstore
cd smartstore
```

**Replace:**
- `YOUR_USERNAME` - Your GitHub username
- `YOUR_REPO_NAME` - Your repository name

---

## ⚙️ Step 3: Initial Setup

```bash
chmod +x deploy/*.sh
sudo ./deploy/setup-ec2.sh
```

**Wait 5-10 minutes for completion**

---

## ✅ Step 4: Verify Installations

```bash
node --version
npm --version
python3 --version
nginx -v
pm2 --version
redis-cli ping
sudo systemctl status mongod
```

---

## 🔧 Step 5: Configure Environment

```bash
cd /home/ubuntu/smartstore/smartstore-backend
cp ../deploy/.env.example .env
nano .env
```

**In nano editor, update these lines:**
- `NODE_ENV=production`
- `JWT_SECRET=<generate-with-next-command>`
- `MONGO_URI=mongodb://localhost:27017/smartstore`
- `FRONTEND_URL=http://YOUR_EC2_IP`
- `GOOGLE_CALLBACK_URL=http://YOUR_EC2_IP/auth/google/callback`

**Save:** Ctrl+X, Y, Enter

**Generate JWT Secret:**
```bash
openssl rand -base64 32
```

**Copy the output and update .env file again:**
```bash
nano .env
# Update JWT_SECRET with the generated value
# Save: Ctrl+X, Y, Enter
```

---

## 🌐 Step 6: Setup Nginx

```bash
cd /home/ubuntu/smartstore
sudo cp deploy/nginx-smartstore.conf /etc/nginx/sites-available/smartstore
sudo ln -s /etc/nginx/sites-available/smartstore /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
sudo systemctl status nginx
```

---

## 🏗️ Step 7: Build Frontend

```bash
cd /home/ubuntu/smartstore/smartstore-frontend
npm install
npm run build
ls -la dist/
```

---

## 🐍 Step 8: Setup Python Service

```bash
cd /home/ubuntu/smartstore
sudo ./deploy/setup-services.sh
sudo systemctl status smartstore-pdf-parser
```

---

## 🚀 Step 9: Start Backend

```bash
cd /home/ubuntu/smartstore/smartstore-backend
mkdir -p logs
pm2 start ecosystem.config.js
pm2 logs smartstore-backend --lines 20
pm2 save
pm2 startup
```

**Copy and run the command that pm2 startup shows:**
```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

---

## 🧪 Step 10: Test Everything

```bash
cd /home/ubuntu/smartstore
chmod +x deploy/test-deployment.sh
./deploy/test-deployment.sh
```

**Test in browser:**
- Frontend: `http://YOUR_EC2_IP`
- Health: `http://YOUR_EC2_IP/health`
- API: `http://YOUR_EC2_IP/api/inventory`

---

## 📊 Step 11: Verify All Services

```bash
pm2 status
sudo systemctl status smartstore-pdf-parser --no-pager
sudo systemctl status nginx --no-pager
sudo systemctl status mongod --no-pager
sudo systemctl status redis-server --no-pager
```

---

## 🔄 Future Deployments (After Initial Setup)

```bash
cd /home/ubuntu/smartstore
./deploy/deploy.sh
```

---

## 🐛 Quick Troubleshooting Commands

**Check backend logs:**
```bash
pm2 logs smartstore-backend --lines 50
```

**Check PDF Parser logs:**
```bash
sudo journalctl -u smartstore-pdf-parser -n 50
```

**Check Nginx logs:**
```bash
sudo tail -f /var/log/nginx/error.log
```

**Restart services:**
```bash
pm2 restart smartstore-backend
sudo systemctl restart smartstore-pdf-parser
sudo systemctl restart nginx
```

**Check what's using a port:**
```bash
sudo lsof -i :5000
```

