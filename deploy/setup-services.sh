#!/bin/bash

# Setup systemd service for Python Flask PDF Parser
# Run with: sudo ./deploy/setup-services.sh

set -e

APP_DIR="/home/ubuntu/smartstore"
SERVICE_FILE="/etc/systemd/system/smartstore-pdf-parser.service"

echo "🔧 Creating systemd service for PDF Parser..."

sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=SmartStore PDF Parser Flask Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR/smartstore-backend/pdf-parser-flask
Environment="PATH=$APP_DIR/smartstore-backend/pdf-parser-flask/venv/bin"
ExecStart=$APP_DIR/smartstore-backend/pdf-parser-flask/venv/bin/python app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable smartstore-pdf-parser
sudo systemctl start smartstore-pdf-parser

echo "✅ PDF Parser service created and started!"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status smartstore-pdf-parser"
echo "  sudo systemctl restart smartstore-pdf-parser"
echo "  sudo journalctl -u smartstore-pdf-parser -f"

