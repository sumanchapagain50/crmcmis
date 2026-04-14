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
    let demoMetrics = { totalPop: 0, hhs: 0, children: 0, elderly: 0, disabilities: 0, male: 0, female: 0 };
    const trendData = {};
    const filteredRows = [];

    // 1. Calculate Demographic (Static) Metrics for selected scope
    if (typeof communitiesDataStaticRaw !== 'undefined') {
        const commLines = communitiesDataStaticRaw.data;
        const seenComms = new Set();

        commLines.forEach(line => {
            // Robust CSV split handles quoted commas in community names
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
            if (parts.length < 20) return;

            const name = parts[1].replace(/^"|"$/g, '').trim();
            const geo = GEO_HIERARCHY.communityToGeo[name];
            if (!geo) return;

            // Check if community is in the current geographic focus
            let inFocus = true;
            if (normF.province && normalizeEntityName(geo.province) !== normF.province) inFocus = false;
            if (normF.district && normalizeEntityName(geo.district) !== normF.district) inFocus = false;
            if (normF.municipality && normalizeEntityName(geo.municipality) !== normF.municipality) inFocus = false;
            if (normF.community && normalizeEntityName(name) !== normF.community) inFocus = false;

            if (inFocus && !seenComms.has(name)) {
                seenComms.add(name);
                demoMetrics.totalPop += (parseInt(parts[14]) || 0);
                demoMetrics.male += (parseInt(parts[15]) || 0);
                demoMetrics.female += (parseInt(parts[16]) || 0);
                demoMetrics.children += (parseInt(parts[17]) || 0);
                demoMetrics.elderly += (parseInt(parts[18]) || 0);
                demoMetrics.disabilities += (parseInt(parts[19]) || 0);
                demoMetrics.hhs += (parseInt(parts[20]) || 0);
            }
        });
    }

    // 3. Process Activity Data for Metrics & Trend
    const processedBreakdowns = new Set(); // To avoid double-counting reach when multiple entities in one breakdown match filters

    SAMPLE_ACTIVITIES.forEach(act => {
        if (!act.breakdown) return;

        act.breakdown.forEach((b, bIdx) => {
            const bKey = `${act.name}-${b.quarter}-${bIdx}`;
            const bEntities = b.entities || b.communities || [];
            
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

            bEntities.forEach(ent => {
                const normE = normalizeEntityName(ent);
                const geo = GEO_HIERARCHY.communityToGeo[ent];
                const muniGeo = MUNI_TO_GEO[normE];
                const distGeo = DIST_TO_GEO[normE];

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
                    const label = ent + "*";
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

                    if (!rowGeo.prov && act.province) rowGeo.prov = Array.isArray(act.province) ? act.province[0] : act.province;
                    if (!rowGeo.dist && act.district) rowGeo.dist = Array.isArray(act.district) ? act.district[0] : act.district;
                    if (!rowGeo.muni && act.municipality && !inMuni) rowGeo.muni = Array.isArray(act.municipality) ? act.municipality[0] : act.municipality;
                }

                let matchesFilter = true;
                if (normF.province && normalizeEntityName(rowGeo.prov) !== normF.province) matchesFilter = false;
                if (normF.district && normalizeEntityName(rowGeo.dist) !== normF.district) matchesFilter = false;
                if (normF.municipality && normalizeEntityName(rowGeo.muni) !== normF.municipality) matchesFilter = false;
                if (normF.community && normalizeEntityName(rowGeo.comm) !== normF.community) matchesFilter = false;

                if (matchesFilter && f.search) {
                    const dataString = `${act.name} ${rowGeo.comm} ${rowGeo.muni} ${rowGeo.dist} ${rowGeo.prov} ${b.quarter}`.toLowerCase();
                    if (!dataString.includes(f.search)) matchesFilter = false;
                }

                if (matchesFilter) {
                    breakdownInScope = true;
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

            if (breakdownInScope && !processedBreakdowns.has(bKey)) {
                processedBreakdowns.add(bKey);
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

    filteredRows.sort((a, b) => b.quarter.localeCompare(a.quarter));
    melDataCache = filteredRows;

    // Calculate Cumulative Trend (Sorted chronologically)
    const sortedQs = Object.keys(trendData).sort();
    const cumulativeTrend = {};
    let runningNew = 0, runningOld = 0;
    
    sortedQs.forEach(q => {
        runningNew += trendData[q].new;
        runningOld += trendData[q].old;
        cumulativeTrend[q] = { new: runningNew, old: runningOld };
    });

    updateMelUI(metrics, cumulativeTrend, filteredRows, demoMetrics);
};

function updateMelUI(m, trend, rows, demo) {
    if (melViewState === 'table') {
        renderMelTable(rows);
    } else {
        renderReachKPIs(m, demo);
        renderDoubleComparison(m);
        renderGenderDonut(m, demo);
        renderReachTrend(trend);
        renderVulnerabilityChart(demo);
    }
}

function renderDemoReach(m, demo) {
    const container = document.getElementById('mel-demo-reach');
    if (!container) return;

    const totalReach = m.newM + m.newW + m.oldM + m.oldW;
    const reachM     = m.newM + m.oldM;
    const reachW     = m.newW + m.oldW;

    const segments = [
        { label: 'Total Population', pop: demo.totalPop, reach: totalReach, popColor: '#334155', reachColor: '#14a3a3' },
        { label: 'Male',             pop: demo.male,     reach: reachM,     popColor: '#1d4ed8', reachColor: '#4facfe' },
        { label: 'Female',           pop: demo.female,   reach: reachW,     popColor: '#9333ea', reachColor: '#f093fb' }
    ];

    const maxPop = Math.max(...segments.map(s => s.pop), 1);
    const BAR_H  = 18;
    const GAP    = 38;
    const LEFT   = 130;
    const W      = 340;
    const totalH = segments.length * GAP + 20;

    let svg = `<svg width="100%" height="${totalH}" viewBox="0 0 ${LEFT + W + 10} ${totalH}" preserveAspectRatio="xMinYMid meet">`;

    segments.forEach((s, i) => {
        const y       = 10 + i * GAP;
        const popW    = s.pop   / maxPop * W;
        const reachW2 = s.reach / maxPop * W;
        const popPct  = s.pop   > 0 ? ((s.reach / s.pop) * 100).toFixed(0) : 0;

        svg += `
            <text x="${LEFT - 8}" y="${y + BAR_H * 0.7}" text-anchor="end" font-size="11" fill="#94a3b8" font-weight="600">${s.label}</text>
            <!-- Population bar (background) -->
            <rect x="${LEFT}" y="${y}" width="${popW}" height="${BAR_H}" fill="${s.popColor}" rx="4" opacity="0.35"/>
            <!-- Reach bar (foreground) -->
            <rect x="${LEFT}" y="${y}" width="${reachW2}" height="${BAR_H}" fill="${s.reachColor}" rx="4"/>
            <!-- Pop value -->
            <text x="${LEFT + popW + 5}" y="${y + BAR_H * 0.72}" font-size="10" fill="#64748b">${s.pop.toLocaleString()}</text>
            <!-- Reach badge -->
            ${reachW2 > 24 ? `<text x="${LEFT + Math.min(reachW2 - 4, reachW2)}" y="${y + BAR_H * 0.72}" text-anchor="end" font-size="9" fill="#fff" font-weight="bold">${s.reach.toLocaleString()}</text>` : ''}
            <!-- % label below -->
            <text x="${LEFT}" y="${y + BAR_H + 12}" font-size="9" fill="#64748b">${popPct}% reached</text>
        `;
    });

    // Legend
    svg += `
        <rect x="${LEFT}"     y="${totalH - 10}" width="10" height="6" rx="2" fill="${segments[0].reachColor}"/>
        <text x="${LEFT + 13}" y="${totalH - 3}" font-size="9" fill="#94a3b8">Project Reach</text>
        <rect x="${LEFT + 90}"  y="${totalH - 10}" width="10" height="6" rx="2" fill="${segments[0].popColor}" opacity="0.45"/>
        <text x="${LEFT + 103}" y="${totalH - 3}" font-size="9" fill="#94a3b8">Total Population</text>
    </svg>`;

    container.innerHTML = svg;
}

function renderReachKPIs(m, demo) {
    const container = document.getElementById('mel-kpi-container');
    if (!container) return;

    const totalReach = m.newM + m.newW + m.oldM + m.oldW;
    const coverage = demo.totalPop > 0 ? ((totalReach / demo.totalPop) * 100).toFixed(1) : 0;

    container.innerHTML = `
        <div class="mel-kpi-card">
            <span class="kpi-label">Target Pop</span>
            <span class="kpi-value">${demo.totalPop.toLocaleString()}</span>
            <span class="kpi-subtext">Across processed communities</span>
        </div>
        <div class="mel-kpi-card">
            <span class="kpi-label">Project Reach</span>
            <span class="kpi-value">${totalReach.toLocaleString()}</span>
            <span class="kpi-subtext">${m.newM + m.newW} new, ${m.oldM + m.oldW} returning</span>
        </div>
        <div class="mel-kpi-card">
            <span class="kpi-label">Households</span>
            <span class="kpi-value">${demo.hhs.toLocaleString()}</span>
            <span class="kpi-subtext">Estimated families impacted</span>
        </div>
        <div class="mel-kpi-card">
            <span class="kpi-label">Reach Coverage</span>
            <span class="kpi-value">${coverage}%</span>
            <span class="kpi-subtext">Of target population reached</span>
        </div>
    `;
}

function renderGenderDonut(m, demo) {
    const chartContainer  = document.getElementById('mel-gender-donut');
    const legendContainer = document.getElementById('mel-gender-legend');
    if (!chartContainer) return;

    const men      = m.newM + m.oldM;
    const women    = m.newW + m.oldW;
    const total    = men + women || 1;
    const menPct   = (men   / total * 100).toFixed(1);
    const womenPct = (women / total * 100).toFixed(1);

    // ── Row 2: Horizontal split bar with wipe animation on hover ──
    chartContainer.innerHTML = `
        <div style="width:100%; padding:0 8px; box-sizing:border-box;">

            <!-- Big % labels above bar -->
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:10px;">
                <div>
                    <div style="font-size:2rem; font-weight:900; color:#4facfe; line-height:1;">${menPct}<span style="font-size:1rem;">%</span></div>
                    <div style="font-size:0.65rem; color:#64748b; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">Men</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:2rem; font-weight:900; color:#f093fb; line-height:1;">${womenPct}<span style="font-size:1rem;">%</span></div>
                    <div style="font-size:0.65rem; color:#64748b; font-weight:600; letter-spacing:0.5px; text-transform:uppercase;">Women</div>
                </div>
            </div>

            <!-- Split bar with grow-on-hover segments -->
            <div style="display:flex; height:24px; border-radius:12px; overflow:visible; box-shadow:0 2px 10px rgba(0,0,0,0.4); align-items:center;">
                <div style="width:${menPct}%; height:24px; background:linear-gradient(90deg,#4facfe,#00f2fe); border-radius:12px 0 0 12px; cursor:pointer;"
                     onmouseenter="melGenderGrow(this); showMelTooltip(event,'<strong>Men</strong><br/>Count: ${men.toLocaleString()}<br/>${menPct}% of reach')"
                     onmousemove="moveMelTooltip(event)"
                     onmouseleave="melGenderShrink(this); hideMelTooltip()"></div>
                <div style="width:${womenPct}%; height:24px; background:linear-gradient(90deg,#f093fb,#f5576c); border-radius:0 12px 12px 0; cursor:pointer;"
                     onmouseenter="melGenderGrow(this); showMelTooltip(event,'<strong>Women</strong><br/>Count: ${women.toLocaleString()}<br/>${womenPct}% of reach')"
                     onmousemove="moveMelTooltip(event)"
                     onmouseleave="melGenderShrink(this); hideMelTooltip()"></div>
            </div>

        </div>
    `;

    // ── Row 3: Raw count tiles in legend row ──
    if (legendContainer) {
        legendContainer.innerHTML = `
            <div style="flex:1; background:rgba(79,172,254,0.08); border:1px solid rgba(79,172,254,0.2); border-radius:8px; padding:6px 10px;">
                <div style="font-size:0.62rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:2px; background:#4facfe; margin-right:4px; vertical-align:middle;"></span>Men
                </div>
                <div style="font-size:1.05rem; font-weight:800; color:#4facfe; line-height:1;">${men.toLocaleString()}</div>
            </div>
            <div style="flex:1; background:rgba(240,147,251,0.08); border:1px solid rgba(240,147,251,0.2); border-radius:8px; padding:6px 10px;">
                <div style="font-size:0.62rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:2px;">
                    <span style="display:inline-block; width:7px; height:7px; border-radius:2px; background:#f093fb; margin-right:4px; vertical-align:middle;"></span>Women
                </div>
                <div style="font-size:1.05rem; font-weight:800; color:#f093fb; line-height:1;">${women.toLocaleString()}</div>
            </div>
        `;
    }
}

function renderVulnerabilityChart(demo) {
    const container = document.getElementById('mel-vulnerability-chart');
    if (!container) return;

    const data = [
        { label: 'Children',   val: demo.children,     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
        { label: 'Elderly',    val: demo.elderly,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
        { label: 'Disability', val: demo.disabilities,  color: '#10b981', bg: 'rgba(16,185,129,0.12)' }
    ];

    const maxVal = Math.max(...data.map(d => d.val), 1);
    const popPct = (val) => demo.totalPop > 0 ? ((val / demo.totalPop) * 100).toFixed(1) : '0.0';
    const barPct = (val) => (val / maxVal * 100).toFixed(1);

    container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:14px; width:100%; height:100%; justify-content:center;">
            ${data.map(d => `
                <div class="vuln-row" style="width:100%; cursor:default; border-radius:8px; padding:6px 8px; transition:background 0.2s ease;"
                     data-target="${barPct(d.val)}%"
                     onmouseenter="melVulnWipe(this); this.style.background='${d.bg}'; showMelTooltip(event, '<strong>${d.label}</strong><br/>Count: ${d.val.toLocaleString()}<br/>% of pop: ${popPct(d.val)}%')"
                     onmousemove="moveMelTooltip(event)"
                     onmouseleave="this.style.background='transparent'; hideMelTooltip()">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.82rem;">
                        <span style="font-weight:600; color:#cbd5e1;">${d.label}</span>
                        <span style="font-weight:800; color:${d.color};">${d.val.toLocaleString()}</span>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); height:10px; border-radius:5px; overflow:hidden;">
                        <div class="vuln-bar-fill" style="width:${barPct(d.val)}%; height:100%; background:${d.color}; border-radius:5px;"></div>
                    </div>
                    <div style="font-size:0.62rem; color:#64748b; margin-top:3px;">${popPct(d.val)}% of population</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderReachTrend(trend) {
    renderTrendChartComplex(trend);
}

function renderDoubleComparison(m) {
    const container = document.getElementById('mel-reach-bar-chart');
    if (!container) return;

    const maxVal = Math.max(m.newM, m.newW, m.oldM, m.oldW, 1);
    const data = [
        { label: 'New Participants (Men)',   val: m.newM, color: '#4facfe', bg: 'rgba(79,172,254,0.12)'  },
        { label: 'New Participants (Women)', val: m.newW, color: '#f093fb', bg: 'rgba(240,147,251,0.12)' },
        { label: 'Old Participants (Men)',   val: m.oldM, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
        { label: 'Old Participants (Women)', val: m.oldW, color: '#ec4899', bg: 'rgba(236,72,153,0.12)'  }
    ];

    container.innerHTML = `
        <div style="display:flex; gap:8px; align-items:flex-end; width:100%; height:100%;
                    padding:0 4px; box-sizing:border-box;">
            ${data.map(d => {
                const pct = (d.val / maxVal * 100).toFixed(1);
                return `
                    <div class="reach-col"
                         data-target="${pct}%" data-label="${d.label}" data-val="${d.val}" data-bg="${d.bg}"
                         style="flex:1; display:flex; flex-direction:column; align-items:center;
                                height:100%; cursor:default; border-radius:8px; padding:4px 2px;
                                box-sizing:border-box; transition:background 0.2s ease;">

                        <!-- Value at top -->
                        <div style="font-size:0.72rem; font-weight:800; color:${d.color};
                                    margin-bottom:4px; line-height:1;">${d.val.toLocaleString()}</div>

                        <!-- Bar track (fills remaining height, bar grows from bottom) -->
                        <div style="flex:1; width:70%; min-height:0; position:relative;
                                    background:rgba(255,255,255,0.05); border-radius:6px; overflow:hidden;">
                            <div class="reach-bar-fill"
                                 style="position:absolute; bottom:0; left:0; right:0;
                                        height:${pct}%; background:${d.color};
                                        border-radius:6px 6px 0 0;"></div>
                        </div>

                        <!-- Label at bottom -->
                        <div style="font-size:0.6rem; color:#94a3b8; margin-top:4px;
                                    text-align:center; line-height:1.3;">
                            ${d.label.split(' ').join('<br/>')}
                        </div>
                    </div>`;
            }).join('')}
        </div>
    `;

    // Programmatic events — same pattern as Vulnerability Profile
    container.querySelectorAll('.reach-col').forEach(col => {
        const label  = col.dataset.label;
        const val    = Number(col.dataset.val).toLocaleString();
        const target = col.dataset.target;
        const bg     = col.dataset.bg;
        const bar    = col.querySelector('.reach-bar-fill');

        col.addEventListener('mouseenter', function(e) {
            this.style.background = bg;
            // Wipe bar bottom → top
            if (bar) {
                bar.style.transition = 'none';
                bar.style.height = '0%';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    bar.style.transition = 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    bar.style.height = target;
                }));
            }
            showMelTooltip(e, `<strong>${label}</strong><br/>Reach: ${val}`);
        });
        col.addEventListener('mousemove',  moveMelTooltip);
        col.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            hideMelTooltip();
        });
    });
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

    let newPts = '', oldPts = '';
    qs.forEach((q, i) => {
        const x  = p + (i * (w - 2 * p) / (qs.length - 1 || 1));
        const yN = h - p - (trend[q].new / maxVal * (h - 2 * p));
        const yO = h - p - (trend[q].old / maxVal * (h - 2 * p));
        if (i === 0) { newPts += `${x},${yN}`; oldPts += `${x},${yO}`; }
        else         { newPts += ` L${x},${yN}`; oldPts += ` L${x},${yO}`; }
    });

    // Build circle markup — store data in data-* attrs, no inline events
    const circleMarkup = qs.map((q, i) => {
        const x = p + (i * (w - 2 * p) / (qs.length - 1 || 1));
        const y = h - p - (trend[q].new / maxVal * (h - 2 * p));
        return `
            <circle class="mel-trend-dot" cx="${x}" cy="${y}" r="7"
                    fill="#14a3a3" stroke="#fff" stroke-width="2"
                    data-q="${q}" data-new="${trend[q].new}" data-old="${trend[q].old}"
                    data-total="${trend[q].new + trend[q].old}"
                    style="cursor:pointer;">
            </circle>
            <text x="${x}" y="210" text-anchor="middle" fill="#777" font-size="9" font-weight="600"
                  transform="rotate(-40, ${x}, 210)">${q}</text>`;
    }).join('');

    container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="xMidYMid meet">
            <path d="M${oldPts}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4" style="opacity:0.4" />
            <path class="mel-trend-path" d="M${newPts}" fill="none" stroke="#14a3a3" stroke-width="3"
                  pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" />
            ${circleMarkup}
            <g transform="translate(10,15)">
                <line x1="0" y1="0" x2="12" y2="0" stroke="#14a3a3" stroke-width="3" />
                <text x="16" y="4" fill="#14a3a3" font-size="9" font-weight="600">NEW</text>
                <line x1="50" y1="0" x2="62" y2="0" stroke="#64748b" stroke-width="2" stroke-dasharray="2" />
                <text x="66" y="4" fill="#64748b" font-size="9" font-weight="600">OLD</text>
            </g>
        </svg>`;

    // Programmatic events — reliable for SVG
    const svgEl = container.querySelector('svg');
    if (svgEl) {
        svgEl.addEventListener('mouseenter', () => melTrendRedraw(svgEl));
    }

    container.querySelectorAll('.mel-trend-dot').forEach(circle => {
        const q     = circle.dataset.q;
        const newV  = Number(circle.dataset.new).toLocaleString();
        const oldV  = Number(circle.dataset.old).toLocaleString();
        const total = Number(circle.dataset.total).toLocaleString();

        circle.addEventListener('mouseenter', function(e) {
            this.style.transformBox    = 'fill-box';
            this.style.transformOrigin = 'center';
            this.style.transition      = 'transform 0.2s ease';
            this.style.transform       = 'scale(1.45)';
            showMelTooltip(e, `<strong>${q}</strong><br/>New: ${newV}<br/>Returning: ${oldV}<br/>Total: ${total}<br/><small>Click to filter</small>`);
        });
        circle.addEventListener('mousemove',  moveMelTooltip);
        circle.addEventListener('mouseleave', function() {
            this.style.transition = 'transform 0.2s ease';
            this.style.transform  = 'scale(1)';
            hideMelTooltip();
        });
        circle.addEventListener('click', () => setMelQuarter(q));
    });
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

// ── CHART ANIMATION HELPERS ─────────────────────────────

/** Vulnerability: wipe bar left → right on hover */
window.melVulnWipe = function(row) {
    const bar = row.querySelector('.vuln-bar-fill');
    if (!bar) return;
    const target = row.dataset.target;
    bar.style.transition = 'none';
    bar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        bar.style.width = target;
    }));
};

/** Reach Distribution: scale bar UP to 1.2x on hover (same feel as Gender Balance) */
window.melBarGrowUp = function(rect) {
    const bx = parseFloat(rect.getAttribute('x'));
    const bw = parseFloat(rect.getAttribute('width'));
    const by = parseFloat(rect.getAttribute('y'));
    const bh = parseFloat(rect.getAttribute('height'));
    // anchor transform at the baseline (bottom of the bar)
    rect.style.transformOrigin = (bx + bw / 2) + 'px ' + (by + bh) + 'px';
    rect.style.transition = 'transform 0.25s ease';
    rect.style.transform = 'scaleY(1.2)';
};
window.melBarShrink = function(rect) {
    rect.style.transition = 'transform 0.25s ease';
    rect.style.transform = 'scaleY(1)';
};

/** Gender Balance: grow split bar segment to 1.2x height */
window.melGenderGrow = function(seg) {
    seg.style.transition = 'height 0.25s ease';
    seg.style.height = '29px';
};
window.melGenderShrink = function(seg) {
    seg.style.transition = 'height 0.25s ease';
    seg.style.height = '24px';
};

/** Reach Trend: draw line left → right using normalized pathLength, scale markers on hover */
window.melTrendRedraw = function(svgEl) {
    const paths = svgEl.querySelectorAll('.mel-trend-path');
    paths.forEach(path => {
        // Reset to hidden (dashoffset = 1 = full path hidden, using pathLength="1" on the element)
        path.style.transition = 'none';
        path.style.strokeDashoffset = '1';
        requestAnimationFrame(() => requestAnimationFrame(() => {
            path.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            path.style.strokeDashoffset = '0';
        }));
    });
};
window.melCircleGrow = function(c) {
    c.style.transformBox = 'fill-box';
    c.style.transformOrigin = 'center';
    c.style.transition = 'transform 0.2s ease';
    c.style.transform = 'scale(1.35)';
};
window.melCircleShrink = function(c) {
    c.style.transition = 'transform 0.2s ease';
    c.style.transform = 'scale(1)';
};
