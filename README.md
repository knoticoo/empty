# Canon Viaprint 3200 Paper Manager

A web application for managing paper types and cross adjustments for Canon Viaprint 3200 typography work.

## Features

- **Paper Type Management**: Manage 20+ different paper types with dimensions and weights
- **Cross-Side Selection**: Choose between short side and long side grain direction
- **Cross Adjustments**: Set left/right and up/down adjustment values (default: 0.0, 0.0)
- **Search & Filter**: Find papers by name, weight, or dimensions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Background Service**: Runs continuously even after SSH disconnection

## Quick Start

### Option 1: Complete Deployment (Recommended)
```bash
# Make deploy script executable and run
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Manual Installation
```bash
# Install dependencies and setup
chmod +x install.sh
./install.sh

# Start the service
./start.sh
```

## Service Management

### Basic Commands
```bash
./start.sh     # Start the service
./stop.sh      # Stop the service
./restart.sh   # Restart the service
./status.sh    # Check service status
```

### PM2 Commands
```bash
pm2 status                    # Show all processes
pm2 logs canon-viaprint-manager  # View logs
pm2 monit                     # Monitor resources
pm2 restart canon-viaprint-manager  # Restart specific app
```

### Systemd Commands (if enabled)
```bash
sudo systemctl start canon-viaprint-manager
sudo systemctl stop canon-viaprint-manager
sudo systemctl status canon-viaprint-manager
sudo systemctl restart canon-viaprint-manager
```

## Access URLs

- **Local**: http://localhost:3000
- **VPS**: http://your-vps-ip:3000
- **Health Check**: http://localhost:3000/health

## Port Configuration

This app runs on **port 3000** to avoid conflicts with other applications like Next.js apps.

## File Structure

```
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── script.js               # JavaScript functionality
├── server.js               # Express server
├── package.json            # Node.js dependencies
├── ecosystem.config.js     # PM2 configuration
├── install.sh              # Installation script
├── start.sh                # Start service script
├── stop.sh                 # Stop service script
├── restart.sh              # Restart service script
├── status.sh               # Status check script
├── deploy.sh               # Complete deployment script
├── .gitignore              # Git ignore file
├── logs/                   # Application logs
└── README.md              # This file
```

## Background Service

The application runs as a background service using PM2, which means:
- ✅ Continues running after SSH disconnection
- ✅ Automatically restarts on crashes
- ✅ Starts automatically on system boot
- ✅ Memory usage monitoring
- ✅ Log management

## Usage

### Managing Paper Types
1. **View Papers**: All paper types are displayed with their properties
2. **Edit Cross Adjustments**: Click "Edit Adjustment" to modify left/right and up/down values
3. **Toggle Cross Side**: Switch between short side and long side grain direction
4. **Add New Papers**: Use the form at the bottom to add new paper types
5. **Search & Filter**: Use the search bar and filters to find specific papers

### Cross Adjustments
- **Left/Right**: Two values for horizontal adjustments (default: 0.0, 0.0)
- **Up/Down**: Two values for vertical adjustments (default: 0.0, 0.0)
- Values are saved automatically when you click "Save Adjustment"

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, modify the `PORT` variable in `ecosystem.config.js`:

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 3001  // Change to available port
}
```

### Service Not Starting
```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs canon-viaprint-manager --err

# Restart the service
pm2 restart canon-viaprint-manager
```

### VPS Firewall
Make sure your VPS firewall allows connections on port 3000:

```bash
# Ubuntu/Debian
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Check Service Status
```bash
# Quick status check
./status.sh

# Detailed PM2 status
pm2 show canon-viaprint-manager

# Systemd status (if enabled)
sudo systemctl status canon-viaprint-manager
```

## Development

### Local Development
```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Or start with PM2
pm2 start ecosystem.config.js --watch
```

### Updating the Application
```bash
# Pull latest changes
git pull

# Restart the service
./restart.sh
```

## Security Notes

- The application runs on port 3000
- No authentication is implemented (add if needed for production)
- Consider using a reverse proxy (nginx) for production
- Monitor logs regularly for any issues

## License

MIT License