# Backend Rules — Pediatric CCC v3

## Stateless Processing (Non-negotiable)
- **No file system writes for user data.** Uploaded CSVs are parsed in-memory and discarded after response.
- **No database.** Static mapping data is loaded from JSON files at startup and held in memory as read-only.
- **No session state.** Each API request is fully self-contained. No server-side session store.
- **No temp files.** Do not use `fs.writeFileSync`, `fs.createWriteStream`, or equivalent for user data.

## API Design
- RESTful endpoints. Two primary:
  - `POST /api/classify` — accepts JSON body with Dx codes + Px codes, returns classification flags.
  - `POST /api/classify-batch` — accepts CSV file via `multipart/form-data`, returns classified CSV.
- Response format: JSON with exact flag names (`cvd`, `resp`, `neuromusc`, etc. and their `_tech` counterparts).
- All 400/422 error responses must include a `message` field in Turkish for user-facing display.

## ICD Code Processing
- **Normalize before lookup:** strip dots, dashes, and whitespace; convert to uppercase.
- **Match prefix when full code not found:** try progressively shorter prefixes (e.g., `E700` → `E70` → `E7`) — but only within the mapping table.
- **Never return a classification for a code not in the mapping.** Unknown codes are silently skipped (not errors).

## Classification Engine
- Must live in a dedicated module (e.g., `src/engine/classifier.js` or `lib/classifier.ts`).
- **Two-pass execution order is mandatory:**
  1. Pass 1: iterate Dx codes → set body-system category flags
  2. Pass 2: iterate Px codes → set tech-dependency flags per matched category
- Engine must be a pure function: `(dxCodes[], pxCodes[], mappingData) → classificationResult`. No side effects.

## Dependencies
- Minimize external dependencies. No ORM, no database driver, no caching layer.
- Any new dependency must be checked for telemetry/phone-home behavior before adding.
- Prefer built-in Node.js APIs over external packages where feasible.
