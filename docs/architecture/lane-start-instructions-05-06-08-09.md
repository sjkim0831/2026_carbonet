# Lane Start Instructions 05 06 08 09

Generated on 2026-03-21 for immediate implementation kickoff after the `01`
contract lane freeze.

## Purpose

This document provides a direct start brief for the first implementation lanes:

- `05` frontend runtime and operator UI
- `06` backend control plane
- `08` deploy and runtime package
- `09` verify compare and repair

Each lane should be able to start from this file without reopening `01`.

## 05 Frontend Runtime And Operator UI

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/governed-identity-naming-convention.md`
- `docs/architecture/context-key-strip-contract.md`
- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/frontend/admin-template-parity-inventory.md`
- `docs/prototypes/resonance-ui/project-runtime.html`
- `docs/prototypes/resonance-ui/deploy-console.html`
- `docs/prototypes/resonance-ui/current-runtime-compare.html`

### First Code Targets

- one shared operator shell in `frontend/src`
- one context-key strip component
- one runtime page
- one compare page

### Must Preserve

- HTML5 semantic structure
- context-key strip before first primary work region
- public/admin split visibility
- `guidedStateId`, `templateLineId`, `screenFamilyRuleId`, `ownerLane`
- `03` handoff rules for template-line, theme-set, custom admin route, and EN variant governance

### End Of First Hour

Leave one of:

- `HANDOFF READY: 09 can continue from React compare page and context-key strip; current blocker count is 0.`
- `BLOCKED: waiting for 01 because <specific missing contract reason>.`

05 should stay handoff-ready only while the runtime/operator surface still keeps:

- public/admin split visibility
- context-key strip placement
- `guidedStateId`, `templateLineId`, `screenFamilyRuleId`, `ownerLane`
- direct linkage to `04` builder inputs and `09` compare consumption

## 06 Backend Control Plane

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/repair-and-verification-api-contracts.md`
- `docs/architecture/module-selection-api-contracts.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
- `docs/architecture/governed-identity-naming-convention.md`

### First Code Targets

- repair open/apply API skeleton
- compare request/result API skeleton
- module-selection result trace API skeleton

### Must Preserve

- governed identity field names
- release-unit and generation trace linkage
- no ad hoc renaming of contract payload fields

### End Of First Hour

Leave one of:

- `HANDOFF READY: 07 can continue from stable controller/service names for compare and repair; current blocker count is 0.`
- `BLOCKED: waiting for 01 because <specific trace or payload semantic change>.`

## 08 Deploy And Runtime Package

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/runtime-package-matrix-and-deploy-ia.md`
- `docs/architecture/two-host-build-deploy-runbook.md`
- `docs/prototypes/resonance-ui/runtime-package-matrix.html`
- `docs/prototypes/resonance-ui/deploy-console.html`
- `ops/scripts/resonance-session-loop.sh`

### First Code Targets

- one runtime package assembly path
- one release-unit packaging assumption in code or script
- one deploy status source
- one numbered-lane session-loop routing path for `08`

### Must Preserve

- runtime package matrix identity keys
- `233` build / `221` run / `193` DB role split
- main server as runtime truth
- public/admin split visibility inside rollout state
- `res-08-deploy` as the numbered deploy lane with the default `8번 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘` prompt

### End Of First Hour

Leave one of:

- `HANDOFF READY: 09 can continue from release-unit and runtime package evidence; current blocker count is 0.`
- `BLOCKED: waiting for 06 because runtime package needs concrete backend artifact naming.`

## 09 Verify Compare And Repair

### Open First

- `docs/architecture/session-implementation-handoff-map.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/parity-and-smoke-checklists.md`
- `docs/architecture/missing-asset-queue-ia.md`
- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/frontend/admin-template-parity-inventory.md`
- `docs/prototypes/resonance-ui/current-runtime-compare.html`
- `docs/prototypes/resonance-ui/repair-workbench.html`
- `docs/prototypes/resonance-ui/chain-matrix-explorer.html`

### First Code Targets

- one compare result model
- one blocker list model
- one repair queue entry model

### Must Preserve

- compare must distinguish current, generated, baseline, patch target
- blocker rows must keep `ownerLane`
- repair rows must keep `guidedStateId`, `templateLineId`, `screenFamilyRuleId`
- `03` handoff rules for template-line coverage, theme-set split decisions, and parity exceptions

### End Of First Hour

Leave one of:

- `HANDOFF READY: 05 and 06 can continue against stable compare and repair models; current blocker count is 0.`
- `BLOCKED: waiting for 05 or 06 because compare target fields are not yet wired in code.`

## Shared Rule

If any lane discovers a missing governed identity field or a need to reinterpret
template line, guided state, or screen family rule naming:

- stop
- record a `BLOCKED` phrase
- reopen `01` only for that explicit reason
