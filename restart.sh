#!/bin/bash

# Canon Viaprint Paper Manager - Restart Script
# This script restarts the service

set -e  # Exit on any error

echo "🔄 Restarting Canon Viaprint Paper Manager..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Please run ./install.sh first."
    exit 1
fi

# Restart the application
echo "📦 Restarting application..."
pm2 restart canon-viaprint-manager

echo "✅ Canon Viaprint Paper Manager restarted successfully!"
echo ""
echo "📊 Service Status:"
pm2 status canon-viaprint-manager

echo ""
echo "🌐 Access the app at:"
echo "   Local: http://localhost:3000"
echo "   VPS:   http://$(hostname -I | awk '{print $1}'):3000"