/**
 * Extract ICD-10-CM mappings from CCC v3 supplement Excel files.
 * 
 * Primary source: files/zoi240662supp2_prod_*.xlsx (eTable2)
 *   - Contains ALL codes in a flat table with columns:
 *     ICD_Code, DX_PR, CCC_Category, ICD9_ICD10, Tech_Dep, Transplant
 *   - We filter ICD-10 only (ICD9_ICD10 = 10)
 *   - Separate DX codes → dx_map.json
 *   - PX codes with Tech_Dep=1 or Transplant=1 → px_map.json
 * 
 * Run: node scripts/extract-mappings.js
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const FILES_DIR = join(ROOT, 'files');
const DATA_DIR = join(ROOT, 'src', 'data');

// Map Excel CCC_Category values to our standard flag names
const CATEGORY_MAP = {
    'neuro_neuromusc': 'neuromusc',
    'neuro': 'neuromusc',
    'neuromusc': 'neuromusc',
    'neurologic_neuromuscular': 'neuromusc',
    'cvd': 'cvd',
    'cardiovascular': 'cvd',
    'resp': 'resp',
    'respiratory': 'resp',
    'renal': 'renal',
    'renal_urologic': 'renal',
    'gi': 'gi',
    'gastrointestinal': 'gi',
    'hemato_immu': 'hemato_immuno',
    'hemato_immuno': 'hemato_immuno',
    'hematologic_immunologic': 'hemato_immuno',
    'metabolic': 'metabolic',
    'congeni_genetic': 'congeni_genetic',
    'congenital_genetic': 'congeni_genetic',
    'congeni': 'congeni_genetic',
    'malignancy': 'malignancy',
    'neonatal': 'neonatal',
    'premature_neonatal': 'neonatal',
};

/**
 * Normalize an ICD code: strip dots, dashes, whitespace; uppercase; toString
 */
function normalizeCode(code) {
    if (code === null || code === undefined) return null;
    const str = String(code).replace(/[.\-\s]/g, '').toUpperCase().trim();
    return str.length >= 2 ? str : null;
}

/**
 * Resolve a category string from the Excel to our flag name
 */
function resolveCategory(raw) {
    if (!raw) return null;
    const key = raw.toString().toLowerCase().trim().replace(/[\s\/]+/g, '_');
    // Try direct match first
    if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
    // Try partial match
    for (const [pattern, flag] of Object.entries(CATEGORY_MAP)) {
        if (key.includes(pattern) || pattern.includes(key)) return flag;
    }
    return null;
}

/**
 * Find a file in FILES_DIR matching a pattern
 */
function findFile(pattern) {
    const files = readdirSync(FILES_DIR);
    const match = files.find(f => f.includes(pattern));
    if (!match) throw new Error(`File not found matching pattern: ${pattern}`);
    return join(FILES_DIR, match);
}

// Load Turkish ICD-10 descriptions
const turkishMap = {};
try {
    const trFile = join(FILES_DIR, 'icd-10-turkish.xls');
    console.log(`Reading Turkish descriptions: ${trFile}`);
    const trWb = XLSX.readFile(trFile);
    const trWs = trWb.Sheets[trWb.SheetNames[0]];
    const trRows = XLSX.utils.sheet_to_json(trWs, { defval: '' });
    for (const row of trRows) {
        const rawCode = row['ICD KODU'];
        const desc = String(row['TANI'] || '').trim().replace(/\s+/g, ' ');
        const code = normalizeCode(rawCode);
        if (code && desc) {
            turkishMap[code] = desc;
        }
    }
    console.log(`Loaded ${Object.keys(turkishMap).length} Turkish descriptions`);
} catch (e) {
    console.warn('Failed to load Turkish ICD-10 descriptions (non-critical):', e.message);
}

// Main extraction from eTable2
try {
    mkdirSync(DATA_DIR, { recursive: true });

    const supp2File = findFile('supp2_prod');
    console.log(`Reading: ${supp2File}`);

    const workbook = XLSX.readFile(supp2File);

    // Find the eTable2 sheet
    const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('etable2') && !s.toLowerCase().includes('description'));
    if (!sheetName) throw new Error('eTable2 sheet not found');

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    console.log(`Sheet "${sheetName}": ${rows.length} rows`);

    const dxMap = {};
    const pxMap = {};
    let icd9Skipped = 0;
    let deletedSkipped = 0;
    let unmappedCategories = new Set();

    for (const row of rows) {
        const icdVersion = Number(row.ICD9_ICD10);
        const dxPx = String(row.DX_PR || '').toUpperCase().trim();
        const rawCategory = String(row.CCC_Category || '');
        const rawCode = row.ICD_Code;
        const description = String(row.ICD_Code_Description || '').trim().replace(/\s+/g, ' ');
        const techDep = Number(row.Tech_Dep || 0);
        const transplant = Number(row.Transplant || 0);

        // Skip ICD-9 codes — we only want ICD-10
        // Note: eTable2 encodes ICD-10 as 0 (not 10), ICD-9 as 9
        if (icdVersion === 9) {
            icd9Skipped++;
            continue;
        }

        const code = normalizeCode(rawCode);
        if (!code) continue;

        const category = resolveCategory(rawCategory);
        if (!category) {
            unmappedCategories.add(rawCategory);
            continue;
        }

        if (dxPx === 'DX') {
            // Diagnosis code → body-system category
            if (!dxMap[code]) {
                dxMap[code] = { categories: [], description };
            } else if (!dxMap[code].description && description) {
                dxMap[code].description = description;
            }
            if (turkishMap[code] && !dxMap[code].description_tr) {
                dxMap[code].description_tr = turkishMap[code];
            }
            if (!dxMap[code].categories.includes(category)) {
                dxMap[code].categories.push(category);
            }
        } else if (dxPx === 'PX' || dxPx === 'PR') {
            // Procedure code → tech-dependency categories
            if (!pxMap[code]) {
                pxMap[code] = { tech_categories: [], description };
            } else if (!pxMap[code].description && description) {
                pxMap[code].description = description;
            }
            if (turkishMap[code] && !pxMap[code].description_tr) {
                pxMap[code].description_tr = turkishMap[code];
            }
            if (!pxMap[code].tech_categories.includes(category)) {
                pxMap[code].tech_categories.push(category);
            }
        }
    }

    // Also extract from supp3 for tech-dependency and transplant codes
    // which may have better PX code coverage
    try {
        const supp3File = findFile('supp3_prod');
        console.log(`\nReading supplemental: ${supp3File}`);
        const wb3 = XLSX.readFile(supp3File);

        // Sheet name to category mapping for supp3
        const SHEET_CATEGORY_MAP = {
            'neuro neuromuscular': 'neuromusc',
            'cardiovascular': 'cvd',
            'respiratory': 'resp',
            'renal urologic': 'renal',
            'gastrointestinal': 'gi',
            'hematologic immunologic': 'hemato_immuno',
            'metabolic': 'metabolic',
            'other congenital genetic defect': 'congeni_genetic',
            'malignancy': 'malignancy',
            'premature & neonatal': 'neonatal',
            'device & tech use': null, // Special: subcategory determines category
            'transplant': null,       // Special: subcategory determines category
        };

        for (const sn of wb3.SheetNames) {
            const ws = wb3.Sheets[sn];
            const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
            if (rawRows.length < 2) continue;

            const snLower = sn.toLowerCase().trim();

            // Skip non-data sheets
            if (snLower.includes('table of contents') || snLower.includes('description')) continue;

            // Find header row (row 0 contains actual column headers)
            const headerRow = rawRows[0];
            const headers = Object.values(headerRow).map(v => String(v).trim());

            // Column index mapping based on position
            // Standard layout: CCC Category, Subcategory, ICD Code, Description, Comments, CF/JF, CCC Code Type, ICD9/ICD10, DX/PX
            const colKeys = Object.keys(headerRow);
            const icdCodeIdx = colKeys[2];    // ICD Code
            const codeTypeIdx = colKeys[6];   // CCC Code Type (V2, V3_new, Delete from V3)
            const icdVersionIdx = colKeys[7]; // ICD9/ICD10
            const dxPxIdx = colKeys[8];       // DX/PX
            const subcategoryIdx = colKeys[1]; // Subcategory (used for Device & Tech / Transplant)
            const descriptionIdx = colKeys[3]; // ICDCode Description

            const isDeviceTech = snLower.includes('device') || snLower.includes('tech use');
            const isTransplant = snLower.includes('transplant');
            const defaultCategory = SHEET_CATEGORY_MAP[snLower] || null;

            for (let i = 1; i < rawRows.length; i++) {
                const row = rawRows[i];

                const icdVersion = Number(row[icdVersionIdx] || 0);
                if (icdVersion === 9) continue; // Skip ICD-9

                const codeType = String(row[codeTypeIdx] || '').toLowerCase();
                if (codeType.includes('delete')) continue; // Skip deleted codes

                const rawCode = row[icdCodeIdx];
                const description = String(row[descriptionIdx] || '').trim().replace(/\s+/g, ' ');
                const code = normalizeCode(rawCode);
                if (!code) continue;

                const dxPx = String(row[dxPxIdx] || '').toUpperCase().trim();
                // Accept both 'PX' and 'PR' for procedure codes

                // Determine category
                let category = defaultCategory;
                if (isDeviceTech || isTransplant) {
                    // For Device & Tech / Transplant sheets, subcategory tells the body system
                    const subcategory = String(row[subcategoryIdx] || '').toLowerCase().trim();
                    category = resolveCategory(subcategory);
                }

                if (!category) continue;

                if (dxPx === 'DX') {
                    if (!dxMap[code]) {
                        dxMap[code] = { categories: [], description };
                    } else if (!dxMap[code].description && description) {
                        dxMap[code].description = description;
                    }
                    if (turkishMap[code] && !dxMap[code].description_tr) {
                        dxMap[code].description_tr = turkishMap[code];
                    }
                    if (!dxMap[code].categories.includes(category)) {
                        dxMap[code].categories.push(category);
                    }
                } else if (dxPx === 'PX' || dxPx === 'PR') {
                    if (!pxMap[code]) {
                        pxMap[code] = { tech_categories: [], description };
                    } else if (!pxMap[code].description && description) {
                        pxMap[code].description = description;
                    }
                    if (turkishMap[code] && !pxMap[code].description_tr) {
                        pxMap[code].description_tr = turkishMap[code];
                    }
                    if (!pxMap[code].tech_categories.includes(category)) {
                        pxMap[code].tech_categories.push(category);
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Supp3 extraction failed (non-critical):', e.message);
    }

    // Print stats
    const dxCount = Object.keys(dxMap).length;
    const pxCount = Object.keys(pxMap).length;

    console.log('\n--- Results ---');
    console.log(`ICD-9 codes skipped: ${icd9Skipped}`);
    console.log(`Dx codes (ICD-10): ${dxCount}`);
    console.log(`Px codes (ICD-10): ${pxCount}`);

    if (unmappedCategories.size > 0) {
        console.log(`Unmapped categories: ${[...unmappedCategories].join(', ')}`);
    }

    // Validate category distribution
    const catStats = {};
    for (const entry of Object.values(dxMap)) {
        for (const cat of entry.categories) {
            catStats[cat] = (catStats[cat] || 0) + 1;
        }
    }
    console.log('\nDx category distribution:');
    for (const [cat, count] of Object.entries(catStats).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count}`);
    }

    const pxCatStats = {};
    for (const entry of Object.values(pxMap)) {
        for (const cat of entry.tech_categories) {
            pxCatStats[cat] = (pxCatStats[cat] || 0) + 1;
        }
    }
    console.log('\nPx category distribution:');
    for (const [cat, count] of Object.entries(pxCatStats).sort((a, b) => b[1] - a[1])) {
        console.log(`  ${cat}: ${count}`);
    }

    // Sanity checks
    if (dxCount < 3000) {
        console.warn('\n⚠ WARNING: Dx code count seems low (expected ~3200+).');
    }
    if (pxCount < 2000) {
        console.warn('\n⚠ WARNING: Px code count seems low (expected ~2500+).');
    }

    // Write output
    const dxPath = join(DATA_DIR, 'dx_map.json');
    const pxPath = join(DATA_DIR, 'px_map.json');

    writeFileSync(dxPath, JSON.stringify(dxMap, null, 2), 'utf-8');
    writeFileSync(pxPath, JSON.stringify(pxMap, null, 2), 'utf-8');

    console.log(`\n✓ Dx map: ${dxPath}`);
    console.log(`✓ Px map: ${pxPath}`);
    console.log('\nExtraction complete!');
} catch (err) {
    console.error('Extraction failed:', err.message);
    console.error(err.stack);
    process.exit(1);
}
