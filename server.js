const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite database
const db = new sqlite3.Database('./paper_types.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Create paper_types table
        db.run(`CREATE TABLE IF NOT EXISTS paper_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            weight INTEGER NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            crossSide TEXT NOT NULL,
            coating TEXT NOT NULL,
            printingWedges BOOLEAN NOT NULL,
            nozzleReconditioning BOOLEAN NOT NULL,
            shortLeftRight1 REAL DEFAULT 0.0,
            shortLeftRight2 REAL DEFAULT 0.0,
            shortUpDown1 REAL DEFAULT 0.0,
            shortUpDown2 REAL DEFAULT 0.0,
            longLeftRight1 REAL DEFAULT 0.0,
            longLeftRight2 REAL DEFAULT 0.0,
            longUpDown1 REAL DEFAULT 0.0,
            longUpDown2 REAL DEFAULT 0.0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(name, weight, width, height)
        )`);

        // Insert default paper types if table is empty
        db.get("SELECT COUNT(*) as count FROM paper_types", (err, row) => {
            if (err) {
                console.error('Error checking paper count:', err.message);
            } else if (row.count === 0) {
                insertDefaultPaperTypes();
            }
        });
    });
}

// Insert default paper types
function insertDefaultPaperTypes() {
    const defaultPapers = [
        { name: "MultiArt Silk", weight: 90, width: 360, height: 315, crossSide: "short", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "G-Print", weight: 100, width: 445, height: 315, crossSide: "short", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "G-Print", weight: 130, width: 320, height: 252, crossSide: "long", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Arctic Volume White", weight: 130, width: 320, height: 252, crossSide: "long", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true },
        { name: "Arctic Volume Ice", weight: 130, width: 320, height: 252, crossSide: "long", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true },
        { name: "G-Print", weight: 170, width: 320, height: 252, crossSide: "long", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Amber Graphic", weight: 140, width: 355, height: 252, crossSide: "short", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Amber Graphic", weight: 140, width: 355, height: 310, crossSide: "short", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Munken Premium Cream", weight: 115, width: 355, height: 310, crossSide: "short", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true },
        { name: "Munken Pure", weight: 130, width: 355, height: 310, crossSide: "short", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true },
        { name: "Amber Graphic", weight: 120, width: 320, height: 252, crossSide: "long", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Amber Graphic", weight: 100, width: 320, height: 252, crossSide: "long", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Munken Print Cream", weight: 80, width: 320, height: 252, crossSide: "long", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true },
        { name: "Magno Volume", weight: 150, width: 487, height: 320, crossSide: "short", coating: "Krītots", printingWedges: true, nozzleReconditioning: true },
        { name: "Munken Lynx Rough", weight: 150, width: 445, height: 315, crossSide: "short", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true },
        { name: "Munken Polar Rough", weight: 120, width: 445, height: 315, crossSide: "short", coating: "Nekrītots", printingWedges: false, nozzleReconditioning: true }
    ];

    const stmt = db.prepare(`INSERT INTO paper_types 
        (name, weight, width, height, crossSide, coating, printingWedges, nozzleReconditioning) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

    defaultPapers.forEach(paper => {
        stmt.run([
            paper.name, paper.weight, paper.width, paper.height, 
            paper.crossSide, paper.coating, paper.printingWedges, paper.nozzleReconditioning
        ]);
    });

    stmt.finalize();
    console.log('Default paper types inserted');
}

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes
// Get all paper types
app.get('/api/papers', (req, res) => {
    db.all(`SELECT * FROM paper_types ORDER BY name, weight`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Transform database rows to match frontend format
        const papers = rows.map(row => ({
            id: row.id,
            name: row.name,
            weight: row.weight,
            width: row.width,
            height: row.height,
            crossSide: row.crossSide,
            coating: row.coating,
            printingWedges: Boolean(row.printingWedges),
            nozzleReconditioning: Boolean(row.nozzleReconditioning),
            crossAdjust: {
                short: {
                    leftRight: [row.shortLeftRight1, row.shortLeftRight2],
                    upDown: [row.shortUpDown1, row.shortUpDown2]
                },
                long: {
                    leftRight: [row.longLeftRight1, row.longLeftRight2],
                    upDown: [row.longUpDown1, row.longUpDown2]
                }
            }
        }));
        
        res.json(papers);
    });
});

// Add new paper type
app.post('/api/papers', (req, res) => {
    const { name, weight, width, height, crossSide, coating, printingWedges, nozzleReconditioning, crossAdjust } = req.body;
    
    const stmt = db.prepare(`INSERT INTO paper_types 
        (name, weight, width, height, crossSide, coating, printingWedges, nozzleReconditioning,
         shortLeftRight1, shortLeftRight2, shortUpDown1, shortUpDown2,
         longLeftRight1, longLeftRight2, longUpDown1, longUpDown2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run([
        name, weight, width, height, crossSide, coating, 
        printingWedges ? 1 : 0, nozzleReconditioning ? 1 : 0,
        crossAdjust.short.leftRight[0], crossAdjust.short.leftRight[1],
        crossAdjust.short.upDown[0], crossAdjust.short.upDown[1],
        crossAdjust.long.leftRight[0], crossAdjust.long.leftRight[1],
        crossAdjust.long.upDown[0], crossAdjust.long.upDown[1]
    ], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, message: 'Paper type added successfully' });
    });
    
    stmt.finalize();
});

// Update paper type
app.put('/api/papers/:id', (req, res) => {
    const { id } = req.params;
    const { name, weight, width, height, crossSide, coating, printingWedges, nozzleReconditioning, crossAdjust } = req.body;
    
    const stmt = db.prepare(`UPDATE paper_types SET 
        name = ?, weight = ?, width = ?, height = ?, crossSide = ?, coating = ?, 
        printingWedges = ?, nozzleReconditioning = ?,
        shortLeftRight1 = ?, shortLeftRight2 = ?, shortUpDown1 = ?, shortUpDown2 = ?,
        longLeftRight1 = ?, longLeftRight2 = ?, longUpDown1 = ?, longUpDown2 = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`);
    
    stmt.run([
        name, weight, width, height, crossSide, coating,
        printingWedges ? 1 : 0, nozzleReconditioning ? 1 : 0,
        crossAdjust.short.leftRight[0], crossAdjust.short.leftRight[1],
        crossAdjust.short.upDown[0], crossAdjust.short.upDown[1],
        crossAdjust.long.leftRight[0], crossAdjust.long.leftRight[1],
        crossAdjust.long.upDown[0], crossAdjust.long.upDown[1],
        id
    ], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Paper type updated successfully' });
    });
    
    stmt.finalize();
});

// Update cross adjustments only
app.patch('/api/papers/:id/adjustments', (req, res) => {
    const { id } = req.params;
    const { crossAdjust } = req.body;
    
    const stmt = db.prepare(`UPDATE paper_types SET 
        shortLeftRight1 = ?, shortLeftRight2 = ?, shortUpDown1 = ?, shortUpDown2 = ?,
        longLeftRight1 = ?, longLeftRight2 = ?, longUpDown1 = ?, longUpDown2 = ?,
        updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`);
    
    stmt.run([
        crossAdjust.short.leftRight[0], crossAdjust.short.leftRight[1],
        crossAdjust.short.upDown[0], crossAdjust.short.upDown[1],
        crossAdjust.long.leftRight[0], crossAdjust.long.leftRight[1],
        crossAdjust.long.upDown[0], crossAdjust.long.upDown[1],
        id
    ], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cross adjustments updated successfully' });
    });
    
    stmt.finalize();
});

// Toggle cross side
app.patch('/api/papers/:id/cross-side', (req, res) => {
    const { id } = req.params;
    const { crossSide } = req.body;
    
    const stmt = db.prepare(`UPDATE paper_types SET crossSide = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`);
    
    stmt.run([crossSide, id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Cross side updated successfully' });
    });
    
    stmt.finalize();
});

// Delete paper type
app.delete('/api/papers/:id', (req, res) => {
    const { id } = req.params;
    
    const stmt = db.prepare(`DELETE FROM paper_types WHERE id = ?`);
    
    stmt.run([id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Paper type deleted successfully' });
    });
    
    stmt.finalize();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Canon Viaprint Paper Manager',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Canon Viaprint Paper Manager running on port ${PORT}`);
    console.log(`📱 Access the app at: http://localhost:${PORT}`);
    console.log(`🌐 Or from your VPS: http://your-vps-ip:${PORT}`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});