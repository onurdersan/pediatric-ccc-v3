---
name: icd10-classification
description: Classify ICD-10-CM diagnosis and procedure codes into CCC v3 body-system categories with tech-dependency flags using the two-pass algorithm.
---

# ICD-10-CM → CCC v3 Classification Skill

## When to Use
Use this skill whenever you need to implement, modify, or debug the CCC v3 classification logic.

## Source Data

| File | Purpose |
|------|---------|
| `../zoi240662supp2_prod_*.xlsx` | Dx code → body-system category mapping |
| `../zoi240662supp3_prod_*.xlsx` | Px code → tech-dependency category mapping |

## Code Normalization (must apply before lookup)
1. Remove all dots (`.`) and dashes (`-`)
2. Remove leading/trailing whitespace
3. Convert to uppercase
4. Example: `e70.0` → `E700`, `Q20.0` → `Q200`

## Two-Pass Algorithm

### Pass 1: Diagnosis Codes → Category Flags
```
Input: dxCodes[]
For each code in dxCodes:
  normalized = normalize(code)
  match = dxMap[normalized]
  if match:
    for each category in match.categories:
      result[category] = 1
```

### Pass 2: Procedure Codes → Tech-Dependency Flags
```
Input: pxCodes[]
For each code in pxCodes:
  normalized = normalize(code)
  match = pxMap[normalized]
  if match:
    for each category in match.tech_categories:
      result[category + "_tech"] = 1
```

## Output Structure
20 binary flags total:

| Category Flag | Tech Flag |
|---------------|-----------|
| `cvd` | `cvd_tech` |
| `resp` | `resp_tech` |
| `neuromusc` | `neuromusc_tech` |
| `renal` | `renal_tech` |
| `gi` | `gi_tech` |
| `hemato_immuno` | `hemato_immuno_tech` |
| `metabolic` | `metabolic_tech` |
| `congeni_genetic` | `congeni_genetic_tech` |
| `malignancy` | `malignancy_tech` |
| `neonatal` | `neonatal_tech` |

Plus derived fields:
- `ccc_flag`: 1 if any category flag is 1, else 0
- `num_categories`: count of category flags set to 1

## Critical Rules
- A single Dx code can set flags in **multiple** categories. Do not break after first match.
- Tech-dependency is set **per category**, not per code. A Px code activates `_tech` on the category it maps to.
- Pass 2 does NOT require the corresponding category flag to already be set. Tech-dependency can exist independently.
- Unknown codes (not in the mapping) are silently skipped — they are not errors.

## Test Cases
After implementing, validate against these patterns from the supplement:
1. A known cardiovascular Dx code → `cvd = 1`, all others `0`
2. A multi-category code → multiple category flags set
3. A known Px code → corresponding `_tech` flag set
4. An invalid/unknown code → no flags changed
5. Empty input → all flags `0`
