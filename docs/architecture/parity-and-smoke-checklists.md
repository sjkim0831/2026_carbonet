# Parity And Smoke Checklists

Generated on 2026-03-21 for repeatable Resonance parity closure and post-deploy verification.

## Goal

Define the repeatable checklists used to close parity gaps and verify deployed runtime packages without rethinking the process every turn.

Use this document when:

- a generated screen family must be compared with the current runtime
- a runtime package is deployed and needs smoke verification
- a selected-screen repair must be confirmed before patch release
- a project-unit rollout must prove first-deployment readiness

Also use it when:

- requirement-domain coverage must be rechecked after a design or scenario change
- a generated menu or page family is promoted from current runtime collection
- a repeated parity-update turn needs one stable loop instead of ad hoc review

## 1. Menu-To-Rendered-Screen Checklist

Check these in order for every governed menu node:

1. menu node resolves to the expected page id
2. page id resolves to the expected route
3. route resolves to the expected shell profile
4. shell profile resolves to the expected header/menu/footer composition
5. page frame matches the approved family
6. all governed components render without missing asset errors
7. required popup, grid, search, upload, report, and approval blocks exist
8. primary actions and row actions are visible where expected
9. event -> function -> API -> backend -> DB chain is complete
10. help, accessibility, security, and authority bindings are present

Release blocker if one item fails.

## 2. Parity Review Checklist

Review the following families before marking parity-ready:

- public home
- public signin
- join family
- admin login
- list pages
- detail pages
- edit pages
- review pages
- popup-heavy admin pages
- file/export/approval screens

For each family, confirm:

1. shell parity
2. page-frame parity
3. popup/grid/search parity
4. action hierarchy parity
5. help and diagnostics parity
6. authority behavior parity
7. backend-chain parity
8. first-deployment behavior parity

## 3. Uniformity Review Checklist

Check:

1. approved shell profile used
2. approved page frame used
3. approved action-layout profile used
4. approved theme and token bundle used
5. approved spacing and density profile used
6. no unregistered button zones
7. no unregistered section layout
8. no page-local component family drift
9. HTML5 semantic landmarks and control semantics pass the governed verification checklist

## 4. Selected-Screen Repair Checklist

When opening repair for one page:

1. select project
2. select screen family or page id
3. compare current runtime vs generated vs baseline vs patch target
4. select affected menu, element, popup, grid, search, or backend chain
5. prefer existing governed asset reuse
6. apply structured repair
7. rerun menu-to-rendered-screen verification
8. rerun parity and uniformity checks
9. rebuild release unit
10. deploy patch and rerun smoke

## 5. Project-Unit Deploy Smoke Checklist

For each project unit and target server set:

### Main web node

1. runtime package received
2. start, stop, and restart macros valid
3. port bound
4. health endpoint OK
5. Nginx entrypoint reachable
6. current-runtime compare available

### Sub web node

1. runtime package received
2. staged rollout target reachable
3. health check OK
4. rollback handoff ready

### DB node

1. DB connection valid
2. migration or SQL draft applicable
3. rollback checkpoint ready
4. backup state visible

### Global checks

1. required logs flowing
2. required audit and security events visible
3. required cron families registered on the main server
4. no blocking scheduler errors
5. active artifact version recorded

Deployment is not complete until all applicable checks pass.

## 6. Repeat-Until-Parity Loop

Use this exact loop repeatedly:

1. collect current runtime
2. run menu-to-rendered-screen verification
3. run parity review
4. run uniformity review
5. open selected-screen repair for blockers
6. regenerate governed assets
7. rebuild release unit
8. redeploy
9. rerun smoke
10. close only when blocking gaps are zero

## 7. Completion Condition

A feature family is done only when:

- no blocking menu-to-rendered-screen gap remains
- no blocking parity gap remains
- no blocking uniformity gap remains
- no unmanaged element family remains
- smoke checks pass on the governed main server and applicable rollout targets

## 7-A. Uniform Asset Quality Checklist

Before closing a governed feature family, confirm:

1. menu, scenario, page, element, backend, and DB assets all belong to the same governed chain
2. approved shell, frame, theme, token, spacing, and action-layout profiles are used
3. generated assets carry provenance to requirement, scenario, and release unit
4. human and AI modifications are both visible in change traces
5. event, function, API, backend, and DB links are complete
6. help, accessibility, authority, security, and diagnostics assets are present
7. compare, patch, and rollback targets are available
8. no unmanaged runtime-only drift remains after current-runtime collection
9. frontend, backend, DB, and runtime package pattern families are compatible

## 7-B. Full-Stack Pattern Consistency Checklist

Before release is marked parity-ready, confirm:

1. selected shell, frame, theme, spacing, density, and slot profiles are declared
2. selected binding family is declared
3. selected backend-chain family is declared
4. selected DB object and SQL draft families are declared
5. runtime package pattern family is declared
6. frontend pattern maps to backend pattern
7. backend pattern maps to DB pattern
8. package pattern matches selected common lines and thin-runtime boundary
9. style coverage and style dedupe states are green

## 8. Requirement Coverage Recheck Checklist

Before closing a feature family, confirm:

1. requirement-domain items are all mapped
2. menu candidates are all registered or explicitly waived
3. page-design assets are all registered or explicitly waived
4. element-design assets are all registered or explicitly waived
5. popup/grid/search/upload/export/approval blocks are covered when required
6. backend-chain and DB-chain are covered
7. help, security, and accessibility assets are covered

## 8-A. Component Coverage And Missing-Asset Checklist

Before marking a page family ready, confirm:

1. all expected component families from the scenario are registered
2. all selected components exist in the approved catalog
3. all required composite blocks exist for the chosen page family
4. popup, grid, search-form, upload, report, approval, and dashboard blocks are present when required
5. no runtime-only component remains outside governed catalog tracking
6. no page uses one-off layout or component drift outside the approved theme set
7. all interactive components emit mandatory trace families
8. all components carry help, accessibility, authority, and security bindings where required
9. same-family components in the same page zone use the same approved slot profile
10. no page-local override changes internal action, helper, badge, or pagination slot placement

## 8-C. Component Slot Uniformity Checklist

Before marking a component family parity-ready, confirm:

1. `componentFamily + pageZone` resolves to one approved `slotProfileId`
2. primary action group is placed in the same internal slot across the family
3. helper text and status badge positions are consistent across the family
4. counters, totals, and pagination appear in the same governed slots
5. no page-local CSS overrides internal slot placement
6. any intentional deviation is published as a new approved slot profile

## 8-B. Missing Page And Requirement Gap Checklist

Before release, confirm:

1. every requirement-domain item has a target scenario family or an explicit waiver
2. every scenario family has all required page families
3. every menu candidate resolves to at least one page assembly
4. every required admin or public page is present in the generated-result compare set
5. no required page family remains in `planned-only` state
6. no required business function is missing from the release-unit matrix

## 9. Current-Runtime Promotion Checklist

When importing from the existing system:

1. collect menu and route
2. collect page shell and frame
3. collect element families
4. collect popup/grid/search/action-layout blocks
5. collect backend chain and DB object ownership
6. compare against governed catalogs
7. promote reusable assets
8. record remaining runtime-only exceptions

## 10. Request-Pattern Replay Checklist

For repeat update turns, always re-check in this order:

1. requirement coverage
2. missing page families
3. missing component families
4. missing binding families
5. parity and uniformity blockers
6. runtime-only drift
7. repair candidates
8. rebuild and redeploy readiness
