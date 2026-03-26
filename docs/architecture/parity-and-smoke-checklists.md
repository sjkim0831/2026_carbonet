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

1. guided step context is known for the verification target
2. template line and screen family rule are resolved
3. menu node resolves to the expected page id
4. page id resolves to the expected route
5. route resolves to the expected shell profile
6. shell profile resolves to the expected header/menu/footer composition
7. page frame matches the approved family
8. all governed components render without missing asset errors
9. required popup, grid, search, upload, report, and approval blocks exist
10. primary actions and row actions are visible where expected
11. event -> function -> API -> backend -> DB chain is complete
12. help, accessibility, security, and authority bindings are present

Release blocker if one item fails.

## 1-A. Builder-Input-To-Runtime-Evidence Checklist

Before closing a verify turn, confirm the `04` builder input and `05` runtime result
can be pointed to by the same governed keys:

1. `menuCode`, `pageId`, and `menuUrl` identify the same screen in builder and runtime evidence
2. `guidedStateId`, `templateLineId`, and `screenFamilyRuleId` are identical across compare, repair, and handoff notes
3. builder draft version and published runtime version are both visible
4. builder node and event counts can be compared with current runtime evidence
5. registry issue counts are visible for generated and current snapshots
6. publish evidence or runtime audit evidence is attached before smoke closure
7. repair candidates can be traced back to one builder asset or one runtime blocker source
8. the same owner lane is preserved until the blocker is handed off or closed

## 1-B. Compare-To-Repair Payload Mapping Checklist

Before opening repair from one compare result, confirm the compare output already
provides these payload fields without reinterpretation:

1. `projectId`, `releaseUnitId`, and `selectedScreenId`
2. `guidedStateId`, `templateLineId`, `screenFamilyRuleId`, and one stable `ownerLane`
3. `builderInput.builderId`, `builderInput.draftVersionId`, `builderInput.menuCode`, `builderInput.pageId`, and `builderInput.menuUrl`
4. `runtimeEvidence.publishedVersionId`, `runtimeEvidence.currentNodeCount`, and `runtimeEvidence.currentEventCount`
5. `compareBaseline`, `blockerSet`, and `repairCandidateSet`
6. publish evidence or compare trace attached before repair/open handoff
7. the same governed keys survive into repair/apply and parity recheck

## 1-C. Verify-To-Handoff Closure Checklist

Before `09` marks the current verification scope `HANDOFF READY`, confirm:

1. `04` builder input and `05` runtime result are both visible on the same verify screen
2. `06` compare trace and baseline are attached to the current repair scope
3. `08` release-unit evidence or publish evidence is attached to the same scope
4. open blocker count is `0`
5. `parityRecheckRequiredYn` is `false`
6. `uniformityRecheckRequiredYn` is `false`
7. `smokeRequiredYn` is `false`
8. latest trace id is visible for the final closure note
9. the final status note uses the documented `HANDOFF READY` phrase for `01`

For the current `08 -> 09` handoff, the verify scope must also display:

- `releaseUnitId`
- `runtimePackageId`
- `deployTraceId`
- `ownerLane`
- `rollbackAnchorYn`

These values must match the latest `08` deploy console, runtime package matrix,
and session-loop evidence without renaming.

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

1. template-line parity
2. screen-family-rule parity
3. shell parity
4. page-frame parity
5. popup/grid/search parity
6. action hierarchy parity
7. help and diagnostics parity
8. authority behavior parity
9. backend-chain parity
10. first-deployment behavior parity

## 3. Uniformity Review Checklist

Check:

1. approved template line used
2. approved screen family rule used
3. approved shell profile used
4. approved page frame used
5. approved action-layout profile used
6. approved theme and token bundle used
7. approved spacing and density profile used
8. no unregistered button zones
9. no unregistered section layout
10. no page-local component family drift
11. HTML5 semantic landmarks and control semantics pass the governed verification checklist

## 4. Selected-Screen Repair Checklist

When opening repair for one page:

1. select project
2. resolve guided step, template line, and screen family rule
3. select screen family or page id
4. compare current runtime vs generated vs baseline vs patch target
5. select affected menu, element, popup, grid, search, or backend chain
6. prefer existing governed asset reuse
7. apply structured repair
8. rerun menu-to-rendered-screen verification
9. rerun parity and uniformity checks
10. rebuild release unit
11. deploy patch and rerun smoke

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
6. `releaseUnitId`, `runtimePackageId`, and `deployTraceId` visible on the verify scope
7. `ownerLane` and `rollbackAnchorYn` preserved into the final smoke note

Deployment is not complete until all applicable checks pass.

## 6. Repeat-Until-Parity Loop

Use this exact loop repeatedly:

1. collect current runtime
2. refresh builder draft and published runtime linkage evidence
3. run menu-to-rendered-screen verification
4. run parity review
5. run uniformity review
6. open selected-screen repair for blockers
7. regenerate governed assets
8. rebuild release unit
9. redeploy
10. rerun smoke
11. close only when blocking gaps are zero

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
2. approved template line and screen family rule are used
3. approved shell, frame, theme, token, spacing, and action-layout profiles are used
4. generated assets carry provenance to requirement, scenario, guided step, and release unit
5. human and AI modifications are both visible in change traces
6. event, function, API, backend, and DB links are complete
7. help, accessibility, authority, security, and diagnostics assets are present
8. compare, patch, and rollback targets are available
9. no unmanaged runtime-only drift remains after current-runtime collection
10. frontend, backend, DB, and runtime package pattern families are compatible

## 7-B. Full-Stack Pattern Consistency Checklist

Before release is marked parity-ready, confirm:

1. selected template line and screen family rule are declared
2. selected shell, frame, theme, spacing, density, and slot profiles are declared
3. selected binding family is declared
4. selected backend-chain family is declared
5. selected DB object and SQL draft families are declared
6. runtime package pattern family is declared
7. frontend pattern maps to backend pattern
8. backend pattern maps to DB pattern
9. package pattern matches selected common lines and thin-runtime boundary
10. style coverage and style dedupe states are green

## 8. Requirement Coverage Recheck Checklist

Before closing a feature family, confirm:

1. requirement-domain items are all mapped
2. menu candidates are all registered or explicitly waived
3. template lines and screen family rules are all registered or explicitly waived
4. page-design assets are all registered or explicitly waived
5. element-design assets are all registered or explicitly waived
6. popup/grid/search/upload/export/approval blocks are covered when required
7. backend-chain and DB-chain are covered
8. help, security, and accessibility assets are covered

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

If the operator uses wording such as `붙어`, `붙어서`, `이어서 해줘`, `무한 반복`, `무한반복`, or `1분마다 재실행` during this replay loop:

- keep the same parity-closure lane and the same current checklist position unless ownership explicitly changes
- continue from the last unfinished blocker or checklist item instead of restarting the whole review
- interpret numbered-session attachment by [resonance-10-session-assignment.md](/opt/projects/carbonet/docs/ai/80-skills/resonance-10-session-assignment.md)
- interpret tmux-lane continuation by [tmux-multi-account-delivery-playbook.md](/opt/projects/carbonet/docs/architecture/tmux-multi-account-delivery-playbook.md)

## 10-A. Lane 09 Session-Attached Repeat Order

When the operator explicitly attaches to `09` with wording such as
`9번 붙어서 무한 반복 1분마다 재실행 혹은 이어서 해줘`, keep the
repeat order fixed as:

1. confirm the current `09` session is still alive
2. recover the last unfinished compare, parity, repair, or smoke item
3. continue from that unfinished point inside the same `09` ownership scope
4. rerun the same verify range only after the unfinished item is closed
5. stop only on operator stop, `DONE`, `BLOCKED`, `HANDOFF`, or ownership change

Use `60 seconds` as the default loop cadence unless another explicit interval
is documented for the same lane.
