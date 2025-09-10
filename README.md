# Canon Viaprint 3200 Paper Manager

A web application for managing paper types and cross adjustments for Canon Viaprint 3200 typography work.

## Features

- **Paper Type Management**: Manage 20+ different paper types with dimensions and weights
- **Cross-Side Selection**: Choose between short side and long side grain direction
- **Cross Adjustments**: Set left/right and up/down adjustment values (default: 0.0, 0.0)
- **Search & Filter**: Find papers by name, weight, or dimensions
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Access the application:
- Local: http://localhost:3000
- VPS: http://your-vps-ip:3000

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## Port Configuration

This app runs on **port 3000** to avoid conflicts with other applications like Next.js apps that typically run on port 3000 in development but use different ports in production.

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

## API Endpoints

- `GET /` - Main application
- `GET /health` - Health check endpoint

## File Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── server.js           # Express server
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, you can change it by modifying the `PORT` variable in `server.js`:

```javascript
const PORT = 3001; // or any other available port
```

### VPS Access
Make sure your VPS firewall allows connections on port 3000:

```bash
# Ubuntu/Debian
sudo ufw allow 3000

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## License

MIT License