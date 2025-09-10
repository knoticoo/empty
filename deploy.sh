#!/bin/bash

# Canon Viaprint Paper Manager - Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

echo "🚀 Canon Viaprint Paper Manager - Deployment Script"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root."
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/ or use your package manager"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

# Make scripts executable
chmod +x *.sh

# Install PM2 globally if not installed
if ! command_exists pm2; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Create PM2 ecosystem file
echo "⚙️  Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'canon-viaprint-manager',
    script: 'server.js',
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Setup systemd service
if command_exists systemctl; then
    echo "🔧 Setting up systemd service..."
    
    # Get current user and working directory
    CURRENT_USER=$(whoami)
    CURRENT_DIR=$(pwd)
    
    # Create systemd service file
    sudo tee /etc/systemd/system/canon-viaprint-manager.service > /dev/null << EOF
[Unit]
Description=Canon Viaprint Paper Manager
After=network.target

[Service]
Type=forking
User=$CURRENT_USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/pm2 start $CURRENT_DIR/ecosystem.config.js
ExecReload=/usr/bin/pm2 reload canon-viaprint-manager
ExecStop=/usr/bin/pm2 stop canon-viaprint-manager
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd and enable service
    sudo systemctl daemon-reload
    sudo systemctl enable canon-viaprint-manager
    
    echo "✅ Systemd service created and enabled!"
fi

# Start the service
echo ""
echo "🚀 Starting the service..."
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
pm2 status canon-viaprint-manager

echo ""
echo "🌐 Access the app at:"
echo "   Local: http://localhost:3000"
echo "   VPS:   http://$(hostname -I | awk '{print $1}'):3000"
echo "   Health: http://localhost:3000/health"

echo ""
echo "📝 Available commands:"
echo "   ./start.sh    - Start the service"
echo "   ./stop.sh     - Stop the service"
echo "   ./restart.sh  - Restart the service"
echo "   ./status.sh   - Check service status"
echo "   pm2 logs      - View logs"
echo "   pm2 monit     - Monitor resources"

echo ""
echo "🔧 Systemd service commands:"
echo "   sudo systemctl start canon-viaprint-manager"
echo "   sudo systemctl stop canon-viaprint-manager"
echo "   sudo systemctl status canon-viaprint-manager"
echo "   sudo systemctl restart canon-viaprint-manager"

echo ""
echo "✅ The service will automatically start on system boot!"