#!/bin/bash

# SmartStore EC2 Setup Script
# Run this script on a fresh Ubuntu 22.04 EC2 instance

set -e  # Exit on error

echo "🚀 Starting SmartStore EC2 Setup..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3 and pip
echo "📦 Installing Python..."
sudo apt install -y python3 python3-pip python3-venv

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Redis (for Bull queue)
echo "📦 Installing Redis..."
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install MongoDB (or you can use MongoDB Atlas)
echo "📦 Installing MongoDB..."
# Use the newer method for adding MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod

# Install build tools for Python dependencies
echo "📦 Installing build tools..."
sudo apt install -y build-essential python3-dev

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/smartstore
cd /home/ubuntu/smartstore

# Set proper permissions
sudo chown -R ubuntu:ubuntu /home/ubuntu/smartstore

echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> ."
echo "2. Copy .env.example to .env and configure it"
echo "3. Run: ./deploy/deploy.sh"

