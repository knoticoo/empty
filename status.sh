#!/bin/bash

# Canon Viaprint Paper Manager - Status Script
# This script shows the current status of the service

echo "📊 Canon Viaprint Paper Manager Status"
echo "======================================"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed."
    exit 1
fi

# Show PM2 status
echo ""
echo "🔍 PM2 Process Status:"
pm2 status canon-viaprint-manager

echo ""
echo "📈 Process Details:"
pm2 show canon-viaprint-manager

echo ""
echo "📋 Recent Logs (last 20 lines):"
pm2 logs canon-viaprint-manager --lines 20

echo ""
echo "🌐 Access URLs:"
echo "   Local: http://localhost:3000"
echo "   VPS:   http://$(hostname -I | awk '{print $1}'):3000"
echo "   Health: http://localhost:3000/health"

echo ""
echo "📝 Available commands:"
echo "   ./start.sh    - Start the service"
echo "   ./stop.sh     - Stop the service"
echo "   ./restart.sh  - Restart the service"
echo "   pm2 logs      - View all logs"
echo "   pm2 monit     - Monitor resources"