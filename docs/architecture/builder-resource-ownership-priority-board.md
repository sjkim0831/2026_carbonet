# Builder Resource Ownership Priority Board

## Goal

Give the next owner one immediate execution order for the `BUILDER_RESOURCE_OWNERSHIP_CLOSURE` family.

Read first:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair before choosing any row.
If priority-board use changes blocker count, active row, next review target, or partial-closeout wording, update both docs in the same turn.

This board does not redefine ownership.
It only decides which resource families should be reviewed first.

## Start Now

### 1. Framework-builder compatibility mapper XML

- canonical owner:
  - `modules/screenbuilder-carbonet-adapter/src/main/resources/egovframework/mapper/com/feature/admin/framework/builder/**`
- review card:
  - `docs/architecture/builder-resource-review-framework-builder-compatibility-xml.md`
- why first:
  - the canonical module resource path is already explicit
  - cutover ambiguity is narrow and visible
  - this is the cleanest first candidate for `DELETE_NOW` versus `BLOCKS_CLOSEOUT`

### 2. Framework contract metadata resource

- canonical owner:
  - `modules/carbonet-contract-metadata/src/main/resources/framework/contracts/framework-contract-metadata.json`
- review card:
  - `docs/architecture/builder-resource-review-framework-contract-metadata.md`
- why second:
  - the canonical owner is explicit
  - drift against root `src/main/resources/framework/**` is easy to reason about
  - this family directly affects whether builder metadata is still silently rooted in the legacy tree

## Review Next

### 3. Builder observability metadata/resource family

- review card:
  - `docs/architecture/builder-resource-review-builder-observability.md`
- why next:
  - ownership is known at module level but resource-family boundaries are broader
  - explicit shim proof may still be needed before delete decisions are safe

### 4. Builder-owned root resource line excluded by app packaging

- review card:
  - `docs/architecture/builder-resource-review-app-packaging-exclusion.md`
- why next:
  - this is more of an app-assembly fallback question than a single-file delete question
  - it depends on proving that module resources fully cover what the app needs

## Likely Blocker Family

### 5. Executable app resource assembly fallback

- review card:
  - `docs/architecture/builder-resource-review-executable-app-fallback.md`
- why later:
  - this family is where silent root fallback is most likely to block closeout
  - it is an integration-level answer, not just a file-location answer
  - treat this as the blocker sink after narrower resource families are classified first

## Owner Rule

When the next owner starts, prefer:

1. classify one `Start Now` resource family fully
2. record `DELETE_NOW`, `EXPLICIT_RESOURCE_SHIM`, or `BLOCKS_CLOSEOUT`
3. only then move to the next row

Do not fan out across all resource families at once.

## Suggested First Handoff Phrase

`HANDOFF READY: start builder resource ownership closure from framework-builder compatibility mapper XML, then move to framework contract metadata resource.`
