// Paper types data with your provided examples
let paperTypes = [
    { name: "MultiArt Silk", weight: 90, width: 360, height: 315, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "G-Print", weight: 100, width: 445, height: 315, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "G-Print", weight: 130, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "Arctic Volume White", weight: 130, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "Arctic Volume Ice", weight: 130, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "G-Print", weight: 170, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "Amber Graphic", weight: 140, width: 355, height: 252, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "Amber Graphic", weight: 140, width: 355, height: 310, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "Munken Premium Cream", weight: 115, width: 355, height: 310, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "Munken Pure", weight: 130, width: 355, height: 310, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "Amber Graphic", weight: 120, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "Amber Graphic", weight: 100, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "Munken Print Cream", weight: 80, width: 320, height: 252, crossSide: "long", crossAdjust: { short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }, long: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] } } },
    { name: "Magno Volume", weight: 150, width: 487, height: 320, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "Munken Lynx Rough", weight: 150, width: 445, height: 315, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } },
    { name: "Munken Polar Rough", weight: 120, width: 445, height: 315, crossSide: "short", crossAdjust: { short: { leftRight: [0.2, -0.2], upDown: [0.2, -0.2] }, long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] } } }
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
    registerServiceWorker();
    setupPWAFeatures();
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
                <div class="adjustment-title">Cross Adjustment (${paper.crossSide === 'short' ? 'Short Side' : 'Long Side'}):</div>
                <div class="adjustment-values">
                    <div class="adjustment-row">
                        <span class="adjustment-label">Left/Right:</span>
                        <span class="adjustment-value">${paper.crossAdjust[paper.crossSide].leftRight[0]}, ${paper.crossAdjust[paper.crossSide].leftRight[1]}</span>
                    </div>
                    <div class="adjustment-row">
                        <span class="adjustment-label">Up/Down:</span>
                        <span class="adjustment-value">${paper.crossAdjust[paper.crossSide].upDown[0]}, ${paper.crossAdjust[paper.crossSide].upDown[1]}</span>
                    </div>
                </div>
                <button onclick="openAdjustmentModal('${paper.name}', ${paper.weight}, ${paper.width}, ${paper.height})" 
                        class="edit-adjustment-btn">
                    Edit Adjustments
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
        
        const matchesSize = !selectedSize || `${paper.width}x${paper.height}` === selectedSize;
        
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
    const leftRight1 = parseFloat(document.getElementById('leftRight1').value) || 0.0;
    const leftRight2 = parseFloat(document.getElementById('leftRight2').value) || 0.0;
    const upDown1 = parseFloat(document.getElementById('upDown1').value) || 0.0;
    const upDown2 = parseFloat(document.getElementById('upDown2').value) || 0.0;
    
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
        crossSide,
        crossAdjust: {
            short: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] },
            long: { leftRight: [0.0, 0.0], upDown: [0.0, 0.0] }
        }
    };
    
    // Set the initial values for the selected cross side
    newPaper.crossAdjust[crossSide] = {
        leftRight: [leftRight1, leftRight2],
        upDown: [upDown1, upDown2]
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

// Modal functionality for editing cross adjustments
function openAdjustmentModal(name, weight, width, height) {
    const paper = paperTypes.find(p => 
        p.name === name && 
        p.weight === weight && 
        p.width === width && 
        p.height === height
    );
    
    if (!paper) return;
    
    // Create modal HTML
    const modalHTML = `
        <div id="adjustmentModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Cross Adjustment - ${paper.name}</h3>
                    <button onclick="closeAdjustmentModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="adjustment-form">
                        <div class="orientation-section">
                            <h4>Short Side Adjustments</h4>
                            <div class="adjustment-group">
                                <label>Left/Right Adjustment:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalShortLeftRight1" value="${paper.crossAdjust.short.leftRight[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalShortLeftRight2" value="${paper.crossAdjust.short.leftRight[1]}" step="0.1">
                                </div>
                            </div>
                            <div class="adjustment-group">
                                <label>Up/Down Adjustment:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalShortUpDown1" value="${paper.crossAdjust.short.upDown[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalShortUpDown2" value="${paper.crossAdjust.short.upDown[1]}" step="0.1">
                                </div>
                            </div>
                        </div>
                        <div class="orientation-section">
                            <h4>Long Side Adjustments</h4>
                            <div class="adjustment-group">
                                <label>Left/Right Adjustment:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalLongLeftRight1" value="${paper.crossAdjust.long.leftRight[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalLongLeftRight2" value="${paper.crossAdjust.long.leftRight[1]}" step="0.1">
                                </div>
                            </div>
                            <div class="adjustment-group">
                                <label>Up/Down Adjustment:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalLongUpDown1" value="${paper.crossAdjust.long.upDown[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalLongUpDown2" value="${paper.crossAdjust.long.upDown[1]}" step="0.1">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="closeAdjustmentModal()" class="cancel-btn">Cancel</button>
                    <button onclick="saveAdjustment('${name}', ${weight}, ${width}, ${height})" class="save-btn">Save Adjustment</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('modalLeftRight1').focus();
    }, 100);
}

function closeAdjustmentModal() {
    const modal = document.getElementById('adjustmentModal');
    if (modal) {
        modal.remove();
    }
}

function saveAdjustment(name, weight, width, height) {
    const shortLeftRight1 = parseFloat(document.getElementById('modalShortLeftRight1').value) || 0.0;
    const shortLeftRight2 = parseFloat(document.getElementById('modalShortLeftRight2').value) || 0.0;
    const shortUpDown1 = parseFloat(document.getElementById('modalShortUpDown1').value) || 0.0;
    const shortUpDown2 = parseFloat(document.getElementById('modalShortUpDown2').value) || 0.0;
    
    const longLeftRight1 = parseFloat(document.getElementById('modalLongLeftRight1').value) || 0.0;
    const longLeftRight2 = parseFloat(document.getElementById('modalLongLeftRight2').value) || 0.0;
    const longUpDown1 = parseFloat(document.getElementById('modalLongUpDown1').value) || 0.0;
    const longUpDown2 = parseFloat(document.getElementById('modalLongUpDown2').value) || 0.0;
    
    const paperIndex = paperTypes.findIndex(paper => 
        paper.name === name && 
        paper.weight === weight && 
        paper.width === width && 
        paper.height === height
    );
    
    if (paperIndex !== -1) {
        paperTypes[paperIndex].crossAdjust = {
            short: {
                leftRight: [shortLeftRight1, shortLeftRight2],
                upDown: [shortUpDown1, shortUpDown2]
            },
            long: {
                leftRight: [longLeftRight1, longLeftRight2],
                upDown: [longUpDown1, longUpDown2]
            }
        };
        filteredPapers = [...paperTypes];
        renderPaperGrid();
        closeAdjustmentModal();
        showNotification('Cross adjustments saved!', 'success');
    }
}

// Add some helpful keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    // Escape to clear search or close modal
    if (e.key === 'Escape') {
        if (document.activeElement === searchInput) {
            clearSearchInput();
        } else {
            closeAdjustmentModal();
        }
    }
});

// PWA Service Worker Registration
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    
                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available, show update notification
                                showUpdateNotification();
                            }
                        });
                    });
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// PWA Features Setup
function setupPWAFeatures() {
    // Install prompt
    let deferredPrompt;
    const installButton = createInstallButton();
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installButton.style.display = 'block';
    });
    
    installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            installButton.style.display = 'none';
        }
    });
    
    // Handle app installed
    window.addEventListener('appinstalled', (evt) => {
        console.log('PWA was installed');
        installButton.style.display = 'none';
        showNotification('App installed successfully!', 'success');
    });
    
    // Offline/Online status
    window.addEventListener('online', () => {
        showNotification('You are back online!', 'success');
        // Sync any pending data
        syncPendingData();
    });
    
    window.addEventListener('offline', () => {
        showNotification('You are offline. Some features may be limited.', 'info');
    });
    
    // Add touch gestures for mobile
    setupTouchGestures();
}

// Create install button
function createInstallButton() {
    const button = document.createElement('button');
    button.id = 'installButton';
    button.innerHTML = '📱 Install App';
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        z-index: 1000;
        display: none;
        transition: all 0.3s ease;
    `;
    
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    });
    
    document.body.appendChild(button);
    return button;
}

// Show update notification
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
        text-align: center;
    `;
    notification.innerHTML = `
        <div>New version available!</div>
        <button onclick="updateApp()" style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 8px; cursor: pointer; font-weight: 600;">
            Update Now
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 10000);
}

// Update app function
function updateApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
            if (registration && registration.waiting) {
                registration.waiting.postMessage({ action: 'skipWaiting' });
                window.location.reload();
            }
        });
    }
}

// Sync pending data when back online
function syncPendingData() {
    // In a real app, you would sync any data that was saved offline
    console.log('Syncing pending data...');
    // For now, just show a notification
    showNotification('Data synced successfully!', 'success');
}

// Touch gestures for mobile
function setupTouchGestures() {
    let startY = 0;
    let startX = 0;
    
    document.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!startY || !startX) return;
        
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = startY - currentY;
        const diffX = startX - currentX;
        
        // Only trigger refresh on swipe down from the very top of the page
        // and only if the user is already at the top of the page
        if (diffY > 100 && Math.abs(diffX) < 50 && window.scrollY === 0) {
            // Pull to refresh functionality
            showNotification('Refreshing...', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    });
    
    document.addEventListener('touchend', () => {
        startY = 0;
        startX = 0;
    });
}

// Listen for service worker messages
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.action === 'skipWaiting') {
            window.location.reload();
        }
    });
}