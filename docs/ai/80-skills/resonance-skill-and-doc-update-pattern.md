# Resonance Skill And Doc Update Pattern

Generated on 2026-03-21 for repeatable Resonance documentation maintenance.

## Goal

Provide one repeatable update pattern so future Resonance work does not keep re-explaining the same architecture in slightly different ways.

Use this document when:

- a new requirement arrives
- a new stack or module is proposed
- a new screen family is requested
- a new runtime rule or governance rule is added
- skills docs need to be updated without duplicating older content

## Core Update Principle

Do not create a new document first.

Update in this order:

1. `resonance-design-patterns.md`
2. the most specific contract document
3. `operations-platform-console-architecture.md`
4. `platform-console-information-architecture.md` only if operator-facing menus or screen responsibilities change
5. `skill-gaps.md` only if a reusable implementation skill or checklist is still missing
6. `skill-boundaries.md` and `skill-index.md` only if the new work changes skill selection or scope

## No-Duplication Rule

Use these layers consistently:

- `resonance-design-patterns.md`
  - short canonical pattern summary
- specific contract docs
  - exact fields, rules, payloads, matrices, or runtime boundaries
- operations architecture
  - control-plane/runtime-plane narrative and product shape
- platform IA
  - menu, screen, and operator-facing placement
- skills docs
  - how future Codex sessions should route, extend, or detect missing checklists

Do not restate full architecture in every contract file.

## Required Classification Before Updating

Every new request should be classified into one or more of these families:

- project and release governance
- scenario and menu generation
- component and theme generation
- page and element design
- event/function/API/backend/DB chain
- security/accessibility/help
- runtime topology and deploy flow
- logging/cron/retention/monitoring
- parity/uniformity/repair
- productization and installable modules
- AI provider or automation support

## Update Workflow

### 1. Pattern check

Ask:

- which Resonance design pattern does this change touch?
- is it already covered by an existing pattern?
- is this a new pattern or a refinement of an old one?

If it is only a refinement, update the pattern summary instead of adding a new concept document.

### 2. Contract check

Ask:

- does this change require a new JSON schema, DB schema, API contract, release-unit rule, or matrix rule?

If yes, update the specific contract document.

### 3. Menu and screen check

Ask:

- does an operator need a new menu, matrix, compare view, registry, or repair surface?

If yes, update `platform-console-information-architecture.md`.

### 4. Runtime boundary check

Ask:

- is this control-plane-only?
- runtime-deployable?
- shared-reference-only?
- main-server runtime truth relevant?

If yes, update operations architecture and the common/project split doc.

### 5. Skill check

Ask:

- will future Codex sessions repeat this work?
- is there still no dedicated skill or checklist for it?

If yes, update `skill-gaps.md`.

Only update `skill-index.md` or `skill-boundaries.md` when actual routing changes.

## Required Cross-Checks

When a requirement changes, verify these families in order:

1. project-first ownership
2. scenario-first ownership
3. menu/page/feature linkage
4. component/theme/layout linkage
5. event/function/API/backend/DB linkage
6. security/accessibility/help linkage
7. control-plane versus runtime boundary
8. release-unit and rollback linkage
9. main-server runtime truth
10. chain and matrix visibility
11. design-output family completeness
12. requirement-item inclusion
13. missing page-family audit
14. missing component-family audit
15. component slot-profile audit
16. request-pattern replay readiness
17. GUI-first builder readiness
18. full-stack pattern consistency
19. installable module pattern and CSS dedupe consistency
20. AI-assisted module intake request and approval flow
21. approval and seal-image common-governance readiness
20. AI-assisted module intake review

If one family changes, update all directly affected linked families.

## Reusable Change Shapes

### New business screen family

Update:

- `resonance-design-patterns.md`
- `scenario-family-generation-contracts.md`
- `operations-platform-console-architecture.md`
- `platform-console-information-architecture.md`

Optional:

- `skill-gaps.md` if new checklist or skill is still missing

### Requirement or proposal refinement

Update:

- `resonance-design-patterns.md`
- `design-workspace-canonical-print-workflow.md`
- the most relevant scenario or contract document
- `operations-platform-console-architecture.md`

Check explicitly:

- whether all requirement-domain items are mapped
- whether any page, element, popup, grid, search, upload, export, approval, help, security, or backend-chain family is still missing
- whether the mature design-output package families remain complete

### New common module or stack

Update:

- `resonance-design-patterns.md`
- `platform-common-module-versioning.md`
- `installable-module-lifecycle-schema.md`
- `operations-platform-console-architecture.md`

Optional:

- `skill-index.md` / `skill-boundaries.md` if routing changes

### New topology or deploy rule

Update:

- `resonance-design-patterns.md`
- `operations-platform-console-architecture.md`
- `two-host-build-deploy-runbook.md` or related rollout doc
- `platform-console-information-architecture.md` if operator screens change

### New compare, repair, or audit rule

Update:

- `resonance-design-patterns.md`
- specific compare/trace contract
- `operations-platform-console-architecture.md`
- `platform-console-information-architecture.md`
- `skill-gaps.md` if implementation skill is still missing

## Completion Standard

An update is not complete until:

- the high-level pattern is reflected once
- the detailed contract is reflected once
- the operator-facing effect is reflected once
- the skill gap is updated if and only if a reusable missing checklist remains
- the requirement-item coverage and design-output family coverage are checked once
- missing page families and missing component families are checked once
- component slot-profile drift is checked once

## Anti-Patterns

Do not:

- create a new doc for every small refinement
- repeat the whole Resonance story in a low-level contract doc
- update only the architecture narrative without updating IA when menus changed
- update only skill gaps without updating the canonical architecture
- describe control-plane rules as if they automatically deploy to runtime-admin screens

## Recommended Minimal Future Routine

For most future requests, use this sequence:

1. update `resonance-design-patterns.md`
2. update the one most relevant contract doc
3. update `operations-platform-console-architecture.md`
4. update `platform-console-information-architecture.md` if menus/screens changed
5. update `skill-gaps.md` if a repeatable missing implementation pattern remains

This keeps Resonance documentation compact, layered, and repeatable.

## Repeat-Until-Parity Routine

When the request is “keep updating until parity is the same and no unmanaged element remains”, use this exact routine each turn:

1. update or confirm the affected Resonance pattern
2. update the most specific contract
3. update operations architecture
4. update IA if screens or operator surfaces changed
5. confirm requirement-item coverage
6. confirm design-output family coverage
7. confirm missing page-family and missing component-family audits
8. confirm operator feature completeness checklist coverage
8. confirm chain and matrix visibility
9. record remaining parity or unmanaged-element gaps in `skill-gaps.md` only if they are still reusable future work

This routine should be repeated feature-family by feature-family, not by rewriting the entire architecture each time.

Use [parity-and-smoke-checklists.md](/opt/projects/carbonet/docs/architecture/parity-and-smoke-checklists.md) as the default execution checklist for this loop.
