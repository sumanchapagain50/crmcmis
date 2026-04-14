// Data & Colors
const colors = {
    'A': { hex: '#00e676', darkScale: '#004d27' }, // Neon Green
    'B': { hex: '#ffeb3b', darkScale: '#665e18' }, // Neon Yellow
    'C': { hex: '#ff9800', darkScale: '#663d00' }, // Vibrant Orange
    'D': { hex: '#ff1744', darkScale: '#66091b' }  // Neon Red
};


// Load the explicitly parsed CSV data from gradingData.js
const communities = [...PREBUILT_COMMUNITIES].sort((a, b) => a.localeCompare(b));
const indicators = PREBUILT_INDICATORS;
let data = PREBUILT_DATA;
const NUM_INDICATORS = indicators.length;
const NUM_COMMUNITIES = communities.length;

// Initialize DOM Elements
const leftSidebar = document.getElementById('sidebar-left');
const rightSidebar = document.getElementById('sidebar-right');

communities.forEach((comm, i) => {
    let div = document.createElement('div');
    div.className = 'comm-item';
    div.id = 'comm-' + safeId(comm);
    
    let textSpan = document.createElement('span');
    textSpan.innerText = comm;
    
    let lockSpan = document.createElement('span');
    lockSpan.className = 'lock-icon';
    lockSpan.innerText = '🔒';
    lockSpan.title = 'Lock Highlight';
    lockSpan.onclick = (e) => toggleLock(e, 'community', comm);
    
    div.appendChild(textSpan);
    div.appendChild(lockSpan);

    div.onclick = () => selectItem('community', comm);
    div.onmouseenter = () => handleHover('community', comm);
    div.onmouseleave = () => handleHoverOut();
    
    if (i < 29) leftSidebar.appendChild(div);
    else rightSidebar.appendChild(div);
});

const indRing = document.getElementById('indicator-ring');

function getPos(d, w, h) {
    if (d <= w) return { x: d, y: 0 }; // Top
    if (d <= w + h) return { x: w, y: d - w }; // Right
    if (d <= 2 * w + h) return { x: w - (d - (w + h)), y: h }; // Bottom
    return { x: 0, y: h - (d - (2 * w + h)) }; // Left
}

// Render dynamic indicators
window.renderIndicators = function() {
    const showGeneric = document.getElementById('chk-generic')?.checked ?? true;
    const showFlood = document.getElementById('chk-flood')?.checked ?? true;
    const showHeat = document.getElementById('chk-heat')?.checked ?? true;

    const showFin = document.getElementById('chk-fin')?.checked ?? true;
    const showHum = document.getElementById('chk-hum')?.checked ?? true;
    const showNat = document.getElementById('chk-nat')?.checked ?? true;
    const showPhy = document.getElementById('chk-phy')?.checked ?? true;
    const showSoc = document.getElementById('chk-soc')?.checked ?? true;

    const activeIndicators = indicators.filter(ind => {
        const meta = indicatorMetadata[ind];
        if (!meta) return true; // Show unmapped indicators just in case
        
        let hazardMatch = true;
        if (meta.hazard === 'Generic' && !showGeneric) hazardMatch = false;
        if (meta.hazard === 'Flood' && !showFlood) hazardMatch = false;
        if (meta.hazard === 'Heatwave' && !showHeat) hazardMatch = false;

        let capitalMatch = true;
        if (meta.capital === 'Financial' && !showFin) capitalMatch = false;
        if (meta.capital === 'Human' && !showHum) capitalMatch = false;
        if (meta.capital === 'Natural' && !showNat) capitalMatch = false;
        if (meta.capital === 'Physical' && !showPhy) capitalMatch = false;
        if (meta.capital === 'Social' && !showSoc) capitalMatch = false;

        return hazardMatch && capitalMatch;
    });

    // Safely calculate dynamic sizes, falling back to viewport derivatives to prevent NaN crashes
    const currentRect = indRing.getBoundingClientRect();
    const rectW = currentRect.width || window.innerWidth * 0.7;
    const rectH = currentRect.height || window.innerHeight * 0.7;
    const perim = 2 * rectW + 2 * rectH;

    // Clean current rings dots before making new ones
    indRing.querySelectorAll('.indicator-item').forEach(el => el.remove());

    const numActive = activeIndicators.length;
    const currentSpacing = numActive > 0 ? perim / numActive : perim;

    activeIndicators.forEach((ind, i) => {
        let d = i * currentSpacing;
        let pos = getPos(d, rectW, rectH);
        let div = document.createElement('div');
        div.className = 'indicator-item';
        div.id = 'ind-' + safeId(ind);
        
        let textSpan = document.createElement('span');
        textSpan.innerText = ind;
        
        let lockSpan = document.createElement('span');
        lockSpan.className = 'lock-icon';
        lockSpan.innerText = '🔒';
        lockSpan.title = 'Lock Highlight';
        lockSpan.onclick = (e) => toggleLock(e, 'indicator', ind);
        
        div.appendChild(textSpan);
        div.appendChild(lockSpan);
        
        // Show full name on hover from metadata
        const label = indicatorMetadata[ind]?.label || ind;
        const hazard = indicatorMetadata[ind]?.hazard || "Unknown";
        div.title = `${ind}: ${label} (${hazard})`;
        
        div.style.left = (pos.x / rectW * 100) + '%';
        div.style.top = (pos.y / rectH * 100) + '%';
        div.onclick = () => selectItem('indicator', ind);
        div.onmouseenter = () => handleHover('indicator', ind);
        div.onmouseleave = () => handleHoverOut();
        
        // Restore active state seamlessly
        if (mode === 'indicator' && selectedId === ind) {
            div.classList.add('active');
        }

        indRing.appendChild(div);
    });

    // Refresh display
    if (mode === 'grade' || mode === 'community') {
        updateView();
    }
};

// Initial draw with a tiny delay to ensure the browser has painted CSS layouts first
setTimeout(renderIndicators, 100);

// Interactive Logic
let mode = null; 
let selectedId = null; 

// Make selectItem available globally for onclick from HTML
window.selectItem = function(type, id) {
    // Toggle off if clicking the same item twice
    if (mode === type && selectedId === id) {
        mode = null;
        selectedId = null;
    } else {
        mode = type;
        selectedId = id;
    }
    updateView();

    // Toggle center area: show comm detail or default grade cards
    const defaultCards = document.getElementById('grade-cards-default');
    const detailInner  = document.getElementById('comm-detail-inner');
    const gradeCenter  = detailInner ? detailInner.closest('.grade-center') : null;
    if (defaultCards && detailInner) {
        if (mode === 'community' && selectedId) {
            window._lastSelectedComm = selectedId;
            defaultCards.classList.add('hidden');
            detailInner.classList.remove('hidden');
            if (gradeCenter) gradeCenter.classList.add('comm-active');
            populateCommDetail(selectedId);
        } else {
            defaultCards.classList.remove('hidden');
            detailInner.classList.add('hidden');
            if (gradeCenter) gradeCenter.classList.remove('comm-active');
    }
}

function populateCommDetail(commName) {
    // ── 0. Community Name Header ───────────────────────
    const detailInner = document.getElementById('comm-detail-inner');
    if (detailInner) {
         detailInner.innerHTML = `
            <div class="cd-close-btn" onclick="selectItem('community', selectedId)" title="Close and return to home">
                <span style="font-size: 20px; font-weight: 300;">&times;</span>
            </div>
            <div class="comm-detail-top">
                <div class="comm-detail-gauge" id="comm-detail-gauge"></div>
                <div class="comm-detail-demo" id="comm-detail-demo"></div>
            </div>
            <div class="comm-detail-bottom">
                <div class="comm-grade-row" id="comm-grade-row"></div>
            </div>
         `;
    }

    // ── 1. Find score data ──────────────────────────────
    const scoreItem = (window.SCORES_DATA || []).find(s => s.name === commName);

    // ── 2. Gauge Chart (Top Left) ───────────────────────
    const gaugeEl = document.getElementById('comm-detail-gauge');
    if (gaugeEl) {
        if (scoreItem) {
            const getAngle = (val) => (val / 100) * 180 - 90;
            const floodAngle   = scoreItem.flood   != null ? getAngle(scoreItem.flood)   : 0;
            const heatAngle    = scoreItem.heat    != null ? getAngle(scoreItem.heat)    : 0;
            const genericAngle = scoreItem.generic != null ? getAngle(scoreItem.generic) : 0;

            gaugeEl.innerHTML = `
                <div class="gauge-section-wrapper" style="width:100%; height:100%; display:flex; flex-direction:column; padding: 15px 0;">
                    <!-- Community Title above gauge as requested -->
                    <div class="gauge-title-area" style="flex: 0 0 10%; display:flex; align-items:center; justify-content:center;">
                        <h3 style="margin:0; font-size:1.1rem; color:#fff; text-transform:uppercase; letter-spacing:1px;">${commName}</h3>
                    </div>

                    <!-- Gauge Chart (Matching Communities layout) -->
                    <div class="gauge-chart-area" style="flex: 0 0 70%; display:flex; align-items:center; justify-content:center;">
                        <div class="gauge-container" style="width: 320px; height: 180px;">
                            <svg viewBox="0 0 100 65" class="gauge-svg">
                                <path class="gauge-arc" d="M 15 55 A 35 35 0 0 1 31 24" stroke="#ff8a80" />
                                <path class="gauge-arc" d="M 31 24 A 35 35 0 0 1 69 24" stroke="#ffd54f" />
                                <path class="gauge-arc" d="M 69 24 A 35 35 0 0 1 85 55" stroke="#69f0ae" />

                                ${scoreItem.flood != null ? `<line class="gauge-needle needle-flood" x1="50" y1="55" x2="50" y2="20" style="transform-box:fill-box; transform-origin:50% 100%; transform:rotate(${floodAngle}deg)" />` : ''}
                                ${scoreItem.heat != null ? `<line class="gauge-needle needle-heat" x1="50" y1="55" x2="50" y2="20" style="transform-box:fill-box; transform-origin:50% 100%; transform:rotate(${heatAngle}deg)" />` : ''}
                                ${scoreItem.generic != null ? `<line class="gauge-needle needle-generic" x1="50" y1="55" x2="50" y2="20" style="transform-box:fill-box; transform-origin:50% 100%; transform:rotate(${genericAngle}deg)" />` : ''}

                                <circle cx="50" cy="55" r="3" fill="#2a2a35" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
                            </svg>
                        </div>
                    </div>

                    <!-- Legend Section (Exact copy of Communities style) -->
                    <div class="gauge-legend-area" style="flex: 0 0 20%; display:flex; align-items:center; justify-content:center; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div class="score-legend">
                            ${scoreItem.flood   != null ? `<div class="legend-item val-flood"><span class="legend-dot">●</span><span class="legend-label">Flood</span><span class="legend-val">${scoreItem.flood}</span></div>` : ''}
                            ${scoreItem.heat    != null ? `<div class="legend-item val-heat"><span class="legend-dot">●</span><span class="legend-label">Heat</span><span class="legend-val">${scoreItem.heat}</span></div>`   : ''}
                            ${scoreItem.generic != null ? `<div class="legend-item val-generic"><span class="legend-dot">●</span><span class="legend-label">Generic</span><span class="legend-val">${scoreItem.generic}</span></div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            gaugeEl.innerHTML = `<div class="cd-demo-title">Resilience Gauge</div><div style="color:#666;font-size:0.8rem;text-align:center;margin-top:20px;">No score data available.</div>`;
        }
    }

    // ── 3. Demographics (Top Right) ─────────────────────
    const demoEl = document.getElementById('comm-detail-demo');
    if (demoEl) {
        const rawRef = window.communitiesDataStaticRaw || (typeof communitiesDataStaticRaw !== 'undefined' ? communitiesDataStaticRaw : null);
        let demo = null;
        if (rawRef && rawRef.data) {
            const row = rawRef.data.find(r => {
                const result = [];
                let cur = ''; let inQuotes = false;
                for (let i = 0; i < r.length; i++) {
                    const char = r[i];
                    if (char === '"') inQuotes = !inQuotes;
                    else if (char === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
                    else cur += char;
                }
                result.push(cur.trim());
                return (result[1] || '').replace(/"/g,'').trim() === commName;
            });

            if (row) {
                const c = (function(line) {
                    const res = []; let curr = ''; let inQ = false;
                    for (let i = 0; i < line.length; i++) {
                        const chr = line[i];
                        if (chr === '"') inQ = !inQ; else if (chr === ',' && !inQ) { res.push(curr.trim()); curr = ''; } else curr += chr;
                    }
                    res.push(curr.trim()); return res;
                })(row);

                demo = {
                    province: c[3], district: c[4], municipality: c[5],
                    totalPop: c[14], male: c[15], female: c[16],
                    children: c[17], elderly: c[18], disabilities: c[19], hhs: c[20],
                    description: (c[25] || '').replace(/"/g,'').trim()
                };
            }
        }

        if (demo) {
            demoEl.innerHTML = `
                <div class="cd-demo-title" style="color:#00e676; border-bottom:none; margin-bottom:15px; font-size:0.75rem;">DEMOGRAPHICS</div>
                <div class="cd-demo-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:15px 30px;">
                    <div class="cd-demo-item" style="grid-column: span 2; margin-bottom: 5px;"><span class="cd-demo-label">Municipality</span><span class="cd-demo-val" style="font-size:0.8rem; color:#bbb; line-height:1.4; display:block; margin-top:4px;">${demo.description || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label"> DISTRICT</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.district || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">PROVINCE</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.province || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">TOTAL POP.</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.totalPop || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">HOUSEHOLDS</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.hhs || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">MALE</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.male || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">FEMALE</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.female || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">CHILDREN</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.children || '—'}</span></div>
                    <div class="cd-demo-item"><span class="cd-demo-label">ELDERLY</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.elderly || '—'}</span></div>
                    <div class="cd-demo-item" style="grid-column: span 2;"><span class="cd-demo-label">DISABILITIES</span><span class="cd-demo-val" style="font-size:0.9rem;">${demo.disabilities || '—'}</span></div>
                </div>
            `;
        } else {
            demoEl.innerHTML = `<div class="cd-demo-title">DEMOGRAPHICS</div><div style="color:#666;font-size:0.85rem;margin-top:10px;">No demographic data available.</div>`;
        }
    }

    // ── 4. Grade Summary (Bottom Section) ─────────────────
    const gradeRowEl = document.getElementById('comm-grade-row');
    const gradeLabels = {
        'A': 'HIGH RESILIENCE',
        'B': 'MODERATE',
        'C': 'AT RISK',
        'D': 'CRITICAL'
    };

    if (gradeRowEl) {
        gradeRowEl.innerHTML = '';
        
        const commData = (typeof data !== 'undefined' && data) ? data[commName] : null;
        const indList  = (typeof indicators !== 'undefined') ? indicators : [];
        const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
        
        if (commData) {
            indList.forEach(ind => {
                const g = commData[ind];
                if (g && gradeCounts[g] !== undefined) gradeCounts[g]++;
            });
        }

        ['A', 'B', 'C', 'D'].forEach(g => {
            const box = document.createElement('div');
            box.className = 'cd-grade-box';
            box.style.borderColor = colors[g].hex;
            box.onclick = () => selectItem('grade', g);
            
            box.innerHTML = `
                <span class="cd-grade-letter" style="color:${colors[g].hex}">${g}</span>
                <span class="cd-grade-count">${gradeCounts[g]}</span>
                <span class="cd-grade-label">${gradeLabels[g]}</span>
            `;
            gradeRowEl.appendChild(box);
        });
    }
}
}

// Global hover interactions
let lockedHoverId = null;
let lockedHoverType = null;
let task12SelectedInd = null; // Track for Task 13 variety
let lastLockedComm = null;    // Ensure variety in multi-community sequences
let lastLockedInd = null;     // Ensure variety in multi-indicator sequences

window.updateHoverLabel = function(type, id) {
    const labelDisplay = document.getElementById('hover-label-display');
    if (!labelDisplay) return;
    
    if (!id || type !== 'indicator') {
        labelDisplay.classList.remove('visible');
        return;
    }
    
    const title = indicatorMetadata[id]?.label || id;
    const hazard = indicatorMetadata[id]?.hazard || '';
    labelDisplay.innerHTML = `<b>${id}</b>: ${title} ${hazard ? `<span style="opacity:0.7;font-size:13px;margin-left:8px;">(${hazard})</span>` : ''}`;
    labelDisplay.classList.add('visible');
};

window.toggleLock = function(event, type, id) {
    event.stopPropagation(); // Prevents normal selectItem click handler
    
    if (lockedHoverId === id) {
        lockedHoverId = null; // Turn off lock
        lockedHoverType = null;
        document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
        handleHoverOut(true); 
    } else {
        document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
        lockedHoverId = id; // Turn on lock for this item
        lockedHoverType = type;
        let el = document.getElementById((type === 'community' ? 'comm-' : 'ind-') + safeId(id));
        if (el) el.classList.add('locked');
        
        handleHover(type, id, true); // Force highlight to target
    }
};

window.handleHover = function(type, id, force = false) {
    // Always dynamically update text natively on any hover, regardless of pin locks!
    updateHoverLabel(type, id);

    if (mode !== 'grade') return;
    if (lockedHoverId && !force) return;

    const grade = selectedId;
    const sId = safeId(id);

    if (type === 'community') {
        const commEl = document.getElementById('comm-' + sId);
        if (commEl) commEl.classList.add('hover-highlight');

        indicators.forEach(ind => {
            if (data[id] && data[id][ind] === grade) {
                let indEl = document.getElementById('ind-' + safeId(ind));
                if (indEl) indEl.classList.add('hover-highlight');
                
                let path = document.querySelector(`.path-${sId}-${safeId(ind)}`);
                if (path) {
                    path.classList.add('highlight-line');
                }
            }
        });
    } else if (type === 'indicator') {
        const indEl = document.getElementById('ind-' + sId);
        if (indEl) indEl.classList.add('hover-highlight');

        communities.forEach(comm => {
            if (data[comm] && data[comm][id] === grade) {
                let commEl = document.getElementById('comm-' + safeId(comm));
                if (commEl) commEl.classList.add('hover-highlight');

                let path = document.querySelector(`.path-${safeId(comm)}-${sId}`);
                if (path) {
                    path.classList.add('highlight-line');
                }
            }
        });
    }
};

window.handleHoverOut = function(force = false) {
    // Revert to locked item, or currently selected indicator, or clear
    if (lockedHoverId && !force) {
        updateHoverLabel(lockedHoverType, lockedHoverId);
    } else if (mode === 'indicator' && selectedId) {
        updateHoverLabel('indicator', selectedId);
    } else {
        updateHoverLabel(null, null);
    }

    if (mode !== 'grade') return;
    if (lockedHoverId && !force) return; // Keep highlights alive if locked!
    
    document.querySelectorAll('.hover-highlight').forEach(el => el.classList.remove('hover-highlight'));
    document.querySelectorAll('.highlight-line').forEach(el => el.classList.remove('highlight-line'));
};

function safeId(str) { 
    if (!str) return '';
    return str.replace(/[^a-zA-Z0-9_-]/g, ''); 
}

function updateView() {
    // 1. Reset everything
    lockedHoverId = null; // Clear lock across main state shifts
    lockedHoverType = null;
    
    // Always show selected indicator label if in indicator mode
    if (mode === 'indicator' && selectedId) {
        updateHoverLabel('indicator', selectedId);
    } else {
        updateHoverLabel(null, null);
    }
    
    document.body.classList.remove('mode-grade');
    if (mode === 'grade') document.body.classList.add('mode-grade');
    
    document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
    document.querySelectorAll('.comm-item').forEach(el => { 
        el.className = 'comm-item'; 
        el.style.backgroundColor = ''; 
        el.style.color = ''; 
        el.style.borderColor = '';
        const span = el.querySelector('span');
        if (span) {
            span.style.color = '';
            span.style.backgroundColor = '';
        }
        const lock = el.querySelector('.lock-icon');
        if (lock) lock.style.color = '';
    });
    document.querySelectorAll('.indicator-item').forEach(el => { 
        el.className = 'indicator-item'; 
        el.style.backgroundColor = ''; 
        el.style.color = '';
        el.style.borderColor = '';
    });
    document.querySelectorAll('.grade-box').forEach(el => el.classList.remove('active'));
    const overlay = document.getElementById('lines-group');
    overlay.innerHTML = '';

    // 2. Apply rules based on selected mode
    if (mode === 'indicator') {
        let indEl = document.getElementById('ind-' + safeId(selectedId));
        if (indEl) indEl.classList.add('active');

        communities.forEach(comm => {
            let grade = data[comm][selectedId];
            let commEl = document.getElementById('comm-' + safeId(comm));
            if (grade && colors[grade]) {
                commEl.style.backgroundColor = colors[grade].darkScale;
                commEl.style.borderColor = colors[grade].hex;
                // Light Mode: Use white for highlighted only! 
                commEl.style.color = '#ffffff';
                const span = commEl.querySelector('span');
                if (span) span.style.color = '#ffffff';
            } else if (document.body.classList.contains('light')) {
                // Light Mode: Ensure others stay black
                commEl.style.color = '#1a1a2e';
                const span = commEl.querySelector('span');
                if (span) span.style.color = '#1a1a2e';
            }
        });

    } else if (mode === 'community') {
        let commEl = document.getElementById('comm-' + safeId(selectedId));
        commEl.classList.add('active');

        indicators.forEach(ind => {
            let grade = data[selectedId][ind];
            let indEl = document.getElementById('ind-' + safeId(ind));
            if (indEl) {
                if (grade && colors[grade]) {
                    indEl.style.backgroundColor = colors[grade].hex;
                    indEl.style.color = '#121212';
                    indEl.style.borderColor = colors[grade].hex;
                }
            }
        });

    } else if (mode === 'grade') {
        let gradeBox = document.getElementById('grade-' + selectedId);
        gradeBox.classList.add('active');
        
        let linesHTML = '';
        let colorHex = colors[selectedId].hex;

        communities.forEach(comm => {
            let commEl = document.getElementById('comm-' + safeId(comm));
            let hasAtLeastOne = false;
            
            indicators.forEach(ind => {
                if(data[comm][ind] === selectedId) {
                    hasAtLeastOne = true;
                    let indEl = document.getElementById('ind-' + safeId(ind));
                    if(indEl) {
                        // Highlight the indicator in the ring
                        indEl.style.backgroundColor = colorHex;
                        indEl.style.color = document.body.classList.contains('light') ? '#1a1a2e' : '#121212';
                        indEl.style.borderColor = colorHex;

                        // Calculate path for SVG line
                        let linesSvg = document.getElementById('lines');
                        let svgRect = linesSvg ? linesSvg.getBoundingClientRect() : { left: 0, top: 0 };
                        
                        let r1 = commEl.getBoundingClientRect();
                        let r2 = indEl.getBoundingClientRect();
                        
                        // Attach to the inner side of the Sidebar Community Box (translated to SVG space)
                        let x1 = (r1.left < window.innerWidth / 2) ? r1.right : r1.left;
                        x1 -= svgRect.left;
                        let y1 = (r1.top + r1.height / 2) - svgRect.top;
                        
                        // Attach to the precise center of the Indicator Ring point (translated to SVG space)
                        let x2 = (r2.left + r2.width / 2) - svgRect.left;
                        let y2 = (r2.top + r2.height / 2) - svgRect.top;
                        
                        // Smooth connection (bezier curve)
                        let dStr = `M ${x1},${y1} C ${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`;
                        
                        // Note: we accumulate string and inject at once for high performance
                        let lineClass = `path-${safeId(comm)}-${safeId(ind)}`;
                        linesHTML += `<path class="${lineClass}" d="${dStr}" stroke="${colorHex}" fill="none" stroke-width="1" opacity="0.15" />`;
                    }
                }
            });

            // Highlight the community box in the sidebar if it has a match
            if(hasAtLeastOne) {
                commEl.style.borderColor = colorHex;
                commEl.style.backgroundColor = colors[selectedId].darkScale;
                commEl.style.color = '#ffffff';
                const span = commEl.querySelector('span');
                if (span) span.style.color = '#ffffff';
            } else if (document.body.classList.contains('light')) {
                // Light Mode: Ensure others stay black!
                commEl.style.color = '#1a1a2e';
                const span = commEl.querySelector('span');
                if (span) span.style.color = '#1a1a2e';
            }
        });
        
        overlay.innerHTML = linesHTML;
    }
}

// Redraw lines smoothly on resize
window.addEventListener('resize', renderIndicators);

// ── View Switching ─────────────────────────────────────
let currentView = 'diagram';

window.switchView = function(view) {
    currentView = view;
    const diagramEl = document.getElementById('diagram-view');
    const tableEl   = document.getElementById('table-view');
    const linesEl   = document.getElementById('lines');
    const btnDiagram = document.getElementById('btn-diagram');
    const btnTable   = document.getElementById('btn-table');

    if (view === 'table') {
        diagramEl.style.display = 'none';
        linesEl.style.display   = 'none';
        tableEl.style.display   = 'flex';
        btnDiagram.classList.remove('active');
        btnTable.classList.add('active');
        renderTable();
    } else {
        tableEl.style.display   = 'none';
        diagramEl.style.display = 'flex';
        linesEl.style.display   = '';
        btnTable.classList.remove('active');
        btnDiagram.classList.add('active');
    }
};

// ── Table Rendering ────────────────────────────────────
// Sort state: { type: 'indicator'|'community', id: string|null, dir: 'asc'|'desc'|null }
let tableSort = { type: 'indicator', id: null, dir: null };
// Grade order for sorting: A=0 (best), D=3 (worst), null=4 (NA, always last)
const gradeOrder = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };

window.sortTable = function(id, type = 'indicator') {
    if (tableSort.id === id && tableSort.type === type) {
        // Cycle: asc → desc → reset
        if (tableSort.dir === 'asc')  tableSort.dir = 'desc';
        else if (tableSort.dir === 'desc') { tableSort.id = null; tableSort.type = 'indicator'; tableSort.dir = null; }
    } else {
        tableSort.id = id;
        tableSort.type = type;
        tableSort.dir = 'asc';
    }
    renderTable();
};

// Helper to update the toolbar label panel
function updateTblLabel(ind) {
    const codeEl = document.getElementById('tbl-hover-code');
    const textEl = document.getElementById('tbl-hover-text');
    const panel  = document.getElementById('tbl-hover-label');
    if (!codeEl || !textEl || !panel) return;

    if (!ind || !indicatorMetadata[ind]) {
        codeEl.textContent = '';
        textEl.textContent = 'Hover over an indicator column to see its label';
        panel.classList.remove('active');
        return;
    }
    const meta = indicatorMetadata[ind];
    codeEl.textContent = ind;
    const hazardIcon = meta.hazard === 'Flood' ? '🌊' : meta.hazard === 'Heatwave' ? '🔥' : '⚙';
    textEl.textContent = `${meta.label}  ${hazardIcon} ${meta.hazard}  ·  ${meta.capital}`;
    panel.classList.add('active');
}

window.renderTable = function() {
    const showGeneric = document.getElementById('tbl-generic')?.checked ?? true;
    const showFlood   = document.getElementById('tbl-flood')?.checked   ?? true;
    const showHeat    = document.getElementById('tbl-heat')?.checked    ?? true;

    const showFin = document.getElementById('tbl-fin')?.checked ?? true;
    const showHum = document.getElementById('tbl-hum')?.checked ?? true;
    const showNat = document.getElementById('tbl-nat')?.checked ?? true;
    const showPhy = document.getElementById('tbl-phy')?.checked ?? true;
    const showSoc = document.getElementById('tbl-soc')?.checked ?? true;

    // Filter active indicators matching current checkboxes
    const activeInds = indicators.filter(ind => {
        const meta = indicatorMetadata[ind];
        if (!meta) return true;
        
        // Hazard Filter
        let hazardMatch = true;
        if (meta.hazard === 'Generic'  && !showGeneric) hazardMatch = false;
        if (meta.hazard === 'Flood'    && !showFlood)   hazardMatch = false;
        if (meta.hazard === 'Heatwave' && !showHeat)    hazardMatch = false;
        
        // Capital Filter
        let capitalMatch = true;
        if (meta.capital === 'Financial' && !showFin) capitalMatch = false;
        if (meta.capital === 'Human' && !showHum) capitalMatch = false;
        if (meta.capital === 'Natural' && !showNat) capitalMatch = false;
        if (meta.capital === 'Physical' && !showPhy) capitalMatch = false;
        if (meta.capital === 'Social' && !showSoc) capitalMatch = false;

        return hazardMatch && capitalMatch;
    });

    // If the sorted indicator is no longer visible, reset sort
    if (tableSort.type === 'indicator' && tableSort.id && !activeInds.includes(tableSort.id)) {
        tableSort = { type: 'indicator', id: null, dir: null };
    }

    const capitalOf = ind => indicatorMetadata[ind]?.capital?.[0] || '';

    const table = document.getElementById('data-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // ── Sort indicators (columns) horizontally ──
    let sortedInds = [...activeInds];
    if (tableSort.type === 'community' && tableSort.id && tableSort.dir) {
        sortedInds.sort((a, b) => {
            const ga = gradeOrder[data[tableSort.id]?.[a]] ?? 4;
            const gb = gradeOrder[data[tableSort.id]?.[b]] ?? 4;
            return tableSort.dir === 'asc' ? ga - gb : gb - ga;
        });
    }

    // ── Sort communities (rows) vertically ──
    let sortedComms = [...communities];
    if (tableSort.type === 'indicator' && tableSort.id && tableSort.dir) {
        sortedComms.sort((a, b) => {
            const ga = gradeOrder[data[a]?.[tableSort.id]] ?? 4;
            const gb = gradeOrder[data[b]?.[tableSort.id]] ?? 4;
            return tableSort.dir === 'asc' ? ga - gb : gb - ga;
        });
    }

    // ── Build header ──
    let headHTML = '<tr><th style="cursor:default;">Community</th>';
    sortedInds.forEach(ind => {
        const cap   = capitalOf(ind);
        const label = indicatorMetadata[ind]?.label || ind;
        let arrow = '';
        if (tableSort.type === 'indicator' && tableSort.id === ind) arrow = tableSort.dir === 'asc' ? ' ▲' : ' ▼';
        const sortedClass = (tableSort.type === 'indicator' && tableSort.id === ind) ? ' th-sorted' : '';
        headHTML += `<th class="cap-${cap}${sortedClass}" title="${ind}: ${label}" onclick="sortTable('${ind}', 'indicator')">${ind}${arrow}</th>`;
    });
    headHTML += '</tr>';
    thead.innerHTML = headHTML;

    // ── Build body rows ──
    let bodyHTML = '';
    sortedComms.forEach(comm => {
        let arrow = '';
        if (tableSort.type === 'community' && tableSort.id === comm) arrow = tableSort.dir === 'asc' ? ' ▶' : ' ◀';
        const sortedClass = (tableSort.type === 'community' && tableSort.id === comm) ? 'tr-sorted' : '';
        
        bodyHTML += `<tr class="${sortedClass}">
            <td title="${comm}" onclick="sortTable('${comm}', 'community')">
                ${comm}${arrow}
            </td>`;
        sortedInds.forEach(ind => {
            const grade = data[comm]?.[ind];
            if (grade && colors[grade]) {
                bodyHTML += `<td class="grade-${grade}" title="${comm} – ${ind}: ${grade}">${grade}</td>`;
            } else {
                bodyHTML += `<td class="grade-na"></td>`;
            }
        });
        bodyHTML += '</tr>';
    });
    tbody.innerHTML = bodyHTML;

    // ── Wire hover events via delegation ──────────────────
    // Detach old listener by cloning the table node
    const newTable = table.cloneNode(false);
    newTable.appendChild(thead);
    newTable.appendChild(tbody);
    table.parentNode.replaceChild(newTable, table);

    newTable.addEventListener('mouseover', e => {
        const td = e.target.closest('td, th');
        if (!td) return;
        // Determine column index
        const colIdx = td.cellIndex;
        if (colIdx === 0) { updateTblLabel(null); return; } // community col
        const ind = sortedInds[colIdx - 1]; // Use sortedInds!
        updateTblLabel(ind);
    });
    newTable.addEventListener('mouseleave', () => updateTblLabel(null));
};

// ── Edge Auto-Scroll for Table ─────────────────────────
(function setupTableAutoScroll() {
    const EDGE_ZONE = 0.10;   // 10% of screen width on each side
    const MAX_SPEED = 18;     // max pixels per frame
    let rafId = null;
    let mouseX = -1;

    function getScrollEl() {
        return document.querySelector('.table-scroll-wrapper');
    }

    function scrollStep() {
        const scrollEl = getScrollEl();
        if (!scrollEl || mouseX < 0) { rafId = null; return; }

        const W = window.innerWidth;
        const edgePx = W * EDGE_ZONE;
        let speed = 0;

        if (mouseX > W - edgePx) {
            // Right zone — scroll right
            const ratio = (mouseX - (W - edgePx)) / edgePx; // 0→1
            speed = Math.round(ratio * ratio * MAX_SPEED);   // ease-in curve
        } else if (mouseX < edgePx) {
            // Left zone — scroll left
            const ratio = (edgePx - mouseX) / edgePx;       // 0→1
            speed = -Math.round(ratio * ratio * MAX_SPEED);
        }

        if (speed !== 0) {
            scrollEl.scrollLeft += speed;
            rafId = requestAnimationFrame(scrollStep);
        } else {
            rafId = null;
        }
    }

    function onMouseMove(e) {
        mouseX = e.clientX;
        const scrollEl = getScrollEl();
        // Only auto-scroll when the table-view is actually visible
        if (!scrollEl || document.getElementById('table-view')?.style.display === 'none') return;
        if (!rafId) rafId = requestAnimationFrame(scrollStep);
    }

    function onMouseLeave() {
        mouseX = -1;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // Attach to the whole window so the mouse position is always tracked
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
})();

// ── Center Menu Navigation ───────────────────────────
// ── Multi-Screen Navigation ───────────────────────────
window.handleMenuClick = function(btn, viewName) {
    // Safely reset map AND dashboard selection when navigating
    if (typeof handleMapCommunityChange === 'function') {
        handleMapCommunityChange('');
    }
    
    // Reset central dashboard to global overview (Grade Cards) if Home is clicked
    if (viewName === 'Home' && typeof window.selectItem === 'function') {
        window.selectItem(null, null); 
    }

    // Clear any existing lines visually when switching tabs
    const linesGroup = document.getElementById('lines-group');
    if (linesGroup) linesGroup.innerHTML = '';
    
    const nextScreenId = `${viewName.toLowerCase()}-screen`;
    
    // Hide Home-specific view switcher when navigating away from Home
    const viewSwitcher = document.getElementById('home-view-switcher');
    if (viewSwitcher) {
        viewSwitcher.style.display = (viewName === 'Home') ? 'flex' : 'none';
    }
    const nextScreen = document.getElementById(nextScreenId);
    const currentScreen = document.querySelector('.app-screen.active');

    if (currentScreen === nextScreen) return;

    // 1. UI Update (Menu Buttons)
    document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Screen Switching
    document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
    if (nextScreen) {
        nextScreen.classList.add('active');
        if (viewName === 'MEL' && typeof initMelView === 'function') {
            initMelView();
        }
    }

    
    // 2. Coordinated Swipe Transition
    if (currentScreen) {
        // Trigger animations
        currentScreen.classList.remove('active');
        currentScreen.classList.add('slide-out-left');
        
        nextScreen.classList.add('slide-in-right');
        
        // Cleanup after animation completes (600ms)
        setTimeout(() => {
            currentScreen.classList.remove('slide-out-left');
            nextScreen.classList.remove('slide-in-right');
            // Ensure only the correct screen is active
            document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
            nextScreen.classList.add('active');
            console.log("Active screen finalized:", viewName);
        }, 600);
    } else {
        // Initial load or no current screen
        document.querySelectorAll('.app-screen').forEach(s => s.classList.remove('active'));
        nextScreen.classList.add('active');
    }

    // 3. Conditional Header UI (Diagram/Table switcher)
    const homeSwitcher = document.getElementById('home-view-switcher');
    if (homeSwitcher) {
        homeSwitcher.style.display = (viewName === 'Home') ? 'flex' : 'none';
    }

    console.log("Navigating to screen:", viewName);
    
    // 4. Initialize specific screen logic if needed
    if (viewName === 'Home') {
        switchView('diagram');
        executeStep(1); // Force reset to landing page state on every return
    } else if (viewName === 'Activities') {
        initActivitiesScreen();
    } else if (viewName === 'Scores') {
        initScoresScreen();
    } else if (viewName === 'Knowledge') {
        initKnowledgeScreen();
    }
};

// ── Activities Screen Logic ────────────────────────────
const actCapitalMeta = {
    'Financial': { color: '#fbbf24', icon: '💰' },
    'Human': { color: '#f87171', icon: '👤' },
    'Natural': { color: '#4ade80', icon: '🌿' },
    'Physical': { color: '#38bdf8', icon: '🏗️' },
    'Social': { color: '#818cf8', icon: '🤝' }
};


let activitiesData = [...SAMPLE_ACTIVITIES];
let activitiesFilters = { hazard: 'All', capital: 'All', search: '', scope: 'All' };
let hasStartedActivitiesListeners = false;
let hasFetchedLiveActivities = false;

let scoresFilters = { tab: 'Both', search: '' };
let hasStartedScoresListeners = false;
let scoresDataLive = null;

function initActivitiesScreen() {
    const grid = document.getElementById('activities-grid');
    if (!grid) return;

    if (!hasStartedActivitiesListeners) {
        setupActivitiesListeners();
        hasStartedActivitiesListeners = true;
    }

    // 1. Render immediate (Zero-Latency)
    renderActivities();

    // 2. Fetch live data in the background (Non-blocking)
    if (!hasFetchedLiveActivities) {
        fetchLiveActivities();
    }
}

async function fetchLiveActivities() {
    hasFetchedLiveActivities = true;

    // Adapt app.js fetch logic
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtfsyAnl5GL1buHmzh5Pn4h-m8TgbIl0mE6FmvyRPpsvZGqw1aWYWnZ_Fo9wNBtg/pub?gid=1814434584&single=true&output=csv';
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(SHEET_URL)}`;

    try {
        const response = await fetch(proxyUrl);
        const text = await response.text();
        const lines = text.trim().split(/\r?\n/).slice(1);
        
        const fetchedData = lines.map(line => {
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Robust CSV split
            const code = parts[0]?.replace(/"/g, '').trim() || 'N/A';
            const name = parts[1]?.replace(/"/g, '').trim() || 'N/A';
            return {
                name: name,
                year: "N/A",
                date: "Ongoing",
                indicators: [code],
                hazards: [(parts[3] || 'Generic').replace(/"/g, '').trim()],
                communities: ["Multiple Communities"], 
                capitals: [(parts[2] || 'Generic').replace(/"/g, '').trim()],
                scope: 'Community' // Default scope for live data
            };
        }).filter(item => item.name !== 'N/A');

        activitiesData = [...SAMPLE_ACTIVITIES, ...fetchedData];
        renderActivities();
    } catch (err) {
        console.warn("Failed to fetch live activities, using sample data only:", err);
        // Data already in activitiesData from init
    }
}

function setupActivitiesListeners() {
    const search = document.getElementById('act-search');
    if (search) {
        search.oninput = (e) => {
            activitiesFilters.search = e.target.value;
            renderActivities();
        };
    }

    ['hazard', 'capital', 'scope'].forEach(type => {
        const container = document.getElementById(`act-${type}-filters`);
        if (container) {
            container.onclick = (e) => {
                const btn = e.target.closest('.chip');
                if (!btn) return;
                activitiesFilters[type] = btn.getAttribute(`data-${type}`);
                container.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === btn));
                renderActivities();
            };
        }
    });
}

function deriveCapitalsFromIndicators(indicators) {
    if (!indicators || !Array.isArray(indicators)) return [];
    
    const capitalMap = {
        'F': 'Financial',
        'H': 'Human',
        'N': 'Natural',
        'P': 'Physical',
        'S': 'Social'
    };

    const caps = new Set();
    indicators.forEach(ind => {
        const firstChar = (ind || '').charAt(0).toUpperCase();
        if (capitalMap[firstChar]) {
            caps.add(capitalMap[firstChar]);
        }
    });

    return Array.from(caps);
}

// Helper to convert quarter/date info into a sortable number (Latest First)
function getActivitySortValue(item) {
    let dates = [];
    if (item.breakdown && item.breakdown.length > 0) {
        item.breakdown.forEach(b => { if (b.quarter) dates.push(b.quarter); });
    }
    if (item.quarter) {
        if (Array.isArray(item.quarter)) dates.push(...item.quarter);
        else dates.push(item.quarter);
    }
    if (item.date && item.date !== 'Ongoing') dates.push(item.date);
    if (item.year) {
        if (Array.isArray(item.year)) dates.push(...item.year);
        else dates.push(item.year);
    }

    if (dates.length === 0) return 0; // Default for Ongoing

    const parse = (str) => {
        if (!str) return 0;
        const s = String(str);
        const yMatch = s.match(/(20\d{2})/);
        if (!yMatch) return 0;
        const year = parseInt(yMatch[1]);
        const qMatch = s.match(/Q(\d)/i);
        const qNum = qMatch ? parseInt(qMatch[1]) : 0;
        return (year * 10) + qNum;
    };

    return Math.max(...dates.map(parse));
}

function renderActivities() {
    const grid = document.getElementById('activities-grid');
    const noRes = document.getElementById('act-no-results');
    if (!grid) return;

    const query = activitiesFilters.search.toLowerCase();

    const filtered = activitiesData.filter(item => {
        // AUTOMATICALLY derive capitals from indicators to fix tagging errors
        item.capitals = deriveCapitalsFromIndicators(item.indicators);

        // Multi-Hazard Filter Check
        const matchHazard = activitiesFilters.hazard === 'All'
            || (activitiesFilters.hazard === 'Multi'
                ? (item.hazards && (item.hazards.includes('Multi') || (item.hazards.includes('Flood') && item.hazards.includes('Heat'))))
                : (item.hazards && item.hazards.includes(activitiesFilters.hazard)));
        // Capital Filter Check
        const matchCapital = activitiesFilters.capital === 'All' || (item.capitals && item.capitals.includes(activitiesFilters.capital));
        
        // --- Geographic Filter Logic ---
        const itemScope = item.scope || 'Community';
        const matchGeo = activitiesFilters.scope === 'All' || (itemScope === activitiesFilters.scope);

        // Multi-Field Search logic (Not Case Sensitive)
        const check = (val) => {
            if (!val) return false;
            if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(query));
            return String(val).toLowerCase().includes(query);
        };

        const matchSearch = !query || 
            check(item.name) ||
            check(item.year) ||
            check(item.date) ||
            check(item.capitals) ||
            check(item.hazards) ||
            check(item.indicators) ||
            check(item.communities) ||
            check(item.province) ||
            check(item.district);

        return matchHazard && matchCapital && matchSearch && matchGeo;
    });

    // Sort by latest first
    filtered.sort((a, b) => getActivitySortValue(b) - getActivitySortValue(a));

    grid.innerHTML = '';
    noRes.classList.toggle('hidden', filtered.length > 0);

    filtered.forEach((item, i) => {
        // Redrive capitals just in case it wasn't captured in the filter loop
        item.capitals = deriveCapitalsFromIndicators(item.indicators);
        const meta = actCapitalMeta[item.capitals[0]] || { color: '#aaa', icon: '📄' };
        
        // Extract quarters from breakdown or use date as fallback
        let quarters = [];
        if (item.breakdown && item.breakdown.length > 0) {
            quarters = [...new Set(item.breakdown.map(b => b.quarter).filter(q => q))];
        }
        if (quarters.length === 0 && item.date && item.date !== 'Ongoing') {
            quarters = [item.date];
        }
        const fullQuarters = quarters.length > 0 ? quarters.join(', ') : (item.date || 'Ongoing');
        const displayQuarters = quarters.length > 2 ? `Multiple (Quarters)` : fullQuarters;

        const card = document.createElement('div');
        card.className = 'act-card';
        card.style.setProperty('--accent', meta.color);
        card.style.animationDelay = `${i * 0.03}s`;
        card.style.cursor = 'pointer';
        card.onclick = () => openActivityModal(item);
        
        const itemScope = (item.scope || 'Community').toLowerCase();
        let locationText = 'Multiple Locations';
        let fullList = '';

        // Robust entities extraction based on scope and common data keys
        const getEntitiesFromItem = (i) => {
            let list = [];
            if (itemScope === 'province') {
                list = i.province || i.communities || [];
            } else if (itemScope === 'district') {
                list = i.district || i.province || i.communities || [];
            } else if (itemScope === 'municipality') {
                list = i.municipalities || i.municipality || i.communities || [];
            } else {
                list = i.communities || i.municipalities || i.municipality || i.district || i.province || [];
            }
            const arr = Array.isArray(list) ? list : (list ? [list] : []);
            return arr.map(x => String(x).trim()).filter(x => x && x !== 'undefined');
        };

        const entities = getEntitiesFromItem(item);
        fullList = entities.join(', ');

        if (itemScope === 'province') {
            locationText = entities.length > 2 ? 'Multiple Provinces' : (entities.join(', ') || 'Multiple Provinces');
        } else if (itemScope === 'district') {
            locationText = entities.length > 2 ? 'Multiple Districts' : (entities.join(', ') || 'Multiple Districts');
        } else if (itemScope === 'municipality') {
            locationText = entities.length > 2 ? 'Multiple Municipalities' : (entities.join(', ') || 'Multiple Municipalities');
        } else {
            locationText = entities.length > 2 ? `${entities.length} Communities` : (entities.join(', ') || 'Multiple Communities');
        }

        card.innerHTML = `
            <div class="act-header">
                <div class="act-tags">
                    <span class="act-scope-badge scope-${itemScope}">${item.scope || 'Community'} Level</span>
                </div>
                <div class="act-hazard-tags" title="Hazards: ${(item.hazards || []).join(', ')}">
                    ${(item.hazards || []).map(h => `<span class="act-hazard ${h}">${h}</span>`).join('')}
                </div>
            </div>

            <div class="act-dates-list" style="margin: 5px 0 10px 0; display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.75rem; opacity: 0.8;">📅</span>
                <span style="font-size: 0.7rem; color: #888; border-bottom: 1px dotted rgba(255,255,255,0.2); cursor: help;" title="${fullQuarters}">${displayQuarters}</span>
            </div>

            <h3 class="act-title">${item.name}</h3>
            
            <div class="act-indicator-tags" title="Indicators: ${(item.indicators || []).join(', ')}">
                ${(item.indicators || []).map(ind => {
                    const lbl = (typeof indicatorMetadata !== 'undefined' && indicatorMetadata[ind]) ? indicatorMetadata[ind].label : ind;
                    return `<span class="ind-tag" title="${lbl}">${ind}</span>`;
                }).join('')}
            </div>

            <div class="act-communities-list">
                <span class="icon">📍</span>
                <span class="comm-text" style="border-bottom: 1px dotted rgba(255,255,255,0.4); cursor: help;" title="${fullList.replace(/"/g, '&quot;')}">${locationText}</span>
            </div>

            ${item.hasKnowledge ? `<div class="act-knowledge-tag"><span>📖</span> Knowledge Captured</div>` : ''}

            <div class="act-footer" title="Capitals: ${(item.capitals || []).join(', ')}">
                ${(item.capitals || []).map(cap => {
                    const cMeta = actCapitalMeta[cap] || { icon: '📄' };
                    return `<span style="display:inline-flex; align-items:center; gap:4px;">${cMeta.icon} ${cap}</span>`;
                }).join('<span style="opacity:0.3; margin:0 6px;">•</span>')}
            </div>
        `;
        grid.appendChild(card);
    });
}

function openActivityModal(item) {
    const modal = document.getElementById('activity-modal');
    const body = document.getElementById('activity-modal-body');
    if (!modal || !body) return;

    let breakdownHTML = '';
    if (item.breakdown && item.breakdown.length > 0) {
        // Dynamic Header based on Scope
        let entityHeader = 'Communities';
        if (item.scope === 'Province') entityHeader = 'Provinces';
        else if (item.scope === 'District') entityHeader = 'Districts';
        else if (item.scope === 'Municipality') entityHeader = 'Municipalities';

        breakdownHTML = `
            <h3 style="margin: 20px 0 10px 0; font-size: 1.1rem; color: #aaa;">Outreach Breakdown</h3>
            <div class="modal-table-scroll">
                <table class="modal-table">
                    <thead>
                        <tr>
                            <th>Quarter</th>
                            <th>${entityHeader}</th>
                            <th>Old Participants</th>
                            <th>New Participants</th>
                            <th>Total Reach (New)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${item.breakdown.map(b => {
                            const totalNew = (b.newMen || 0) + (b.newWomen || 0);
                            const hasDesc = !!b.description;
                            const btnClass = hasDesc ? 'breakdown-info-btn' : 'breakdown-info-btn disabled';
                            const entityList = (b.entities || b.communities || []).join(', ') || '-';
                            
                            return `
                                <tr>
                                    <td>${b.quarter || '-'}</td>
                                    <td>${entityList}</td>
                                    <td><span style="opacity:0.8">${b.oldMen}♂ / ${b.oldWomen}♀</span></td>
                                    <td><span style="color:#00e676;">${b.newMen}♂ / ${b.newWomen}♀</span></td>
                                    <td style="font-weight:700; color:#fff; text-align:center;">
                                        ${totalNew}
                                        <div class="info-tooltip-wrap" style="margin-left:8px;">
                                            <button class="${btnClass}">i</button>
                                            <div class="info-popup">${hasDesc ? b.description : 'No details available'}</div>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    body.innerHTML = `
        <h2 style="color: #00e676;">${item.name}</h2>
        <div class="modal-detail-row">
            <strong>Target Indicators:</strong> 
            ${item.indicators.map(ind => {
                const lbl = (typeof indicatorMetadata !== 'undefined' && indicatorMetadata[ind]) ? indicatorMetadata[ind].label : ind;
                return `<span class="ind-tag" style="display:inline-block; margin:0 2px; cursor:help; border-bottom:1px dotted #888;" title="${lbl}">${ind}</span>`;
            }).join(', ')}
        </div>
        <div class="modal-detail-row"><strong>Primary Hazards:</strong> ${item.hazards.join(', ')}</div>
        <div class="modal-detail-row"><strong>Associated Capitals:</strong> ${item.capitals.join(', ')}</div>
        <div class="modal-detail-row"><strong>Scope:</strong> ${item.scope || 'Community'} Level</div>
        ${item.hasKnowledge ? `<div class="modal-detail-row" style="margin-bottom: 15px;"><strong>Knowledge Product:</strong> <span style="color:#00e676;">Yes, related research is available</span></div>` : ''}
        ${breakdownHTML}
    `;

    modal.classList.add('active');
}

function closeActivityModal(event) {
    // If event is passed (click on overlay), check if the target is exactly the overlay and not the content box
    if (event && event.target !== document.getElementById('activity-modal')) {
        return; 
    }
    const modal = document.getElementById('activity-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}


// ── Scores Screen Logic ────────────────────────────────
function initScoresScreen() {
    const grid = document.getElementById('scores-grid');
    if (!grid) return;

    if (!hasStartedScoresListeners) {
        setupScoresListeners();
        hasStartedScoresListeners = true;
    }

    // Use static JS data directly to avoid CORS issues
    if (window.SCORES_DATA) {
        scoresDataLive = window.SCORES_DATA;
    }
    
    renderScores();
}



function setupScoresListeners() {
    const search = document.getElementById('score-search');
    if (search) {
        search.oninput = (e) => {
            scoresFilters.search = e.target.value;
            renderScores();
        };
    }

    const container = document.getElementById('score-hazard-filters');
    if (container) {
        container.onclick = (e) => {
            const btn = e.target.closest('.chip');
            if (!btn) return;
            scoresFilters.tab = btn.getAttribute('data-tab');
            container.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === btn));
            renderScores();
        };
    }
}

function renderScores() {
    const grid = document.getElementById('scores-grid');
    if (!grid) return;

    let itemsToRender = [];
    if (scoresDataLive) {
        itemsToRender = scoresDataLive;
    } else {
        const rawDataRef = window.communitiesDataStaticRaw || (typeof communitiesDataStaticRaw !== 'undefined' ? communitiesDataStaticRaw : null);
        if (rawDataRef && rawDataRef.data) {
            itemsToRender = rawDataRef.data.map(line => {
                // Robust CSV parse to handle names with commas in quotes
                const p = (function(l) {
                    const res = [];
                    let curr = '';
                    let inQ = false;
                    for (let i = 0; i < l.length; i++) {
                        const chr = l[i];
                        if (chr === '"') inQ = !inQ;
                        else if (chr === ',' && !inQ) {
                            res.push(curr.trim());
                            curr = '';
                        } else curr += chr;
                    }
                    res.push(curr.trim());
                    return res;
                })(line);

                return { 
                    code: p[0], 
                    name: (p[1] || '').replace(/"/g,'').trim(), 
                    flood: parseFloat(p[8]) || 0,
                    heat: parseFloat(p[10]) || 0,
                    generic: parseFloat(p[12]) || 0 
                };
            });
        }
    }

    // Always keep items sorted alphabetically by name
    itemsToRender.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    const query = scoresFilters.search.toLowerCase();
    const currentTab = scoresFilters.tab;

    const filtered = itemsToRender.filter(item => {
        const matchSearch = !query || item.name.toLowerCase().includes(query);
        
        let matchTab = true;
        if (currentTab === 'Flood') {
            matchTab = (item.flood !== null && item.flood !== undefined);
        } else if (currentTab === 'Heat') {
            matchTab = (item.heat !== null && item.heat !== undefined);
        }
        
        return matchSearch && matchTab;
    });

    grid.innerHTML = '';
    
    if (filtered.length === 0) {
        document.getElementById('score-no-results').classList.remove('hidden');
    } else {
        document.getElementById('score-no-results').classList.add('hidden');
    }

    // Gauge Arc calculation constants
    const getAngle = (val) => (val / 100) * 180 - 90;

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'score-card';
        card.style.cursor = 'pointer';
        card.title = 'Click to see indicator grades';
        card.addEventListener('click', () => openScoreDetailModal(item));

        const showFlood  = (currentTab === 'Both' || currentTab === 'Flood')  && item.flood   != null;
        const showHeat   = (currentTab === 'Both' || currentTab === 'Heat')   && item.heat    != null;
        const showGeneric = item.generic != null;

        const floodAngle   = showFlood   ? getAngle(item.flood)   : 0;
        const heatAngle    = showHeat    ? getAngle(item.heat)    : 0;
        const genericAngle = showGeneric ? getAngle(item.generic) : 0;

        card.innerHTML = `
            <div class="score-card-header">
                <h3>${item.name}</h3>
                <span class="comm-id">ID: ${item.code || 'N/A'}</span>
            </div>

            <div class="score-metrics">
                <div class="gauge-container">
                    <svg viewBox="0 0 100 65" class="gauge-svg">
                        <!-- Background Arcs: Red(0-33), Yellow(33-67), Green(67-100) -->
                        <path class="gauge-arc" d="M 15 55 A 35 35 0 0 1 31 24" stroke="#ff8a80" />
                        <path class="gauge-arc" d="M 31 24 A 35 35 0 0 1 69 24" stroke="#ffd54f" />
                        <path class="gauge-arc" d="M 69 24 A 35 35 0 0 1 85 55" stroke="#69f0ae" />

                        <!-- Needles -->
                        ${showFlood   ? `<line class="gauge-needle needle-flood"   x1="50" y1="55" x2="50" y2="20" style="transform-box:fill-box; transform-origin:50% 100%; transform:rotate(${floodAngle}deg)" />` : ''}
                        ${showHeat    ? `<line class="gauge-needle needle-heat"    x1="50" y1="55" x2="50" y2="20" style="transform-box:fill-box; transform-origin:50% 100%; transform:rotate(${heatAngle}deg)" />` : ''}
                        ${showGeneric ? `<line class="gauge-needle needle-generic" x1="50" y1="55" x2="50" y2="20" style="transform-box:fill-box; transform-origin:50% 100%; transform:rotate(${genericAngle}deg)" />` : ''}

                        <circle cx="50" cy="55" r="3" fill="#2a2a35" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/>
                    </svg>
                </div>

                <div class="score-legend">
                    ${showFlood   ? `<div class="legend-item val-flood"><span class="legend-dot">●</span><span class="legend-label">Flood</span><span class="legend-val">${item.flood}</span></div>`   : ''}
                    ${showHeat    ? `<div class="legend-item val-heat"><span class="legend-dot">●</span><span class="legend-label">Heat</span><span class="legend-val">${item.heat}</span></div>`     : ''}
                    ${showGeneric ? `<div class="legend-item val-generic"><span class="legend-dot">●</span><span class="legend-label">Generic</span><span class="legend-val">${item.generic}</span></div>` : ''}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}


window.openScoreDetailModal = function(item) {
    const modal = document.getElementById('score-detail-modal');
    const body  = document.getElementById('score-detail-modal-body');
    if (!modal || !body) return;

    // Store for re-render on sort change
    window._scoreDetailItem = item;
    window._scoreDetailSort = 'default';

    const commData = (typeof data !== 'undefined' && data) ? data[item.name] : null;
    const indList  = (typeof indicators !== 'undefined') ? indicators : [];

    const gradeColors = { A: '#00e676', B: '#ffea00', C: '#ff9100', D: '#ff1744' };
    const gradeLabels = { A: 'High Resilience', B: 'Moderate', C: 'At Risk', D: 'Critical' };
    const gradeOrder  = { A: 0, B: 1, C: 2, D: 3 };

    const totalInds = indList.length;
    const gradeCounts = { A: 0, B: 0, C: 0, D: 0 };
    if (commData) {
        indList.forEach(ind => {
            const g = commData[ind];
            if (g && gradeCounts[g] !== undefined) gradeCounts[g]++;
        });
    }


    const noDataNote = !commData
        ? `<div style="color:#888; font-size:0.85rem; margin-bottom:16px;">⚠️ No indicator grading data found for this community.</div>`
        : '';

    // Sort toolbar
    const sortBarHTML = `
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
            <span style="font-size:0.68rem; color:#666; text-transform:uppercase; letter-spacing:0.6px; margin-right:4px;">Sort:</span>
            <button id="sdsort-default" onclick="window._renderScoreDetailTable('default')"
                style="background:#00e676; color:#121212; border:none; border-radius:6px; padding:4px 12px; font-size:0.72rem; font-weight:700; cursor:pointer;">⊞ By Capital</button>
            <button id="sdsort-asc" onclick="window._renderScoreDetailTable('asc')"
                style="background:rgba(255,255,255,0.06); color:#aaa; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 12px; font-size:0.72rem; font-weight:700; cursor:pointer;">▲ Best First</button>
            <button id="sdsort-desc" onclick="window._renderScoreDetailTable('desc')"
                style="background:rgba(255,255,255,0.06); color:#aaa; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 12px; font-size:0.72rem; font-weight:700; cursor:pointer;">▼ Worst First</button>
            
            <div style="width:1px; height:16px; background:rgba(255,255,255,0.1); margin:0 4px;"></div>

            <button id="sdsort-grade-A" onclick="window._renderScoreDetailTable('grade-A')"
                style="background:rgba(255,255,255,0.06); color:#aaa; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 10px; font-size:0.72rem; font-weight:700; cursor:pointer;">A (${gradeCounts.A})</button>
            <button id="sdsort-grade-B" onclick="window._renderScoreDetailTable('grade-B')"
                style="background:rgba(255,255,255,0.06); color:#aaa; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 10px; font-size:0.72rem; font-weight:700; cursor:pointer;">B (${gradeCounts.B})</button>
            <button id="sdsort-grade-C" onclick="window._renderScoreDetailTable('grade-C')"
                style="background:rgba(255,255,255,0.06); color:#aaa; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 10px; font-size:0.72rem; font-weight:700; cursor:pointer;">C (${gradeCounts.C})</button>
            <button id="sdsort-grade-D" onclick="window._renderScoreDetailTable('grade-D')"
                style="background:rgba(255,255,255,0.06); color:#aaa; border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:4px 10px; font-size:0.72rem; font-weight:700; cursor:pointer;">D (${gradeCounts.D})</button>
        </div>`;

    // --- Fetch Demographic & Reach Data ---
    const rawRef = window.communitiesDataStaticRaw || (typeof communitiesDataStaticRaw !== 'undefined' ? communitiesDataStaticRaw : null);
    let demo = null;
    if (rawRef && rawRef.data) {
        const row = rawRef.data.find(r => {
            // Robust CSV split to handle commas in names
            const result = [];
            let cur = '';
            let inQuotes = false;
            for (let i = 0; i < r.length; i++) {
                const char = r[i];
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) {
                    result.push(cur.trim());
                    cur = '';
                } else cur += char;
            }
            result.push(cur.trim());
            return (result[1] || '').replace(/"/g,'').trim() === item.name;
        });

        if (row) {
            const c = (function(line) {
                const res = [];
                let curr = '';
                let inQ = false;
                for (let i = 0; i < line.length; i++) {
                    const chr = line[i];
                    if (chr === '"') inQ = !inQ;
                    else if (chr === ',' && !inQ) {
                        res.push(curr.trim());
                        curr = '';
                    } else curr += chr;
                }
                res.push(curr.trim());
                return res;
            })(row);

            demo = {
                province: c[3], district: c[4], municipality: c[5],
                totalPop: c[14], male: c[15], female: c[16],
                children: c[17], elderly: c[18], disabilities: c[19], hhs: c[20]
            };
        }
    }

    const allActs = (typeof activitiesData !== 'undefined') ? activitiesData : [];
    const commActs = allActs.filter(a => a.communities && a.communities.includes(item.name));
    const commKnow = commActs.filter(a => a.hasKnowledge);
    
    // Extract unique years for this specific community's activities
    const commYears = new Set();
    allActs.forEach(a => {
        const bd = a.breakdown || [];
        const hasComm = (a.communities && a.communities.includes(item.name)) || 
                        bd.some(b => {
                            const c = b.communities || b.entities || [];
                            return c.includes(item.name) || (item.code && c.includes(item.code));
                        });
        if (!hasComm) return;

        // Collect years from top level
        if (Array.isArray(a.year)) a.year.forEach(y => commYears.add(String(y)));
        else if (a.year) commYears.add(String(a.year));

        // Collect years from breakdown quarters
        bd.forEach(b => {
            const q = b.quarter || "";
            if (typeof q === 'string' && q.includes('-')) commYears.add(q.split('-')[0]);
        });
    });
    const sortedCommYears = [...commYears].sort().reverse();

    // Calculate Detailed Reach Breakdown using robust isolation logic (Initial: All Years/Qtrs)
    let rNM=0, rNW=0, rOM=0, rOW=0;
    allActs.forEach(act => {
        const bd = (act.breakdown || []);
        bd.forEach(b => {
            const comms = b.communities || b.entities || [];
            const isMatch = comms.includes(item.name) || (item.code && comms.includes(item.code));
            if (!isMatch) return;

            rNM += (parseInt(b.newMen) || 0); rNW += (parseInt(b.newWomen) || 0);
            rOM += (parseInt(b.oldMen) || 0); rOW += (parseInt(b.oldWomen) || 0);
        });
    });
    const totalNew = rNM + rNW;
    const totalOverall = rNM + rNW + rOM + rOW;

    const demoHTML = `
        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; padding:12px; margin-bottom:16px;">
            <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:16px;">
                <!-- Column 1: Community Demographics -->
                <div style="background:rgba(255,255,255,0.03); padding:10px; border-radius:8px;">
                    <div style="font-size:0.65rem; color:#888; text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid rgba(255,255,255,0.05); margin-bottom:8px; padding-bottom:4px; font-weight:700;">Community Demographics</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">

                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Municipality</span><span style="font-size:0.65rem; color:#aaa;">${demo?.municipality|| '-'}</span></div>

                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">District</span><span style="font-size:0.65rem; color:#aaa;">${demo?.district || '-'}</span></div>

                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Province</span><span style="font-size:0.65rem; color:#aaa;">${demo?.province || '-'}</span></div>
                        
<div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Total Pop</span><span style="font-size:0.8rem; color:#eee; font-weight:600;">${demo?.totalPop || '-'}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Households</span><span style="font-size:0.8rem; color:#eee; font-weight:600;">${demo?.hhs || '-'}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Men</span><span style="font-size:0.8rem; color:#eee;">${demo?.male || '-'}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Women</span><span style="font-size:0.8rem; color:#eee;">${demo?.female || '-'}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Children</span><span style="font-size:0.8rem; color:#eee;">${demo?.children || '-'}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Elderly</span><span style="font-size:0.8rem; color:#eee;">${demo?.elderly || '-'}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#666; text-transform:uppercase;">Disabilities</span><span style="font-size:0.8rem; color:#eee;">${demo?.disabilities || '-'}</span></div>
                    </div>
                </div>

                <!-- Column 2: Activity Reach Details -->
                <div style="background:rgba(20, 163, 163,0.04); padding:10px; border-radius:8px; border:1px solid rgba(20, 163, 163,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(20, 163, 163,0.1); margin-bottom:8px; padding-bottom:4px;">
                        <div style="font-size:0.65rem; color:#14a3a3; text-transform:uppercase; letter-spacing:0.5px; font-weight:700;">Project Reach</div>
                        <div style="display:flex; gap:4px;">
                            <select id="modal-filter-year" onchange="window._updateModalReach('${item.name.replace(/'/g, "\\'")}', '${(item.code || '').replace(/'/g, "\\'")}')" 
                                style="background:#1a1a2e; color:#14a3a3; border:1px solid rgba(20, 163, 163,0.3); border-radius:4px; font-size:0.55rem; padding:1px 2px; outline:none; cursor:pointer;">
                                <option value="">Year</option>
                                ${sortedCommYears.map(y => `<option value="${y}">${y}</option>`).join('')}
                            </select>
                            <select id="modal-filter-qtr" onchange="window._updateModalReach('${item.name.replace(/'/g, "\\'")}', '${(item.code || '').replace(/'/g, "\\'")}')" 
                                style="background:#1a1a2e; color:#14a3a3; border:1px solid rgba(20, 163, 163,0.3); border-radius:4px; font-size:0.55rem; padding:1px 2px; outline:none; cursor:pointer;">
                                <option value="">Qtr</option>
                                <option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                        <div style="flex-direction:column; grid-column: span 2; background:rgba(20, 163, 163,0.1); padding:4px 8px; border-radius:4px; margin-bottom:4px; display: flex;">
                            <span style="font-size:0.55rem; color:#14a3a3; text-transform:uppercase;">Total Reach</span>
                            <div style="display:flex; align-items:baseline; gap:8px;">
                                <span id="modal-reach-total" style="font-size:1.1rem; color:#fff; font-weight:800;">${totalNew.toLocaleString()}</span>
                                <span id="modal-reach-overall" style="font-size:0.75rem; color:#888;">(Overall: ${totalOverall.toLocaleString()})</span>
                            </div>
                        </div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#888; text-transform:uppercase;">New Participants (Men)</span><span id="modal-reach-nm" style="font-size:0.8rem; color:#00e676; font-weight:600;">${rNM.toLocaleString()}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#888; text-transform:uppercase;">New Participants (Women)</span><span id="modal-reach-nw" style="font-size:0.8rem; color:#00e676; font-weight:600;">${rNW.toLocaleString()}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#888; text-transform:uppercase;">Old Participants (Men)</span><span id="modal-reach-om" style="font-size:0.8rem; color:#aaa;">${rOM.toLocaleString()}</span></div>
                        <div style="display:flex; flex-direction:column;"><span style="font-size:0.55rem; color:#888; text-transform:uppercase;">Old Participants (Women)</span><span id="modal-reach-ow" style="font-size:0.8rem; color:#aaa;">${rOW.toLocaleString()}</span></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
                <h2 style="color:#00e676; margin:0 0 2px 0; font-size:1.4rem;">${item.name}</h2>
            </div>
        </div>

        ${demoHTML}

        <!-- Tab bar -->
        <div id="sd-tabs" style="display:flex; gap:0; border-bottom:2px solid rgba(255,255,255,0.08); margin-bottom:14px;">
            <button id="sdtab-indicators" onclick="window._switchScoreTab('indicators')"
                style="background:transparent; border:none; border-bottom:2px solid #00e676; margin-bottom:-2px; color:#00e676; padding:8px 16px; font-size:0.78rem; font-weight:700; cursor:pointer; letter-spacing:0.3px;">⊞ Indicators</button>
            <button id="sdtab-activities" onclick="window._switchScoreTab('activities')"
                style="background:transparent; border:none; border-bottom:2px solid transparent; margin-bottom:-2px; color:#666; padding:8px 16px; font-size:0.78rem; font-weight:700; cursor:pointer; letter-spacing:0.3px;">⚡ Activities <span style="background:rgba(255,255,255,0.08); border-radius:10px; padding:1px 7px; font-size:0.68rem;">${commActs.length}</span></button>
            <button id="sdtab-knowledge" onclick="window._switchScoreTab('knowledge')"
                style="background:transparent; border:none; border-bottom:2px solid transparent; margin-bottom:-2px; color:#666; padding:8px 16px; font-size:0.78rem; font-weight:700; cursor:pointer; letter-spacing:0.3px;">📖 Knowledge <span style="background:rgba(255,255,255,0.08); border-radius:10px; padding:1px 7px; font-size:0.68rem;">${commKnow.length}</span></button>
        </div>

        <!-- Tab content -->
        <div id="score-detail-tab-content">
            <!-- Indicators sub-content -->
            <div id="sdpane-indicators">
                ${noDataNote}
                ${sortBarHTML}
                <div id="score-detail-table"></div>
            </div>
            <div id="sdpane-activities" style="display:none;"></div>
            <div id="sdpane-knowledge" style="display:none;"></div>
        </div>
    `;
    window._renderScoreDetailTable('default');
    modal.classList.add('active');
};

/** 
 * Real-time reach stat updater for the community modal.
 * Reacts to Year and Quarter filter dropdowns.
 */
window._updateModalReach = function(commName, commCode) {
    const yearSearch = document.getElementById('modal-filter-year')?.value || "";
    const qtrSearch  = document.getElementById('modal-filter-qtr')?.value || "";
    
    const allActs = (typeof activitiesData !== 'undefined') ? activitiesData : [];
    
    let rNM=0, rNW=0, rOM=0, rOW=0;
    allActs.forEach(act => {
        // Activity-level year filter (Broad check to speed up, but allow crossovers)
        if (yearSearch) {
            const actYrs = Array.isArray(act.year) ? act.year.map(String) : [String(act.year || "")];
            const actMatches = actYrs.includes(yearSearch) || String(act.quarter || "").includes(yearSearch);
            // We only skip if BOTH top-level and breakdown-level checks (in loop) would find nothing.
            // For CDMC Meeting anomaly, we'll be more permissive at the activity check.
            if (!actMatches && !String(JSON.stringify(act.breakdown)).includes(yearSearch)) return;
        }

        const bd = act.breakdown || [];
        bd.forEach(b => {
            // Community check
            const comms = b.communities || b.entities || [];
            const isMatch = comms.includes(commName) || (commCode && comms.includes(commCode));
            if (!isMatch) return;

            // Final Time Filter with Strict Extraction
            const bQtr = b.quarter || act.quarter || "";
            const bYr  = b.year || act.year || "";
            
            let effectiveYear = "";
            if (typeof bQtr === 'string' && bQtr.includes('-')) {
                effectiveYear = bQtr.split('-')[0];
            } else {
                effectiveYear = Array.isArray(bYr) ? bYr.map(String) : String(bYr);
            }

            // Year check
            if (yearSearch) {
                if (Array.isArray(effectiveYear)) {
                    if (!effectiveYear.includes(yearSearch)) return;
                } else if (effectiveYear !== yearSearch) return;
            }

            // Quarter check
            if (qtrSearch && !String(bQtr).includes(qtrSearch)) return;

            rNM += (parseInt(b.newMen) || 0); rNW += (parseInt(b.newWomen) || 0);
            rOM += (parseInt(b.oldMen) || 0); rOW += (parseInt(b.oldWomen) || 0);
        });
    });
    
    const totalNew = rNM + rNW;
    const totalOverall = rNM + rNW + rOM + rOW;
    
    // Update IDs in the modal
    const updateEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val.toLocaleString();
    };
    
    updateEl('modal-reach-total', totalNew);
    const overallEl = document.getElementById('modal-reach-overall');
    if (overallEl) overallEl.innerText = `(Overall: ${totalOverall.toLocaleString()})`;

    updateEl('modal-reach-nm', rNM);
    updateEl('modal-reach-nw', rNW);
    updateEl('modal-reach-om', rOM);
    updateEl('modal-reach-ow', rOW);
};

window._switchScoreTab = function(tab) {
    ['indicators','activities','knowledge'].forEach(t => {
        const btn  = document.getElementById('sdtab-' + t);
        const pane = document.getElementById('sdpane-' + t);
        const isActive = t === tab;
        if (btn)  { btn.style.color  = isActive ? '#00e676' : '#666'; btn.style.borderBottomColor = isActive ? '#00e676' : 'transparent'; }
        if (pane) pane.style.display = isActive ? '' : 'none';
    });
    if (tab === 'activities') window._renderScoreActivitiesTab();
    if (tab === 'knowledge')  window._renderScoreKnowledgeTab();
};

window._renderScoreActivitiesTab = function() {
    const pane = document.getElementById('sdpane-activities');
    if (!pane || pane.dataset.loaded) return;
    pane.dataset.loaded = '1';

    const item     = window._scoreDetailItem;
    const commName = item.name;
    const allActs  = (typeof activitiesData !== 'undefined') ? activitiesData : [];
    const commActs = allActs.filter(a => a.communities && a.communities.includes(commName));

    // Sort by latest first
    commActs.sort((a, b) => getActivitySortValue(b) - getActivitySortValue(a));

    if (commActs.length === 0) {
        pane.innerHTML = '<div style="color:#666;font-size:0.85rem;padding:20px 0;">No activities recorded for this community.</div>';
        return;
    }

    const hazardBg = { Flood: '#3b82f6', Heat: '#ef4444', Multi: '#a855f7', Others: '#f59e0b', Generic: '#6b7280' };

    pane.innerHTML = commActs.map((act, idx) => {
        act.capitals = (typeof deriveCapitalsFromIndicators === 'function') ? deriveCapitalsFromIndicators(act.indicators) : (act.capitals || []);
        const meta = (typeof actCapitalMeta !== 'undefined' && actCapitalMeta[act.capitals[0]]) || { color: '#aaa' };

        const commBreakdown = (act.breakdown || []).filter(b =>
            b.communities && b.communities.includes(commName)
        );

        const periods = commBreakdown.length > 0
            ? [...new Set(commBreakdown.map(b => b.quarter).filter(q => q))]
            : (act.date ? [act.date] : []);
        const fullPeriods = periods.join(', ') || act.date || 'Ongoing';
        const displayPeriods = periods.length > 2 ? `Multiple (Quarters)` : fullPeriods;

        let reachTableHTML = '';
        if (commBreakdown.length > 0) {
            const totalOld = commBreakdown.reduce((s, b) => s + (b.oldMen || 0) + (b.oldWomen || 0), 0);
            const totalNew = commBreakdown.reduce((s, b) => s + (b.newMen || 0) + (b.newWomen || 0), 0);

            reachTableHTML = `
                <div class="modal-table-scroll">
                    <table style="width:100%;border-collapse:collapse;font-size:0.78rem;margin-top:0;" class="modal-table">
                        <thead>
                            <tr style="color:#555;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid rgba(255,255,255,0.08);">
                                <th style="text-align:left;padding:5px 8px;">Quarter</th>
                                <th style="text-align:center;padding:5px 8px;">Old&nbsp;♂</th>
                                <th style="text-align:center;padding:5px 8px;">Old&nbsp;♀</th>
                                <th style="text-align:center;padding:5px 8px;">New&nbsp;♂</th>
                                <th style="text-align:center;padding:5px 8px;">New&nbsp;♀</th>
                                <th style="text-align:center;padding:5px 8px;color:#00e676;">Total&nbsp;New</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${commBreakdown.map(b => {
                                const rowNew = (b.newMen || 0) + (b.newWomen || 0);
                                const hasDesc = !!b.description;
                                const btnClass = hasDesc ? 'breakdown-info-btn' : 'breakdown-info-btn disabled';
                                
                                return `
                                <tr onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                                    onmouseout="this.style.background='transparent'">
                                    <td style="color:#aaa;">${b.quarter || '—'}</td>
                                    <td style="text-align:center;color:#888;">${b.oldMen ?? '—'}</td>
                                    <td style="text-align:center;color:#888;">${b.oldWomen ?? '—'}</td>
                                    <td style="text-align:center;color:#ddd;">${b.newMen ?? '—'}</td>
                                    <td style="text-align:center;color:#ddd;">${b.newWomen ?? '—'}</td>
                                    <td style="text-align:center;font-weight:700;color:#00e676;">
                                        ${rowNew}
                                        <div class="info-tooltip-wrap" style="margin-left:5px;">
                                            <button class="${btnClass}">i</button>
                                            <div class="info-popup">${hasDesc ? b.description : 'No details available'}</div>
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="border-top:2px solid rgba(255,255,255,0.1);">
                                <td style="padding:6px 8px;font-weight:700;color:#aaa;font-size:0.72rem;">TOTAL</td>
                                <td colspan="3" style="padding:6px 8px;text-align:center;color:#777;font-size:0.72rem;">Old: ${totalOld}</td>
                                <td colspan="2" style="padding:6px 8px;text-align:center;font-weight:800;font-size:0.88rem;color:#00e676;">New: ${totalNew}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>`;
        } else {
            reachTableHTML = `<div style="color:#666;font-size:0.78rem;margin-top:10px;">No breakdown data available.</div>`;
        }

        const cardId = `sd-act-card-${idx}`;
        const detailId = `sd-act-detail-${idx}`;

        return `
        <div id="${cardId}"
            style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-left:3px solid ${meta.color};border-radius:10px;margin-bottom:10px;overflow:hidden;transition:all 0.2s;">
            <div onclick="window._toggleScoreActivity('${cardId}','${detailId}')"
                style="padding:12px 14px;cursor:pointer;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;"
                onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">
                <div style="flex:1;min-width:0;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                        <span style="font-size:0.75rem; color:#aaa; flex-shrink:0;">📅</span>
                        <span style="font-size:0.63rem; color:#888; border-bottom:1px dotted #555; cursor:help;" title="${fullPeriods}">${displayPeriods}</span>
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:0.82rem;font-weight:600;color:#fff;line-height:1.3;">${act.name}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px;">
                        ${act.hazards.map(h => `<span style="background:${hazardBg[h]||'#555'};color:#fff;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:10px;">${h}</span>`).join('')}
                        ${act.indicators.map(i => {
                            const lbl = (typeof indicatorMetadata !== 'undefined' && indicatorMetadata[i]) ? indicatorMetadata[i].label : i;
                            return `<span class="ind-tag" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#aaa;font-size:0.63rem;font-weight:600;padding:1px 6px;border-radius:4px;font-family:monospace;cursor:help;" title="${lbl}">${i}</span>`;
                        }).join('')}
                    </div>
                    ${act.hasKnowledge ? '<span style="font-size:0.65rem;color:#00e676;font-weight:700;">📖 Knowledge Available</span>' : ''}
                </div>
                <span id="${detailId}-chevron" style="color:#555;font-size:1rem;flex-shrink:0;margin-top:2px;transition:transform 0.2s;">▼</span>
            </div>

            <!-- Expandable reach detail (hidden by default) -->
            <div id="${detailId}" style="display:none;padding:0 14px 14px 14px;border-top:1px solid rgba(255,255,255,0.06);">
                <div style="font-size:0.65rem;font-weight:700;color:#00e676;text-transform:uppercase;letter-spacing:0.7px;margin:10px 0 4px 0;">
                    Reach for <span style="color:#fff;">${commName}</span>
                </div>
                ${reachTableHTML}
            </div>
        </div>`;
    }).join('');
};

window._toggleScoreActivity = function(cardId, detailId) {
    const detail  = document.getElementById(detailId);
    const chevron = document.getElementById(detailId + '-chevron');
    if (!detail) return;
    const isOpen = detail.style.display !== 'none';
    detail.style.display  = isOpen ? 'none' : '';
    if (chevron) {
        chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        chevron.style.color     = isOpen ? '#555' : '#00e676';
    }
};

window._renderScoreKnowledgeTab = function() {
    const pane = document.getElementById('sdpane-knowledge');
    if (!pane || pane.dataset.loaded) return;
    pane.dataset.loaded = '1';

    const item     = window._scoreDetailItem;
    const commName = item.name;
    const allActs  = (typeof activitiesData !== 'undefined') ? activitiesData : [];
    const commKnow = allActs.filter(a => a.communities && a.communities.includes(commName) && a.hasKnowledge);

    if (commKnow.length === 0) {
        pane.innerHTML = '<div style="color:#666;font-size:0.85rem;padding:20px 0;">No knowledge products recorded for this community.</div>';
        return;
    }

    const capitalIcons2 = { Financial: '💰', Human: '👤', Natural: '🌿', Physical: '🏗️', Social: '🤝' };
    const hazardColors  = { Generic: '#888', Flood: '#38bdf8', Heatwave: '#fb923c' };

    pane.innerHTML = commKnow.map((act, idx) => {
        act.capitals = (typeof deriveCapitalsFromIndicators === 'function') ? deriveCapitalsFromIndicators(act.indicators) : (act.capitals || []);
        const primaryCapital = act.capitals[0] || 'Unknown';
        const icon = capitalIcons2[primaryCapital] || '📄';
        const meta = (typeof actCapitalMeta !== 'undefined' && actCapitalMeta[primaryCapital]) || { color: '#aaa' };

        const publishedYear = act.date || act.year || '—';
        const indicators    = (act.indicators || []).join(', ') || '—';
        const capitals      = (act.capitals   || []).join(', ') || '—';
        const communities   = (act.communities || []).join(', ') || '—';
        const description   = act.description ||
            `Knowledge product generated from activities across ${communities}, focusing on ${(act.hazards||[]).join(', ')} hazard resilience. Covers indicators: ${indicators}.`;
        const fileUrl       = act.fileUrl || null;

        const cardId   = `sd-know-card-${idx}`;
        const detailId = `sd-know-detail-${idx}`;

        // Hazard pill badges
        const hazardPills = (act.hazards || []).map(h =>
            `<span style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#ccc;font-size:0.63rem;font-weight:600;padding:2px 8px;border-radius:10px;">${h}</span>`
        ).join('');

        return `
        <div id="${cardId}"
            style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-left:3px solid ${meta.color};border-radius:10px;margin-bottom:10px;overflow:hidden;transition:all 0.2s;">

            <!-- Card header — clickable to expand -->
            <div onclick="window._toggleScoreKnowledge('${cardId}','${detailId}')"
                style="padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:10px;"
                onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background='transparent'">
                <div style="width:40px;height:40px;flex-shrink:0;border-radius:8px;overflow:hidden;background:#2a2a35;border:1px solid rgba(255,255,255,0.1);">
                    <img src="${getKnowledgeThumbnail(act)}" style="width:100%;height:100%;object-fit:cover;">
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.82rem;font-weight:600;color:#fff;line-height:1.3;margin-bottom:3px;">${act.name}</div>
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;">
                        <span style="background:rgba(0,230,118,0.12);border:1px solid rgba(0,230,118,0.3);color:#00e676;font-size:0.63rem;font-weight:700;padding:1px 8px;border-radius:10px;">📅 ${publishedYear}</span>
                        <span style="font-size:0.65rem;color:#777;">${primaryCapital} Report</span>
                        ${hazardPills}
                    </div>
                </div>
                <!-- Chevron -->
                <span id="${detailId}-chevron" style="color:#555;font-size:1rem;flex-shrink:0;transition:transform 0.2s;">▼</span>
            </div>

            <!-- Expandable detail panel (hidden by default) -->
            <div id="${detailId}" style="display:none;padding:0 14px 14px 14px;border-top:1px solid rgba(255,255,255,0.06);">
                <!-- Meta rows -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px;margin:12px 0 10px 0;font-size:0.78rem;">
                    <div><span style="color:#666;">Indicators:</span> <span style="color:#ddd;">${indicators}</span></div>
                    <div><span style="color:#666;">Capitals:</span> <span style="color:#ddd;">${capitals}</span></div>
                    <div style="grid-column:1/-1;"><span style="color:#666;">Communities:</span> <span style="color:#ddd;">${communities}</span></div>
                </div>

                <!-- Description -->
                <div style="font-size:0.65rem;font-weight:700;color:#00e676;text-transform:uppercase;letter-spacing:0.7px;margin-bottom:5px;">Description</div>
                <p style="color:#ccc;font-size:0.78rem;line-height:1.6;margin:0 0 12px 0;background:rgba(255,255,255,0.02);border-left:2px solid rgba(0,230,118,0.35);padding:8px 10px;border-radius:0 6px 6px 0;">${description}</p>

                <!-- File link -->
                <a href="${fileUrl || 'javascript:void(0)'}" target="${fileUrl ? '_blank' : ''}" rel="noopener"
                    style="display:inline-flex;align-items:center;gap:6px;background:${fileUrl ? '#00e676' : '#2a2a2a'};color:${fileUrl ? '#121212' : '#555'};font-weight:700;font-size:0.78rem;padding:7px 16px;border-radius:7px;text-decoration:none;transition:all 0.2s;cursor:${fileUrl ? 'pointer' : 'not-allowed'};pointer-events:${fileUrl ? 'auto' : 'none'};opacity:${fileUrl ? '1' : '0.5'};border:1px solid ${fileUrl ? 'transparent' : 'rgba(255,255,255,0.05)'};"
                    onmouseover="${fileUrl ? "this.style.opacity='0.85'" : ''}" onmouseout="${fileUrl ? "this.style.opacity='1'" : ''}">
                    📄 ${fileUrl ? 'Open Document' : 'Document Unavailable'}
                </a>
            </div>
        </div>`;
    }).join('');
};

window._toggleScoreKnowledge = function(cardId, detailId) {
    const detail  = document.getElementById(detailId);
    const chevron = document.getElementById(detailId + '-chevron');
    if (!detail) return;
    const isOpen = detail.style.display !== 'none';
    detail.style.display  = isOpen ? 'none' : '';
    if (chevron) {
        chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
        chevron.style.color     = isOpen ? '#555' : '#00e676';
    }
};

window._renderScoreDetailTable = function(sortMode) {
    const tableEl = document.getElementById('score-detail-table');
    if (!tableEl) return;

    const item     = window._scoreDetailItem;
    if (!item) return;

    window._scoreDetailSort = sortMode;

    // Update sort button styles
    const gradeColorsBtn = { 'grade-A': '#00e676', 'grade-B': '#ffeb3b', 'grade-C': '#ff9800', 'grade-D': '#ff1744' };
    ['default','asc','desc','grade-A','grade-B','grade-C','grade-D'].forEach(k => {
        const btn = document.getElementById('sdsort-' + k);
        if (!btn) return;
        const isActive = (k === sortMode);
        
        let activeBg = '#00e676';
        if (k.startsWith('grade-')) activeBg = gradeColorsBtn[k] || '#00e676';
        
        btn.style.background     = isActive ? activeBg : 'rgba(255,255,255,0.06)';
        btn.style.color          = isActive ? '#121212' : '#aaa';
        btn.style.border         = isActive ? 'none'    : '1px solid rgba(255,255,255,0.12)';
    });

    const commData  = (typeof data !== 'undefined' && data) ? data[item.name] : null;
    const indList   = (typeof indicators !== 'undefined') ? indicators : [];
    
    // Sync with global colors (A: #00e676, B: #ffeb3b, C: #ff9800, D: #ff1744)
    const gradeColors = { A: '#00e676', B: '#ffeb3b', C: '#ff9800', D: '#ff1744' };
    const gradeOrder  = { A: 0, B: 1, C: 2, D: 3 };
    const capitalIcons = { Financial: '💰', Human: '👤', Natural: '🌿', Physical: '🏗️', Social: '🤝' };
    const hazardColors = { Generic: '#888', Flood: '#38bdf8', Heatwave: '#fb923c' };

    function rowHTML(ind, meta) {
        const grade  = commData ? (commData[ind] || '—') : '—';
        let color    = gradeColors[grade] || '#555';
        
        // Light mode legibility fix for Grade B (Yellow -> Amber)
        if (grade === 'B' && document.body.classList.contains('light')) {
            color = '#b07800'; 
        }

        const hazard = meta ? meta.hazard : '';
        const hColor = hazardColors[hazard] || '#888';
        const label  = meta ? meta.label : ind;
        return `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04);"
                onmouseover="this.style.background='rgba(255,255,255,0.04)'"
                onmouseout="this.style.background='transparent'">
                <td style="padding:5px 8px;color:#aaa;font-family:monospace;font-size:0.78rem;">${ind}</td>
                <td style="padding:5px 8px;color:#ddd;line-height:1.3;">${label}</td>
                <td style="padding:5px 8px;text-align:center;"><span style="font-size:0.65rem;font-weight:700;color:${hColor};">${hazard || '—'}</span></td>
                <td style="padding:5px 8px;text-align:center;">
                    <span style="display:inline-block;min-width:28px;font-weight:800;font-size:0.95rem;color:${color}">${grade}</span>
                </td>
            </tr>`;
    }

    const tableHead = `
        <table style="width:100%;border-collapse:collapse;font-size:0.83rem;">
            <thead>
                <tr style="color:#555;font-size:0.68rem;text-transform:uppercase;letter-spacing:0.4px;">
                    <th style="text-align:left;padding:4px 8px;width:52px;">Code</th>
                    <th style="text-align:left;padding:4px 8px;">Indicator</th>
                    <th style="text-align:center;padding:4px 8px;width:60px;">Hazard</th>
                    <th style="text-align:center;padding:4px 8px;width:48px;cursor:pointer;"
                        onclick="window._renderScoreDetailTable(window._scoreDetailSort==='asc'?'desc':'asc')"
                        title="Click to toggle sort">
                        Grade ⇅
                    </th>
                </tr>
            </thead>
            <tbody>`;

    let html = '';

    if (sortMode === 'default') {
        // Grouped by capital
        const capitalGroups = {};
        indList.forEach(ind => {
            const meta    = (typeof indicatorMetadata !== 'undefined') ? indicatorMetadata[ind] : null;
            const capital = meta ? meta.capital : 'Other';
            if (!capitalGroups[capital]) capitalGroups[capital] = [];
            capitalGroups[capital].push({ ind, meta });
        });

        Object.entries(capitalGroups).forEach(([capital, inds]) => {
            html += `
                <div style="margin-bottom:16px;">
                    <div style="font-size:0.7rem;font-weight:700;color:#00e676;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid rgba(0,230,118,0.15);padding-bottom:5px;margin-bottom:8px;">
                        ${capitalIcons[capital] || '📄'} ${capital} Capital
                    </div>
                    ${tableHead}
                        ${inds.map(({ ind, meta }) => rowHTML(ind, meta)).join('')}
                    </tbody></table>
                </div>`;
        });

    } else if (sortMode === 'asc' || sortMode === 'desc') {
        // Flat list sorted by grade
        const allInds = indList.map(ind => ({
            ind,
            meta: (typeof indicatorMetadata !== 'undefined') ? indicatorMetadata[ind] : null,
            grade: commData ? (commData[ind] || '—') : '—'
        }));

        allInds.sort((a, b) => {
            const ga = gradeOrder[a.grade] ?? 99;
            const gb = gradeOrder[b.grade] ?? 99;
            return sortMode === 'asc' ? ga - gb : gb - ga;
        });

        const label = sortMode === 'asc'
            ? '▲ Sorted: Best → Worst'
            : '▼ Sorted: Worst → Best';

        html = `
            <div style="margin-bottom:16px;">
                <div style="font-size:0.68rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">${label}</div>
                ${tableHead}
                    ${allInds.map(({ ind, meta }) => rowHTML(ind, meta)).join('')}
                </tbody></table>
            </div>`;

    } else if (sortMode && sortMode.startsWith('grade-')) {
        // Filter to a specific grade
        const targetGrade = sortMode.replace('grade-','');
        const gradeColors2 = { A: '#00e676', B: '#ffea00', C: '#ff9100', D: '#ff1744' };
        const filtered = indList
            .map(ind => ({
                ind,
                meta: (typeof indicatorMetadata !== 'undefined') ? indicatorMetadata[ind] : null,
                grade: commData ? (commData[ind] || '—') : '—'
            }))
            .filter(r => r.grade === targetGrade);

        const btnStyle = `background:${gradeColors2[targetGrade]};color:#121212;border:none;border-radius:6px;padding:3px 10px;font-size:0.72rem;font-weight:700;cursor:pointer;margin-left:6px;`;
        html = `
            <div style="margin-bottom:16px;">
                <div style="font-size:0.68rem;font-weight:700;color:${gradeColors2[targetGrade]};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px;">
                    Showing Grade ${targetGrade} — ${filtered.length} indicator${filtered.length !== 1 ? 's' : ''}
                    <button onclick="window._renderScoreDetailTable('default')" style="${btnStyle}">✕ Clear</button>
                </div>
                ${filtered.length ? tableHead + filtered.map(({ ind, meta }) => rowHTML(ind, meta)).join('') + '</tbody></table>' : '<div style="color:#666;font-size:0.85rem;">No indicators with this grade.</div>'}
            </div>`;
    }

    tableEl.innerHTML = html || '<div style="color:#666;">No indicators available.</div>';
};

window.closeScoreDetailModal = function(event) {
    if (event && event.target !== document.getElementById('score-detail-modal')) return;
    const modal = document.getElementById('score-detail-modal');
    if (modal) modal.classList.remove('active');
};

// ── Knowledge Screen Logic ────────────────────────────
let knowledgeAllItems = [];

function initKnowledgeScreen() {
    const grid = document.getElementById('knowledge-grid');
    if (!grid) return;

    // Build items list once
    knowledgeAllItems = (window.activitiesData || SAMPLE_ACTIVITIES).filter(act => act.hasKnowledge);

    // Attach search listener (only once)
    const searchInput = document.getElementById('know-search');
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = '1';
        searchInput.oninput = () => renderKnowledge(searchInput.value.trim().toLowerCase());
    }

    renderKnowledge('');
}

function getKnowledgeThumbnail(act) {
    if (!act || !act.name) return 'assets/knowledge_default.jpg';
    const name = act.name.toLowerCase();
    if (name.includes('bio-dyke')) return 'assets/biodyke.jpg';
    if (name.includes('flood')) return 'assets/flood.png';
    if (name.includes('heatwave')) return 'assets/heatwave.png';
    return 'assets/knowledge_default.jpg';
}

function renderKnowledge(query) {
    const grid = document.getElementById('knowledge-grid');
    const noRes = document.getElementById('know-no-results');
    if (!grid) return;

    const filtered = knowledgeAllItems.filter(act => {
        if (!query) return true;
        return (
            (act.name  && act.name.toLowerCase().includes(query)) ||
            (act.hazards  && act.hazards.some(h => h.toLowerCase().includes(query))) ||
            (act.capitals && act.capitals.some(c => c.toLowerCase().includes(query))) ||
            (act.communities && act.communities.some(c => c.toLowerCase().includes(query))) ||
            (act.indicators  && act.indicators.some(i => i.toLowerCase().includes(query)))
        );
    });

    if (noRes) noRes.classList.toggle('hidden', filtered.length > 0);

    if (filtered.length === 0) {
        grid.innerHTML = '';
        return;
    }

    grid.innerHTML = filtered.map((act, idx) => {
        act.capitals = deriveCapitalsFromIndicators(act.indicators);
        const primaryCapital = act.capitals && act.capitals.length > 0 ? act.capitals[0] : 'Unknown';
        const meta = actCapitalMeta[primaryCapital] || { icon: '📄' };
        const safeIdx = idx;

        const kType = act.knowledgeType || `${primaryCapital} Report`;

        return `
        <div class="know-card" style="cursor:pointer;" onclick="openKnowledgeModal(knowledgeAllItems[${safeIdx}])">
            <div class="know-img">
                <img src="${getKnowledgeThumbnail(act)}" alt="${act.name}">
            </div>
            <div class="know-body">
                <span class="know-tag">${kType}</span>
                <h3 class="know-title">${act.name}</h3>
                <p class="know-desc">${act.description || `Knowledge product and technical observations generated from executions across ${act.communities.join(', ')} focusing on ${act.hazards.join(', ')} resilience (${act.date || act.year}).`}</p>
                <div style="margin-top:10px;font-size:11px;color:#00e676;opacity:0.8;">🔍 Click to view details</div>
            </div>
        </div>
        `;
    }).join('');
}


window.openKnowledgeModal = function(act) {
    const modal = document.getElementById('knowledge-modal');
    const body  = document.getElementById('knowledge-modal-body');
    if (!modal || !body || !act) return;

    const publishedYear = act.date || act.year || '—';
    const communities   = (act.communities  || []).join(', ') || '—';
    const indicators    = (act.indicators   || []).join(', ') || '—';
    const hazards       = (act.hazards      || []).join(', ') || '—';
    const capitals      = (act.capitals     || deriveCapitalsFromIndicators(act.indicators || [])).join(', ') || '—';
    const description   = act.description   || `Knowledge product and technical observations generated from activities across ${communities}, focusing on ${hazards} hazard resilience. Covers indicators: ${indicators}.`;
    const fileUrl       = act.fileUrl       || null;

    const kType         = act.knowledgeType || `${capitals.split(',')[0]} Report`;
    const detailsHtml   = (act.details || []).map(d => `<li>${d}</li>`).join('');

    body.innerHTML = `
        <h2 style="color:#00e676;margin:0 0 6px 0;font-size:1.35rem;line-height:1.3;">${act.name}</h2>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;">
            <span style="background:rgba(0,230,118,0.12);border:1px solid rgba(0,230,118,0.3);color:#00e676;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">📅 ${publishedYear}</span>
            <span style="background:rgba(255,152,0,0.12);border:1px solid rgba(255,152,0,0.3);color:#ff9800;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">📄 ${kType}</span>
            ${(act.hazards||[]).map(h => `<span style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#ccc;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;">${h}</span>`).join('')}
        </div>

        <div class="modal-detail-row"><strong>Related Indicators:</strong> ${indicators}</div>
        <div class="modal-detail-row"><strong>Capital Categories:</strong> ${capitals}</div>
        <div class="modal-detail-row"><strong>Communities Covered:</strong> ${communities}</div>

        <div style="margin:16px 0 8px 0;">
            <strong style="color:#00e676;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.8px;">Description</strong>
        </div>
        <p style="color:#ccc;font-size:0.88rem;line-height:1.6;margin:0 0 16px 0;background:rgba(255,255,255,0.03);border-left:3px solid rgba(0,230,118,0.4);padding:10px 14px;border-radius:0 8px 8px 0;">${description}</p>

        ${act.details ? `
        <div style="margin:16px 0 8px 0;">
            <strong style="color:#00e676;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.8px;">Key Technical Insights</strong>
        </div>
        <ul class="knowledge-details-list">
            ${detailsHtml}
        </ul>
        ` : ''}

        <div style="border-top:1px solid rgba(255,255,255,0.07);padding-top:16px;">
            <a href="${fileUrl || 'javascript:void(0)'}" target="${fileUrl ? '_blank' : ''}" rel="noopener"
               style="display:inline-flex;align-items:center;gap:8px;background:${fileUrl? '#00e676' : '#2a2a2a'};color:${fileUrl? '#121212' : '#555'};font-weight:700;font-size:0.85rem;padding:9px 20px;border-radius:8px;text-decoration:none;transition:all 0.2s;cursor:${fileUrl? 'pointer' : 'not-allowed'};pointer-events:${fileUrl? 'auto' : 'none'};opacity:${fileUrl? '1' : '0.5'};border:1px solid ${fileUrl? 'transparent' : 'rgba(255,255,255,0.05)'};"
               onmouseover="${fileUrl? "this.style.opacity='0.85'" : ''}" onmouseout="${fileUrl? "this.style.opacity='1'" : ''}">
               📄 ${fileUrl ? 'Open Document' : 'Document Unavailable'}
            </a>
        </div>
    `;

    modal.classList.add('active');
};

window.closeKnowledgeModal = function(event) {
    if (event && event.target !== document.getElementById('knowledge-modal')) return;
    const modal = document.getElementById('knowledge-modal');
    if (modal) modal.classList.remove('active');
};

// ── Right-Click Interaction Sequence & Long-Press Logic ─────────────────
let isRightClickLocked = true;
let interactionStep = 1; // Default to task 1 (Landing Page)
let autoRunActive = false;
let pressStartTime = 0;

const hud = document.getElementById('interaction-hud');
const hudText = document.getElementById('hud-text');
const hudNav = document.getElementById('hud-nav');
const hudPrev = document.getElementById('hud-prev');
const hudNext = document.getElementById('hud-next');

let hudNextPressStart = 0;
let pressTimer = null;

const delay = ms => new Promise(res => setTimeout(res, ms));

function updateHUD(text, state = 'unlocked') {
    if (!hud) return;
    
    // Always show current task number
    if (hudText) {
        hudText.textContent = `TASK ${interactionStep} / 31`;
        hudText.style.display = 'flex';
    }

    if (isRightClickLocked) {
        hud.classList.add('hidden');
        return;
    }

    hud.className = ''; 
    if (state === 'unlocked' || state === 'autorun') {
        hud.classList.add(state);
    }

    if (hudNext) {
        if (state === 'autorun') hudNext.classList.add('active-step');
        else hudNext.classList.remove('active-step');
    }
}

// Initial state: Everything hidden until activated
function initializeInteraction() {
    isRightClickLocked = true;
    if (hud) hud.classList.add('hidden');
    if (hudText) hudText.style.display = 'none';
    if (hudNav) hudNav.style.display = 'none';
}
initializeInteraction();

// HUD Navigation buttons are hidden in CSS/JS now, listeners removed
/* 
hudPrev.addEventListener('click', () => { ... });
hudNext.addEventListener('pointerdown', (e) => { ... });
... 
*/



// Global Logic for Long-press and Left-click navigation
window.addEventListener('mousedown', startPress);
window.addEventListener('mouseup', endPress);
window.addEventListener('touchstart', (e) => startPress(e.touches[0]));
window.addEventListener('touchend', (e) => endPress(e.changedTouches[0]));

let pressStartButton = null;

function startPress(e) {
    // Track which button is being pressed
    pressStartButton = e.button !== undefined ? e.button : 0; // default to left for touches
    pressStartTime = Date.now();
}

function endPress(e) {
    const duration = Date.now() - pressStartTime;
    const button = e.button !== undefined ? e.button : 0;
    
    // Safety check: ensure the button released is the same one that pressed
    if (button !== pressStartButton) return;

    if (duration >= 3000) {
        // --- LONG PRESS (3s+) ---
        if (button === 2) { 
            // RIGHT-CLICK LONG PRESS
            if (isRightClickLocked) {
                // ACTIVATE TASKS
                console.log("Tasks Activated via Right-Click Long Press");
                isRightClickLocked = false;
                interactionStep = 1;
                if (hud) hud.classList.remove('hidden');
                if (hudText) hudText.style.display = 'flex';
                executeStep(1); 
            } else {
                // ACTIVATE AUTOPLAY
                console.log("Autoplay Activated via Right-Click Long Press");
                if (!autoRunActive) startAutoRun();
            }
        } else if (button === 0) {
            // LEFT-CLICK LONG PRESS: RESET EVERYTHING
            console.log("Resetting via Left-Click Long Press");
            isRightClickLocked = true;
            stopAutoRun();
            interactionStep = 1;
            if (hud) hud.classList.add('hidden');
            if (hudText) hudText.style.display = 'none';
            executeStep(1); // Return to landing page
        }
    } else if (duration > 50) {
        // --- SHORT PRESS ---
        if (button === 0) { // Only Left-click navigates
            if (!isRightClickLocked) {
                if (autoRunActive) {
                    console.log("Stopping Auto-run via click");
                    stopAutoRun();
                } else {
                    console.log("Advancing Task via click");
                    runNextInteraction();
                }
            }
        }
    }
    
    pressStartTime = 0;
    pressStartButton = null;
}

async function runNextInteraction() {
    interactionStep = (interactionStep % 31) + 1;
    console.log("runNextInteraction, step is now:", interactionStep);
    await executeStep(interactionStep);
}

async function runPrevInteraction() {
    // Go back 1 step (1-31 scale)
    interactionStep = (interactionStep - 2 + 31) % 31 + 1;
    await executeStep(interactionStep);
}

async function executeStep(step) {
    const randomComm = () => communities[Math.floor(Math.random() * communities.length)];
    const randomInd = () => indicators[Math.floor(Math.random() * indicators.length)];
    const randomGrade = () => ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
    const labelDisplay = document.getElementById('hover-label-display');

    // 1. Global Cleanup of previous animation/state overrides
    document.querySelectorAll('.pulsate-animation, .blink-animation').forEach(el => {
        el.classList.remove('pulsate-animation', 'blink-animation');
    });
    // Reset label display
    if (labelDisplay) {
        labelDisplay.classList.remove('visible', 'pulsate-animation');
    }

    updateHUD("", autoRunActive ? 'autorun' : 'unlocked');

    switch(step) {
        case 1: // Landing Page (Reset)
            selectItem('community', null);
            selectItem('indicator', null);
            selectItem('grade', null);
            lockedHoverId = null;
            lockedHoverType = null;
            document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
            break;
            
        case 2: // Random Community
        case 3: 
        case 4: 
        case 5: 
            selectItem('community', randomComm()); 
            break;
            
        case 6: // Random Indicator
        case 7: 
        case 8: 
        case 9: 
            selectItem('indicator', randomInd()); 
            break;
            
        case 10: // Random Grading
            selectItem('grade', randomGrade()); 
            break;
        case 11: // [Grade Cycle 1] Lock Community 1
        case 14: // [Grade Cycle 1] Lock Community 2
        case 18: // [Grade Cycle 2] Lock Community 3
        case 21: // [Grade Cycle 2] Lock Community 4
            {
                // 1. Maintain context
                let g = (mode === 'grade' && selectedId) ? selectedId : randomGrade();
                mode = 'grade';
                selectedId = g;
                updateView();
                
                // 2. Cleanup preceding task state
                lockedHoverId = null;
                lockedHoverType = null;
                document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));

                // 3. Selection with Variety
                const matchingComms = communities.filter(comm => {
                    return indicators.some(ind => data[comm][ind] === g);
                });

                if (matchingComms.length > 0) {
                    // If it's a second community step (14 or 21), try to pick a different one
                    let c;
                    if ((step === 14 || step === 21) && matchingComms.length > 1) {
                        const others = matchingComms.filter(id => id !== lastLockedComm);
                        c = others[Math.floor(Math.random() * others.length)];
                    } else {
                        c = matchingComms[Math.floor(Math.random() * matchingComms.length)];
                    }

                    lastLockedComm = c;
                    const el = document.getElementById('comm-' + safeId(c));
                    if (el) {
                        const mockEvent = { stopPropagation: () => {} };
                        toggleLock(mockEvent, 'community', c); 
                    }
                }
            }
            break;

        case 12: // Pulse Step 1 (Comm 1/2/3/4)
        case 15:
        case 19:
        case 22:
            {
                if (!lockedHoverId || lockedHoverType !== 'community') {
                    // Try to recover by running the previous logic
                    await executeStep(step - 1);
                }

                const g = selectedId;
                const c = lockedHoverId;
                const matchingInds = indicators.filter(ind => data[c][ind] === g);
                
                if (matchingInds.length > 0) {
                    const randomI = matchingInds[Math.floor(Math.random() * matchingInds.length)];
                    task12SelectedInd = randomI; 
                    const indEl = document.getElementById('ind-' + safeId(randomI));
                    if (indEl) {
                        indEl.classList.add('pulsate-animation');
                        updateHoverLabel('indicator', randomI);
                        const labelDisplay = document.getElementById('hover-label-display');
                        if (labelDisplay) {
                            labelDisplay.classList.add('visible', 'pulsate-animation');
                        }
                    }
                }
            }
            break;

        case 13: // Pulse Step 2 (Comm 1/2/3/4, variety)
        case 16:
        case 20:
        case 23:
            {
                if (!lockedHoverId || lockedHoverType !== 'community') {
                    await executeStep(step - 2); 
                }

                const g = selectedId;
                const c = lockedHoverId;
                const matchingInds = indicators.filter(ind => data[c][ind] === g);
                
                if (matchingInds.length <= 1) {
                    runNextInteraction(); 
                    return;
                }

                const otherInds = matchingInds.filter(id => id !== task12SelectedInd);
                const randomI = otherInds.length > 0 
                    ? otherInds[Math.floor(Math.random() * otherInds.length)]
                    : matchingInds[0];

                const indEl = document.getElementById('ind-' + safeId(randomI));
                if (indEl) {
                    indEl.classList.add('pulsate-animation');
                    updateHoverLabel('indicator', randomI);
                    const labelDisplay = document.getElementById('hover-label-display');
                    if (labelDisplay) {
                        labelDisplay.classList.add('visible', 'pulsate-animation');
                    }
                }
            }
            break;

        case 17: // [Grade Cycle 2 Start]
        case 24: // [Grade Cycle 3 Start]
        case 28: // [Grade Cycle 4 Start]
            {
                // Select a DIFFERENT grade than the previous choice if possible
                const prevG = selectedId;
                let nextG = randomGrade();
                if (prevG && nextG === prevG) {
                    const choices = ['A', 'B', 'C', 'D'].filter(x => x !== prevG);
                    nextG = choices[Math.floor(Math.random() * choices.length)];
                }
                selectItem('grade', nextG);
            }
            break;

        case 25: // Reversed Highlight (One Indicator -> All Communities)
        case 26: // Repeat for another indicator
        case 27: // Repeat for another indicator
        case 29: // [Grade Cycle 4] Repeat Reverse
        case 30: 
        case 31:
            {
                // 1. Maintain Grade Context
                let g = (mode === 'grade' && selectedId) ? selectedId : randomGrade();
                mode = 'grade';
                selectedId = g;
                updateView();

                // 2. Identify indicators that have matching communities for this grade
                const validInds = indicators.filter(ind => {
                    return communities.some(c => data[c][ind] === g);
                });

                if (validInds.length > 0) {
                    // Variety: If Step 26, 27, 29, 30, 31, try to pick a different one
                    let randomI;
                    const multiSteps = [26, 27, 29, 30, 31];
                    if (multiSteps.includes(step) && validInds.length > 1) {
                        const others = validInds.filter(id => id !== lastLockedInd);
                        randomI = others[Math.floor(Math.random() * others.length)];
                    } else {
                        randomI = validInds[Math.floor(Math.random() * validInds.length)];
                    }
                    
                    lastLockedInd = randomI;
                    const indEl = document.getElementById('ind-' + safeId(randomI));
                    if (indEl) {
                        const mockEvent = { stopPropagation: () => {} };
                        toggleLock(mockEvent, 'indicator', randomI); 
                    }
                }
            }
            break;
    }
}

async function startAutoRun() {
    if (autoRunActive) return;
    autoRunActive = true;
    console.log("Auto-run loop started");
    updateHUD("", 'autorun');
    
    // Safety check for starting point
    if (interactionStep < 1) interactionStep = 1;
    
    while (autoRunActive) {
        try {
            console.log("Playing TASK", interactionStep);
            await executeStep(interactionStep);
            
            console.log("Waiting 3s for TASK", interactionStep);
            await delay(3000);
            
            if (!autoRunActive) break;

            // Increment and loop logic
            interactionStep = (interactionStep % 31) + 1;
            
            // USER REQUIREMENT: When repeating, skip task 1 (the reset page)
            if (interactionStep === 1) {
                console.log("Skipping Task 1 on repeat cycle");
                interactionStep = 2;
            }
            
            console.log("Advanced to TASK", interactionStep);
        } catch (err) {
            console.error("Auto-run error encountered:", err);
            // Don't break the loop, just log and try the next one
            interactionStep = (interactionStep % 31) + 1;
            if (interactionStep === 1) interactionStep = 2;
            await delay(1000);
        }
    }
    console.log("Auto-run loop stopped.");
}

function stopAutoRun() {
    autoRunActive = false;
    updateHUD("");
}


// ── Theme Toggle ───────────────────────────────────────────
window.toggleTheme = function(isLight) {
    document.body.classList.toggle('light', isLight);
    const label = document.getElementById('theme-label');
    if (label) label.textContent = isLight ? '🌙' : '☀️';
    try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e) {}
};

// Restore saved theme on load
(function() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            document.body.classList.add('light');
            const cb = document.getElementById('theme-checkbox');
            if (cb) cb.checked = true;
            const label = document.getElementById('theme-label');
            if (label) label.textContent = '🌙';
        }
    } catch(e) {}
})();

/* ==========================================
   COMMUNITY MAP VIEW LOGIC
   ========================================== */
let scoresMap = null;
let communityMarkers = [];
let resourceMarkers = [];
let scoresMapBaseLayer = null;
let satelliteMapLayer = null;
let isMapView = false;

// Robust CSV parser to handle quotes and commas
function parseCsvRow(row) {
    if (!row) return [];
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur.trim());
    return result;
}

window.showScoresGrid = function() {
    isMapView = false;
    document.getElementById('btn-grid-view').classList.add('active');
    document.getElementById('btn-map-view').classList.remove('active');
    document.getElementById('scores-grid').classList.remove('hidden');
    document.getElementById('scores-map-wrapper').classList.add('hidden');
    if (typeof handleMapCommunityChange === 'function') {
        handleMapCommunityChange('');
    }

    // Show search and filters in All Scores view
    const searchBox = document.querySelector('#scores-screen .search-box');
    const hazardFilters = document.getElementById('score-hazard-filters');
    const mapControls = document.getElementById('map-toolbar-controls');
    
    if (searchBox) searchBox.style.display = 'flex';
    if (hazardFilters) hazardFilters.style.display = 'flex';
    if (mapControls) mapControls.classList.add('hidden');
};

window.showScoresMap = function() {
    isMapView = true;
    document.getElementById('btn-grid-view').classList.remove('active');
    document.getElementById('btn-map-view').classList.add('active');
    document.getElementById('scores-grid').classList.add('hidden');
    const wrapper = document.getElementById('scores-map-wrapper');
    wrapper.classList.remove('hidden');

    // Hide search and filters in Map view, show map controls
    const searchBox = document.querySelector('#scores-screen .search-box');
    const hazardFilters = document.getElementById('score-hazard-filters');
    const mapControls = document.getElementById('map-toolbar-controls');
    
    if (searchBox) searchBox.style.display = 'none';
    if (hazardFilters) hazardFilters.style.display = 'none';
    if (mapControls) mapControls.classList.remove('hidden');
    
    // Initialize map if not already done
    if (!scoresMap) {
        initScoresMap();
    } else {
        // Force Leaflet to recalculate container size
        setTimeout(() => {
            scoresMap.invalidateSize();
            if (communityMarkers.length > 0 && resourceMarkers.length === 0) {
                const group = new L.featureGroup(communityMarkers);
                scoresMap.fitBounds(group.getBounds().pad(0.1));
            }
        }, 150);
    }
};

function initScoresMap() {
    console.log("Initializing Community Map...");
    
    // Initial center
    scoresMap = L.map('scores-map', {
        center: [28.5, 81.3],
        zoom: 8,
        zoomControl: false
    });
    
    // Custom Zoom Control at bottom left
    L.control.zoom({ position: 'bottomleft' }).addTo(scoresMap);
    
    // Custom Scale at bottom right (Stacked above legend)
    const scale = L.control.scale({ 
        position: 'bottomright',
        imperial: false,
        maxWidth: 150
    }).addTo(scoresMap);
    
    // Always show scale bar
    if (scale.getContainer()) scale.getContainer().style.visibility = 'visible';

    // Dark/Light theme tiles (Standard)
    const isLight = document.body.classList.contains('light');
    const tileUrl = isLight 
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
        
    scoresMapBaseLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; CartoDB',
        maxZoom: 19
    });

    // High Quality Google Satellite Layer (Default)
    satelliteMapLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
        maxZoom: 21
    }).addTo(scoresMap);

    // Populate Community Dropdown
    const select = document.getElementById('map-community-select');
    if (select) {
        select.innerHTML = '<option value="">Select Community...</option>';
        communities.forEach(comm => {
            const opt = document.createElement('option');
            opt.value = comm;
            opt.innerText = comm;
            select.appendChild(opt);
        });
    }

    renderAllCommunityMarkers();
    updateMapLegend(''); // Force global legend on load
}

function renderAllCommunityMarkers() {
    // Clear existing
    communityMarkers.forEach(m => scoresMap.removeLayer(m));
    communityMarkers = [];
    resourceMarkers.forEach(m => scoresMap.removeLayer(m));
    resourceMarkers = [];

    const rawRef = window.communitiesDataStaticRaw || (typeof communitiesDataStaticRaw !== 'undefined' ? communitiesDataStaticRaw : null);
    if (!rawRef || !rawRef.data) {
        console.error("No community data found for mapping.");
        return;
    }

    // Custom SVG Pin Icon for Communities
    const communityIcon = L.divIcon({
        className: 'comm-pin-icon',
        html: `
            <svg width="18" height="25" viewBox="0 0 30 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill="#14a3a3"/>
                <circle cx="15" cy="15" r="7" fill="white"/>
            </svg>`,
        iconSize: [18, 25],
        iconAnchor: [9, 25],
        popupAnchor: [0, -24]
    });

    rawRef.data.forEach(row => {
        const c = parseCsvRow(row);
        if (c.length < 7) return;

        const name = c[1].replace(/"/g,'').trim();
        const lat = parseFloat(c[6]);
        const lng = parseFloat(c[7]);

        if (!isNaN(lat) && !isNaN(lng)) {
            const marker = L.marker([lat, lng], {
                icon: communityIcon,
                riseOnHover: true
            }).addTo(scoresMap);

            marker.bindPopup(`
                <div style="font-family: inherit; padding: 5px; min-width:180px;">
                    <b style="color:#14a3a3; font-size:1.1rem; display:block; margin-bottom:4px;">${name}</b>
                    <span style="font-size:12px; color:#888;">Chowk</span>
                    <div style="margin-top:12px;">
                        <button onclick="handleMapCommunityChange('${name.replace(/'/g, "\\'")}')" 
                                style="background:#14a3a3; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:600; width:100%; box-shadow: 0 4px 10px rgba(20, 163, 163,0.3);">
                            Enter a Community
                        </button>
                    </div>
                </div>
            `);
            communityMarkers.push(marker);
        }
    });

    if (communityMarkers.length > 0) {
        const group = new L.featureGroup(communityMarkers);
        scoresMap.fitBounds(group.getBounds().pad(0.1));
    }
}

window.handleMapCommunityChange = function(commName) {
    if (!scoresMap) return; // Prevention: Don't run reset logic if map wasn't initialized
    
    // Sync dropdown immediately
    const select = document.getElementById('map-community-select');
    if (select) select.value = commName || "";

    // Sync header immediately
    const header = document.getElementById('map-community-header');
    if (header) header.innerText = commName || "Nepal";

    // Toggle Legend and Scale visibility
    const legend = document.getElementById('map-legend');
    
    // Move legend into leaflet control container on first run to ensure stacking
    const ctrlCorner = document.querySelector('.leaflet-bottom.leaflet-right');
    if (ctrlCorner && legend && legend.parentElement !== ctrlCorner) {
        ctrlCorner.appendChild(legend);
        legend.style.position = 'static'; // Reset from absolute
        legend.style.margin = '0';
    }

    if (commName) {
        if (legend) legend.classList.remove('hidden');
    } else {
        if (legend) legend.classList.add('hidden');
    }

    if (!commName) {
        if (header) header.innerText = "Nepal";
        renderAllCommunityMarkers();
        return;
    }

    const rawRef = window.communitiesDataStaticRaw || (typeof communitiesDataStaticRaw !== 'undefined' ? communitiesDataStaticRaw : null);
    if (!rawRef || !rawRef.data) return;
    
    const row = rawRef.data.find(r => parseCsvRow(r)[1].replace(/"/g,'').trim() === commName);
    
    if (row) {
        const c = parseCsvRow(row);
        const lat = parseFloat(c[6]);
        const lng = parseFloat(c[7]);
        
        scoresMap.closePopup();
        // Removed hardcoded setView(..., 17) - will use fitBounds after resources load

        // Hide ALL community markers to focus solely on resources
        communityMarkers.forEach(m => scoresMap.removeLayer(m));

        if (typeof selectItem === 'function') {
            selectItem('community', commName);
        }

        updateMapLegend(commName);
        renderResourceMarkers(commName);
    }
};

function updateMapLegend(commName) {
    const legendContainer = document.getElementById('map-legend-items');
    if (!legendContainer) return;

    let resources = [];
    if (commName && typeof COMMUNITY_RESOURCES !== 'undefined') {
        resources = COMMUNITY_RESOURCES[commName] || [];
    } else if (typeof COMMUNITY_RESOURCES !== 'undefined') {
        // Aggregate all resources from all communities for "Global" view
        Object.values(COMMUNITY_RESOURCES).forEach(list => {
            resources = resources.concat(list);
        });
    }
    
    // Get unique normalized types
    let typesSet = new Set();
    resources.forEach(r => {
        if (r.type) {
            let t = r.type.trim();
            // Normalize: Infrastructures -> Infrastructure
            if (t === 'Infrastructures') t = 'Infrastructure';
            typesSet.add(t);
        }
    });
    
    // Filter out Extent and Community from the legend list
    const excludedTypes = ['Extent', 'Community'];
    const types = [...typesSet].filter(t => t && !excludedTypes.includes(t));
    types.sort();

    legendContainer.innerHTML = types.map(type => {
        const symbolPath = getResourceSymbol(type);
        const typeColor = getResourceColor(type);
        return `
            <div class="map-legend-item" data-type="${type}" 
                 style="color: #ffffff; font-weight: 600;"
                 onmouseenter="hoverMapLegend('${type}')" 
                 onmouseleave="hoverMapLegend(null)" 
                 onclick="clickMapLegend('${type}')">
                <div style="width: 22px; height: 22px; background: ${typeColor}; border: 1.5px solid #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                    <img src="${symbolPath}" style="width: 12px; height: 12px; object-fit: contain; filter: brightness(0) invert(1);" 
                         onerror="this.src='${RESOURCE_SYMBOLS["Default"]}'">
                </div>
                ${type}
            </div>
        `;
    }).join('');

}

function renderResourceMarkers(commName) {
    resourceMarkers.forEach(m => scoresMap.removeLayer(m));
    resourceMarkers = [];

    const resources = (typeof COMMUNITY_RESOURCES !== 'undefined') ? (COMMUNITY_RESOURCES[commName] || []) : [];

    // --- NEW: Add the main Chowk marker automatically ---
    const rawData = window.communitiesDataStaticRaw || (typeof communitiesDataStaticRaw !== 'undefined' ? communitiesDataStaticRaw : null);
    if (rawData && rawData.data) {
        const row = rawData.data.find(r => r[1].replace(/"/g,'').trim() === commName);
        if (row) {
            const rowArr = parseCsvRow(row);
            const cLat = parseFloat(rowArr[6]);
            const cLng = parseFloat(rowArr[7]);
            if (!isNaN(cLat) && !isNaN(cLng)) {
                resources.unshift({ 
                    name: commName + " Center", 
                    type: "Community", 
                    lat: cLat, 
                    lng: cLng 
                });
            }
        }
    }


    resources.forEach(res => {
        const symbolPath = getResourceSymbol(res.type);
        const resColor = getResourceColor(res.type);
        
        const marker = L.marker([res.lat, res.lng], {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: `
                    <div style="width: 19px; height: 19px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: ${resColor}; border: 1.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4); transform: translateY(-3px);">
                        <img src="${symbolPath}" 
                             style="width: 11px; height: 11px; object-fit: contain; filter: brightness(0) invert(1);"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                        <span style="display:none; font-size: 10px;">📍</span>
                    </div>`,
                iconSize: [19, 19],
                iconAnchor: [9.5, 19]
            })
        }).addTo(scoresMap);
        
        marker.resourceType = res.type; // Attach type for legend interaction
        marker.bindPopup(`<b style="color:${resColor}">${res.name}</b><br><span style="color:#888; font-size:0.8rem;">${res.type}</span>`);
        
        // --- NEW: Apply current highlight if this type is active ---
        if (highlightedType && res.type === highlightedType) {
            setTimeout(() => {
                const el = marker.getElement();
                if (el) el.classList.add('map-marker-highlight');
            }, 10);
            marker.setZIndexOffset(2000);
        }

        // Add bidirectional interaction: Markers -> Legend
        marker.on('mouseover', function() {
            window.hoverMapLegend(marker.resourceType);
        });
        marker.on('mouseout', function() {
            window.hoverMapLegend(null);
        });
        marker.on('click', function(e) {
            // Toggle highlight for category
            window.clickMapLegend(marker.resourceType);
            L.DomEvent.stopPropagation(e);
        });

        resourceMarkers.push(marker);
    });

    // Sync legend visuals if a type is already highlighted
    if (highlightedType) {
        window.clickMapLegend(highlightedType, true); // Re-run to ensure legend UI is synced
    }

    // Zoom to extent of all points in this community
    if (resourceMarkers.length > 0 && scoresMap) {
        const group = new L.featureGroup(resourceMarkers);
        scoresMap.fitBounds(group.getBounds().pad(0.3), { 
            animate: true,
            maxZoom: 18 // Prevent over-zooming on single points
        });
    }
}

// Legend Interaction Logic
let highlightedType = null;

window.hoverMapLegend = function(type) {
    resourceMarkers.forEach(m => {
        const el = m.getElement();
        if (!el) return;
        
        // Remove react class from all first
        el.classList.remove('map-marker-react');
        
        if (type && m.resourceType === type) {
            el.classList.add('map-marker-react');
            m.setZIndexOffset(2000);
        } else {
            m.setZIndexOffset(0);
        }
    });

    // Mirror hover state on markers back to legend
    document.querySelectorAll('.map-legend-item').forEach(item => {
        const itemType = item.getAttribute('data-type');
        if (type && itemType === type) {
            item.style.background = 'rgba(255, 255, 255, 0.1)';
            item.style.color = '#fff';
            item.style.transform = 'translateX(12px) scale(1.02)';
        } else {
            item.style.background = '';
            item.style.color = '';
            item.style.transform = '';
        }
    });
};

window.clickMapLegend = function(type, bypassToggle = false) {
    if (!bypassToggle) {
        if (highlightedType === type) {
            highlightedType = null; // Toggle off
        } else {
            highlightedType = type;
        }
    }

    resourceMarkers.forEach(m => {
        const el = m.getElement();
        if (!el) return;
        
        el.classList.remove('map-marker-highlight');
        
        if (highlightedType && m.resourceType === highlightedType) {
            el.classList.add('map-marker-highlight');
            m.setZIndexOffset(2000);
        } else {
            m.setZIndexOffset(0);
        }
    });

    document.querySelectorAll('.map-legend-item').forEach(item => {
        const itemType = item.getAttribute('data-type');
        if (highlightedType && itemType === highlightedType) {
            item.classList.add('active-legend-item');
            item.style.background = 'rgba(20, 163, 163,0.15)';
            item.style.color = '#00e5ff';
            item.style.fontWeight = '700';
            item.style.boxShadow = 'inset 3px 0 0 #14a3a3, 0 0 20px rgba(20, 163, 163, 0.3)';
        } else {
            item.classList.remove('active-legend-item');
            item.style.background = 'transparent';
            item.style.color = 'rgba(255, 255, 255, 0.7)';
            item.style.fontWeight = '500';
            item.style.boxShadow = 'none';
        }
    });
};

window.toggleSatelliteMap = function(isOn) {
    if (!scoresMap || !scoresMapBaseLayer || !satelliteMapLayer) return;

    if (isOn) {
        scoresMap.removeLayer(scoresMapBaseLayer);
        scoresMap.addLayer(satelliteMapLayer);
        satelliteMapLayer.bringToBack();
    } else {
        scoresMap.removeLayer(satelliteMapLayer);
        scoresMap.addLayer(scoresMapBaseLayer);
        scoresMapBaseLayer.bringToBack();
    }
};

// Update Map Theme dynamically
const themeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && scoresMap) {
            const isLight = document.body.classList.contains('light');
            const tileUrl = isLight 
                ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
            
            if (scoresMapBaseLayer) {
                scoresMapBaseLayer.setUrl(tileUrl);
            }
        }
    });
});
themeObserver.observe(document.body, { attributes: true });
