# 📱 Mobile Access Setup Guide

## Quick Setup

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

Or run the helper script:
```bash
node get-local-ip.js
```

### Step 2: Start the Servers

**Terminal 1 - Backend:**
```bash
cd smartstore-backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd smartstore-frontend
npm run dev
```

### Step 3: Access from Mobile

1. **Make sure your mobile device is on the same WiFi network** as your computer
2. Open a browser on your mobile device
3. Navigate to: `http://[YOUR_IP]:5173`
   - Example: `http://192.168.1.100:5173`

### Step 4: Test Barcode Scanner

1. Navigate to POS page
2. Click "Scan Barcode"
3. Allow camera permissions when prompted
4. Scan a barcode!

## Troubleshooting

### Can't Access from Mobile?

1. **Check Firewall:**
   - Windows: Allow Node.js through Windows Firewall
   - Mac: System Preferences → Security → Firewall → Allow Node

2. **Check Network:**
   - Ensure both devices are on the same WiFi network
   - Try disabling VPN if active

3. **Check IP Address:**
   - Your IP might change if you reconnect to WiFi
   - Re-run `ipconfig` or `get-local-ip.js` if needed

4. **Check Backend:**
   - Backend should be running on port 5000
   - Frontend will automatically use the same IP for API calls

### Camera Not Working?

1. **HTTPS Required (Production):**
   - Modern browsers require HTTPS for camera access
   - For local development, use `http://` (works on mobile browsers)
   - Chrome on Android allows camera on HTTP for localhost/IP addresses

2. **Permissions:**
   - Make sure you allow camera permissions in the browser

3. **Browser Compatibility:**
   - Works best on Chrome/Edge (Android) or Safari (iOS)
   - Some browsers may have restrictions

## Production Deployment

For production, you'll need:
- HTTPS certificate (required for camera access)
- Proper domain name
- Update `VITE_API_URL` environment variable

## Notes

- The frontend automatically detects if you're accessing via IP and uses that IP for backend API calls
- CORS is configured to allow requests from local network IPs
- Both devices must be on the same network for this to work

