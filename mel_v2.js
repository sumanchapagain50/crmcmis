/**
 * MEL (Monitoring, Evaluation, and Learning) Module - V2 Refined
 * Handles hierarchical reach data (New vs Old) and entity normalization.
 */

// ── Extended Hierarchy Maps ─────────────────────────────
const MUNI_TO_GEO = {}; 
const DIST_TO_GEO = {}; 
const NORM_MAP = {};    

function initExtendedHierarchy() {
    if (Object.keys(MUNI_TO_GEO).length > 0) return; 

    if (typeof GEO_HIERARCHY === 'undefined') {
        console.warn('MEL: GEO_HIERARCHY not found.');
        return;
    }

    GEO_HIERARCHY.allProvinces.forEach(p => {
        const pObj = GEO_HIERARCHY.provinces[p];
        if (!pObj) return;
        Object.keys(pObj).forEach(d => {
            const normD = normalizeEntityName(d);
            DIST_TO_GEO[normD] = { province: p, original: d };
            
            const dObj = pObj[d];
            Object.keys(dObj).forEach(m => {
                const normM = normalizeEntityName(m);
                MUNI_TO_GEO[normM] = { province: p, district: d, original: m };
            });
        });
    });
}

function normalizeEntityName(name) {
    if (!name) return "";
    if (typeof name !== 'string') name = String(name);
    if (NORM_MAP[name]) return NORM_MAP[name];

    let norm = name.toLowerCase()
        .replace(/\b(rural\s+)?municipality\b/g, '')
        .replace(/\brm\b/g, '')
        .replace(/\bpalika\b/g, '')
        .replace(/\bprovince\b/g, '')
        .replace(/\bdistrict\b/g, '')
        .replace(/\(.*\)/g, '') 
        .replace(/\s+/g, '') 
        .trim();
    
    NORM_MAP[name] = norm;
    return norm;
}

/** Robust lookup for hierarchy objects using normalized keys */
function getGeoChild(parentObj, childName) {
    if (!parentObj || !childName) return null;
    const normSearch = normalizeEntityName(childName);
    if (parentObj[childName]) return parentObj[childName];
    for (let key in parentObj) {
        if (normalizeEntityName(key) === normSearch) return parentObj[key];
    }
    return null;
}

// ── Lifecycle ───────────────────────────────────────────

let melInitialized = false;

window.initMelView = function() {
    initExtendedHierarchy();
    if (!melInitialized) {
        populateMelHierarchy();
        populateMelTimeFilters();
        melInitialized = true;
    }
    renderMelData();
};

function populateMelHierarchy() {
    const provSelect = document.getElementById('mel-province');
    if (!provSelect) return;

    // Provinces never change their content
    provSelect.innerHTML = `<option value="">All Provinces</option>`;
    if (typeof GEO_HIERARCHY !== 'undefined') {
        GEO_HIERARCHY.allProvinces.sort().forEach(p => {
            let opt = document.createElement('option');
            opt.value = p; opt.innerText = p; provSelect.appendChild(opt);
        });
    }

    // Initial population of all downstream
    updateMelFilters('province', true);
}

/** 
 * Central orchestrator for geographic filtering.
 * Supports bi-directional cascading: selecting a child level updates parents.
 */
window.updateMelFilters = function(level, skipRender = false) {
    const pEl = document.getElementById('mel-province');
    const dEl = document.getElementById('mel-district');
    const mEl = document.getElementById('mel-municipality');
    const cEl = document.getElementById('mel-community');

    if (!pEl) return;

    // 1. BOTTOM-UPContext sync: If a lower level is selected, identify and set its parents.
    if (level === 'community' && cEl.value) {
        const geo = GEO_HIERARCHY.communityToGeo[cEl.value];
        if (geo) {
            pEl.value = geo.province;
            refreshMelDropdown('district'); // Ensure the list exists so we can select the value
            dEl.value = geo.district;
            refreshMelDropdown('municipality');
            mEl.value = geo.municipality;
        }
    } else if (level === 'municipality' && mEl.value) {
        const normM = normalizeEntityName(mEl.value);
        const geo = MUNI_TO_GEO[normM];
        if (geo) {
            pEl.value = geo.province;
            refreshMelDropdown('district');
            dEl.value = geo.district;
        }
        // When municipality changes, reset community to "All" to avoid cross-municipality mismatch
        cEl.value = ""; 
    } else if (level === 'district' && dEl.value) {
        const normD = normalizeEntityName(dEl.value);
        const geo = DIST_TO_GEO[normD];
        if (geo) {
            pEl.value = geo.province;
        }
        // Reset downstream
        mEl.value = "";
        cEl.value = "";
    } else if (level === 'province') {
        // Reset downstream
        dEl.value = "";
        mEl.value = "";
        cEl.value = "";
    }

    // 2. Refresh all dropdown lists based on current state of parents
    // Even if we moved bottom-up, we need to ensure the lists are filtered consistently.
    if (level === 'province') refreshMelDropdown('district');
    if (level === 'province' || level === 'district') refreshMelDropdown('municipality');
    refreshMelDropdown('community');

    if (!skipRender) renderMelData();
};

/** Refreshes the options of a specific dropdown based on its parents */
function refreshMelDropdown(targetLevel) {
    const pVal = document.getElementById('mel-province').value;
    const dVal = document.getElementById('mel-district').value;
    const mVal = document.getElementById('mel-municipality').value;
    const targetEl = document.getElementById('mel-' + targetLevel);
    if (!targetEl) return;

    const currentVal = targetEl.value;
    let options = [];

    if (targetLevel === 'district') {
        targetEl.innerHTML = `<option value="">All Districts</option>`;
        const provData = getGeoChild(GEO_HIERARCHY.provinces, pVal);
        options = provData ? Object.keys(provData).sort() : GEO_HIERARCHY.allDistricts;
    } 
    else if (targetLevel === 'municipality') {
        targetEl.innerHTML = `<option value="">All Municipalities</option>`;
        const provData = getGeoChild(GEO_HIERARCHY.provinces, pVal);
        const distData = getGeoChild(provData, dVal);
        options = distData ? Object.keys(distData).sort() : GEO_HIERARCHY.allMunicipalities;
    } 
    else if (targetLevel === 'community') {
        targetEl.innerHTML = `<option value="">All Communities</option>`;
        const provData = getGeoChild(GEO_HIERARCHY.provinces, pVal);
        const distData = getGeoChild(provData, dVal);
        const muniData = getGeoChild(distData, mVal);
        
        if (Array.isArray(muniData)) {
            options = muniData.sort();
        } else if (!mVal && !dVal && !pVal) {
            options = Object.keys(GEO_HIERARCHY.communityToGeo).sort();
        } else {
            // Complex case: show all communities that match the active filters
            options = Object.keys(GEO_HIERARCHY.communityToGeo).filter(comm => {
                const geo = GEO_HIERARCHY.communityToGeo[comm];
                if (pVal && geo.province !== pVal) return false;
                if (dVal && geo.district !== dVal) return false;
                if (mVal && geo.municipality !== mVal) return false;
                return true;
            }).sort();
        }
    }

    options.forEach(optVal => {
        let opt = document.createElement('option');
        opt.value = optVal; opt.innerText = optVal; targetEl.appendChild(opt);
    });

    // Try to restore previous value
    targetEl.value = currentVal;
    if (targetEl.value !== currentVal) targetEl.value = "";
}

function populateMelTimeFilters() {
    const yearSelect = document.getElementById('mel-year');
    const qtrSelect = document.getElementById('mel-quarter');
    if (!yearSelect || !qtrSelect) return;

    const years = new Set();
    if (typeof SAMPLE_ACTIVITIES !== 'undefined') {
        SAMPLE_ACTIVITIES.forEach(a => {
            if (Array.isArray(a.year)) a.year.forEach(y => years.add(String(y)));
            else if (a.year) years.add(String(a.year));
        });
    }

    yearSelect.innerHTML = `<option value="">All Years</option>`;
    [...years].sort().reverse().forEach(y => {
        let opt = document.createElement('option');
        opt.value = y; opt.innerText = y; yearSelect.appendChild(opt);
    });

    qtrSelect.innerHTML = `
        <option value="">All Quarters</option>
        <option value="Q1">Q1</option>
        <option value="Q2">Q2</option>
        <option value="Q3">Q3</option>
        <option value="Q4">Q4</option>
    `;
}

// ── Calculation ─────────────────────────────────────────

// ── Global State for MEL ──────────────────────────────────
let melSortState = { col: 'quarter', dir: 'desc' };
let melDataCache = []; // Cache for current filtered results to allow re-sorting
let melViewState = 'table'; 

window.switchMelView = function(view) {
    melViewState = view;
    
    // Update active tab buttons
    document.getElementById('mel-btn-table').classList.toggle('active', view === 'table');
    document.getElementById('mel-btn-dash').classList.toggle('active', view === 'dashboard');
    
    // Toggle containers
    document.getElementById('mel-table-view').classList.toggle('active', view === 'table');
    document.getElementById('mel-dashboard-view').classList.toggle('active', view === 'dashboard');
    
    // Toggle Search Bar (only show for table)
    const searchRow = document.querySelector('.mel-search-row');
    if (searchRow) searchRow.style.display = (view === 'table') ? 'block' : 'none';

    // Re-render data for the new view
    renderMelData();
};

window.handleMelSort = function(col) {
    if (melSortState.col === col) {
        melSortState.dir = melSortState.dir === 'asc' ? 'desc' : 'asc';
    } else {
        melSortState.col = col;
        melSortState.dir = 'asc';
    }
    renderMelTable(melDataCache);
};

window.renderMelData = function() {
    const provinceEl = document.getElementById('mel-province');
    const districtEl = document.getElementById('mel-district');
    const muniEl = document.getElementById('mel-municipality');
    const commEl = document.getElementById('mel-community');
    const yearEl = document.getElementById('mel-year');
    const qtrEl = document.getElementById('mel-quarter');

    if (!provinceEl || !districtEl) return;

    const f = {
        province: provinceEl.value,
        district: districtEl.value,
        municipality: muniEl.value,
        community: commEl.value,
        year: yearEl.value,
        quarter: qtrEl.value,
        search: document.getElementById('mel-search-input')?.value.toLowerCase().trim() || ""
    };

    const normF = {
        province: normalizeEntityName(f.province),
        district: normalizeEntityName(f.district),
        municipality: normalizeEntityName(f.municipality),
        community: normalizeEntityName(f.community)
    };

    let metrics = { newM: 0, newW: 0, oldM: 0, oldW: 0 };
    const trendData = {};
    const filteredRows = [];

    if (typeof SAMPLE_ACTIVITIES === 'undefined') return;

    SAMPLE_ACTIVITIES.forEach(act => {
        if (!act.breakdown) return;

        act.breakdown.forEach(b => {
            const bEntities = b.entities || b.communities || [];
            
            // Fallback to scope-level entities if breakdown list is empty
            if (bEntities.length === 0) {
                if (act.scope === 'Province' && act.province) bEntities.push(...(Array.isArray(act.province) ? act.province : [act.province]));
                else if (act.scope === 'District' && act.district) bEntities.push(...(Array.isArray(act.district) ? act.district : [act.district]));
                else if (act.scope === 'Municipality' && act.municipality) bEntities.push(...(Array.isArray(act.municipality) ? act.municipality : [act.municipality]));
                else if (act.scope === 'Community' && act.communities) bEntities.push(...(Array.isArray(act.communities) ? act.communities : [act.communities]));
            }

            let breakdownInScope = false;
            let timeMatch = true;
            if (f.year && !b.quarter.startsWith(f.year)) timeMatch = false;
            if (f.quarter && !b.quarter.endsWith(f.quarter)) timeMatch = false;

            if (!timeMatch) return;

            // Check each entity in this breakdown
            bEntities.forEach(ent => {
                const normE = normalizeEntityName(ent);
                const geo = GEO_HIERARCHY.communityToGeo[ent];
                const muniGeo = MUNI_TO_GEO[normE];
                const distGeo = DIST_TO_GEO[normE];

                // Resolve full hierarchy for this specific entity
                let rowGeo = { comm: "", muni: "", dist: "", prov: "" };
                
                const isKnownProv = GEO_HIERARCHY.allProvinces.includes(ent);
                
                if (geo) {
                    rowGeo = { comm: ent, muni: geo.municipality, dist: geo.district, prov: geo.province };
                } else if (muniGeo) {
                    rowGeo = { comm: "", muni: ent, dist: muniGeo.district, prov: muniGeo.province };
                } else if (distGeo) {
                    rowGeo = { comm: "", muni: "", dist: ent, prov: distGeo.province };
                } else if (isKnownProv) {
                    rowGeo = { comm: "", muni: "", dist: "", prov: ent };
                } else {
                    // Unknown entity - Apply asterisk and try to categorize using activity metadata/scope
                    const label = ent + "*";
                    
                    // Categorize based on where the name is found in activity metadata or its scope
                    const inProv = (act.province || []).includes(ent);
                    const inDist = (act.district || []).includes(ent);
                    const inMuni = (act.municipality || []).includes(ent);
                    const inComm = (act.communities || []).includes(ent);

                    if (inProv || (act.scope === 'Province' && !inDist && !inMuni && !inComm)) {
                        rowGeo = { comm: "", muni: "", dist: "", prov: label };
                    } else if (inDist || (act.scope === 'District' && !inMuni && !inComm)) {
                        rowGeo = { comm: "", muni: "", dist: label, prov: "" };
                    } else if (inMuni || (act.scope === 'Municipality' && !inComm)) {
                        rowGeo = { comm: "", muni: label, dist: "", prov: "" };
                    } else {
                        rowGeo = { comm: label, muni: "", dist: "", prov: "" };
                    }

                    // Fill in known parents from activity-level metadata
                    if (!rowGeo.prov && act.province) rowGeo.prov = Array.isArray(act.province) ? act.province[0] : act.province;
                    if (!rowGeo.dist && act.district) rowGeo.dist = Array.isArray(act.district) ? act.district[0] : act.district;
                    if (!rowGeo.muni && act.municipality && !inMuni) rowGeo.muni = Array.isArray(act.municipality) ? act.municipality[0] : act.municipality;
                }

                // Filter logic: Only keep if it matches all active geographic filters
                let matchesFilter = true;
                if (normF.province && normalizeEntityName(rowGeo.prov) !== normF.province) matchesFilter = false;
                if (normF.district && normalizeEntityName(rowGeo.dist) !== normF.district) matchesFilter = false;
                if (normF.municipality && normalizeEntityName(rowGeo.muni) !== normF.municipality) matchesFilter = false;
                if (normF.community && normalizeEntityName(rowGeo.comm) !== normF.community) matchesFilter = false;

                if (matchesFilter) {
                    // Search bar check
                    if (f.search) {
                        const dataString = `${act.name} ${rowGeo.comm} ${rowGeo.muni} ${rowGeo.dist} ${rowGeo.prov} ${b.quarter}`.toLowerCase();
                        if (!dataString.includes(f.search)) matchesFilter = false;
                    }
                }

                if (matchesFilter) {
                    breakdownInScope = true; // Mark that at least ONE entity in this breakdown matched
                    
                    filteredRows.push({
                        ...rowGeo,
                        newM: b.newMen || 0,
                        newW: b.newWomen || 0,
                        oldM: b.oldMen || 0,
                        oldW: b.oldWomen || 0,
                        activity: act.name,
                        quarter: b.quarter
                    });
                }
            });

            if (breakdownInScope) {
                metrics.newM += (b.newMen || 0);
                metrics.newW += (b.newWomen || 0);
                metrics.oldM += (b.oldMen || 0);
                metrics.oldW += (b.oldWomen || 0);

                const q = b.quarter;
                if (!trendData[q]) trendData[q] = { new: 0, old: 0 };
                trendData[q].new += (b.newMen || 0) + (b.newWomen || 0);
                trendData[q].old += (b.oldMen || 0) + (b.oldWomen || 0);
            }
        });
    });

    // Sort by latest quarter first (default)
    filteredRows.sort((a, b) => b.quarter.localeCompare(a.quarter));
    
    melDataCache = filteredRows; // Update cache

    updateMelUI(metrics, trendData, filteredRows);
};

function updateMelUI(m, trend, rows) {
    if (melViewState === 'table') {
        renderMelTable(rows);
    } else {
        renderDoubleComparison(m);
    }
}

function renderDoubleComparison(m) {
    const container = document.getElementById('mel-reach-bar-chart');
    if (!container) return;

    const maxVal = Math.max(m.newM, m.newW, m.oldM, m.oldW, 1);
    const data = [
        { label: 'New Men', val: m.newM, color: '#4facfe', type: 'New' },
        { label: 'New Women', val: m.newW, color: '#f093fb', type: 'New' },
        { label: 'Old Men', val: m.oldM, color: '#3b82f6', type: 'Returning' },
        { label: 'Old Women', val: m.oldW, color: '#ec4899', type: 'Returning' }
    ];

    let svg = `<svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">`;
    data.forEach((d, i) => {
        const h = (d.val / maxVal) * 160;
        const x = 40 + i * 82;
        const y = 200 - h;
        const tooltipText = `<strong>${d.label}</strong><br/>Reach: ${d.val.toLocaleString()}<br/>Type: ${d.type}`;
        
        svg += `
            <rect class="mel-bar" x="${x}" y="${y}" width="48" height="${h}" fill="${d.color}" rx="6"
                  onmouseenter="showMelTooltip(event, '${tooltipText}')"
                  onmousemove="moveMelTooltip(event)"
                  onmouseleave="hideMelTooltip()">
            </rect>
            <text x="${x + 24}" y="225" text-anchor="middle" fill="#777" font-size="10" font-weight="600">${d.label.split(' ')[1]}</text>
            <text x="${x + 24}" y="${y - 12}" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">${d.val.toLocaleString()}</text>
        `;
    });
    svg += `</svg>`;
    container.innerHTML = svg;
}

function renderTrendChartComplex(trend) {
    const container = document.getElementById('reach-trend-chart');
    if (!container) return;

    const qs = Object.keys(trend).sort();
    if (qs.length === 0) {
        container.innerHTML = `<div style="color:#666; display:flex; justify-content:center; align-items:center; height:100%;">No reach trend data.</div>`;
        return;
    }

    const maxVal = Math.max(...qs.map(q => trend[q].new + trend[q].old), 1);
    const w = 400, h = 180, p = 40;

    let newPts = "", oldPts = "";
    qs.forEach((q, i) => {
        const x = p + (i * (w - 2 * p) / (qs.length - 1 || 1));
        const yN = h - p - (trend[q].new / maxVal * (h - 2 * p));
        const yO = h - p - (trend[q].old / maxVal * (h - 2 * p));
        if (i === 0) { newPts += `${x},${yN}`; oldPts += `${x},${yO}`; }
        else { newPts += ` L${x},${yN}`; oldPts += ` L${x},${yO}`; }
    });

    let svg = `<svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
        <path d="M${oldPts}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4" style="opacity:0.4" />
        <path d="M${newPts}" fill="none" stroke="#14a3a3" stroke-width="3" />
        ${qs.map((q, i) => {
            const x = p + (i * (w-2*p) / (qs.length - 1 || 1));
            const y = h - p - (trend[q].new / maxVal * (h - 2 * p));
            const t = trend[q];
            const tooltipText = `<strong>${q}</strong><br/>New: ${t.new}<br/>Returning: ${t.old}<br/>Total: ${t.new+t.old}<br/><small>(Click to filter)</small>`;
            
            return `
                <circle cx="${x}" cy="${y}" r="7" fill="#14a3a3" stroke="#fff" stroke-width="2" style="cursor:pointer"
                        onmouseenter="showMelTooltip(event, '${tooltipText}')"
                        onmousemove="moveMelTooltip(event)"
                        onmouseleave="hideMelTooltip()"
                        onclick="setMelQuarter('${q}')">
                </circle>
                <text x="${x}" y="210" text-anchor="middle" fill="#777" font-size="9" font-weight="600" transform="rotate(-40, ${x}, 210)">${q}</text>`;
        }).join('')}
        <g transform="translate(10, 15)">
            <line x1="0" y1="0" x2="12" y2="0" stroke="#14a3a3" stroke-width="3" />
            <text x="16" y="4" fill="#14a3a3" font-size="9" font-weight="600">NEW</text>
            <line x1="50" y1="0" x2="62" y2="0" stroke="#64748b" stroke-width="2" stroke-dasharray="2" />
            <text x="66" y="4" fill="#64748b" font-size="9" font-weight="600">OLD</text>
        </g>
    </svg>`;

    container.innerHTML = svg;
}

function renderMelTable(rows) {
    const tbody = document.querySelector('#mel-breakdown-table tbody');
    if (!tbody) return;

    // 1. Apply Sorting
    const { col, dir } = melSortState;
    const sorted = [...rows].sort((a, b) => {
        let valA = a[col] || "";
        let valB = b[col] || "";
        
        // Handle numeric sorting
        if (typeof valA === 'number' && typeof valB === 'number') {
            return dir === 'asc' ? valA - valB : valB - valA;
        }
        
        // String sort
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });

    // 2. Calculate Totals
    const t = { nM: 0, nW: 0, oM: 0, oW: 0 };
    rows.forEach(r => {
        t.nM += r.newM; t.nW += r.newW;
        t.oM += r.oldM; t.oW += r.oldW;
    });

    // 3. Update Headers Sort UI
    document.querySelectorAll('#mel-breakdown-table th').forEach(th => {
        const c = th.getAttribute('data-col');
        th.classList.toggle('active-sort', c === col);
        th.classList.remove('sort-asc', 'sort-desc');
        if (c === col) th.classList.add('sort-' + dir);
    });

    // 4. Build Table Content
    let html = `
        <tr class="mel-total-row">
            <td colspan="4"><strong>TOTAL (Filtered)</strong></td>
            <td colspan="2"></td>
            <td class="total-val">${t.nM.toLocaleString()}</td>
            <td class="total-val">${t.nW.toLocaleString()}</td>
            <td class="total-val">${t.oM.toLocaleString()}</td>
            <td class="total-val">${t.oW.toLocaleString()}</td>
        </tr>
    `;

    html += sorted.map(r => {
        return `
            <tr>
                <td>${r.comm || ""}</td>
                <td>${r.muni || ""}</td>
                <td>${r.dist || ""}</td>
                <td>${r.prov || ""}</td>
                <td><strong>${r.activity}</strong></td>
                <td>${r.quarter}</td>
                <td>${r.newM}</td>
                <td>${r.newW}</td>
                <td>${r.oldM}</td>
                <td>${r.oldW}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;

    if (rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:40px; color:#666;">No results.</td></tr>`;
    }
}

/** 
 * Resets all MEL filters to 'All'
 */
window.resetMelFilters = function() {
    ['province', 'district', 'municipality', 'community', 'year', 'quarter'].forEach(id => {
        const el = document.getElementById('mel-' + id);
        if (el) el.value = "";
    });
    // Re-initialize lists
    populateMelHierarchy();
    renderMelData();
};

/** 
 * Sets the year and quarter filters based on a clicked trend point
 */
window.setMelQuarter = function(qLabel) {
    const parts = qLabel.split('-'); // e.g. "2024-Q1"
    if (parts.length === 2) {
        document.getElementById('mel-year').value = parts[0];
        document.getElementById('mel-quarter').value = parts[1];
        renderMelData();
    }
};

// ── CUSTOM TOOLTIP SYSTEM ───────────────────────────────

let melTooltip = null;

window.showMelTooltip = function(e, content) {
    if (!melTooltip) {
        melTooltip = document.createElement('div');
        melTooltip.className = 'mel-tooltip';
        document.body.appendChild(melTooltip);
    }
    melTooltip.innerHTML = content;
    melTooltip.style.display = 'block';
    moveMelTooltip(e);
};

window.moveMelTooltip = function(e) {
    if (!melTooltip) return;
    melTooltip.style.left = (e.pageX + 15) + 'px';
    melTooltip.style.top = (e.pageY - 15) + 'px';
};

window.hideMelTooltip = function() {
    if (melTooltip) melTooltip.style.display = 'none';
};
