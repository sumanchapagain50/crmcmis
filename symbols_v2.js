/**
 * MAP RESOURCE SYMBOLS CONFIGURATION
 * Map your resource types (as defined in resources_v2.js) to SVG files in your assets folder.
 */
const RESOURCE_SYMBOLS = {
    // Standard Types
    "Health": "assets/health.svg",
    "Education": "assets/school.svg",
    "Water": "assets/culvert.svg",
    "Social": "assets/wardoffice.svg",
    "Safety": "assets/safeshelter.svg",
    "Economy": "assets/shop.svg",
    "Community": "assets/citycenter.svg",
    "Chowk": "assets/citycenter.svg",

    // Specialized Types
    "Institution": "assets/financeinstitution.svg",
    "Business": "assets/shop.svg",
    "Infrastructure": "assets/bridge.svg",
    "Infrastructures": "assets/bridge.svg",
    "Culvert": "assets/culvert.svg",
    "Road": "assets/bridge.svg",
    "Temple": "assets/govoffice.svg",
    "Forest": "assets/highland.svg",
    "Settlement": "assets/lowland.svg",
    "Ward Office": "assets/wardoffice.svg",
    "Gov Office": "assets/govoffice.svg",
    "Municipality Office": "assets/municipalityoffice.svg",
    "Police": "assets/police.svg",
    
    // Fallback for types not listed here
    "Default": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImdyYXkiIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48L3N2Zz4="
};

const RESOURCE_COLORS = {
    "Health": "#10b981",    // Emerald
    "Education": "#3b82f6", // Blue
    "Water": "#0ea5e9",     // Sky Blue
    "Social": "#8b5cf6",    // Violet
    "Ward Office": "#8b5cf6",
    "Gov Office": "#a855f7",
    "Municipality Office": "#7c3aed",
    "Safety": "#f59e0b",    // Amber
    "Police": "#f43f5e",    // Rose/Red
    "Economy": "#ec4899",   // Pink
    "Business": "#db2777",
    "Institution": "#be185d",
    "Infrastructure": "#64748b", // Slate
    "Road": "#475569",
    "Culvert": "#94a3b8",
    "Temple": "#f97316",    // Orange
    "Forest": "#059669",    // Dark Green
    "Settlement": "#d97706", // Brownish/Amber
    "Default": "#14a3a3"     // Original Teal
};

/**
 * Returns the color for a given resource type.
 */
function getResourceColor(type) {
    if (!type) return RESOURCE_COLORS["Default"];
    if (RESOURCE_COLORS[type]) return RESOURCE_COLORS[type];
    
    // Case-insensitive match
    const foundType = Object.keys(RESOURCE_COLORS).find(t => t.toLowerCase() === type.toLowerCase());
    if (foundType) return RESOURCE_COLORS[foundType];

    return RESOURCE_COLORS["Default"];
}

/**
 * Returns the SVG path for a given resource type.
 * Automatically handles lowercasing and fallbacks.
 */
function getResourceSymbol(type) {
    if (!type) return RESOURCE_SYMBOLS["Default"];
    
    // 1. Direct match (Check exact Type first)
    if (RESOURCE_SYMBOLS[type]) return RESOURCE_SYMBOLS[type];
    
    // 2. Case-insensitive match
    const foundType = Object.keys(RESOURCE_SYMBOLS).find(t => t.toLowerCase() === type.toLowerCase());
    if (foundType) return RESOURCE_SYMBOLS[foundType];

    // 3. Dynamic filename fallback (assets/[type].svg)
    return `assets/${type.toLowerCase()}.svg`;
}
