// Simple script to rename build/ to dist/ after CRA build
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'build');
const distDir = path.join(__dirname, 'dist');

if (fs.existsSync(buildDir)) {
  // Remove dist if it exists
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  
  // Rename build to dist
  fs.renameSync(buildDir, distDir);
  console.log('✅ Build renamed to dist/');
} else {
  console.log('❌ Build folder not found. Run "npm run build" first.');
  process.exit(1);
}

