---
name: carbonet-emission-management-extension
description: Estimate, review, and implement `/admin/emission/management` category or tier extensions in Carbonet. Use when Codex must judge whether a requested emission category or tier can be added by DB metadata only, requires new calculation definitions/executors, needs UI metadata follow-up, or needs local `:18000` save/calculate verification.
---

# Carbonet Emission Management Extension

Use this skill when the request is specifically about adding or changing `/admin/emission/management` category and tier support.

Read first:

- `/opt/projects/carbonet/docs/operations/emission-management-category-tier-extension-guide.md`

Read these code paths only as needed:

- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationDefinitionRegistry.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationUiDefinitionFactory.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionVariableDefinitionAssembler.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionInputSavePolicySupport.java`
- `frontend/src/features/emission-management/EmissionManagementMigrationPage.tsx`
- `frontend/src/features/emission-management/emissionManagementShared.ts`
- `src/test/java/egovframework/com/feature/admin/service/impl/AdminEmissionManagementServiceImplTest.java`

## Workflow

1. Classify the request:
   - existing supported category-tier metadata only
   - existing category with a new tier number
   - new `subCode` category
   - any of the above plus local `:18000` runtime proof
2. Confirm whether the requested pair already exists in `EmissionCalculationDefinitionRegistry`.
3. Check whether option binding, derived-variable handling, repeat groups, or section metadata depend on code rather than DB rows.
4. Separate these UI concerns before estimating:
   - documented default-capable badge criteria
   - runtime missing-input warning suppression
   - repeat-group empty validation
   - Step 1 tier-summary wording
   - Step 2 variable-resolution wording
5. Estimate in the sizing bands from the guide instead of giving an unbounded guess.
6. If implementation is requested, change SQL, backend calculation support, UI metadata, and tests in one pass.
7. If local proof is required, follow `carbonet-fast-bootstrap-ops` and `docs/operations/fast-bootstrap-runtime-freshness.md`.

## Estimation Rules

- Metadata-only under an already supported pair: `20k` to `50k` tokens, `20` to `45` minutes.
- Existing category plus new tier number: `60k` to `120k` tokens, `1` to `2.5` hours.
- New category plus new calculation path: `120k` to `220k` tokens, `2.5` to `5` hours.
- Add local `:18000` proof: plus `30k` to `60k` tokens and `20` to `40` minutes.

## Do Not Assume

- Do not assume DB inserts alone are enough because tier exposure is DB-driven.
- Do not assume a new tier is safe unless a calculation definition exists.
- Do not assume frontend behavior is generic when lime-specific helper logic or derived fields are involved.
- Do not assume a variable with a default-capable badge should also suppress direct-input warnings.
- Do not assume repeat-group validation is safe just because at least one line pattern works; verify the fully blank case too.

## Validation Reminders

- For `LIME` repeat-entry tiers, verify that a completely blank repeat group cannot proceed to calculate.
- When changing Step 1 guidance, keep it short and tier-specific; do not dump Step 2-style resolution detail there.
- When changing Step 2 guidance, prefer explicit badges for:
  - default-capable
  - type mapping
  - derived or fallback

## Output Shape

For estimation-only requests, return:

- work classification
- concrete risk points
- token/time band
- whether runtime proof is extra or required

For implementation requests, return:

- files changed
- whether the work stayed metadata-only or crossed into code changes
- tests run
- runtime proof status
