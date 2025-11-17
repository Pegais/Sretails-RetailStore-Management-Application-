// Quick script to get your local IP address
// Run: node get-local-ip.js

const os = require('os')
const networkInterfaces = os.networkInterfaces()

console.log('\n📱 Mobile Access Setup\n')
console.log('Your local IP addresses:\n')

let found = false
for (const interfaceName in networkInterfaces) {
  const interfaces = networkInterfaces[interfaceName]
  for (const iface of interfaces) {
    // Skip internal (loopback) and non-IPv4 addresses
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`  ✅ ${iface.address}`)
      found = true
    }
  }
}

if (!found) {
  console.log('  ⚠️  No network IP found. Make sure you are connected to WiFi.')
}

console.log('\n📝 Instructions:')
console.log('1. Make sure your computer and mobile are on the same WiFi network')
console.log('2. Start the frontend: npm run dev')
console.log('3. Start the backend: npm start (in smartstore-backend)')
console.log('4. On your mobile, open browser and go to:')
console.log(`   http://[YOUR_IP_ABOVE]:5173`)
console.log('\nExample: http://192.168.1.100:5173\n')

