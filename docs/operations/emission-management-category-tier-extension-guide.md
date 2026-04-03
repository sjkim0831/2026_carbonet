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
- rollout board snapshot fill when the task depends on `READY/BLOCKED/SHADOW_ONLY/LEGACY_ONLY` status

Add this on top of the implementation estimate:

- extra tokens: `30k` to `60k`
- extra elapsed time: `20` to `40` minutes

Use:

- `bash ops/scripts/build-restart-verify-emission-management-18000.sh`
- `bash ops/scripts/verify-emission-management-flow.sh`
- `bash ops/scripts/fill-emission-management-rollout-snapshots.sh`
- `bash ops/scripts/build-restart-fill-verify-emission-management-rollout-18000.sh`

If the task explicitly changes published-definition runtime adoption, add a `PRIMARY` mode verifier run:

- `env VERIFY_DEFINITION_PUBLISH=true DEFINITION_RUNTIME_MODE=PRIMARY EXPECTED_PROMOTION_STATUS=PRIMARY_READY EXPECTED_DRAFT_ID_PREFIX='' bash ops/scripts/verify-emission-management-flow.sh`

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

When the task changes definition comparison or rollout-board behavior, also include:

- one save/calculate proof with `bash ops/scripts/verify-emission-management-flow.sh`
- scope fill for the supported rollout matrix with `bash ops/scripts/fill-emission-management-rollout-snapshots.sh`
- final confirmation that requested scopes are `READY` in `/admin/emission/management/page-data`

## Rollout Board Verification

Use these scripts when the operator must see the rollout board populated instead of only proving that one calculate call succeeds.

- `bash ops/scripts/help-emission-management-rollout.sh`
  use `EMISSION_HELP_OUTPUT=json bash ops/scripts/help-emission-management-rollout.sh` for a machine-readable command catalog
  or `EMISSION_HELP_OUTPUT=flat-json bash ops/scripts/help-emission-management-rollout.sh` for a versioned flat command catalog
  or `EMISSION_HELP_OUTPUT=commands bash ops/scripts/help-emission-management-rollout.sh` for a flat command list
  invalid `EMISSION_HELP_OUTPUT` values now fail fast instead of silently falling back to text output
- `bash ops/scripts/show-emission-management-rollout-board.sh`
- `bash ops/scripts/show-emission-management-rollout-status.sh`
- `bash ops/scripts/verify-emission-management-rollout-board-ready.sh`
- `bash ops/scripts/verify-emission-management-rollout-readonly.sh`
- `bash ops/scripts/fill-emission-management-rollout-snapshots.sh`
- `bash ops/scripts/verify-emission-management-rollout-scope.sh CEMENT:1`
- `bash ops/scripts/build-restart-fill-verify-emission-management-rollout-18000.sh`

Recommended command choice:

- supported rollout scope list only: `bash ops/scripts/list-emission-management-rollout-scopes.sh`
  if you need a copy-pasteable default scope set, use:
  `EMISSION_SCOPE_LIST_OUTPUT=scopes bash ops/scripts/list-emission-management-rollout-scopes.sh`
  for machine-readable metadata output, use:
  `EMISSION_SCOPE_LIST_OUTPUT=json bash ops/scripts/list-emission-management-rollout-scopes.sh`
- rollout metadata and fixture consistency only: `bash ops/scripts/verify-emission-management-rollout-fixtures.sh`
  for machine-readable verification output, use:
  `EMISSION_FIXTURE_VERIFY_OUTPUT=json bash ops/scripts/verify-emission-management-rollout-fixtures.sh`
- non-runtime helper smoke verification only:
  `bash ops/scripts/verify-emission-management-rollout-tooling.sh`
- one read-only status summary for scopes plus fixtures plus current board:
  `bash ops/scripts/show-emission-management-rollout-status.sh`
  for machine-readable summary output without hitting the board, use:
  `EMISSION_STATUS_OUTPUT=json EMISSION_STATUS_INCLUDE_BOARD=false bash ops/scripts/show-emission-management-rollout-status.sh`
- current board state only: `bash ops/scripts/show-emission-management-rollout-board.sh`
- read-only verification bundle for fixture consistency plus READY board assertion:
  `bash ops/scripts/verify-emission-management-rollout-readonly.sh`
  for machine-readable verification output, use:
  `EMISSION_READONLY_VERIFY_OUTPUT=json bash ops/scripts/verify-emission-management-rollout-readonly.sh`
- read-only READY assertion for the current default scope set: `bash ops/scripts/verify-emission-management-rollout-board-ready.sh`
- one scope replay with canonical fixture: `bash ops/scripts/verify-emission-management-rollout-scope.sh CEMENT:1`
  use `bash ops/scripts/verify-emission-management-rollout-scope.sh list` to see supported scope arguments
  or `bash ops/scripts/verify-emission-management-rollout-scope.sh list-scopes` to emit the space-separated default set
- all supported scopes replay without rebuild: `bash ops/scripts/fill-emission-management-rollout-snapshots.sh`
- rebuild, restart, refill, verify, then optionally print final board summary: `bash ops/scripts/build-restart-fill-verify-emission-management-rollout-18000.sh`
  this wrapper now starts with the fixture consistency check automatically
  and ends by read-only asserting the same scope set by default

Important behavior:

- `show-emission-management-rollout-board.sh` is the read-only status command for summary cards and per-scope rollout rows.
- `verify-emission-management-rollout-readonly.sh` is the read-only verification bundle for the common operator case: metadata/fixture consistency plus current board READY assertion.
- `verify-emission-management-rollout-readonly.sh` can emit machine-readable JSON through `EMISSION_READONLY_VERIFY_OUTPUT=json`.
- the rollout help catalog JSON and the read-only JSON payloads now include `schemaVersion=1`.
- `list-emission-management-rollout-scopes.sh` JSON includes `schemaVersion=1`, `scopeCount`, and `scopes`.
- `verify-emission-management-rollout-fixtures.sh` JSON includes `schemaVersion=1` and `status=ok`.
- `show-emission-management-rollout-status.sh` JSON includes `expectedReadyScopes`, which defaults to the metadata-derived scope set when `EMISSION_EXPECT_READY_SCOPES` is omitted.
- `verify-emission-management-rollout-readonly.sh` JSON includes `expectedReadyScopes`, which defaults to the metadata-derived scope set when `EMISSION_EXPECT_READY_SCOPES` is omitted.
- `show-emission-management-rollout-board.sh` can emit machine-readable JSON through `EMISSION_ROLLOUT_OUTPUT=json`, can limit rows with `EMISSION_ROLLOUT_FILTER_SCOPES="CEMENT:1 LIME:2"`, and can fail unless selected scopes are `READY` through `EMISSION_EXPECT_READY_SCOPES`.
- `verify-emission-management-rollout-board-ready.sh` is the shortcut for the common read-only case: assert the default metadata-derived scope set is `READY` without running save or calculate.
- rollout helper and status output selectors now fail fast on unsupported values instead of silently falling back to text or default boolean behavior.
- `verify-emission-management-flow.sh` proves one authenticated load/save/calculate path and can also assert rollout-board status for the selected scope.
- `verify-emission-management-flow.sh` now retries transient localhost HTTP failures through `EMISSION_HTTP_RETRIES` and `EMISSION_HTTP_RETRY_SECONDS`.
- `verify-emission-management-flow.sh` accepts `SAVE_PAYLOAD_FILE` for category-specific payload replay without embedding large JSON in one command line.
- `verify-emission-management-rollout-scope.sh` is the short wrapper for one canonical scope fixture and also retries at the scope level through `EMISSION_SCOPE_VERIFY_RETRIES`.
- `fill-emission-management-rollout-snapshots.sh` runs that verified path for each requested scope and can fail unless every requested scope ends up `READY`.
- `EMISSION_SCOPES` can restrict the rollout fill to a subset such as `CEMENT:1 LIME:2`.
- `EMISSION_SCOPE_DELAY_SECONDS` can be used when rapid save requests risk `sessionId` collisions.
- `EMISSION_PRINT_COMMANDS=true bash ops/scripts/fill-emission-management-rollout-snapshots.sh` prints the exact per-scope `verify-emission-management-rollout-scope.sh` commands for environments where one long parent shell cannot reliably reach local `:18000`.
- canonical rollout payload fixtures now live under `ops/fixtures/emission-management-rollout/` and are referenced directly by the printed commands.
- the supported rollout scope matrix itself is tracked in `ops/fixtures/emission-management-rollout/scopes.tsv`.
- when `EMISSION_SCOPES` is omitted, the fill script and full wrapper now derive the default scope set from `ops/fixtures/emission-management-rollout/scopes.tsv`.
- scope metadata lookup and default-scope derivation are shared through `ops/scripts/emission-management-auth-common.sh`, so scope additions propagate through the rollout scripts together.
- rollout JSON and text rendering helpers are shared through `ops/scripts/emission_rollout_json_common.py`, so schema and text row formats stay aligned across help/list/status/readonly flows.
- `verify-emission-management-rollout-fixtures.sh` checks that `scopes.tsv` and the referenced fixture payload files stay in sync.
- the scope wrapper already carries the correct scope-specific input-variable check, so `CEMENT` scopes do not fall back to the default `MLI` check.

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
