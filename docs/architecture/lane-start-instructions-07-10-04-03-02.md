# Lane Start Instructions 07 10 04 03 02

Generated on 2026-03-21 for secondary implementation lanes after the first
execution lanes begin.

## Purpose

This document provides direct start briefs for:

- `07` DB, SQL, migration, rollback
- `10` installable module and common lines
- `04` builder and asset studio implementation
- `03` theme and design-system implementation details
- `02` proposal intake implementation details

These lanes should start after the first implementation wave has already opened
real code boundaries.

## 07 DB SQL Migration Rollback

### Start After

- `06` has stabilized the first controller/service/API family names

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/implementation-blocker-audit.md`
- `docs/architecture/db-object-integrity-contract.md`
- `docs/architecture/common-db-and-project-db-splitting.md`
- `docs/architecture/runtime-package-matrix-and-deploy-ia.md`

### First Targets

- first SQL draft family for compare or repair support
- one migration draft
- one rollback draft
- common/project DB split verification note

### Must Preserve

- common DB vs project DB split
- project ownership on SQL drafts
- linkage to release unit and project unit

### End Of First Hour

Leave one of:

- `HANDOFF READY: 06 and 08 can continue from stable SQL draft, migration family, and release-unit binding placeholder; current blocker count is 0.`
- `BLOCKED: waiting for 06 because controller/service names are not yet stable enough for SQL family naming.`

## 10 Installable Module And Common Lines

### Start After

- `05`, `06`, and `08` expose the first real runtime package and trace flow

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/installable-module-pattern-contract.md`
- `docs/architecture/module-selection-and-install-ui-contract.md`
- `docs/architecture/module-selection-api-contracts.md`
- `docs/architecture/module-selection-trace-linkage-contract.md`
- `docs/prototypes/resonance-ui/module-selection-popup.html`
- `docs/prototypes/resonance-ui/module-selection-result.html`

### First Targets

- first attach-plan backed module-selection flow
- first common-line binding trace
- first module result linkage into release unit or runtime package

### Must Preserve

- no blind folder-to-build ingestion
- attach-plan-first pattern
- template line and screen family rule linkage
- centralized common-line upgrade ownership

### End Of First Hour

Leave one of:

- `HANDOFF READY: 08 can continue from module-result linkage into runtime package; current blocker count is 0.`
- `BLOCKED: waiting for 08 because no stable runtime package attachment point exists yet.`

## 04 Builder And Asset Studio Implementation

### Start After

- `05` has started implementing the first governed operator shell

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/page-design-schema.md`
- `docs/architecture/element-design-set-schema.md`
- `docs/architecture/page-assembly-schema.md`
- `docs/architecture/context-key-strip-contract.md`
- `docs/prototypes/resonance-ui/asset-studio.html`
- `docs/prototypes/resonance-ui/screen-builder.html`

### First Targets

- one builder surface frame
- one page-design editor shell
- one asset list with context-key strip

### Must Preserve

- builder does not bypass registered assets
- screen family rules stay visible and locked where required
- missing-asset and repair loops remain reachable

### End Of First Hour

Leave one of:

- `HANDOFF READY: 05 can continue from builder frame and governed asset editor shell; current blocker count is 0.`
- `BLOCKED: waiting for 03 because theme or template line controls are not yet stable enough for builder implementation.`

## 03 Theme And Design-System Implementation Details

### Start After

- `05` confirms the first React shell/component boundary

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/architecture/screen-family-ui-consistency-contract.md`
- `docs/prototypes/resonance-ui/theme-set-studio.html`

### First Targets

- one template line selector model
- one theme-set selector model
- one token or spacing profile wiring boundary

### Must Preserve

- public/admin split
- template line naming convention
- canonical screen family rule usage

### End Of First Hour

Leave one of:

- `HANDOFF READY: 04 and 05 can continue from stable template-line and theme-set controls; current blocker count is 0.`
- `BLOCKED: waiting for 05 because the first React shell boundary still changes too frequently.`

## 02 Proposal Intake Implementation Details

### Start After

- `05` and `06` can already consume proposal outputs

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/project-proposal-generation-api-contracts.md`
- `docs/architecture/project-proposal-generation-api-examples.md`
- `docs/architecture/proposal-to-mapping-ai-output-schema.md`
- `docs/prototypes/resonance-ui/proposal-mapping-draft.html`

### First Targets

- one proposal upload result model
- one proposal mapping draft list
- one candidate-set review path

### Must Preserve

- proposal outputs remain drafts until governed approval
- project binding is explicit
- template line and screen family rule candidates remain visible

### End Of First Hour

Leave one of:

- `HANDOFF READY: 04 can continue from proposal-mapping candidate review flow; current blocker count is 0.`
- `BLOCKED: waiting for 05 or 06 because proposal outputs do not yet have a real consumer boundary.`

## Shared Rule

These lanes are secondary on the first implementation day.

If they start too early and discover that:

- frontend runtime boundaries are still moving
- backend service names are still moving
- runtime package attachment points are still moving

they should pause and leave a `BLOCKED` note instead of inventing parallel conventions.
