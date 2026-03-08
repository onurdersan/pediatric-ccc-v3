import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const FILES_DIR = join(ROOT, 'files');

const wb = XLSX.readFile(join(FILES_DIR, 'icd-10-turkish.xls'));
const ws = wb.Sheets[wb.SheetNames[0]];

const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
writeFileSync(join(__dirname, 'peek_turkish.json'), JSON.stringify(rows.slice(0, 10), null, 2));
console.log('Done writing peek_turkish.json');
