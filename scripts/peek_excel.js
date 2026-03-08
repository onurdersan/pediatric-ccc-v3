import { readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const FILES_DIR = join(ROOT, 'files');

const out = {};

// Check supp2
const supp2File = readdirSync(FILES_DIR).find(f => f.includes('supp2_prod'));
const wb2 = XLSX.readFile(join(FILES_DIR, supp2File));
out.supp2 = { sheets: wb2.SheetNames, data: {} };
for (const sn of wb2.SheetNames) {
    const ws = wb2.Sheets[sn];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (rows.length > 0) {
        out.supp2.data[sn] = rows.slice(0, 3);
    }
}

// Check supp3
const supp3File = readdirSync(FILES_DIR).find(f => f.includes('supp3_prod'));
const wb3 = XLSX.readFile(join(FILES_DIR, supp3File));
out.supp3 = { sheets: wb3.SheetNames, data: {} };
for (const sn of wb3.SheetNames.slice(0, 3)) {
    const ws = wb3.Sheets[sn];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (rows.length > 0) {
        out.supp3.data[sn] = rows.slice(0, 3);
    }
}

writeFileSync(join(__dirname, 'peek_output.json'), JSON.stringify(out, null, 2));
