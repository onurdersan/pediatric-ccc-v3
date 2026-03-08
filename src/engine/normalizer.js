/**
 * ICD-10-CM Code Normalizer
 * 
 * Normalizes ICD codes by stripping dots, dashes, whitespace
 * and converting to uppercase. This is required before any
 * mapping lookup.
 */

/**
 * Normalize a single ICD code.
 * @param {string} code - Raw ICD code
 * @returns {string} Normalized code (uppercase, no dots/dashes/whitespace)
 */
export function normalizeCode(code) {
    if (!code || typeof code !== 'string') return '';
    return code.replace(/[.\-\s]/g, '').toUpperCase().trim();
}

/**
 * Normalize an array of ICD codes.
 * Filters out empty results.
 * @param {string[]} codes - Array of raw ICD codes
 * @returns {string[]} Array of normalized codes
 */
export function normalizeCodes(codes) {
    if (!Array.isArray(codes)) return [];
    return codes
        .map(normalizeCode)
        .filter(c => c.length > 0);
}

/**
 * Parse a semicolon/comma-separated string of codes into an array
 * of normalized codes.
 * @param {string} input - Semicolon or comma separated codes
 * @returns {string[]} Array of normalized codes
 */
export function parseCodeString(input) {
    if (!input || typeof input !== 'string') return [];
    const parts = input.split(/[;,\n]/).map(s => s.trim()).filter(Boolean);
    return normalizeCodes(parts);
}
