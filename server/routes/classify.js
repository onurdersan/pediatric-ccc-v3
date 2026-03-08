/**
 * POST /api/classify — Single-patient classification
 * 
 * Accepts JSON body: { dx_codes: string[], px_codes: string[] }
 * Returns classification result with 20 flags + ccc_flag + num_categories
 */

import { Router } from 'express';
import { classify } from '../../src/engine/classifier.js';

const router = Router();

router.post('/classify', (req, res) => {
    try {
        const { dx_codes, px_codes } = req.body;

        // Input validation
        if (!dx_codes && !px_codes) {
            return res.status(422).json({
                error: true,
                message: 'En az bir tanı kodu (dx_codes) veya işlem kodu (px_codes) gereklidir.',
            });
        }

        if (dx_codes && !Array.isArray(dx_codes)) {
            return res.status(422).json({
                error: true,
                message: 'Tanı kodları (dx_codes) bir dizi olarak gönderilmelidir.',
            });
        }

        if (px_codes && !Array.isArray(px_codes)) {
            return res.status(422).json({
                error: true,
                message: 'İşlem kodları (px_codes) bir dizi olarak gönderilmelidir.',
            });
        }

        const result = classify(
            dx_codes || [],
            px_codes || [],
            req.dxMap,
            req.pxMap
        );

        return res.json({
            success: true,
            result,
        });
    } catch (err) {
        console.error('Classification error:', err.constructor.name);
        return res.status(500).json({
            error: true,
            message: 'Sınıflandırma sırasında bir hata oluştu.',
        });
    }
});

export default router;
