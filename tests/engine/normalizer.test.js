import { describe, it, expect } from 'vitest';
import { normalizeCode, normalizeCodes, parseCodeString } from '../../src/engine/normalizer.js';

describe('normalizeCode', () => {
    it('strips dots, dashes, and whitespace', () => {
        expect(normalizeCode('e70.0')).toBe('E700');
        expect(normalizeCode(' Q20.0 ')).toBe('Q200');
        expect(normalizeCode('0BH-17EZ')).toBe('0BH17EZ');
    });

    it('handles empty and null inputs', () => {
        expect(normalizeCode(null)).toBe('');
        expect(normalizeCode(undefined)).toBe('');
        expect(normalizeCode('')).toBe('');
    });
});

describe('normalizeCodes', () => {
    it('normalizes an array of codes', () => {
        expect(normalizeCodes(['e70.0', ' Q20.0 ', null])).toEqual(['E700', 'Q200']);
    });

    it('handles empty and null inputs', () => {
        expect(normalizeCodes(null)).toEqual([]);
        expect(normalizeCodes(undefined)).toEqual([]);
        expect(normalizeCodes([])).toEqual([]);
    });
});

describe('parseCodeString', () => {
    it('parses comma and semicolon separated strings', () => {
        expect(parseCodeString('e70.0, Q20.0; 0BH17EZ')).toEqual(['E700', 'Q200', '0BH17EZ']);
    });

    it('handles newlines', () => {
        expect(parseCodeString('e70.0\nQ20.0\r\n0BH17EZ')).toEqual(['E700', 'Q200', '0BH17EZ']);
    });

    it('handles empty and null inputs', () => {
        expect(parseCodeString(null)).toEqual([]);
        expect(parseCodeString(undefined)).toEqual([]);
        expect(parseCodeString('')).toEqual([]);
    });
});
