# Builder Folder Refactor Priority Map

## Goal

Turn the builder-oriented folder cleanup into one executable order so one owner can refactor without reopening the same path debate.

Use this document together with:

- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/system-folder-refactor-checklist.md`
- `docs/architecture/large-move-completion-contract.md`
- `docs/architecture/screenbuilder-module-source-inventory.md`
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`
- `docs/architecture/builder-structure-wave-20260409-closure.md`

After the closed structure-governance family, continue from:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`
- supporting guidance only: `docs/architecture/builder-resource-entry-pair-maintenance-contract.md`

Treat those two docs as the single live entry pair for the next active builder continuation.
Use `docs/architecture/builder-resource-entry-pair-maintenance-contract.md` only as supporting guidance when continuation state changes.

If continuation state changes blocker count, active row, next review target, or partial-closeout wording, update both continuation docs in the same turn.

## Current Wave Freeze

For the current owner wave, the closed family is:

- `BUILDER_STRUCTURE_GOVERNANCE`

Treat this document as the execution order for that family, not as proof that broader builder completion is already done.

If that family is already accepted as closed, do not keep using this document as the live execution queue.

Use:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

for the next active builder continuation.

## Core Rule

Do not refactor by "which folder looks messy first".

Refactor by builder ownership first:

1. builder core
2. runtime-common adapter
3. project adapter
4. platform control-plane family
5. app assembly
6. frontend authoring boundary
7. bootstrap/install assets
8. legacy root shrink

Also do not assume builder implementation and structural cleanup must be separated.

Preferred rule:

- if a builder slice already touches one family, clean that family toward the target structure in the same slice
- if the cleanup crosses too many shared families, split it into a dedicated refactor wave

Accumulated large-move rule:

- a repository-wide large move may be executed as repeated small family cutovers
- each slice should still end with one clear source-of-truth path
- do not keep old and new ownership lines alive longer than needed

## Priority 1

Paths that should stop regrowing under the root legacy tree:

- `src/main/java/egovframework/com/platform/**`
- `src/main/java/egovframework/com/framework/**`
- `src/main/java/egovframework/com/feature/admin/screenbuilder/**`
- `src/main/java/egovframework/com/feature/admin/framework/builder/**`

Primary question:

- does a live `modules/` owner already exist for this family

If yes:

- do not add new source here
- leave only explicit transitional shims if still required

## Priority 2

Builder module ownership confirmation:

- `modules/screenbuilder-core/**`
- `modules/screenbuilder-runtime-common-adapter/**`
- `modules/screenbuilder-carbonet-adapter/**`

Confirm:

- core-only logic lives in `screenbuilder-core`
- reusable default policy logic lives in `screenbuilder-runtime-common-adapter`
- Carbonet-specific menu, route, authority, runtime, and bridge wiring lives in `screenbuilder-carbonet-adapter`

## Priority 3

Platform common module cleanup:

- `modules/platform-request-contracts/**`
- `modules/platform-service-contracts/**`
- `modules/platform-help-content/**`
- `modules/platform-help/**`
- `modules/platform-observability-query/**`
- `modules/platform-observability-payload/**`
- `modules/platform-observability-web/**`
- `modules/platform-runtime-control/**`
- `modules/platform-version-control/**`

Confirm:

- family boundaries are reusable and not app-assembly-specific
- root `src/main/java/egovframework/com/platform/**` is shrinking, not regrowing

## Priority 4

Executable assembly boundary:

- `apps/carbonet-app/**`
- root `pom.xml`
- `apps/carbonet-app/pom.xml`

Confirm:

- executable assembly logic stays in `apps/carbonet-app`
- reusable builder/platform logic is not drifting back into the app module

## Priority 5

Frontend builder boundary:

- `frontend/src/app/**`
- `frontend/src/platform/**`
- `frontend/src/framework/**`
- `frontend/src/features/screen-builder/**`
- `frontend/src/app/routes/**`

Important route files:

- `frontend/src/app/routes/definitions.ts`
- `frontend/src/app/routes/pageRegistry.tsx`
- `frontend/src/app/routes/runtime.ts`
- `frontend/src/app/routes/platformRouteDefinitions.ts`
- `frontend/src/app/routes/platformPageRegistry.tsx`
- `frontend/src/app/routes/platformRuntimeRules.ts`

Confirm:

- app shell and route orchestration stay under `app`
- platform manifest and telemetry stay under `platform`
- shared builder/authority contract stays under `framework`
- route-level builder UI stays under `features/screen-builder`

## Priority 6

Bootstrap and install assets:

- `templates/screenbuilder-project-bootstrap/**`

Confirm:

- starter, manifest, validator, and checklist assets stay here
- runtime source and install templates do not mix

## Priority 7

Legacy resource shrink:

- `src/main/resources/egovframework/mapper/com/feature/admin/**`
- `src/main/resources/egovframework/mapper/com/platform/**`
- `src/main/resources/framework/**`

Do this only after the source ownership and module/resource consumers are verified.

## Execution Rhythm

Recommended one-owner order:

1. freeze target family and owner paths
2. inspect root legacy duplicates for that family
3. confirm live module or app target
4. move or keep only the minimum required shim
5. fix imports and dependencies
6. build/compile
7. remove transitional duplicate only if verification passes

## Shim Or Delete Check

Before keeping any old builder path, ask these in order:

1. does the canonical module path already exist and act as the source of truth
2. is the old path needed only for one remaining caller or runtime entry
3. is the old path extension-free
4. is the next removal condition documented

If any answer is no:

- do not call it a shim
- keep the family open

If all answers are yes:

- the old path may remain only as an explicit transitional shim

If the old path is no longer needed at all:

- delete it instead of preserving a dormant duplicate

## Done Criteria

The refactor slice is complete when:

- one family has one clear source-of-truth path
- no new common/platform builder logic was added to the root legacy tree
- app, module, frontend, and template ownership are easy to explain from the folder alone

For a broad structural wave, use `large-move-completion-contract.md` as the final closure standard.

For the current builder owner wave, use:

- `docs/architecture/builder-structure-wave-20260409-closure.md`

as the final family-close authority.
