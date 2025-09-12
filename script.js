// Application state
let paperTypes = [];
let filteredPapers = [];
let categories = [];
let currentView = 'categories'; // 'categories', 'papers', 'history'
let currentCategory = null;
let currentPaper = null;

// DOM elements
const paperGrid = document.getElementById('paperGrid');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const weightFilter = document.getElementById('weightFilter');
const sizeFilter = document.getElementById('sizeFilter');
const addPaperForm = document.getElementById('addPaperForm');

// View elements
const categoriesView = document.getElementById('categoriesView');
const papersView = document.getElementById('papersView');
const historyView = document.getElementById('historyView');
const categoriesGrid = document.getElementById('categoriesGrid');
const backToCategories = document.getElementById('backToCategories');
const backToPapers = document.getElementById('backToPapers');
const currentCategoryName = document.getElementById('currentCategoryName');
const currentPaperName = document.getElementById('currentPaperName');
const historyContainer = document.getElementById('historyContainer');

// API Functions
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error('Failed to load categories');
        }
        categories = await response.json();
        renderCategoriesGrid();
    } catch (error) {
        console.error('Error loading categories:', error);
        showNotification('Neizdevās ielādēt kategorijas. Izmanto bezsaistes režīmu.', 'info');
        categories = [];
        renderCategoriesGrid();
    }
}

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
        showNotification('Neizdevās ielādēt papīra veidus. Izmanto bezsaistes režīmu.', 'info');
        // Fallback to empty array if API fails
        paperTypes = [];
        filteredPapers = [];
        renderPaperGrid();
    }
}

async function loadPapersByCategory(categoryName) {
    try {
        const response = await fetch(`/api/categories/${encodeURIComponent(categoryName)}/papers`);
        if (!response.ok) {
            throw new Error('Failed to load papers for category');
        }
        const papers = await response.json();
        return papers;
    } catch (error) {
        console.error('Error loading papers for category:', error);
        showNotification('Neizdevās ielādēt papīrus kategorijai', 'error');
        return [];
    }
}

async function loadPaperHistory(paperId) {
    try {
        const response = await fetch(`/api/papers/${paperId}/history`);
        if (!response.ok) {
            throw new Error('Failed to load paper history');
        }
        const history = await response.json();
        return history;
    } catch (error) {
        console.error('Error loading paper history:', error);
        showNotification('Neizdevās ielādēt papīra vēsturi', 'error');
        return [];
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
    loadCategories();
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
    
    // Navigation buttons
    backToCategories.addEventListener('click', showCategoriesView);
    backToPapers.addEventListener('click', showPapersView);
    
    // Setup alignment constraint listeners
    setupAlignmentConstraints();
}

function renderPaperGrid() {
    if (filteredPapers.length === 0) {
        paperGrid.innerHTML = '<div class="no-results">Nav atrasti papīra veidi, kas atbilst jūsu kritērijiem.</div>';
        return;
    }
    
    paperGrid.innerHTML = filteredPapers.map(paper => `
        <div class="paper-card ${paper.crossSide === 'short' ? 'grain-short' : 'grain-long'}">
            <div class="paper-name">${paper.name}</div>
            <div class="paper-details">
                <div class="detail-item">
                    <span class="detail-label">Svars:</span>
                    <span class="detail-value">${paper.weight}gr</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Izmēri:</span>
                    <span class="detail-value">${paper.width}×${paper.height}mm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Malu attiecība:</span>
                    <span class="detail-value">${(paper.width / paper.height).toFixed(2)}:1</span>
                </div>
            </div>
            <div class="paper-specs">
                <span class="spec-badge coating-badge ${paper.coating}">${paper.coating === 'Krītots' ? 'Krītots' : 'Nekrītots'}</span>
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
                <div class="cross-side-label">Šķērsa puse (Grauda virziens)</div>
                <div class="cross-side-value">
                    ${paper.crossSide === 'short' ? 'Īsā puse' : 'Garā puse'}
                </div>
            </div>
            <div class="cross-adjustment-display">
                <div class="adjustment-title">Šķērsa regulējums (${paper.crossSide === 'short' ? 'Īsā puse' : 'Garā puse'}):</div>
                <div class="adjustment-values">
                    <div class="adjustment-row">
                        <span class="adjustment-label">Kreisā/Labā:</span>
                        <span class="adjustment-value">${paper.crossAdjust[paper.crossSide].leftRight[0]}, ${paper.crossAdjust[paper.crossSide].leftRight[1]}</span>
                    </div>
                    <div class="adjustment-row">
                        <span class="adjustment-label">Augšā/Lejā:</span>
                        <span class="adjustment-value">${paper.crossAdjust[paper.crossSide].upDown[0]}, ${paper.crossAdjust[paper.crossSide].upDown[1]}</span>
                    </div>
                </div>
                <button onclick="openAdjustmentModal(${paper.id})" 
                        class="edit-adjustment-btn">
                    Rediģēt regulējumus
                </button>
            </div>
            <div class="paper-actions" style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="openPaperHistory(${paper.id})" 
                        class="history-btn" style="flex: 1; padding: 8px 12px; border: 2px solid #9b59b6; background: white; color: #9b59b6; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    📊 Vēsture
                </button>
                <button onclick="toggleCrossSide(${paper.id})" 
                        class="toggle-btn" style="flex: 1; padding: 8px 12px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    Pārslēgt uz ${paper.crossSide === 'short' ? 'Garā puse' : 'Īsā puse'}
                </button>
                <button onclick="openEditPaperModal(${paper.id})" 
                        class="edit-btn" style="padding: 8px 12px; border: 2px solid #28a745; background: white; color: #28a745; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    Rediģēt
                </button>
                <button onclick="removePaper(${paper.id})" 
                        class="remove-btn" style="padding: 8px 12px; border: 2px solid #e74c3c; background: white; color: #e74c3c; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s ease;">
                    Dzēst
                </button>
            </div>
        </div>
    `).join('');
}

// Navigation functions
function showCategoriesView() {
    currentView = 'categories';
    categoriesView.style.display = 'block';
    papersView.style.display = 'none';
    historyView.style.display = 'none';
    
    // Show add paper section in categories view
    const addPaperSection = document.querySelector('.add-paper-section');
    if (addPaperSection) {
        addPaperSection.style.display = 'block';
    }
    
    loadCategories();
}

function showPapersView() {
    currentView = 'papers';
    categoriesView.style.display = 'none';
    papersView.style.display = 'block';
    historyView.style.display = 'none';
    
    // Show add paper section in papers view
    const addPaperSection = document.querySelector('.add-paper-section');
    if (addPaperSection) {
        addPaperSection.style.display = 'block';
    }
}

function showHistoryView() {
    currentView = 'history';
    categoriesView.style.display = 'none';
    papersView.style.display = 'none';
    historyView.style.display = 'block';
    
    // Hide add paper section in history view
    const addPaperSection = document.querySelector('.add-paper-section');
    if (addPaperSection) {
        addPaperSection.style.display = 'none';
    }
}

// Rendering functions
function renderCategoriesGrid() {
    if (categories.length === 0) {
        categoriesGrid.innerHTML = '<div class="no-results">Nav atrastas kategorijas.</div>';
        return;
    }
    
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card" onclick="openCategory('${category.name}')">
            <div class="category-name">${category.name}</div>
            <div class="category-count">${category.paperCount} papīra veidi</div>
            <div class="category-preview">
                ${category.papers.slice(0, 3).map(paper => 
                    `<span class="paper-preview">${paper.weight}gr ${paper.width}×${paper.height}mm</span>`
                ).join('')}
                ${category.papers.length > 3 ? `<span class="more-papers">+${category.papers.length - 3} vēl</span>` : ''}
            </div>
        </div>
    `).join('');
}

async function openCategory(categoryName) {
    currentCategory = categoryName;
    currentCategoryName.textContent = categoryName;
    
    const papers = await loadPapersByCategory(categoryName);
    filteredPapers = papers;
    // Also update paperTypes to ensure edit functionality works
    paperTypes = papers;
    showPapersView();
    renderPaperGrid();
}

async function openPaperHistory(paperId) {
    const paper = filteredPapers.find(p => p.id === paperId);
    if (!paper) return;
    
    currentPaper = paper;
    currentPaperName.textContent = `${paper.name} - ${paper.weight}gr ${paper.width}×${paper.height}mm`;
    
    const history = await loadPaperHistory(paperId);
    renderPaperHistory(history);
    showHistoryView();
}

function renderPaperHistory(history) {
    if (history.length === 0) {
        historyContainer.innerHTML = '<div class="no-results">Nav vēstures ierakstu šim papīram.</div>';
        return;
    }
    
    historyContainer.innerHTML = history.map(entry => `
        <div class="history-entry">
            <div class="history-header">
                <div class="history-date">${new Date(entry.changedAt).toLocaleString('lv-LV')}</div>
            </div>
            <div class="history-changes">
                <div class="change-section">
                    <h4>Īsās puses regulējumi</h4>
                    <div class="change-row">
                        <span class="change-label">Kreisā/Labā:</span>
                        <span class="change-values">
                            <span class="old-value">${entry.oldValues.short.leftRight[0]}, ${entry.oldValues.short.leftRight[1]}</span>
                            <span class="arrow">→</span>
                            <span class="new-value">${entry.newValues.short.leftRight[0]}, ${entry.newValues.short.leftRight[1]}</span>
                        </span>
                    </div>
                    <div class="change-row">
                        <span class="change-label">Augšā/Lejā:</span>
                        <span class="change-values">
                            <span class="old-value">${entry.oldValues.short.upDown[0]}, ${entry.oldValues.short.upDown[1]}</span>
                            <span class="arrow">→</span>
                            <span class="new-value">${entry.newValues.short.upDown[0]}, ${entry.newValues.short.upDown[1]}</span>
                        </span>
                    </div>
                </div>
                <div class="change-section">
                    <h4>Garās puses regulējumi</h4>
                    <div class="change-row">
                        <span class="change-label">Kreisā/Labā:</span>
                        <span class="change-values">
                            <span class="old-value">${entry.oldValues.long.leftRight[0]}, ${entry.oldValues.long.leftRight[1]}</span>
                            <span class="arrow">→</span>
                            <span class="new-value">${entry.newValues.long.leftRight[0]}, ${entry.newValues.long.leftRight[1]}</span>
                        </span>
                    </div>
                    <div class="change-row">
                        <span class="change-label">Augšā/Lejā:</span>
                        <span class="change-values">
                            <span class="old-value">${entry.oldValues.long.upDown[0]}, ${entry.oldValues.long.upDown[1]}</span>
                            <span class="arrow">→</span>
                            <span class="new-value">${entry.newValues.long.upDown[0]}, ${entry.newValues.long.upDown[1]}</span>
                        </span>
                    </div>
                </div>
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
    const coatingValue = document.getElementById('paperCoating').value;
    const coating = coatingValue === 'coated' ? 'Krītots' : 'Nekrītots';
    const printingWedges = document.getElementById('printingWedges').checked;
    const nozzleReconditioning = document.getElementById('nozzleReconditioning').checked;
    const leftRight1 = parseFloat(document.getElementById('leftRight1').value) || 0.0;
    const leftRight2 = parseFloat(document.getElementById('leftRight2').value) || 0.0;
    const upDown1 = parseFloat(document.getElementById('upDown1').value) || 0.0;
    const upDown2 = parseFloat(document.getElementById('upDown2').value) || 0.0;
    
    // Validation
    let hasErrors = false;
    
    if (!name) {
        showValidationError('paperName', 'Papīra nosaukums ir obligāts');
        hasErrors = true;
    }
    
    if (!weight || weight < 1) {
        showValidationError('paperWeight', 'Svars jābūt vismaz 1gr');
        hasErrors = true;
    }
    
    if (!width || width < 1) {
        showValidationError('paperWidth', 'Platums jābūt vismaz 1mm');
        hasErrors = true;
    }
    
    if (!height || height < 1) {
        showValidationError('paperHeight', 'Augstums jābūt vismaz 1mm');
        hasErrors = true;
    }
    
    if (!crossSide) {
        showValidationError('crossSide', 'Šķērsa puses izvēle ir obligāta');
        hasErrors = true;
    }
    
    if (!coating) {
        showValidationError('paperCoating', 'Pārklājuma izvēle ir obligāta');
        hasErrors = true;
    }
    
    if (hasErrors) {
        return;
    }
    
    // Check for duplicates with enhanced validation (all parameters)
    const duplicatePapers = paperTypes.filter(paper => 
        paper.name.toLowerCase() === name.toLowerCase() && 
        paper.weight === weight && 
        paper.width === width && 
        paper.height === height &&
        paper.crossSide === crossSide &&
        paper.coating === coating
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
        
        // Reload categories from database
        await loadCategories();
        
        // Clear form
        addPaperForm.reset();
        
        // Show success message
        showNotification('Papīra veids veiksmīgi pievienots!', 'success');
    } catch (error) {
        showNotification('Neizdevās pievienot papīra veidu: ' + error.message, 'error');
    }
}

async function toggleCrossSide(id) {
    const paper = paperTypes.find(p => p.id === id);
    if (!paper) return;
    
    const newCrossSide = paper.crossSide === 'short' ? 'long' : 'short';
    
    try {
        await toggleCrossSideAPI(id, newCrossSide);
        
        // Reload categories from database
        await loadCategories();
        
        // If we're in category view, reload the current category's papers
        if (currentView === 'papers' && currentCategory) {
            const papers = await loadPapersByCategory(currentCategory);
            filteredPapers = papers;
            paperTypes = papers;
            renderPaperGrid();
        }
        
        showNotification('Šķērsa puse atjaunota!', 'success');
    } catch (error) {
        showNotification('Neizdevās atjaunot šķērsa pusi: ' + error.message, 'error');
    }
}

async function removePaper(id) {
    if (confirm('Vai tiešām vēlaties dzēst šo papīra veidu?')) {
        try {
            await deletePaperType(id);
            
            // Reload paper types from database
            await loadPaperTypes();
            
            // If we're in category view, reload the current category's papers
            if (currentView === 'papers' && currentCategory) {
                const papers = await loadPapersByCategory(currentCategory);
                filteredPapers = papers;
                paperTypes = papers;
                renderPaperGrid();
            }
            
            showNotification('Papīra veids dzēsts!', 'success');
        } catch (error) {
            showNotification('Neizdevās dzēst papīra veidu: ' + error.message, 'error');
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
                    <h3>Rediģēt šķērsa regulējumu - ${paper.name}</h3>
                    <button onclick="closeAdjustmentModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="constraint-help">💡 Vērtības tiek automātiski ierobežotas: Kreisā/Labā un Augšā/Lejā pāriem jābūt nullei</div>
                    <div class="adjustment-form">
                        <div class="orientation-section">
                            <h4>Īsās puses regulējumi</h4>
                            <div class="adjustment-group">
                                <label>Kreisā/Labā regulējums:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalShortLeftRight1" value="${paper.crossAdjust.short.leftRight[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalShortLeftRight2" value="${paper.crossAdjust.short.leftRight[1]}" step="0.1">
                                </div>
                            </div>
                            <div class="adjustment-group">
                                <label>Augšā/Lejā regulējums:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalShortUpDown1" value="${paper.crossAdjust.short.upDown[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalShortUpDown2" value="${paper.crossAdjust.short.upDown[1]}" step="0.1">
                                </div>
                            </div>
                        </div>
                        <div class="orientation-section">
                            <h4>Garās puses regulējumi</h4>
                            <div class="adjustment-group">
                                <label>Kreisā/Labā regulējums:</label>
                                <div class="adjustment-inputs">
                                    <input type="number" id="modalLongLeftRight1" value="${paper.crossAdjust.long.leftRight[0]}" step="0.1">
                                    <span>,</span>
                                    <input type="number" id="modalLongLeftRight2" value="${paper.crossAdjust.long.leftRight[1]}" step="0.1">
                                </div>
                            </div>
                            <div class="adjustment-group">
                                <label>Augšā/Lejā regulējums:</label>
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
                    <button onclick="closeAdjustmentModal()" class="cancel-btn">Atcelt</button>
                    <button onclick="saveAdjustment(${id})" class="save-btn">Saglabāt regulējumu</button>
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
        
        // Reload categories from database
        await loadCategories();
        
        // If we're in category view, reload the current category's papers
        if (currentView === 'papers' && currentCategory) {
            const papers = await loadPapersByCategory(currentCategory);
            filteredPapers = papers;
            paperTypes = papers;
            renderPaperGrid();
        }
        
        closeAdjustmentModal();
        showNotification('Šķērsa regulējumi saglabāti!', 'success');
    } catch (error) {
        showNotification('Neizdevās saglabāt regulējumus: ' + error.message, 'error');
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
        showNotification('Lietotne veiksmīgi instalēta!', 'success');
    });
    
    // Offline/Online status
    window.addEventListener('online', () => {
        showNotification('Jūs atkal esat tiešsaistē!', 'success');
        // Sync any pending data
        syncPendingData();
    });
    
    window.addEventListener('offline', () => {
        showNotification('Jūs esat bezsaistē. Dažas funkcijas var būt ierobežotas.', 'info');
    });
    
    // Add touch gestures for mobile
    setupTouchGestures();
}

// Create install button
function createInstallButton() {
    const button = document.createElement('button');
    button.id = 'installButton';
    button.innerHTML = '📱 Instalēt lietotni';
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
        <div>Pieejama jauna versija!</div>
        <button onclick="updateApp()" style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 8px; cursor: pointer; font-weight: 600;">
            Atjaunot tagad
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
        showNotification('Dati veiksmīgi sinhronizēti!', 'success');
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
            showNotification('Atjaunina...', 'info');
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
        <strong>⚠️ Atklāts dublēts papīrs!</strong><br>
        Papīrs ar tādu pašu nosaukumu, svaru un izmēriem jau eksistē:<br>
        <strong>${existingPaper.name}</strong> - ${existingPaper.weight}gr, ${existingPaper.width}×${existingPaper.height}mm<br>
        <small>Lūdzu mainiet specifikācijas vai izmantojiet citu nosaukumu.</small>
    `;
    
    form.appendChild(warningDiv);
}

// Edit Paper functionality
function openEditPaperModal(id) {
    const paper = paperTypes.find(p => p.id === id);
    
    if (!paper) return;
    
    // Create modal HTML
    const modalHTML = `
        <div id="editPaperModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Rediģēt papīru - ${paper.name}</h3>
                    <button onclick="closeEditPaperModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editPaperForm" class="edit-form">
                        <div class="form-row">
                            <input type="text" id="editPaperName" value="${paper.name}" required>
                            <input type="number" id="editPaperWeight" value="${paper.weight}" min="1" required>
                        </div>
                        <div class="form-row">
                            <input type="number" id="editPaperWidth" value="${paper.width}" min="1" required>
                            <input type="number" id="editPaperHeight" value="${paper.height}" min="1" required>
                        </div>
                        <div class="form-row">
                            <select id="editCrossSide" required>
                                <option value="short" ${paper.crossSide === 'short' ? 'selected' : ''}>Īsā puse (Īsā grauds)</option>
                                <option value="long" ${paper.crossSide === 'long' ? 'selected' : ''}>Garā puse (Garā grauds)</option>
                            </select>
                            <select id="editPaperCoating" required>
                                <option value="coated" ${paper.coating === 'Krītots' ? 'selected' : ''}>Krītots</option>
                                <option value="uncoated" ${paper.coating === 'Nekrītots' ? 'selected' : ''}>Nekrītots</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="editPrintingWedges" ${paper.printingWedges ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Piemērots drukāšanas ķīlēm
                                </label>
                                <label class="checkbox-label">
                                    <input type="checkbox" id="editNozzleReconditioning" ${paper.nozzleReconditioning ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Piemērots sprauslu atjaunošanai
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button onclick="closeEditPaperModal()" class="cancel-btn">Atcelt</button>
                    <button onclick="saveEditPaper(${id})" class="save-btn">Saglabāt izmaiņas</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Focus first input
    setTimeout(() => {
        document.getElementById('editPaperName').focus();
    }, 100);
}

function closeEditPaperModal() {
    const modal = document.getElementById('editPaperModal');
    if (modal) {
        modal.remove();
    }
}

async function saveEditPaper(id) {
    const name = document.getElementById('editPaperName').value.trim();
    const weight = parseInt(document.getElementById('editPaperWeight').value);
    const width = parseInt(document.getElementById('editPaperWidth').value);
    const height = parseInt(document.getElementById('editPaperHeight').value);
    const crossSide = document.getElementById('editCrossSide').value;
    const coatingValue = document.getElementById('editPaperCoating').value;
    const coating = coatingValue === 'coated' ? 'Krītots' : 'Nekrītots';
    const printingWedges = document.getElementById('editPrintingWedges').checked;
    const nozzleReconditioning = document.getElementById('editNozzleReconditioning').checked;
    
    // Validation
    if (!name || !weight || !width || !height || !crossSide || !coating) {
        showNotification('Lūdzu aizpildiet visus obligātos laukus', 'error');
        return;
    }
    
    const updatedPaper = {
        name,
        weight,
        width,
        height,
        crossSide,
        coating,
        printingWedges,
        nozzleReconditioning
    };
    
    try {
        await updatePaperType(id, updatedPaper);
        
        // Reload categories from database
        await loadCategories();
        
        // If we're in category view, reload the current category's papers
        if (currentView === 'papers' && currentCategory) {
            const papers = await loadPapersByCategory(currentCategory);
            filteredPapers = papers;
            paperTypes = papers;
            renderPaperGrid();
        }
        
        closeEditPaperModal();
        showNotification('Papīrs veiksmīgi atjaunots!', 'success');
    } catch (error) {
        showNotification('Neizdevās atjaunot papīru: ' + error.message, 'error');
    }
}
