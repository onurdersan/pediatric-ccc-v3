# Agent Architecture Reference — Pediatric CCC v3

## Project Structure (Planned)
```
AntigravityCCCv3/
├── gemini.md              # Agent identity & boundaries
├── AGENTS.md              # Hard constraints for coding agents
├── agent.md               # This file — architecture map
├── progress.md            # Phase tracker
├── agent_rules/
│   ├── frontend.md        # UI layer rules
│   ├── backend.md         # Server layer rules
│   └── database.md        # Data layer rules
├── skills/
│   ├── icd10_classification/
│   │   └── SKILL.md       # Classification algorithm skill
│   └── csv_bulk_processing/
│       └── SKILL.md       # Bulk CSV pipeline skill
├── .agent/
│   └── workflows/
│       ├── research_planning.md
│       ├── code_implementation.md
│       ├── code_review.md
│       ├── optimization_audit.md
│       └── security_audit.md
├── src/
│   ├── engine/
│   │   ├── classifier.js  # Two-pass CCC v3 engine (pure function)
│   │   └── normalizer.js  # ICD code normalization
│   ├── data/
│   │   ├── dx_map.json    # Dx → category mapping (generated from Excel)
│   │   └── px_map.json    # Px → tech-dep mapping (generated from Excel)
│   ├── api/
│   │   ├── classify.js    # POST /api/classify endpoint
│   │   └── batch.js       # POST /api/classify-batch endpoint
│   └── ui/
│       ├── components/    # Reusable UI components
│       └── pages/         # Manual mode + Batch mode views
├── tests/
│   ├── engine/            # Unit tests for classifier
│   └── api/               # API integration tests
└── package.json
```

## Data Flow
```
User Input (Dx + Px codes)
        │
        ▼
  Code Normalization (strip dots, uppercase)
        │
        ▼
  Pass 1: Dx codes → dx_map.json lookup → category flags
        │
        ▼
  Pass 2: Px codes → px_map.json lookup → tech-dep flags
        │
        ▼
  Classification Result (20 flags + ccc_flag + num_categories)
        │
        ▼
  Response (JSON for manual, CSV for batch)
```

## Key Modules

| Module | Responsibility | Side Effects |
|--------|---------------|--------------|
| `engine/classifier.js` | Two-pass classification | None (pure function) |
| `engine/normalizer.js` | ICD code cleanup | None (pure function) |
| `data/dx_map.json` | Dx → category lookup | Read-only static file |
| `data/px_map.json` | Px → tech-dep lookup | Read-only static file |
| `api/classify.js` | Single-patient API | HTTP response only |
| `api/batch.js` | Bulk CSV API | HTTP response only |

## Reference Files (Outside Repo)
| Path | Purpose |
|------|---------|
| `../zoi240662supp2_prod_*.xlsx` | Dx code mapping source |
| `../zoi240662supp3_prod_*.xlsx` | Px code mapping source |
| `../feinstein_2024_oi_240662_*.pdf` | CCC v3 paper |
