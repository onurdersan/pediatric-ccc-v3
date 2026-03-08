# Data Layer Rules — Pediatric CCC v3

## No Database
- This project has **zero database dependencies.** No SQLite, PostgreSQL, MongoDB, or any other DBMS.
- The term "database" in this project refers only to the static JSON mapping files derived from the CCC v3 supplement Excel sheets.

## Static Mapping Data
- Source of truth: `../zoi240662supp2_prod_*.xlsx` (Dx → category) and `../zoi240662supp3_prod_*.xlsx` (Px → tech-dep).
- Mapping data must be pre-extracted into static JSON files and committed to the repo.
- JSON mapping files are **read-only at runtime.** Never mutate them programmatically.
- Any update to mapping JSONs requires re-extraction from the original Excel files + explicit user confirmation.

## Mapping File Schema

### Dx mapping (`dx_map.json`)
```json
{
  "A170": { "categories": ["neuromusc"] },
  "D571": { "categories": ["hemato_immuno"] },
  "Q200": { "categories": ["cvd", "congeni_genetic"] }
}
```
- Key: normalized ICD-10-CM code (no dots, uppercase)
- `categories`: array of body-system flag names (a single code can map to multiple)

### Px mapping (`px_map.json`)
```json
{
  "0BH17EZ": { "tech_categories": ["resp"] },
  "02HV33Z": { "tech_categories": ["cvd"] }
}
```
- Key: normalized ICD-10-PCS code
- `tech_categories`: array of category names whose `_tech` flag should be set

## Data Integrity
- After any re-extraction, run a diff against the previous JSON to verify changes are expected.
- Code count sanity check: Dx map should have ~8,000–12,000 entries. Px map should have ~2,000–5,000 entries. Significant deviation indicates extraction error.
- Never hand-edit the JSON mapping files. Always regenerate from Excel.
