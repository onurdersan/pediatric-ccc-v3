# Frontend Rules — Pediatric CCC v3

## Design Constraints
- **Minimalist, academic-grade UI.** No decorative illustrations, gamification, or unnecessary animations.
- **All user-facing text must be in Turkish.** Buttons, labels, headings, tooltips, error messages — everything the user reads.
- Code, comments, CSS class names, and variable names remain in English.

## Layout
- Two primary views: **Manuel Mod** (single-patient) and **Toplu İşlem** (batch CSV).
- Navigation must be obvious — no hidden menus or multi-step wizards for core functionality.
- Responsive: must work on 1024px+ screens. Mobile is not a priority but layout must not break.

## Data Handling (PHI Safety)
- **Never store patient data in `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.**
- Form inputs containing ICD codes or patient identifiers must not be captured by autocomplete (`autocomplete="off"`).
- After classification result is displayed, clearing the form must also clear all in-memory references to the input data.
- CSV file content must never be assigned to global/window-scope variables.

## Accessibility
- All form inputs must have associated `<label>` elements.
- Color must not be the sole indicator of classification results — use text labels alongside color.
- Interactive elements must be keyboard-navigable.

## Component Naming
- Use descriptive English names: `ManualClassifier`, `BatchUploader`, `ResultsTable`, `CategoryBadge`.
- CSS class prefix: `ccc-` (e.g., `ccc-result-card`, `ccc-upload-zone`).
