# Session Implementation Handoff Map

Generated on 2026-03-21 for the `01` contract lane.

## Purpose

This document tells implementation lanes where to start after the contract lane
freeze and what they must not reinterpret.

Use together with:

- `docs/ai/00-governance/ai-skill-doc-routing-matrix.md`
- `docs/ai/00-governance/ai-orchestration-doc-retention-inventory.md`
- `docs/architecture/high-parallel-account-orchestration-playbook.md`
- `docs/ai/80-skills/resonance-10-session-assignment.md`
- `docs/architecture/tmux-multi-account-delivery-playbook.md`
- `docs/architecture/governed-identity-naming-convention.md`
- `docs/architecture/implementation-priority-and-first-day-plan.md`
- `docs/architecture/implementation-blocker-audit.md`
- `docs/architecture/lane-start-instructions-05-06-08-09.md`
- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`

## Contract Freeze Baseline

Implementation lanes should treat the following as frozen unless `01` reopens
them:

- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`
- context-key strip placement
- public/admin surface split
- project-first and scenario-first generation order
- release-unit and runtime-package trace linkage

## Lane Start Points

### 02 Proposal And Requirement Intake

Primary files:

- `docs/architecture/project-proposal-generation-api-contracts.md`
- `docs/architecture/project-proposal-generation-api-examples.md`
- `docs/architecture/proposal-to-mapping-ai-output-schema.md`
- `docs/prototypes/resonance-ui/proposal-mapping-draft.html`
- `docs/prototypes/resonance-ui/project-proposal-inventory.html`
- `docs/prototypes/resonance-ui/project-proposal-matrix.html`

Must preserve:

- proposal outputs carry template line candidates
- proposal outputs carry screen family rule candidates
- proposal outputs remain project-bound

### 03 Theme, Shell, And Design System

Primary files:

- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/architecture/screen-family-ui-consistency-contract.md`
- `docs/prototypes/resonance-ui/theme-set-studio.html`
- `docs/prototypes/resonance-ui/design-workspace.html`

Must preserve:

- public/admin template lines remain separate
- screen family rules stay canonical uppercase enums
- theme-set outputs can seed page/element generation without bypassing rule families

### 04 Builder And Asset Studio

Primary files:

- `docs/architecture/page-design-schema.md`
- `docs/architecture/element-design-set-schema.md`
- `docs/architecture/page-assembly-schema.md`
- `docs/architecture/context-key-strip-contract.md`
- `docs/prototypes/resonance-ui/asset-studio.html`
- `docs/prototypes/resonance-ui/screen-builder.html`
- `docs/prototypes/resonance-ui/project-scenario-output.html`
- `docs/prototypes/resonance-ui/project-design-output.html`

Must preserve:

- builder surfaces always show context-key strip
- same screen family rule means same approved layout family
- missing-asset and repair loops stay traceable

### 05 Frontend Runtime And Operator UI

Primary files:

- `frontend/src`
- `docs/prototypes/resonance-ui/index.html`
- `docs/prototypes/resonance-ui/project-runtime.html`
- `docs/prototypes/resonance-ui/deploy-console.html`
- `docs/prototypes/resonance-ui/current-runtime-compare.html`

Must preserve:

- HTML5 semantic structure
- context-key strip before the main work region
- public/admin runtime split under one project
- no local reinterpretation of template line naming

### 06 Backend Control Plane

Primary files:

- `src/main/java`
- `src/main/resources/egovframework/mapper`
- `docs/architecture/repair-and-verification-api-contracts.md`
- `docs/architecture/module-selection-api-contracts.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`

Must preserve:

- repair and compare APIs accept governed identity keys
- trace objects keep release-unit and generation linkage
- backend should not rename governed identity fields

### 07 DB, SQL, Migration, Rollback

Primary files:

- `docs/sql`
- `docs/architecture/db-object-integrity-contract.md`
- `docs/architecture/common-db-and-project-db-splitting.md`
- `docs/architecture/runtime-package-matrix-and-deploy-ia.md`

Must preserve:

- common and project DB storage split
- SQL drafts remain traceable to project and release unit
- no DB artifact should lose template line or scenario linkage if already declared upstream

### 08 Deploy, Runtime Package, Server

Primary files:

- `ops`
- `docs/architecture/two-host-build-deploy-runbook.md`
- `docs/architecture/runtime-package-matrix-and-deploy-ia.md`
- `docs/prototypes/resonance-ui/runtime-package-matrix.html`
- `docs/prototypes/resonance-ui/deploy-console.html`

Must preserve:

- runtime package matrix shows guided state, template line, screen family rule, and owner lane
- main server remains runtime truth reference
- public/admin split remains visible even when runtime hosts are shared

### 09 Verify, Compare, Repair

Primary files:

- `docs/architecture/parity-and-smoke-checklists.md`
- `docs/architecture/missing-asset-queue-ia.md`
- `docs/prototypes/resonance-ui/current-runtime-compare.html`
- `docs/prototypes/resonance-ui/repair-workbench.html`
- `docs/prototypes/resonance-ui/chain-matrix-explorer.html`

Must preserve:

- parity checks compare current, baseline, target, and patch
- blockers always carry owner lane
- repair-open and repair-apply do not lose guided state or family rule

### 10 Installable Module And Common Lines

Primary files:

- `docs/architecture/installable-module-pattern-contract.md`
- `docs/architecture/module-selection-and-install-ui-contract.md`
- `docs/architecture/module-selection-api-contracts.md`
- `docs/architecture/module-selection-trace-linkage-contract.md`
- `docs/prototypes/resonance-ui/module-selection-popup.html`
- `docs/prototypes/resonance-ui/module-selection-result.html`

Must preserve:

- module selection is attach-plan driven, not blind auto-build
- module results remain tied to template line and screen family rule
- common module line upgrades stay centralized

## First 30-Minute Checklist

Each implementation lane should spend the first 30 minutes on:

1. reopen only its owned files and the handoff map
2. confirm the governed identity keys needed by that lane
3. confirm the prototype or contract that will act as the immediate source of truth
4. list the first concrete code or document target
5. mark the lane as `IN_PROGRESS`, `HANDOFF`, or `BLOCKED` with one short reason

Lane-specific focus:

- `02`
  - confirm proposal output counts and candidate sets
- `03`
  - confirm public/admin template split and theme-set scope
- `04`
  - confirm builder entry surfaces and missing-asset loop
- `05`
  - confirm first React route, frame, and shared component boundary
- `06`
  - confirm first controller/service/API family to implement
- `07`
  - confirm first SQL draft and DB split assumptions
- `08`
  - confirm first runtime package and rollout path
- `09`
  - confirm first parity, compare, and repair target
- `10`
  - confirm first module attach flow and common-line binding target

## Standard Status Phrases

Use one of these short status phrases in lane notes or handoff comments.

### HANDOFF READY

Use when:

- the lane's current scope is internally consistent
- the next lane can continue without reopening `01`
- the changed files and next target are known

Recommended format:

- `HANDOFF READY: <target lane> can continue from <file or flow>; current blocker count is <n>.`

Examples:

- `HANDOFF READY: 05 can continue from project-runtime and deploy-console frame implementation; current blocker count is 0.`
- `HANDOFF READY: 09 can continue from current-runtime-compare and repair-workbench verification flow; current blocker count is 1 known gap.`

### BLOCKED

Use when:

- a missing contract field prevents clean continuation
- another lane owns the next required change
- a reopen of `01` is required

Recommended format:

- `BLOCKED: waiting for <lane or contract> because <specific reason>.`

Examples:

- `BLOCKED: waiting for 01 because a new context-key strip companion field is required.`
- `BLOCKED: waiting for 06 because SQL draft names depend on the final backend service boundary.`

## Allowed Reopen Cases

Only reopen `01` contract ownership when:

- a lane finds a missing governed identity field
- a lane needs a new context-key strip rule
- a lane cannot express a required public/admin split using current contracts
- release-unit, runtime-package, or repair trace semantics must change

## Naming Audit Status

Current status:

- template line naming is normalized to `public-line-*` and `admin-line-*`
- guided state naming is normalized to `guided-build-*`
- screen family rules remain uppercase canonical enums by design
- owner lane naming is normalized to `res-*`

Remaining uppercase values in docs are expected when they represent:

- actor or policy enums
- screen family rule enums
- package or standards families

They should not be treated as naming drift unless they are being used as
template lines or guided states.

## Ready-For-Implementation Verdict

`01` contract lane verdict:

- document and prototype governance is ready for implementation lanes
- naming ambiguity is reduced enough to start code lanes
- remaining work is mostly code implementation and runtime verification
