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

# Frontend build
echo "🏗️  Building frontend..."
cd $APP_DIR/smartstore-frontend
npm install
npm run build

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

