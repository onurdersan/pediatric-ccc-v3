---
name: csv-bulk-processing
description: Process uploaded CSV files containing ICD-10-CM codes, classify each row using CCC v3, and return results as a downloadable CSV with all 20 classification flags.
---

# CSV Bulk Processing Skill

## When to Use
Use this skill whenever implementing or modifying the batch/bulk CSV classification pipeline.

## Input Requirements
- File format: `.csv` (UTF-8 encoded, comma-separated)
- Must contain at least one column with ICD-10-CM Dx codes
- Px code column is optional (if absent, tech-dependency flags default to 0)
- Column detection: accept common headers like `dx`, `diagnosis`, `dx_code`, `icd_dx`, `px`, `procedure`, `px_code`, `icd_px` (case-insensitive)

## Processing Pipeline
```
1. Parse CSV from upload (in-memory only — NEVER write to disk)
2. Detect Dx and Px columns by header name matching
3. For each row:
   a. Extract Dx codes (may be semicolon-separated within a cell)
   b. Extract Px codes (may be semicolon-separated within a cell)
   c. Normalize all codes (strip dots, uppercase)
   d. Run two-pass classification (use icd10_classification skill)
   e. Append 20 flag columns + ccc_flag + num_categories to row
4. Generate output CSV with original columns + classification columns
5. Return as downloadable file
6. Discard all in-memory data after response is sent
```

## Output CSV Schema
Original columns are preserved unchanged. The following columns are appended:

| Column | Type | Description |
|--------|------|-------------|
| `cvd` | 0/1 | Cardiovascular |
| `resp` | 0/1 | Respiratory |
| `neuromusc` | 0/1 | Neuromuscular |
| `renal` | 0/1 | Renal/Urologic |
| `gi` | 0/1 | Gastrointestinal |
| `hemato_immuno` | 0/1 | Hematologic/Immunologic |
| `metabolic` | 0/1 | Metabolic |
| `congeni_genetic` | 0/1 | Congenital/Genetic |
| `malignancy` | 0/1 | Malignancy |
| `neonatal` | 0/1 | Neonatal |
| `cvd_tech` … `neonatal_tech` | 0/1 | Tech-dependency per category |
| `ccc_flag` | 0/1 | Any category flagged |
| `num_categories` | int | Count of categories flagged |

## Error Handling
- **Missing Dx column:** Return 422 with Turkish error message: `"CSV dosyasında tanı kodu sütunu bulunamadı."`
- **Malformed rows:** Skip the row, log a warning count. Include a `warnings` field in the response with count of skipped rows.
- **Empty file:** Return 422: `"Yüklenen CSV dosyası boş."`
- **File too large:** Set a max size limit (configurable, default 50MB). Return 413 if exceeded.

## PHI Safety Checklist
- [ ] CSV file is never written to disk
- [ ] No temp files created during processing
- [ ] In-memory buffers are dereferenced after response
- [ ] No logging of row contents or ICD codes
- [ ] Response headers include `Cache-Control: no-store`
