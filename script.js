// Paper types data with your provided examples
let paperTypes = [
    { name: "MultiArt Silk", weight: 90, width: 360, height: 315, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "G-Print", weight: 100, width: 445, height: 315, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "G-Print", weight: 130, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Arctic Volume White", weight: 130, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Arctic Volume Ice", weight: 130, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "G-Print", weight: 170, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Amber Graphic", weight: 140, width: 355, height: 252, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Amber Graphic", weight: 140, width: 355, height: 310, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Munken Premium Cream", weight: 115, width: 355, height: 310, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Munken Pure", weight: 130, width: 355, height: 310, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Amber Graphic", weight: 120, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Amber Graphic", weight: 100, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Munken Print Cream", weight: 80, width: 320, height: 252, crossSide: "long", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Magno Volume", weight: 150, width: 487, height: 320, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Munken Lynx Rough", weight: 150, width: 445, height: 315, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } },
    { name: "Munken Polar Rough", weight: 120, width: 445, height: 315, crossSide: "short", crossAdjust: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } }
];

let filteredPapers = [...paperTypes];

// DOM elements
const paperGrid = document.getElementById('paperGrid');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const weightFilter = document.getElementById('weightFilter');
const sizeFilter = document.getElementById('sizeFilter');
const addPaperForm = document.getElementById('addPaperForm');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderPaperGrid();
    setupEventListeners();
});

function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', filterPapers);
    clearSearch.addEventListener('click', clearSearchInput);
    
    // Filter functionality
    weightFilter.addEventListener('change', filterPapers);
    sizeFilter.addEventListener('change', filterPapers);
    
    // Add new paper form
    addPaperForm.addEventListener('submit', addNewPaper);
}

function renderPaperGrid() {
    if (filteredPapers.length === 0) {
        paperGrid.innerHTML = '<div class="no-results">No paper types found matching your criteria.</div>';
        return;
    }
    
    paperGrid.innerHTML = filteredPapers.map(paper => `
        <div class="paper-card ${paper.crossSide === 'short' ? 'grain-short' : 'grain-long'}">
            <div class="paper-name">${paper.name}</div>
            <div class="paper-details">
                <div class="detail-item">
                    <span class="detail-label">Weight:</span>
                    <span class="detail-value">${paper.weight}gr</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Dimensions:</span>
                    <span class="detail-value">${paper.width}×${paper.height}mm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Aspect Ratio:</span>
                    <span class="detail-value">${(paper.width / paper.height).toFixed(2)}:1</span>
                </div>
            </div>
            <div class="cross-side ${paper.crossSide === 'short' ? 'grain-short' : 'grain-long'}">
                <div class="cross-side-label">Cross Side (Grain Direction)</div>
                <div class="cross-side-value">
                    ${paper.crossSide === 'short' ? 'Short Side' : 'Long Side'}
                </div>
            </div>
            <div class="cross-adjustment-display">
                <div class="adjustment-title">Cross Adjustment:</div>
                <div class="adjustment-values">
                    <div class="adjustment-row">
                        <span class="adjustment-label">Left/Right:</span>
                        <span class="adjustment-value">${paper.crossAdjust.leftRight[0]}, ${paper.crossAdjust.leftRight[1]}</span>
                    </div>
                    <div class="adjustment-row">
                        <span class="adjustment-label">Up/Down:</span>
                        <span class="adjustment-value">${paper.crossAdjust.upDown[0]}, ${paper.crossAdjust.upDown[1]}</span>
                    </div>
                </div>
                <button onclick="openAdjustmentModal('${paper.name}', ${paper.weight}, ${paper.width}, ${paper.height})" 
                        class="edit-adjustment-btn">
                    Edit Adjustment
                </button>
            </div>
            <div class="paper-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="toggleCrossSide('${paper.name}', ${paper.weight}, ${paper.width}, ${paper.height})" 
                        class="toggle-btn" style="flex: 1; padding: 8px 12px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    Switch to ${paper.crossSide === 'short' ? 'Long Side' : 'Short Side'}
                </button>
                <button onclick="removePaper('${paper.name}', ${paper.weight}, ${paper.width}, ${paper.height})" 
                        class="remove-btn" style="padding: 8px 12px; border: 2px solid #e74c3c; background: white; color: #e74c3c; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    Remove
                </button>
            </div>
        </div>
    `).join('');
}

function filterPapers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedWeight = weightFilter.value;
    const selectedSize = sizeFilter.value;
    
    filteredPapers = paperTypes.filter(paper => {
        const matchesSearch = paper.name.toLowerCase().includes(searchTerm) ||
                            paper.weight.toString().includes(searchTerm) ||
                            `${paper.width}×${paper.height}`.includes(searchTerm);
        
        const matchesWeight = !selectedWeight || paper.weight.toString() === selectedWeight;
        
        const matchesSize = !selectedSize || `${paper.width}×${paper.height}` === selectedSize;
        
        return matchesSearch && matchesWeight && matchesSize;
    });
    
    renderPaperGrid();
}

function clearSearchInput() {
    searchInput.value = '';
    weightFilter.value = '';
    sizeFilter.value = '';
    filteredPapers = [...paperTypes];
    renderPaperGrid();
}

function addNewPaper(e) {
    e.preventDefault();
    
    const name = document.getElementById('paperName').value.trim();
    const weight = parseInt(document.getElementById('paperWeight').value);
    const width = parseInt(document.getElementById('paperWidth').value);
    const height = parseInt(document.getElementById('paperHeight').value);
    const crossSide = document.getElementById('crossSide').value;
    
    if (!name || !weight || !width || !height || !crossSide) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if paper already exists
    const exists = paperTypes.some(paper => 
        paper.name === name && 
        paper.weight === weight && 
        paper.width === width && 
        paper.height === height
    );
    
    if (exists) {
        alert('This paper type already exists');
        return;
    }
    
    const newPaper = {
        name,
        weight,
        width,
        height,
        crossSide
    };
    
    paperTypes.push(newPaper);
    filteredPapers = [...paperTypes];
    renderPaperGrid();
    
    // Clear form
    addPaperForm.reset();
    
    // Show success message
    showNotification('Paper type added successfully!', 'success');
}

function toggleCrossSide(name, weight, width, height) {
    const paperIndex = paperTypes.findIndex(paper => 
        paper.name === name && 
        paper.weight === weight && 
        paper.width === width && 
        paper.height === height
    );
    
    if (paperIndex !== -1) {
        paperTypes[paperIndex].crossSide = paperTypes[paperIndex].crossSide === 'short' ? 'long' : 'short';
        filteredPapers = [...paperTypes];
        renderPaperGrid();
        showNotification('Cross side updated!', 'success');
    }
}

function removePaper(name, weight, width, height) {
    if (confirm('Are you sure you want to remove this paper type?')) {
        const paperIndex = paperTypes.findIndex(paper => 
            paper.name === name && 
            paper.weight === weight && 
            paper.width === width && 
            paper.height === height
        );
        
        if (paperIndex !== -1) {
            paperTypes.splice(paperIndex, 1);
            filteredPapers = [...paperTypes];
            renderPaperGrid();
            showNotification('Paper type removed!', 'success');
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        clearSearchInput();
    }
});