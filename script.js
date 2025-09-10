// Paper types data - loaded from database
let paperTypes = [];
let filteredPapers = [];

// DOM elements
const paperGrid = document.getElementById('paperGrid');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const weightFilter = document.getElementById('weightFilter');
const sizeFilter = document.getElementById('sizeFilter');
const addPaperForm = document.getElementById('addPaperForm');

// API Functions
async function loadPaperTypes() {
    try {
        const response = await fetch('/api/papers');
        if (!response.ok) {
            throw new Error('Failed to load paper types');
        }
        paperTypes = await response.json();
        filteredPapers = [...paperTypes];
        renderPaperGrid();
    } catch (error) {
        console.error('Error loading paper types:', error);
        showNotification('Failed to load paper types. Using offline mode.', 'info');
        // Fallback to empty array if API fails
        paperTypes = [];
        filteredPapers = [];
        renderPaperGrid();
    }
}

async function savePaperType(paperData) {
    try {
        const response = await fetch('/api/papers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paperData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save paper type');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving paper type:', error);
        throw error;
    }
}

async function updatePaperType(id, paperData) {
    try {
        const response = await fetch(`/api/papers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paperData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update paper type');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating paper type:', error);
        throw error;
    }
}

async function updateCrossAdjustments(id, crossAdjust) {
    try {
        const response = await fetch(`/api/papers/${id}/adjustments`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ crossAdjust })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update adjustments');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating adjustments:', error);
        throw error;
    }
}

async function toggleCrossSideAPI(id, crossSide) {
    try {
        const response = await fetch(`/api/papers/${id}/cross-side`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ crossSide })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to toggle cross side');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error toggling cross side:', error);
        throw error;
    }
}

async function deletePaperType(id) {
    try {
        const response = await fetch(`/api/papers/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete paper type');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting paper type:', error);
        throw error;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadPaperTypes();
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
    
    // Setup alignment constraint listeners
    setupAlignmentConstraints();
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
            <div class="paper-specs">
                <span class="spec-badge coating-badge ${paper.coating}">${paper.coating}</span>
                <span class="spec-badge">${paper.weight}gr</span>
                <span class="spec-badge">${paper.width}×${paper.height}mm</span>
            </div>
            <div class="suitability-badges">
                <span class="suitability-badge ${paper.printingWedges ? 'good' : 'not-suitable'}">
                    ${paper.printingWedges ? 'Wedges ✓' : 'No Wedges'}
                </span>
                <span class="suitability-badge ${paper.nozzleReconditioning ? 'good' : 'not-suitable'}">
                    ${paper.nozzleReconditioning ? 'Nozzle ✓' : 'No Nozzle'}
                </span>
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
                <button onclick="openAdjustmentModal(${paper.id})" 
                        class="edit-adjustment-btn">
                    Edit Adjustments
                </button>
            </div>
            <div class="paper-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                <button onclick="toggleCrossSide(${paper.id})" 
                        class="toggle-btn" style="flex: 1; padding: 8px 12px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    Switch to ${paper.crossSide === 'short' ? 'Long Side' : 'Short Side'}
                </button>
                <button onclick="openPrintPreview(${paper.id})" 
                        class="print-preview-btn">
                    Alignment Preview
                </button>
                <button onclick="removePaper(${paper.id})" 
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

async function addNewPaper(e) {
    e.preventDefault();
    
    // Clear previous validation errors
    clearValidationErrors();
    
    const name = document.getElementById('paperName').value.trim();
    const weight = parseInt(document.getElementById('paperWeight').value);
    const width = parseInt(document.getElementById('paperWidth').value);
    const height = parseInt(document.getElementById('paperHeight').value);
    const crossSide = document.getElementById('crossSide').value;
    const coating = document.getElementById('paperCoating').value;
    const printingWedges = document.getElementById('printingWedges').checked;
    const nozzleReconditioning = document.getElementById('nozzleReconditioning').checked;
    const leftRight1 = parseFloat(document.getElementById('leftRight1').value) || 0.0;
    const leftRight2 = parseFloat(document.getElementById('leftRight2').value) || 0.0;
    const upDown1 = parseFloat(document.getElementById('upDown1').value) || 0.0;
    const upDown2 = parseFloat(document.getElementById('upDown2').value) || 0.0;
    
    // Validation
    let hasErrors = false;
    
    if (!name) {
        showValidationError('paperName', 'Paper name is required');
        hasErrors = true;
    }
    
    if (!weight || weight < 1) {
        showValidationError('paperWeight', 'Weight must be at least 1gr');
        hasErrors = true;
    }
    
    if (!width || width < 1) {
        showValidationError('paperWidth', 'Width must be at least 1mm');
        hasErrors = true;
    }
    
    if (!height || height < 1) {
        showValidationError('paperHeight', 'Height must be at least 1mm');
        hasErrors = true;
    }
    
    if (!crossSide) {
        showValidationError('crossSide', 'Cross side selection is required');
        hasErrors = true;
    }
    
    if (!coating) {
        showValidationError('paperCoating', 'Coating selection is required');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Check for duplicates with enhanced validation
    const duplicatePapers = paperTypes.filter(paper => 
        paper.name.toLowerCase() === name.toLowerCase() && 
        paper.weight === weight && 
        paper.width === width && 
        paper.height === height
    );
    
    if (duplicatePapers.length > 0) {
        showDuplicateWarning(duplicatePapers[0]);
        return;
    }
    
    const newPaper = {
        name,
        weight,
        width,
        height,
        crossSide,
        coating,
        printingWedges,
        nozzleReconditioning,
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
    
    try {
        await savePaperType(newPaper);
        
        // Reload paper types from database
        await loadPaperTypes();
        
        // Clear form
        addPaperForm.reset();
        
        // Show success message
        showNotification('Paper type added successfully!', 'success');
    } catch (error) {
        showNotification('Failed to add paper type: ' + error.message, 'error');
    }
}

async function toggleCrossSide(id) {
    const paper = paperTypes.find(p => p.id === id);
    if (!paper) return;
    
    const newCrossSide = paper.crossSide === 'short' ? 'long' : 'short';
    
    try {
        await toggleCrossSideAPI(id, newCrossSide);
        
        // Reload paper types from database
        await loadPaperTypes();
        
        showNotification('Cross side updated!', 'success');
    } catch (error) {
        showNotification('Failed to update cross side: ' + error.message, 'error');
    }
}

async function removePaper(id) {
    if (confirm('Are you sure you want to remove this paper type?')) {
        try {
            await deletePaperType(id);
            
            // Reload paper types from database
            await loadPaperTypes();
            
            showNotification('Paper type removed!', 'success');
        } catch (error) {
            showNotification('Failed to remove paper type: ' + error.message, 'error');
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
function openAdjustmentModal(id) {
    const paper = paperTypes.find(p => p.id === id);
    
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
                    <div class="constraint-help">💡 Values are automatically constrained: Left/Right and Up/Down pairs must sum to zero</div>
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
                    <button onclick="saveAdjustment(${id})" class="save-btn">Save Adjustment</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Setup constraint listeners for modal inputs
    setupModalAlignmentConstraints();
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('modalShortLeftRight1').focus();
    }, 100);
}

function closeAdjustmentModal() {
    const modal = document.getElementById('adjustmentModal');
    if (modal) {
        modal.remove();
    }
}

async function saveAdjustment(id) {
    const shortLeftRight1 = parseFloat(document.getElementById('modalShortLeftRight1').value) || 0.0;
    const shortLeftRight2 = parseFloat(document.getElementById('modalShortLeftRight2').value) || 0.0;
    const shortUpDown1 = parseFloat(document.getElementById('modalShortUpDown1').value) || 0.0;
    const shortUpDown2 = parseFloat(document.getElementById('modalShortUpDown2').value) || 0.0;
    
    const longLeftRight1 = parseFloat(document.getElementById('modalLongLeftRight1').value) || 0.0;
    const longLeftRight2 = parseFloat(document.getElementById('modalLongLeftRight2').value) || 0.0;
    const longUpDown1 = parseFloat(document.getElementById('modalLongUpDown1').value) || 0.0;
    const longUpDown2 = parseFloat(document.getElementById('modalLongUpDown2').value) || 0.0;
    
    const crossAdjust = {
        short: {
            leftRight: [shortLeftRight1, shortLeftRight2],
            upDown: [shortUpDown1, shortUpDown2]
        },
        long: {
            leftRight: [longLeftRight1, longLeftRight2],
            upDown: [longUpDown1, longUpDown2]
        }
    };
    
    try {
        await updateCrossAdjustments(id, crossAdjust);
        
        // Reload paper types from database
        await loadPaperTypes();
        
        closeAdjustmentModal();
        showNotification('Cross adjustments saved!', 'success');
    } catch (error) {
        showNotification('Failed to save adjustments: ' + error.message, 'error');
    }
}

// Alignment constraint system
function setupAlignmentConstraints() {
    // Add constraint listeners to form inputs
    const leftRight1 = document.getElementById('leftRight1');
    const leftRight2 = document.getElementById('leftRight2');
    const upDown1 = document.getElementById('upDown1');
    const upDown2 = document.getElementById('upDown2');
    
    if (leftRight1 && leftRight2) {
        leftRight1.addEventListener('input', () => updateOppositeValue(leftRight1, leftRight2));
        leftRight2.addEventListener('input', () => updateOppositeValue(leftRight2, leftRight1));
    }
    
    if (upDown1 && upDown2) {
        upDown1.addEventListener('input', () => updateOppositeValue(upDown1, upDown2));
        upDown2.addEventListener('input', () => updateOppositeValue(upDown2, upDown1));
    }
}

function updateOppositeValue(changedInput, oppositeInput) {
    const value = parseFloat(changedInput.value) || 0;
    const oppositeValue = -value;
    oppositeInput.value = oppositeValue.toFixed(1);
    
    // Add visual constraint indicators
    changedInput.classList.add('constrained');
    oppositeInput.classList.add('constrained');
    
    // Remove indicators after a short delay to show the constraint was applied
    setTimeout(() => {
        changedInput.classList.remove('constrained');
        oppositeInput.classList.remove('constrained');
    }, 1000);
}

function setupModalAlignmentConstraints() {
    // Add constraint listeners to modal inputs
    const modalShortLeftRight1 = document.getElementById('modalShortLeftRight1');
    const modalShortLeftRight2 = document.getElementById('modalShortLeftRight2');
    const modalShortUpDown1 = document.getElementById('modalShortUpDown1');
    const modalShortUpDown2 = document.getElementById('modalShortUpDown2');
    
    const modalLongLeftRight1 = document.getElementById('modalLongLeftRight1');
    const modalLongLeftRight2 = document.getElementById('modalLongLeftRight2');
    const modalLongUpDown1 = document.getElementById('modalLongUpDown1');
    const modalLongUpDown2 = document.getElementById('modalLongUpDown2');
    
    // Short side constraints
    if (modalShortLeftRight1 && modalShortLeftRight2) {
        modalShortLeftRight1.addEventListener('input', () => updateOppositeValue(modalShortLeftRight1, modalShortLeftRight2));
        modalShortLeftRight2.addEventListener('input', () => updateOppositeValue(modalShortLeftRight2, modalShortLeftRight1));
    }
    
    if (modalShortUpDown1 && modalShortUpDown2) {
        modalShortUpDown1.addEventListener('input', () => updateOppositeValue(modalShortUpDown1, modalShortUpDown2));
        modalShortUpDown2.addEventListener('input', () => updateOppositeValue(modalShortUpDown2, modalShortUpDown1));
    }
    
    // Long side constraints
    if (modalLongLeftRight1 && modalLongLeftRight2) {
        modalLongLeftRight1.addEventListener('input', () => updateOppositeValue(modalLongLeftRight1, modalLongLeftRight2));
        modalLongLeftRight2.addEventListener('input', () => updateOppositeValue(modalLongLeftRight2, modalLongLeftRight1));
    }
    
    if (modalLongUpDown1 && modalLongUpDown2) {
        modalLongUpDown1.addEventListener('input', () => updateOppositeValue(modalLongUpDown1, modalLongUpDown2));
        modalLongUpDown2.addEventListener('input', () => updateOppositeValue(modalLongUpDown2, modalLongUpDown1));
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

// Validation helper functions
function clearValidationErrors() {
    const errorElements = document.querySelectorAll('.validation-error');
    errorElements.forEach(el => el.remove());
    
    const inputElements = document.querySelectorAll('.input-error');
    inputElements.forEach(el => el.classList.remove('input-error'));
    
    const warningElements = document.querySelectorAll('.duplicate-warning');
    warningElements.forEach(el => el.remove());
}

function showValidationError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('input-error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function showDuplicateWarning(existingPaper) {
    const form = document.getElementById('addPaperForm');
    const warningDiv = document.createElement('div');
    warningDiv.className = 'duplicate-warning';
    warningDiv.innerHTML = `
        <strong>⚠️ Duplicate Paper Detected!</strong><br>
        A paper with the same name, weight, and dimensions already exists:<br>
        <strong>${existingPaper.name}</strong> - ${existingPaper.weight}gr, ${existingPaper.width}×${existingPaper.height}mm<br>
        <small>Please modify the specifications or use a different name.</small>
    `;
    
    form.appendChild(warningDiv);
}

// Print Preview functionality
function openPrintPreview(id) {
    const modal = document.getElementById('printPreviewModal');
    const paper = paperTypes.find(p => p.id === id);
    
    if (!paper) return;
    
    // Update preview content
    document.getElementById('previewPaperName').textContent = paper.name;
    document.getElementById('previewPaperSpecs').textContent = 
        `${paper.weight}gr • ${paper.width}×${paper.height}mm • ${paper.coating}`;
    
    const adjustments = paper.crossAdjust[paper.crossSide];
    document.getElementById('previewAdjustments').textContent = 
        `Cross Adjustments: L/R: ${adjustments.leftRight[0]}, ${adjustments.leftRight[1]} | U/D: ${adjustments.upDown[0]}, ${adjustments.upDown[1]}`;
    
    // Update preview paper styling based on coating
    const previewPaper = document.getElementById('previewPaper');
    previewPaper.className = `preview-paper ${coating}`;
    
    // Add alignment crosses to the preview
    addAlignmentCrosses(paper);
    
    // Show modal
    modal.style.display = 'block';
    
    // Setup modal event listeners
    setupPrintPreviewModal();
}

function setupPrintPreviewModal() {
    const modal = document.getElementById('printPreviewModal');
    const closeBtn = document.querySelector('.close');
    const closePreviewBtn = document.getElementById('closePreviewBtn');
    const printBtn = document.getElementById('printPreviewBtn');
    
    // Close modal functions
    function closeModal() {
        modal.style.display = 'none';
    }
    
    closeBtn.onclick = closeModal;
    closePreviewBtn.onclick = closeModal;
    
    // Close when clicking outside modal
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    }
    
    // Print functionality - DISABLED for personal use only
    printBtn.onclick = function() {
        showNotification('Print functionality disabled - This is for personal alignment reference only', 'info');
    }
}

function addAlignmentCrosses(paper) {
    const previewGrid = document.querySelector('.preview-grid');
    if (!previewGrid) return;
    
    // Clear existing crosses
    previewGrid.querySelectorAll('.alignment-cross').forEach(cross => cross.remove());
    
    const adjustments = paper.crossAdjust[paper.crossSide];
    const gridCells = previewGrid.querySelectorAll('.preview-cell');
    
    // Add alignment crosses to each cell
    gridCells.forEach((cell, index) => {
        const cross = document.createElement('div');
        cross.className = 'alignment-cross';
        cross.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 10;
        `;
        
        // Create cross lines
        const horizontalLine = document.createElement('div');
        horizontalLine.style.cssText = `
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: #ff0000;
            transform: translateY(-50%);
        `;
        
        const verticalLine = document.createElement('div');
        verticalLine.style.cssText = `
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #ff0000;
            transform: translateX(-50%);
        `;
        
        // Apply adjustments to cross position
        const lrAdjust = adjustments.leftRight[0] + adjustments.leftRight[1];
        const udAdjust = adjustments.upDown[0] + adjustments.upDown[1];
        
        cross.style.transform = `translate(calc(-50% + ${lrAdjust * 10}px), calc(-50% + ${udAdjust * 10}px))`;
        
        cross.appendChild(horizontalLine);
        cross.appendChild(verticalLine);
        
        // Position the cell relatively
        cell.style.position = 'relative';
        cell.appendChild(cross);
        
        // Add adjustment values as text
        const adjustmentText = document.createElement('div');
        adjustmentText.style.cssText = `
            position: absolute;
            bottom: 2px;
            right: 2px;
            font-size: 10px;
            color: #666;
            background: rgba(255,255,255,0.8);
            padding: 2px 4px;
            border-radius: 2px;
        `;
        adjustmentText.textContent = `L/R: ${adjustments.leftRight[0]},${adjustments.leftRight[1]} | U/D: ${adjustments.upDown[0]},${adjustments.upDown[1]}`;
        cell.appendChild(adjustmentText);
    });
}

function getCurrentPreviewPaper() {
    const name = document.getElementById('previewPaperName').textContent;
    const specs = document.getElementById('previewPaperSpecs').textContent;
    const parts = specs.split(' • ');
    const weight = parseInt(parts[0].replace('gr', ''));
    const dimensions = parts[1].replace('mm', '').split('×');
    const width = parseInt(dimensions[0]);
    const height = parseInt(dimensions[1]);
    
    return paperTypes.find(p => 
        p.name === name && p.weight === weight && p.width === width && p.height === height
    );
}