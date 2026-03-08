import { describe, it, expect } from 'vitest';
import { classify, createEmptyResult } from '../../src/engine/classifier.js';

describe('classify', () => {
    const mockDxMap = {
        'C000': { categories: ['malignancy'] },
        'E700': { categories: ['metabolic'] },
        'Q200': { categories: ['cvd', 'congeni_genetic'] },
        'A170': { categories: ['neuromusc'] },
        'D571': { categories: ['hemato_immuno'] }
    };

    const mockPxMap = {
        '0BH17EZ': { tech_categories: ['resp'] },
        '02HV33Z': { tech_categories: ['cvd'] },
        '336': { tech_categories: ['resp'] } // Transplant code example
    };

    it('returns empty result for empty inputs', () => {
        const result = classify([], [], mockDxMap, mockPxMap);
        expect(result).toEqual(createEmptyResult());
    });

    it('correctly classifies a single known Dx code', () => {
        const result = classify(['C000'], [], mockDxMap, mockPxMap);
        expect(result.malignancy).toBe(1);
        expect(result.num_categories).toBe(1);
        expect(result.ccc_flag).toBe(1);
        // Ensure others are 0
        expect(result.cvd).toBe(0);
    });

    it('correctly flags multiple categories for a multi-category Dx code', () => {
        const result = classify(['Q20.0'], [], mockDxMap, mockPxMap); // Assuming 'Q20.0' normalizes to 'Q200'
        expect(result.cvd).toBe(1);
        expect(result.congeni_genetic).toBe(1);
        expect(result.num_categories).toBe(2);
        expect(result.ccc_flag).toBe(1);
    });

    it('correctly sets tech dependency flag for a Px code', () => {
        const result = classify([], ['0BH17EZ'], mockDxMap, mockPxMap);
        expect(result.resp_tech).toBe(1);
        // Note: num_categories and ccc_flag do NOT include tech flags per algorithm rules
        // (Wait, checking Feinstein et al: typically ccc_flag implies a CCC condition exists. 
        // In this implementation, ccc_flag relies on num_categories > 0 from Dx codes)
    });

    it('ignores unknown codes', () => {
        const result = classify(['UNKNOWN_DX'], ['UNKNOWN_PX'], mockDxMap, mockPxMap);
        expect(result).toEqual(createEmptyResult());
    });

    it('performs prefix matching if exact code not found', () => {
        // If code is 'C000123', it should match 'C000'
        const result = classify(['C000123'], [], mockDxMap, mockPxMap);
        expect(result.malignancy).toBe(1);
        expect(result.num_categories).toBe(1);
    });

    it('handles multiple Dx and Px codes', () => {
        const result = classify(['E700', 'A170'], ['02HV33Z', '336'], mockDxMap, mockPxMap);
        expect(result.metabolic).toBe(1);
        expect(result.neuromusc).toBe(1);
        expect(result.cvd_tech).toBe(1);
        expect(result.resp_tech).toBe(1);
        expect(result.num_categories).toBe(2);
        expect(result.ccc_flag).toBe(1);
    });
});
