import XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const d = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'dx_map.json'), 'utf-8'));
const p = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'px_map.json'), 'utf-8'));

const lines = [];
lines.push(`Dx codes: ${Object.keys(d).length}`);
lines.push(`Px codes: ${Object.keys(p).length}`);

// Dx category distribution
const dxCats = {};
for (const [code, entry] of Object.entries(d)) {
    for (const cat of entry.categories) {
        dxCats[cat] = (dxCats[cat] || 0) + 1;
    }
}
lines.push('\nDx category distribution:');
for (const [cat, count] of Object.entries(dxCats).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${cat}: ${count}`);
}

// Px category distribution
const pxCats = {};
for (const [code, entry] of Object.entries(p)) {
    for (const cat of entry.tech_categories) {
        pxCats[cat] = (pxCats[cat] || 0) + 1;
    }
}
lines.push('\nPx category distribution:');
for (const [cat, count] of Object.entries(pxCats).sort((a, b) => b[1] - a[1])) {
    lines.push(`  ${cat}: ${count}`);
}

// Sample entries
lines.push('\nSample Dx entries:');
const dxEntries = Object.entries(d);
for (let i = 0; i < Math.min(5, dxEntries.length); i++) {
    lines.push(`  ${dxEntries[i][0]}: ${JSON.stringify(dxEntries[i][1])}`);
}

lines.push('\nSample Px entries:');
const pxEntries = Object.entries(p);
for (let i = 0; i < Math.min(5, pxEntries.length); i++) {
    lines.push(`  ${pxEntries[i][0]}: ${JSON.stringify(pxEntries[i][1])}`);
}

writeFileSync(join(ROOT, 'scripts', 'map-stats.txt'), lines.join('\n'), 'utf-8');
console.log('Stats written to scripts/map-stats.txt');
