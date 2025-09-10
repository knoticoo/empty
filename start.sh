#!/bin/bash

# Canon Viaprint Paper Manager - Start Script
# This script starts the service in the background using PM2

set -e  # Exit on any error

echo "🚀 Starting Canon Viaprint Paper Manager..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed. Please run ./install.sh first."
    exit 1
fi

# Check if ecosystem config exists
if [ ! -f "ecosystem.config.js" ]; then
    echo "❌ Ecosystem config not found. Please run ./install.sh first."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application
echo "📦 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Canon Viaprint Paper Manager started successfully!"
echo ""
echo "📊 Service Status:"
pm2 status canon-viaprint-manager

echo ""
echo "🌐 Access the app at:"
echo "   Local: http://localhost:3000"
echo "   VPS:   http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📝 Useful commands:"
echo "   ./status.sh  - Check service status"
echo "   ./stop.sh    - Stop the service"
echo "   ./restart.sh - Restart the service"
echo "   pm2 logs     - View logs"
echo "   pm2 monit    - Monitor resources"