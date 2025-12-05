# CORS and Cookie Configuration for Railway + Vercel Deployment

## ✅ Changes Made

### Backend (Railway)
1. **CORS Configuration** (`server.js`):
   - Added `credentials: true` to allow cookies in cross-origin requests
   - Configured to accept multiple origins (comma-separated in `FRONTEND_URL`)
   - Added proper headers for cookie support

2. **Cookie Settings** (all auth routes):
   - `secure: true` in production (required for HTTPS)
   - `sameSite: 'None'` in production (required for cross-origin cookies)
   - `httpOnly: true` (security best practice)

### Frontend (Vercel)
1. **Axios Configuration** (`axiosInstance.js`):
   - Already has `withCredentials: true` ✅
   - Updated to properly use `REACT_APP_API_URL` in production

---

## 🔧 Required Environment Variables

### Railway (Backend) Environment Variables

Set these in your Railway project settings:

```bash
# Frontend URL(s) - comma-separated for multiple origins
FRONTEND_URL=https://your-app.vercel.app,https://www.your-app.vercel.app

# Other existing variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=3d
NODE_ENV=production
PORT=5000

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK=https://your-backend.railway.app/auth/google/callback
```

**Important**: 
- Replace `your-app.vercel.app` with your actual Vercel domain
- Replace `your-backend.railway.app` with your actual Railway backend URL
- Use HTTPS URLs only (no `http://`)

### Vercel (Frontend) Environment Variables

Set these in your Vercel project settings:

```bash
# Backend API URL (Railway backend)
REACT_APP_API_URL=https://your-backend.railway.app

# Other existing variables (if any)
NODE_ENV=production
```

**Important**: 
- Replace `your-backend.railway.app` with your actual Railway backend URL
- Must use HTTPS (no `http://`)
- No trailing slash (the code handles it)

---

## 🔍 How to Set Environment Variables

### Railway
1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the "Variables" tab
4. Add/update the variables listed above

### Vercel
1. Go to your Vercel project dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Add/update the variables listed above
5. **Important**: Make sure to set them for "Production" environment
6. Redeploy after adding variables

---

## ✅ Testing Checklist

After deploying with the new configuration:

1. **Check CORS Headers**:
   - Open browser DevTools → Network tab
   - Make a request to your backend
   - Check response headers should include:
     - `Access-Control-Allow-Origin: https://your-app.vercel.app`
     - `Access-Control-Allow-Credentials: true`

2. **Check Cookies**:
   - After login, check Application → Cookies in DevTools
   - Cookie should have:
     - `Secure` flag ✅
     - `SameSite=None` ✅
     - `HttpOnly` ✅

3. **Test Authentication**:
   - Try logging in
   - Check if cookie is set in browser
   - Try accessing protected routes
   - Should not get 401 errors

---

## 🐛 Troubleshooting

### Still getting 401 errors?

1. **Verify Environment Variables**:
   - Check Railway: `FRONTEND_URL` matches your Vercel URL exactly
   - Check Vercel: `REACT_APP_API_URL` matches your Railway URL exactly
   - Both must use HTTPS

2. **Check Browser Console**:
   - Look for CORS errors
   - Check Network tab for cookie headers

3. **Verify Cookie Settings**:
   - In production, cookies must have `Secure=true` and `SameSite=None`
   - Check if cookies are being set in Application → Cookies

4. **Clear Browser Cache**:
   - Clear cookies and cache
   - Try in incognito mode

5. **Check Railway Logs**:
   - Look for CORS errors in Railway logs
   - Verify backend is receiving requests

---

## 📝 Notes

- **Development**: Cookies use `sameSite: 'Lax'` and `secure: false` for local development
- **Production**: Automatically switches to `sameSite: 'None'` and `secure: true` when `NODE_ENV=production`
- **Multiple Origins**: You can set multiple frontend URLs in `FRONTEND_URL` (comma-separated)
- **Google OAuth**: Make sure `GOOGLE_CALLBACK` uses your Railway backend URL (HTTPS)

---

## 🚀 Deployment Steps

1. **Update Railway Environment Variables**:
   - Set `FRONTEND_URL` to your Vercel URL(s)
   - Ensure `NODE_ENV=production`

2. **Update Vercel Environment Variables**:
   - Set `REACT_APP_API_URL` to your Railway backend URL
   - Ensure `NODE_ENV=production`

3. **Redeploy Both Services**:
   - Railway will auto-deploy on code push
   - Vercel will auto-deploy on code push

4. **Test Authentication**:
   - Try logging in
   - Verify cookies are set
   - Test protected routes

---

**All code changes have been made. You just need to set the environment variables and redeploy!** 🎉

