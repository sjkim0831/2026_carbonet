# Builder Structure Wave 2026-04-09 Closure

## Goal

Freeze the builder-oriented structure-cleanup owner decision for the current wave.

This document answers four questions for the current wave:

- which family is being closed now
- which path is the source of truth
- whether old paths stay as shims or must be deleted
- how `large-move-completion-contract.md` is interpreted for builder work

Use this document together with:

- `docs/architecture/system-folder-structure-alignment.md`
- `docs/architecture/builder-folder-refactor-priority-map.md`
- `docs/architecture/screenbuilder-multimodule-cutover-plan.md`
- `docs/architecture/large-move-completion-contract.md`
- `docs/architecture/builder-source-of-truth-matrix.md`
- `docs/architecture/builder-structure-owner-checklist.md`

After this family is accepted as closed, continue from:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

If continuation state later changes blocker count, active row, next review target, or partial-closeout wording, update both continuation docs in the same turn.

## Current Wave Owner Decision

The current wave closes only the builder structure-governance family.

It does not claim closure for:

- control-plane composition outside builder ownership
- frontend builder runtime/editor implementation details
- runtime verification for routes unrelated to builder ownership

The owner for this wave is expected to finish in a fully closed documentation state for the selected family instead of partially updating many unrelated families.

## Family Closed In This Wave

The family closed in this wave is:

- `BUILDER_STRUCTURE_GOVERNANCE`

This family includes:

- builder module ownership
- folder source-of-truth declaration
- legacy root treatment for builder-owned paths
- shim-versus-delete rules
- wave-level completion criteria

This family does not include direct backend or frontend implementation.

## Canonical Source Of Truth

For the shortest path-by-path answer, use:

- `docs/architecture/builder-source-of-truth-matrix.md`

For the selected family, the canonical source-of-truth paths are:

- backend builder core: `modules/screenbuilder-core/**`
- backend reusable runtime-common policy line: `modules/screenbuilder-runtime-common-adapter/**`
- backend Carbonet project binding and bridge line: `modules/screenbuilder-carbonet-adapter/**`
- executable app assembly: `apps/carbonet-app/**`
- builder bootstrap and install assets: `templates/screenbuilder-project-bootstrap/**`
- structure and closure rules: `docs/architecture/**`, `docs/ai/**`, `STRUCTURE.md`

For this wave, the legacy root builder paths are explicitly not source of truth:

- `src/main/java/egovframework/com/platform/screenbuilder/**`
- `src/main/java/egovframework/com/framework/builder/**`
- `src/main/java/egovframework/com/feature/admin/screenbuilder/**`
- `src/main/java/egovframework/com/feature/admin/framework/builder/**`

If any builder-owned path above still exists in the legacy root tree, it is transitional only.

## Old Path Rule: Shim Or Delete

Use this decision order.

### Delete Immediately

Delete the old path instead of keeping a shim when all of the following are true:

- the module path already owns the family
- no live runtime entry depends on the old path
- resource ownership is already moved
- no remaining caller needs the old package name as a compatibility surface

### Keep As Explicit Shim

Keep the old path only as a shim when all of the following are true:

- the canonical module path is already the source of truth
- the old path only forwards or aliases one remaining runtime or compatibility entry
- the old path is not extended with new logic
- the removal condition is named in docs
- the next-removal candidate is already known

### Not Allowed

Do not call the old path a shim when any of the following are true:

- new source is still added there
- resources are still resolved there as the real ownership line
- the app still silently relies on duplicate root resources
- the old path is used because the module path is incomplete but undocumented

In that case the family is still open, not closed.

## Builder-Specific Shim Standard

For builder work, the only acceptable shim shapes are:

- compatibility wrapper
- route-forwarding bridge
- package-name-preserving delegate
- resource alias kept for one remaining runtime entry

The following are not acceptable shims:

- duplicate live services
- duplicate mapper XML ownership
- duplicate builder controller implementations
- duplicate core model or port ownership

## Completion Interpretation For This Wave

`large-move-completion-contract.md` is applied narrowly to `BUILDER_STRUCTURE_GOVERNANCE`.

The wave is considered complete only when all of the following are true.

### 1. Family Freeze

- the wave closes only the builder structure-governance family
- the selected family name is explicit in docs
- the owner path for this family is explicit in docs

### 2. Source-Of-Truth Closure

- one canonical path is declared for each builder lane
- legacy root builder paths are declared non-canonical
- `STRUCTURE.md` and AI entry docs point to the same ownership answer

### 3. Shim/Delete Closure

- the decision standard for old builder paths is written down
- remaining shims are described as transitional only
- undocumented mixed ownership is treated as incomplete

### 4. Large-Move Closure

- the current wave does not claim broader completion than it actually closes
- this wave names what is done, what is still transitional, and what family moves next
- completion is judged by ownership closure, not by “many files were already moved”

## Done / Not Done For 2026-04-09

### Done In This Wave

- builder structure-governance family is frozen
- source-of-truth path decision is frozen
- shim-versus-delete rule is frozen
- large-move completion interpretation for builder structure work is frozen

### Explicitly Not Done In This Wave

- final deletion of every remaining legacy runtime shim
- broader control-plane family closure outside builder structure governance
- backend/frontend source implementation closure
- runtime proof for unrelated families

## Next Family After This Wave

The next family should be selected from these, in order:

1. `BUILDER_RESOURCE_OWNERSHIP_CLOSURE`
2. `BUILDER_COMPATIBILITY_SHIM_REMOVAL`
3. `CONTROL_PLANE_COMPOSITION_SPLIT`

Do not reopen the structure-governance debate while executing those next families unless the source-of-truth declaration itself changes.

For the live continuation entry, use:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the `single live entry pair` for the next family.
