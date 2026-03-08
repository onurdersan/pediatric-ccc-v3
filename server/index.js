/**
 * Express API Server — Pediatric CCC v3
 * 
 * Stateless server with zero PHI persistence.
 * Loads static JSON mappings at startup (read-only).
 * Two endpoints: single classify + batch CSV.
 */

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import classifyRoute from './routes/classify.js';
import batchRoute from './routes/batch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load mapping data at startup (read-only, in-memory)
const dxMap = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'dx_map.json'), 'utf-8'));
const pxMap = JSON.parse(readFileSync(join(__dirname, '..', 'src', 'data', 'px_map.json'), 'utf-8'));

console.log(`Loaded Dx map: ${Object.keys(dxMap).length} codes`);
console.log(`Loaded Px map: ${Object.keys(pxMap).length} codes`);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? false : '*' })); // Or configure explicitly
app.use(express.json({ limit: '1mb' }));

// Security: prevent caching of any response
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    next();
});

// Attach mapping data to request for route handlers
app.use((req, res, next) => {
    req.dxMap = dxMap;
    req.pxMap = pxMap;
    next();
});

// Routes
app.use('/api', classifyRoute);
app.use('/api', batchRoute);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        dx_codes: Object.keys(dxMap).length,
        px_codes: Object.keys(pxMap).length,
    });
});

app.listen(PORT, () => {
    console.log(`CCC v3 API server running on port ${PORT}`);
});
