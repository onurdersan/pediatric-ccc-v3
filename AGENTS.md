# AGENTS.md

## Must-follow constraints

- **Zero PHI storage.** No patient-identifiable data may be persisted to disk, database, or logs. All processing must be ephemeral (in-memory / client-side only). Uploaded CSVs must never be saved server-side.
- **CCC v3 algorithm fidelity is non-negotiable.** The classification logic must exactly match Feinstein et al. 2024 (JAMA Network Open). Reference files live in `../` (`zoi240662supp2_prod_*.xlsx` = Dx code map, `zoi240662supp3_prod_*.xlsx` = Px code map). Do not invent or approximate mappings.
- **All 10 CCC body-system categories must be implemented.** Cardiovascular, Respiratory, Neuromuscular, Renal/Urologic, GI, Hematologic/Immunologic, Metabolic, Congenital/Genetic, Malignancy, Neonatal.
- **Technology-dependence flags are two-pass.** First pass: flag Dx codes as non-tech-dependent. Second pass: evaluate Px codes and flip the tech-dependency indicator per category (e.g., `cvd_tech`, `resp_tech`, `gi_tech`, etc.). This ordering must not be collapsed into a single pass.
- **ICD-10-CM codes only.** Do not add ICD-9 or SNOMED support unless explicitly requested.

## Validation before finishing

- Verify classification output against at least 5 known Dx+Px code combinations from the supplement Excel files.
- Confirm CSV upload round-trip: upload → classify → download results — no data left on server after session ends.
- Run `npm run build` (or equivalent) with zero errors before committing.

## Repo-specific conventions

- Language: Turkish UI labels and user-facing copy; English for code, comments, variable names, and commit messages.
- Output flag variables must use the exact naming scheme: `cvd`, `resp`, `neuromusc`, `renal`, `gi`, `hemato_immuno`, `metabolic`, `congeni_genetic`, `malignancy`, `neonatal` and their `_tech` counterparts.
- Two operational modes in the UI:
  1. **Manual mode** — single-patient, real-time code lookup and classification.
  2. **Batch mode** — CSV upload, bulk classify, downloadable results.
- Design: minimalist, academic-grade. No decorative illustrations or gamification.

## Important locations

| Path | Content |
|------|---------|
| `../zoi240662supp2_prod_*.xlsx` | Diagnosis code → CCC category mapping (source of truth) |
| `../zoi240662supp3_prod_*.xlsx` | Procedure code → tech-dependency mapping (source of truth) |
| `../feinstein_2024_oi_240662_*.pdf` | Original CCC v3 paper (algorithm reference) |
| `gemini.md` | Agent identity, hard boundaries, safety rules |
| `progress.md` | Phased project tracker — read at session start |
| `agent.md` | Architecture map, directory tree, data flow |
| `agent_rules/frontend.md` | UI layer constraints |
| `agent_rules/backend.md` | Server layer constraints |
| `agent_rules/database.md` | Data layer constraints (no-DB, static JSON) |
| `skills/icd10_classification/SKILL.md` | Two-pass classification algorithm steps |
| `skills/csv_bulk_processing/SKILL.md` | CSV bulk processing pipeline |
| `.agent/workflows/` | Agent A/B/C workflows + audit workflows |

## Change safety rules

- Never modify the mapping data derived from the supplement Excel files without explicit confirmation — these are the peer-reviewed source of truth.
- Backward-compatible CSV output schema: adding columns is allowed, removing or renaming existing output columns is not.
- Do not introduce server-side storage (database, file cache, session store) without explicit approval — violates the zero-PHI constraint.

## Known gotchas

- Some ICD-10-CM codes map to multiple CCC categories — a single code can flag more than one body system. Do not short-circuit after first match.
- Tech-dependency is category-specific, not code-specific. A Px code sets tech-dependency on the category it belongs to, not on the original Dx code.
- The supplement Excel files use inconsistent dot/dash formatting in ICD codes. Normalize all codes (strip dots, uppercase) before lookup.
