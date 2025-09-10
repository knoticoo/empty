#!/bin/bash

# Canon Viaprint Paper Manager - Stop Script
# This script stops the service

set -e  # Exit on any error

echo "🛑 Stopping Canon Viaprint Paper Manager..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 is not installed."
    exit 1
fi

# Stop the application
echo "📦 Stopping application..."
pm2 stop canon-viaprint-manager

echo "✅ Canon Viaprint Paper Manager stopped successfully!"
echo ""
echo "📝 To start again, run: ./start.sh"