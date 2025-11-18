#!/bin/bash

# SmartStore Deployment Script
# Run this from the project root on EC2 after setup

set -e  # Exit on error

echo "🚀 Starting SmartStore Deployment..."

APP_DIR="/home/ubuntu/smartstore"
cd $APP_DIR

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Backend setup
echo "📦 Setting up backend..."
cd $APP_DIR/smartstore-backend
npm install --production

# Frontend build - Skip if dist exists (we'll build locally and upload)
echo "🏗️  Checking frontend build..."
cd $APP_DIR/smartstore-frontend

# Check for build folder (CRA outputs to 'build', but we'll check both)
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "✅ Frontend build found (from local build), skipping rebuild"
    echo "💡 To rebuild on EC2, delete build/ folder first"
elif [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Frontend build found in dist/ (from local build), skipping rebuild"
    echo "💡 To rebuild on EC2, delete dist/ folder first"
else
    echo "⚠️  No frontend build found!"
    echo "📦 Building frontend on EC2 (this may take 10-20 minutes)..."
    echo "💡 For faster deployment, build locally and upload build/ folder"
    npm install
    npm run build
    # CRA outputs to 'build', but create symlink to 'dist' for Nginx compatibility
    if [ -d "build" ] && [ ! -d "dist" ]; then
        ln -s build dist
    fi
fi

# Python Flask setup
echo "🐍 Setting up Python Flask service..."
cd $APP_DIR/smartstore-backend/pdf-parser-flask
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
deactivate

# Restart services with PM2
echo "🔄 Restarting services..."
cd $APP_DIR/smartstore-backend
pm2 restart smartstore-backend || pm2 start ecosystem.config.js

# Restart Python Flask service (using systemd or PM2)
if systemctl is-active --quiet smartstore-pdf-parser; then
    sudo systemctl restart smartstore-pdf-parser
else
    echo "⚠️  PDF Parser service not configured. Run: sudo ./deploy/setup-services.sh"
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Deployment complete!"
echo ""
echo "Check service status:"
echo "  pm2 status"
echo "  sudo systemctl status smartstore-pdf-parser"
echo "  sudo systemctl status nginx"

