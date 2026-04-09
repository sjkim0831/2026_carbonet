# Implementation Lane Prompt Starters

Generated on 2026-03-21 for use after the `01` contract lane handoff.

## Purpose

These short starters can be given to implementation lanes so they begin from
the agreed files and constraints instead of reinterpreting the architecture.

For even shorter lane-ready prompts, see:

- `docs/architecture/implementation-lane-short-prompts.md`
- `docs/architecture/implementation-lane-short-prompts-ko.md`

## 05 Frontend

Start from:

- `docs/architecture/lane-start-instructions-05-06-08-09.md`

Prompt starter:

- `05 lane: implement the first governed operator shell and context-key strip in frontend/src, then build project-runtime and current-runtime-compare using the existing prototype and do not rename governed identity fields.`

## 06 Backend

Start from:

- `docs/architecture/lane-start-instructions-05-06-08-09.md`

Prompt starter:

- `06 lane: implement control-plane API skeletons for repair open/apply, compare request/result, and module-selection result trace under src/main/java without changing contract field names or governed identity keys.`

## 08 Deploy

Start from:

- `docs/architecture/lane-start-instructions-05-06-08-09.md`

Prompt starter:

- `08 lane: implement the first runtime package assembly and deploy status flow from the documented runtime-package matrix and deploy-console contracts, preserving public/admin split and governed identity keys.`

## 09 Verify

Start from:

- `docs/architecture/lane-start-instructions-05-06-08-09.md`

Prompt starter:

- `09 lane: implement compare, blocker, and repair queue models from current-runtime-compare, repair-workbench, and chain-matrix-explorer, preserving ownerLane and full governed identity linkage.`

## 07 DB

Start from:

- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`

Prompt starter:

- `07 lane: after 06 stabilizes the first service and API family names, create the first SQL draft, migration draft, and rollback draft while preserving common/project DB split and release-unit traceability.`

## 10 Module

Start from:

- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`

Prompt starter:

- `10 lane: implement the first attach-plan-backed module selection flow and common-line linkage without allowing blind folder ingestion or losing template line and screen family rule traceability.`

## 04 Builder

Start from:

- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`

Prompt starter:

- `04 lane: implement the first builder surface frame and governed asset editor shell from asset-studio and screen-builder while keeping screen family rules visible and registered assets mandatory.`

If `04` is continuing builder resource ownership instead of ordinary builder UI work, start from:

- `docs/ai/60-operations/session-orchestration/active/resonance-platformization-20260409/builder-resource-ownership-current-closeout.md`
- `docs/architecture/builder-resource-ownership-queue-map.md`

Treat those two docs as the single live entry pair before opening the next row-specific review card.
If prompt-guided work changes blocker count, active row, next review target, or partial-closeout wording, update both docs in the same turn.

Prompt starter:

- `04 lane: continue BUILDER_RESOURCE_OWNERSHIP_CLOSURE from the current closeout and queue map, keep BUILDER_STRUCTURE_GOVERNANCE closed, and work only on the next queued row-specific review card and provisional handoff shape.`

## 03 Theme

Start from:

- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`

Prompt starter:

- `03 lane: implement template-line and theme-set selector models from the existing theme-set contracts, preserving public/admin split and canonical screen family rule usage.`

## 02 Proposal

Start from:

- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`

Prompt starter:

- `02 lane: implement proposal upload result and proposal-mapping draft review flow from the existing proposal contracts, keeping outputs as governed drafts until approval and preserving visible candidate sets.`
