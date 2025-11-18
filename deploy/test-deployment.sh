#!/bin/bash

# Quick deployment test script
# Run this to verify your deployment is working

echo "🔍 Testing SmartStore Deployment..."
echo ""

APP_DIR="/home/ubuntu/smartstore"
cd $APP_DIR

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✅ $1 is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is NOT running${NC}"
        return 1
    fi
}

test_pm2() {
    if pm2 list | grep -q "smartstore-backend.*online"; then
        echo -e "${GREEN}✅ PM2: smartstore-backend is online${NC}"
        return 0
    else
        echo -e "${RED}❌ PM2: smartstore-backend is NOT online${NC}"
        return 1
    fi
}

test_port() {
    if netstat -tlnp 2>/dev/null | grep -q ":$1 "; then
        echo -e "${GREEN}✅ Port $1 is listening${NC}"
        return 0
    else
        echo -e "${RED}❌ Port $1 is NOT listening${NC}"
        return 1
    fi
}

test_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ File exists: $1${NC}"
        return 0
    else
        echo -e "${RED}❌ File missing: $1${NC}"
        return 1
    fi
}

test_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ Directory exists: $1${NC}"
        return 0
    else
        echo -e "${RED}❌ Directory missing: $1${NC}"
        return 1
    fi
}

# Run tests
echo "=== Service Status ==="
test_service nginx
test_service mongod
test_service redis-server
test_service smartstore-pdf-parser

echo ""
echo "=== PM2 Status ==="
test_pm2

echo ""
echo "=== Port Status ==="
test_port 80
test_port 5000
test_port 5001

echo ""
echo "=== File Checks ==="
test_file "$APP_DIR/smartstore-backend/.env"
test_file "$APP_DIR/smartstore-backend/ecosystem.config.js"
test_file "/etc/nginx/sites-enabled/smartstore"

echo ""
echo "=== Directory Checks ==="
test_directory "$APP_DIR/smartstore-frontend/dist"
test_directory "$APP_DIR/smartstore-backend/logs"
test_directory "$APP_DIR/smartstore-backend/pdf-parser-flask/venv"

echo ""
echo "=== Quick API Test ==="
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/inventory | grep -q "200\|401\|403"; then
    echo -e "${GREEN}✅ Backend API is responding${NC}"
else
    echo -e "${RED}❌ Backend API is NOT responding${NC}"
fi

echo ""
echo "=== Nginx Test ==="
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo -e "${GREEN}✅ Nginx is serving content${NC}"
else
    echo -e "${RED}❌ Nginx is NOT serving content${NC}"
fi

echo ""
echo "=== MongoDB Connection Test ==="
if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ MongoDB is accessible${NC}"
else
    echo -e "${RED}❌ MongoDB is NOT accessible${NC}"
fi

echo ""
echo "=== Redis Connection Test ==="
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is accessible${NC}"
else
    echo -e "${RED}❌ Redis is NOT accessible${NC}"
fi

echo ""
echo "=== Recent Logs (Last 5 lines) ==="
echo -e "${YELLOW}PM2 Backend Logs:${NC}"
pm2 logs smartstore-backend --lines 5 --nostream 2>/dev/null || echo "No logs available"

echo ""
echo -e "${YELLOW}PDF Parser Logs:${NC}"
sudo journalctl -u smartstore-pdf-parser -n 5 --no-pager 2>/dev/null || echo "No logs available"

echo ""
echo "=== Test Complete ==="
echo ""
echo "For detailed logs:"
echo "  pm2 logs smartstore-backend"
echo "  sudo journalctl -u smartstore-pdf-parser -f"
echo "  sudo tail -f /var/log/nginx/error.log"

