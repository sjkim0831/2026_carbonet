# Emission Management Category/Tier Extension Guide

Purpose: give a first-session decision path for `/admin/emission/management` changes when a new category (`subCode`) or a new tier must be added.

Use this document before estimating or implementing:

1. Is the request only adding or editing `emission_variable_def` and `emission_factor` rows for an already supported pair such as `CEMENT:1..3` or `LIME:1..3`?
2. Is the request adding a new tier number under an existing category?
3. Is the request adding a brand-new category `subCode` with its own formula?
4. Is local `:18000` runtime proof required in the same session?

## Current Hard Boundaries

The current implementation is not fully metadata-driven.

- Tier exposure is DB-driven through `emission_variable_def`.
- Variable/factor acceptance is DB-driven.
- Calculation execution is code-driven.
- UI display metadata is partly code-driven.

Important code anchors:

- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationDefinitionRegistry.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionCalculationUiDefinitionFactory.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionVariableDefinitionAssembler.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/EmissionInputSavePolicySupport.java`
- `frontend/src/features/emission-management/EmissionManagementMigrationPage.tsx`
- `frontend/src/features/emission-management/emissionManagementShared.ts`

This means:

- adding DB rows alone is usually safe only for existing supported category-tier combinations
- adding a new tier number usually requires backend code
- adding a new `subCode` definitely requires backend code and tests
- lime-specific helper UI logic may require frontend follow-up even when backend accepts the data

## UI Guardrail Lessons

Recent `/admin/emission/management` changes exposed three recurring risks:

1. Do not couple "default-capable" display badges to "missing-input warning suppression".
   - The badge is a documentation and operator-visibility rule.
   - Warning suppression is a runtime validation rule.
   - They can overlap, but they are not the same rule set.

2. Repeat-group validation must still fail when the whole group is blank.
   - Especially for `LIME:1` and `LIME:2`, a fully empty repeat group must not silently pass to calculation.
   - If no populated line exists, create validation issues against the first required row instead of skipping the group.

3. Tier summary copy and variable-level resolution logic should not be inferred from one generic fallback flag.
   - `Tier 1` often needs short coefficient-default copy.
   - `Tier 2` often mixes derived, stored, and documented default rules.
   - `Tier 3` often mixes type-mapping with limited fallback on selected factors such as `EFD`.

When changing UI rules for emission inputs, review these boundaries explicitly:

- display badge criteria
- direct-input warning criteria
- repeat-group empty-state validation
- tier summary wording
- factor-resolution wording in Step 2 cards

## First-Session Decision Table

### Case A. Existing supported pair, metadata-only

Example:

- add variables to `LIME:2`
- add factors to `CEMENT:1`
- adjust labels, sections, hints, repeat-group metadata already supported by current UI rules

Expected work:

- SQL seed/update
- optional UI metadata in DB columns
- focused regression test update when behavior changed

Typical Codex estimate:

- tokens: `20k` to `50k`
- elapsed time: `20` to `45` minutes

Risk:

- low to medium

### Case B. Existing category, new tier number

Example:

- add `LIME:4`
- add `CEMENT:4`

Expected work:

- SQL for category-tier variable/factor definitions
- registry entry in `EmissionCalculationDefinitionRegistry`
- new executor path or adapted executor
- UI definition and display metadata fallback review
- service test coverage for save and calculate

Typical Codex estimate:

- tokens: `60k` to `120k`
- elapsed time: `1` to `2.5` hours

Risk:

- medium to high

Reason:

- the tier can appear in the screen from DB data before calculation support exists

### Case C. New category `subCode`, existing tier style is not reusable

Example:

- add `GLASS:1`
- add `CERAMIC:1..3`

Expected work:

- new category seed
- new variable/factor seed
- registry entry for every supported tier
- calculation executor implementation
- UI definition or DB metadata strategy
- common-code option wiring if select inputs are needed
- save/calculate tests

Typical Codex estimate:

- tokens: `120k` to `220k`
- elapsed time: `2.5` to `5` hours

Risk:

- high

### Case D. New category plus local runtime proof on `:18000`

Expected work:

- everything in Case B or C
- frontend build if UI changed
- package
- restart
- runtime freshness verification
- emission-management flow verification

Add this on top of the implementation estimate:

- extra tokens: `30k` to `60k`
- extra elapsed time: `20` to `40` minutes

Use:

- `bash ops/scripts/build-restart-verify-emission-management-18000.sh`
- `bash ops/scripts/verify-emission-management-flow.sh`

Also read:

- `docs/operations/fast-bootstrap-runtime-freshness.md`

## What Must Be True Before Saying "Just Add the Rows"

All of these must be true:

1. `subCode` is already supported in `EmissionCalculationDefinitionRegistry`.
2. `tier` is already supported in `EmissionCalculationDefinitionRegistry`.
3. No new option-binding rule is needed in `EmissionVariableDefinitionAssembler`.
4. No new derived/supplemental skip rule is needed in `EmissionInputSavePolicySupport`.
5. No new frontend helper logic is required in `emissionManagementShared.ts`.

If any item is false, do not estimate it as metadata-only.

6. No frontend validation split is needed between:
   - documented default-capable badges
   - runtime warning suppression
   - repeat-group empty validation

If item 6 is false, treat the work as code change, not metadata-only.

## Recommended Estimation Language For First Session

Use this wording style in the first session:

- metadata-only extension under an existing supported pair: `20k` to `50k` tokens, about `20` to `45` minutes
- new tier under existing category: `60k` to `120k` tokens, about `1` to `2.5` hours
- new category with new calculation path: `120k` to `220k` tokens, about `2.5` to `5` hours
- local `:18000` runtime proof: add `30k` to `60k` tokens and `20` to `40` minutes

These are practical Codex session bands, not hard limits. Dirty worktrees, missing SQL seeds, unclear formulas, or required runtime proof push the estimate upward.

## Minimum First-Session Checklist

When a session starts, answer these in order:

1. Which `subCode` is being added or changed?
2. Which `tier` numbers are being added or changed?
3. Is the formula identical to an existing supported executor?
4. Are new select-option code tables required?
5. Are new derived variables or hidden factors required?
6. Is `:18000` verification required in the same task?

Then classify the work as:

- metadata-only
- existing-category new-tier
- new-category implementation
- implementation plus runtime proof

## Suggested Delivery Shape

For a safe implementation session, bundle these together:

- SQL seed or migration
- backend registry and executor updates when needed
- UI metadata updates when needed
- service tests
- runtime verification only if the task explicitly needs local proof

When the task changes emission input UX or validation, also include:

- an explicit note on whether the change affected badge rules, warning rules, or both
- a repeat-group empty-input check for lime/cement flows that use line-based entry
- local `:18000` verification that the changed route still loads after restart

## Refactor Direction

For long-term stability, prefer moving toward stored resolution-policy metadata instead of hard-coding category/tier display logic in React.

The target split is:

- category and tier definition
- variable definition
- formula definition
- factor-resolution policy
- UI display policy
- validation policy

Useful future fields include:

- `input_required_yn`
- `default_capable_yn`
- `stored_factor_capable_yn`
- `mapping_capable_yn`
- `derived_capable_yn`
- `warning_policy`
- `resolution_policy`

Until that refactor exists, assume `/admin/emission/management` changes can require coordinated Java plus React updates even when DB metadata already exists.
