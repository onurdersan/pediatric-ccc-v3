/**
 * CCC v3 Two-Pass Classification Engine
 * 
 * Pure function that classifies ICD-10-CM diagnosis and procedure codes
 * into CCC v3 body-system categories with technology-dependency flags.
 * 
 * Algorithm: Feinstein et al., 2024, JAMA Network Open
 * 
 * Pass 1: Dx codes → body-system category flags
 * Pass 1: Dx codes → body-system category flags
 * Pass 2: Px codes → technology-dependency flags per category
 */

import { normalizeCode } from './normalizer.js';

/**
 * Perform progressive prefix matching on mapping data.
 * Tries the full code, then progressively removes characters from the end
 * down to a minimum of 3 characters.
 * @param {Object} map - The mapping object
 * @param {string} code - The normalized ICD code
 * @returns {Object|null} The mapped data or null
 */
function lookupWithPrefix(map, code) {
    if (!code) return null;
    let current = code;
    while (current.length >= 3) {
        if (map[current]) {
            return map[current];
        }
        current = current.slice(0, -1);
    }
    return null;
}

// All 10 CCC v3 body-system categories
const CATEGORIES = [
    'cvd',
    'resp',
    'neuromusc',
    'renal',
    'gi',
    'hemato_immuno',
    'metabolic',
    'congeni_genetic',
    'malignancy',
    'neonatal',
];

/**
 * Create a blank classification result with all flags set to 0.
 * @returns {Object} Empty classification result
 */
export function createEmptyResult() {
    const result = {};
    for (const cat of CATEGORIES) {
        result[cat] = 0;
        result[`${cat}_tech`] = 0;
    }
    result.ccc_flag = 0;
    result.num_categories = 0;
    return result;
}

/**
 * Classify ICD-10-CM codes using the CCC v3 two-pass algorithm.
 * 
 * @param {string[]} dxCodes - Array of diagnosis codes (raw or normalized)
 * @param {string[]} pxCodes - Array of procedure codes (raw or normalized)
 * @param {Object} dxMap - Dx code → { categories: string[] } mapping
 * @param {Object} pxMap - Px code → { tech_categories: string[] } mapping
 * @returns {Object} Classification result with 20 flags + ccc_flag + num_categories
 */
export function classify(dxCodes, pxCodes, dxMap, pxMap) {
    const result = createEmptyResult();

    // ========================================
    // PASS 1: Diagnosis codes → category flags
    // ========================================
    if (Array.isArray(dxCodes)) {
        for (const rawCode of dxCodes) {
            const code = normalizeCode(rawCode);
            if (!code) continue;

            const match = lookupWithPrefix(dxMap, code);
            if (match && Array.isArray(match.categories)) {
                // A single code can map to MULTIPLE categories
                for (const category of match.categories) {
                    if (CATEGORIES.includes(category)) {
                        result[category] = 1;
                    }
                }
            }
        }
    }

    // ========================================
    // PASS 2: Procedure codes → tech-dependency flags
    // ========================================
    if (Array.isArray(pxCodes)) {
        for (const rawCode of pxCodes) {
            const code = normalizeCode(rawCode);
            if (!code) continue;

            const match = lookupWithPrefix(pxMap, code);
            if (match && Array.isArray(match.tech_categories)) {
                // Tech-dependency is set per CATEGORY, not per code
                for (const category of match.tech_categories) {
                    if (CATEGORIES.includes(category)) {
                        result[`${category}_tech`] = 1;
                    }
                }
            }
        }
    }

    // ========================================
    // Derived fields
    // ========================================
    let numCategories = 0;
    for (const cat of CATEGORIES) {
        if (result[cat] === 1) {
            numCategories++;
        }
    }
    result.num_categories = numCategories;
    result.ccc_flag = numCategories > 0 ? 1 : 0;

    return result;
}

/**
 * Get the list of all category names.
 * @returns {string[]} Category names
 */
export function getCategories() {
    return [...CATEGORIES];
}

/**
 * Get Turkish display names for categories.
 * @returns {Object} Map of flag name → Turkish display name
 */
export function getCategoryDisplayNames() {
    return {
        cvd: 'Kardiyovasküler',
        resp: 'Solunumsal',
        neuromusc: 'Nöromüsküler',
        renal: 'Renal/Ürolojik',
        gi: 'Gastrointestinal',
        hemato_immuno: 'Hematolojik/İmmünolojik',
        metabolic: 'Metabolik',
        congeni_genetic: 'Konjenital/Genetik',
        malignancy: 'Malignite',
        neonatal: 'Neonatal',
    };
}
