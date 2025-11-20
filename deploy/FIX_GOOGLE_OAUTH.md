# Fix Google OAuth - Not Working

## ✅ Fixed!

I've fixed two issues:

1. **Frontend:** Google OAuth button now uses relative path in production (`/auth/google` instead of `http://IP:5000/auth/google`)
2. **Backend:** Redirect after Google login now uses `FRONTEND_URL` from environment

---

## 🔄 Steps to Deploy Fix

### Step 1: Rebuild Frontend

**On your local machine:**

```powershell
cd C:\Users\sneha\Desktop\Sretails\smartstore-frontend
npm run build
```

### Step 2: Upload dist/ to EC2

**Upload the new `dist/` folder via WinSCP** to:
`/home/ubuntu/smartstore/smartstore-frontend/`

### Step 3: Pull Backend Changes and Restart

**On EC2:**

```bash
cd /home/ubuntu/smartstore
git pull origin main
pm2 restart smartstore-backend
```

---

## 🔧 Also Update Google OAuth Console

**Important:** Make sure your Google OAuth callback URL is set correctly:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. **Authorized redirect URIs** should include:
   - `http://13.126.159.215/auth/google/callback`
   - `http://localhost:5000/auth/google/callback` (for local dev)

---

## ✅ After Fix

1. **Frontend:** Google button will go to `/auth/google` (through Nginx)
2. **Backend:** After Google login, redirects to `http://13.126.159.215/dashboard`
3. **Google Console:** Callback URL matches

---

## 🧪 Test

After deploying:
1. Click "Login with Google"
2. Should redirect to Google login
3. After login, should redirect back to `/dashboard`
4. Should be logged in!

---

**Rebuild frontend, upload, and restart backend - Google OAuth should work!**

