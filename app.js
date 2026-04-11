const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtfsyAnl5GL1buHmzh5Pn4h-m8TgbIl0mE6FmvyRPpsvZGqw1aWYWnZ_Fo9wNBtg/pub?gid=1814434584&single=true&output=csv';

let indicatorsData = [];
let currentFilters = {
    hazard: 'All',
    capital: 'All',
    search: ''
};

// UI Elements
const indicatorGrid = document.getElementById('indicatorGrid');
const hazardFilters = document.getElementById('hazardFilters');
const capitalFilters = document.getElementById('capitalFilters');
const searchInput = document.getElementById('searchInput');
const loader = document.getElementById('loader');
const noResults = document.getElementById('noResults');
const statsOverview = document.getElementById('statsOverview');

// Capital Colors & Icons Mapping
const capitalMeta = {
    'Financial': { color: '#fbbf24', icon: '💰' },
    'Human': { color: '#f87171', icon: '👤' },
    'Natural': { color: '#4ade80', icon: '🌿' },
    'Physical': { color: '#38bdf8', icon: '🏗️' },
    'Social': { color: '#818cf8', icon: '🤝' }
};

/**
 * Robust CSV Parser for Google Sheets CSV Export
 */
function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    return lines.slice(1).map(line => {
        const result = [];
        let curValue = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(curValue.trim());
                curValue = "";
            } else {
                curValue += char;
            }
        }
        result.push(curValue.trim());

        // Map to object: Code, Indicators, Capitals, Hazard
        return {
            code: result[0] || 'N/A',
            indicator: result[1] || 'N/A',
            capital: result[2] || 'Generic',
            hazard: result[3] || 'Generic'
        };
    }).filter(item => item.indicator !== 'N/A' && item.code !== 'Code');
}

/**
 * Fetch Data from Google Sheets
 */
async function fetchData(useProxy = false) {
    const url = useProxy 
        ? `https://api.allorigins.win/raw?url=${encodeURIComponent(SHEET_URL)}` 
        : SHEET_URL;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        
        const text = await response.text();
        indicatorsData = parseCSV(text);
        
        // Hide loader
        loader.style.opacity = '0';
        setTimeout(() => loader.classList.add('hidden'), 500);
        
        initDashboard();
        console.log(`Data loaded successfully ${useProxy ? 'via proxy' : 'directly'}`);
    } catch (error) {
        console.warn(`Fetch failed (${useProxy ? 'proxy' : 'direct'}):`, error);
        
        if (!useProxy) {
            console.log('Attempting fetch via CORS proxy...');
            fetchData(true); // Retry with proxy
        } else {
            loader.innerHTML = `
                <div style="text-align: center; color: #f87171; padding: 20px;">
                    <p>⚠️ <strong>Failed to load data.</strong></p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">
                        This is likely due to browser security blocking local file access.<br>
                        Please try opening with a local server or checking your connection.
                    </p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 8px 16px; border-radius: 8px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    }
}

/**
 * Initialize Dashboard
 */
function initDashboard() {
    renderStats();
    renderIndicators();
    setupEventListeners();
}

/**
 * Render Statistics Overview
 */
function renderStats() {
    const total = indicatorsData.length;
    const hazards = [...new Set(indicatorsData.map(d => d.hazard))].length;
    const capitals = [...new Set(indicatorsData.map(d => d.capital))].length;

    statsOverview.innerHTML = `
        <div class="stat-card">
            <h4>Total Indicators</h4>
            <div class="val">${total}</div>
        </div>
        <div class="stat-card">
            <h4>Hazard Contexts</h4>
            <div class="val">${hazards}</div>
        </div>
        <div class="stat-card">
            <h4>Capital Categories</h4>
            <div class="val">${capitals}</div>
        </div>
    `;
}

/**
 * Render Indicator Cards
 */
function renderIndicators() {
    const filtered = indicatorsData.filter(item => {
        const matchHazard = currentFilters.hazard === 'All' || item.hazard === currentFilters.hazard;
        const matchCapital = currentFilters.capital === 'All' || item.capital === currentFilters.capital;
        const matchSearch = item.indicator.toLowerCase().includes(currentFilters.search.toLowerCase()) || 
                          item.code.toLowerCase().includes(currentFilters.search.toLowerCase());
        
        return matchHazard && matchCapital && matchSearch;
    });

    indicatorGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        noResults.classList.remove('hidden');
    } else {
        noResults.classList.add('hidden');
        filtered.forEach((item, index) => {
            const meta = capitalMeta[item.capital] || { color: '#94a3b8', icon: '📄' };
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${index * 0.05}s`;
            card.style.setProperty('--primary', meta.color);

            card.innerHTML = `
                <div class="card-header">
                    <span class="card-code">${item.code}</span>
                    <span class="tag-hazard ${item.hazard}">${item.hazard}</span>
                </div>
                <h3 class="indicator-title">${item.indicator}</h3>
                <div class="card-footer">
                    <div class="capital-label">
                        <span class="icon">${meta.icon}</span>
                        <span class="capital-text">${item.capital} Capital</span>
                    </div>
                </div>
            `;
            indicatorGrid.appendChild(card);
        });
    }
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    // Hazard Filters
    hazardFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip')) {
            updateFilter('hazard', e.target.getAttribute('data-hazard'), hazardFilters);
        }
    });

    // Capital Filters
    capitalFilters.addEventListener('click', (e) => {
        if (e.target.classList.contains('chip')) {
            updateFilter('capital', e.target.getAttribute('data-capital'), capitalFilters);
        }
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        currentFilters.search = e.target.value;
        renderIndicators();
    });
}

function updateFilter(type, value, container) {
    currentFilters[type] = value;
    
    // UI Update
    container.querySelectorAll('.chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute(`data-${type}`) === value);
    });
    
    renderIndicators();
}

// Start the app
fetchData();
