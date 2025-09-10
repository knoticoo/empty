#!/bin/bash

# Canon Viaprint Paper Manager - Installation Script
# This script installs dependencies and sets up the service

set -e  # Exit on any error

echo "🚀 Installing Canon Viaprint Paper Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/ or use your package manager"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Make scripts executable
chmod +x start.sh
chmod +x stop.sh
chmod +x restart.sh
chmod +x status.sh

echo "✅ Dependencies installed successfully!"

# Check if PM2 is installed globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally for process management..."
    npm install -g pm2
fi

echo "✅ PM2 installed: $(pm2 -v)"

# Create PM2 ecosystem file
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

echo "✅ PM2 ecosystem configuration created!"

# Setup systemd service (optional)
if command -v systemctl &> /dev/null; then
    echo "🔧 Setting up systemd service..."
    
    # Create systemd service file
    sudo tee /etc/systemd/system/canon-viaprint-manager.service > /dev/null << EOF
[Unit]
Description=Canon Viaprint Paper Manager
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/pm2 start ecosystem.config.js
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
    echo "   Use 'sudo systemctl start canon-viaprint-manager' to start"
    echo "   Use 'sudo systemctl status canon-viaprint-manager' to check status"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 Available commands:"
echo "   ./start.sh     - Start the service"
echo "   ./stop.sh      - Stop the service"
echo "   ./restart.sh   - Restart the service"
echo "   ./status.sh    - Check service status"
echo ""
echo "🌐 Access the app at: http://localhost:3000"
echo "   Or from your VPS: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📝 To start the service now, run: ./start.sh"