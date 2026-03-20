# Resonance DB First Draft Family

Generated on 2026-03-21 for lane `07` DB, SQL, migration, and rollback work.

## Goal

Fix the first DB draft family that `06`, `08`, and `09` can share without reopening common contracts.

This draft family covers:

- module-selection preview and apply result persistence
- repair session open and apply history
- menu-to-rendered-screen verification history
- release-unit and guided-state trace continuity

## Source Contracts

This draft follows:

- `docs/architecture/module-selection-api-contracts.md`
- `docs/architecture/module-selection-trace-linkage-contract.md`
- `docs/architecture/repair-and-verification-api-contracts.md`
- `docs/architecture/chain-matrix-governance-schema.md`
- `docs/architecture/common-db-and-project-db-splitting.md`
- `docs/architecture/db-object-integrity-contract.md`

## DB Split Decision

Keep all tables in this first draft family in `COMMON_DB`.

Reason:

- they are control-plane workflow records, not project runtime business data
- they anchor guided generation, repair, verification, and release readiness
- `08` deploy and rollback views need the same records without depending on project-local DB layouts

Do not put these rows in `PROJECT_DB`:

- module binding preview or result metadata
- repair session and repair apply history
- verification run history
- blocker and rollback pointer metadata created only for governance

## First Table Family

## Governance Baseline For This Draft

Apply these shared governance columns to the first draft family so that `06`,
`08`, and `09` can join on stable trace and rollback metadata without adding
runtime business-table coupling:

- `TRACE_ID`
- `SCENARIO_FAMILY_ID`
- `ROW_VERSION`
- `CREATED_BY`
- `UPDATED_BY`

Additional rule:

- `RSN_MODULE_BINDING_RESULT` and `RSN_REPAIR_APPLY_RUN` keep
  `ROLLBACK_ANCHOR_YN` because `08` deploy and rollback views need one explicit
  governed anchor per apply family
- fields that drive operator review lists, release handoff, or rollback evidence
  should be promoted into explicit columns instead of staying only inside one
  payload JSON blob
- `RSN_VERIFICATION_RUN` is append-only, but still keeps `UPDATED_AT` and
  `UPDATED_BY` equal to the latest review actor for consistent audit export
- repair and verification rows keep an explicit `OCCURRED_AT` event timestamp
  in addition to `CREATED_AT` so replay, retry, and delayed persistence can
  still preserve the original governed execution moment
- no FK hardening is added in this first draft; linkage remains ID-based until
  `06` freezes the first mapper and service family names

### 1. `RSN_MODULE_BINDING_PREVIEW`

Purpose:

- persist the preview acknowledged before `module-selection/apply`

Required columns:

- `MODULE_BINDING_PREVIEW_ID`
- `TRACE_ID`
- `PROJECT_ID`
- `SCENARIO_FAMILY_ID`
- `SCENARIO_ID`
- `GUIDED_STATE_ID`
- `PAGE_ASSEMBLY_ID`
- `TEMPLATE_LINE_ID`
- `SCREEN_FAMILY_RULE_ID`
- `THEME_SET_ID`
- `INSTALLABLE_MODULE_ID`
- `MODULE_PATTERN_FAMILY_ID`
- `MODULE_DEPTH_PROFILE_ID`
- `SELECTION_MODE`
- `OPERATOR_ID`
- `FRONTEND_IMPACT_SUMMARY`
- `BACKEND_IMPACT_SUMMARY`
- `DB_IMPACT_SUMMARY`
- `CSS_IMPACT_SUMMARY`
- `RUNTIME_PACKAGE_ATTACH_PREVIEW`
- `ROLLBACK_PLAN_SUMMARY`
- `BLOCKING_ISSUE_COUNT`
- `BLOCKING_ISSUE_SET_JSON`
- `READY_FOR_APPLY_YN`
- `PREVIEW_PAYLOAD_JSON`
- `ROW_VERSION`
- `CREATED_BY`
- `UPDATED_BY`
- `CREATED_AT`
- `UPDATED_AT`

Indexes to preserve:

- `(PROJECT_ID, GUIDED_STATE_ID)`
- `(PROJECT_ID, INSTALLABLE_MODULE_ID, GUIDED_STATE_ID)`
- `(SCENARIO_ID, SCREEN_FAMILY_RULE_ID)`
- `(TRACE_ID)`

### 2. `RSN_MODULE_BINDING_RESULT`

Purpose:

- persist one governed result after selection is applied

Required columns:

- `MODULE_BINDING_RESULT_ID`
- `MODULE_BINDING_PREVIEW_ID`
- `TRACE_ID`
- `PROJECT_ID`
- `SCENARIO_FAMILY_ID`
- `SCENARIO_ID`
- `GUIDED_STATE_ID`
- `PAGE_ASSEMBLY_ID`
- `TEMPLATE_LINE_ID`
- `SCREEN_FAMILY_RULE_ID`
- `THEME_SET_ID`
- `RELEASE_UNIT_ID`
- `RUNTIME_PACKAGE_ID`
- `GENERATION_RUN_ID`
- `JSON_REVISION_SET_JSON`
- `PUBLISHED_ASSET_TRACE_SET_JSON`
- `SELECTION_APPLIED_YN`
- `ATTACHED_PAGE_ASSET_SET_JSON`
- `ATTACHED_COMPONENT_ASSET_SET_JSON`
- `ATTACHED_BACKEND_ASSET_SET_JSON`
- `ATTACHED_DB_ASSET_SET_JSON`
- `APPLIED_MODULE_SET_JSON`
- `RUNTIME_PACKAGE_IMPACT_SUMMARY`
- `RELEASE_BLOCKER_DELTA_JSON`
- `TRACE_LINK_SET_JSON`
- `FOLLOW_UP_CHECKLIST_SUMMARY`
- `REPAIR_NEEDED_YN`
- `REPAIR_QUEUE_COUNT`
- `REPAIR_SESSION_CANDIDATE_ID`
- `COMPARE_CONTEXT_ID`
- `NEXT_RECOMMENDED_ACTION`
- `ROLLBACK_ANCHOR_YN`
- `RESULT_PAYLOAD_JSON`
- `ROW_VERSION`
- `CREATED_BY`
- `UPDATED_BY`
- `CREATED_AT`
- `UPDATED_AT`

Indexes to preserve:

- `(PROJECT_ID, RELEASE_UNIT_ID)`
- `(GUIDED_STATE_ID, SCREEN_FAMILY_RULE_ID)`
- `(RELEASE_UNIT_ID, ROLLBACK_ANCHOR_YN)`
- `(TRACE_ID)`
- unique `(MODULE_BINDING_PREVIEW_ID)`

Rollback anchor:

- delete result row before deleting preview row
- detach from release-unit trace before hard delete
- keep JSON revision and asset-trace payload export together with the result row

### 3. `RSN_REPAIR_SESSION`

Purpose:

- persist the result of `repair/open`

Required columns:

- `REPAIR_SESSION_ID`
- `TRACE_ID`
- `PROJECT_ID`
- `SCENARIO_FAMILY_ID`
- `RELEASE_UNIT_ID`
- `GUIDED_STATE_ID`
- `SCREEN_FAMILY_RULE_ID`
- `OWNER_LANE`
- `SELECTED_SCREEN_ID`
- `COMPARE_SNAPSHOT_ID`
- `COMPARE_BASELINE`
- `REASON_CODE`
- `REQUESTED_BY`
- `REQUESTED_BY_TYPE`
- `REQUEST_NOTE`
- `SELECTED_ELEMENT_SET_JSON`
- `EXISTING_ASSET_REUSE_SET_JSON`
- `BLOCKING_GAP_SET_JSON`
- `REUSE_RECOMMENDATION_SET_JSON`
- `REQUIRED_CONTRACT_SET_JSON`
- `STATUS`
- `BLOCKING_GAP_COUNT`
- `SESSION_PAYLOAD_JSON`
- `OCCURRED_AT`
- `ROW_VERSION`
- `CREATED_BY`
- `UPDATED_BY`
- `CREATED_AT`
- `UPDATED_AT`

Indexes to preserve:

- `(PROJECT_ID, RELEASE_UNIT_ID, STATUS)`
- `(GUIDED_STATE_ID, OWNER_LANE)`
- `(SELECTED_SCREEN_ID, STATUS)`
- `(TRACE_ID)`

### 4. `RSN_REPAIR_APPLY_RUN`

Purpose:

- persist the result of `repair/apply`

Required columns:

- `REPAIR_APPLY_RUN_ID`
- `REPAIR_SESSION_ID`
- `TRACE_ID`
- `PROJECT_ID`
- `SCENARIO_FAMILY_ID`
- `RELEASE_UNIT_ID`
- `GUIDED_STATE_ID`
- `SCREEN_FAMILY_RULE_ID`
- `OWNER_LANE`
- `SELECTED_SCREEN_ID`
- `SELECTED_ELEMENT_SET_JSON`
- `COMPARE_BASELINE`
- `UPDATED_RELEASE_CANDIDATE_ID`
- `PUBLISH_MODE`
- `REQUESTED_BY`
- `REQUESTED_BY_TYPE`
- `PARITY_RECHECK_REQUIRED_YN`
- `UNIFORMITY_RECHECK_REQUIRED_YN`
- `SMOKE_REQUIRED_YN`
- `STATUS`
- `ROLLBACK_ANCHOR_YN`
- `CHANGE_SUMMARY`
- `UPDATED_ASSET_TRACE_SET_JSON`
- `UPDATED_BINDING_SET_JSON`
- `UPDATED_THEME_LAYOUT_SET_JSON`
- `SQL_DRAFT_SET_JSON`
- `APPLY_PAYLOAD_JSON`
- `OCCURRED_AT`
- `ROW_VERSION`
- `CREATED_BY`
- `UPDATED_BY`
- `CREATED_AT`
- `UPDATED_AT`

Indexes to preserve:

- `(REPAIR_SESSION_ID, CREATED_AT)`
- `(PROJECT_ID, RELEASE_UNIT_ID, STATUS)`
- `(PROJECT_ID, OWNER_LANE, STATUS)`
- `(UPDATED_RELEASE_CANDIDATE_ID, ROLLBACK_ANCHOR_YN)`
- `(TRACE_ID)`

Rollback anchor:

- revert `updatedReleaseCandidateId` attachment first
- revert generated SQL draft linkage second
- keep session history row after rollback for audit continuity

### 5. `RSN_VERIFICATION_RUN`

Purpose:

- persist governed verification history for `verification/menu-to-rendered-screen`

Required columns:

- `VERIFICATION_RUN_ID`
- `TRACE_ID`
- `PROJECT_ID`
- `SCENARIO_FAMILY_ID`
- `MENU_ID`
- `GUIDED_STATE_ID`
- `OWNER_LANE`
- `TARGET_RUNTIME`
- `RELEASE_UNIT_ID`
- `SCREEN_FAMILY_RULE_ID`
- `SELECTED_SCREEN_ID`
- `SELECTED_ELEMENT_SET_JSON`
- `COMPARE_BASELINE`
- `PAGE_ID`
- `ROUTE_ID`
- `SHELL_PROFILE_ID`
- `PAGE_FRAME_ID`
- `COMPONENT_COVERAGE_STATE`
- `BINDING_COVERAGE_STATE`
- `BACKEND_CHAIN_STATE`
- `HELP_SECURITY_STATE`
- `RESULT`
- `BLOCKER_COUNT`
- `VERIFY_SHELL_YN`
- `VERIFY_COMPONENT_YN`
- `VERIFY_BINDING_YN`
- `VERIFY_BACKEND_YN`
- `VERIFY_HELP_SECURITY_YN`
- `REQUESTED_BY`
- `REQUESTED_BY_TYPE`
- `BLOCKER_SET_JSON`
- `RESULT_PAYLOAD_JSON`
- `OCCURRED_AT`
- `ROW_VERSION`
- `CREATED_BY`
- `UPDATED_BY`
- `CREATED_AT`
- `UPDATED_AT`

Indexes to preserve:

- `(PROJECT_ID, MENU_ID, CREATED_AT)`
- `(RELEASE_UNIT_ID, RESULT)`
- `(GUIDED_STATE_ID, OWNER_LANE)`
- `(TRACE_ID)`

## Migration Draft Scope

The first migration draft should do only these actions:

1. create the five control-plane tables above
2. create the required indexes
3. keep trace, audit, row-version, and rollback-anchor columns in the first DDL itself
4. avoid adding new FKs to project-owned business tables
5. keep trace linkage by IDs first, then add FK hardening after `06` code family names stabilize
6. publish the draft as three separate SQL artifacts so `08` can reference them without extracting sections by hand:
   - `docs/sql/20260321_resonance_repair_module_selection_schema.sql`
   - `docs/sql/20260321_resonance_repair_module_selection_migration.sql`
   - `docs/sql/20260321_resonance_repair_module_selection_rollback.sql`

Reason:

- `06` contracts are stable at identity-field level
- family-level service and mapper naming is still likely to move
- lane `07` should not force premature runtime coupling into `PROJECT_DB`
- the added explicit JSON columns let `06`, `08`, and `09` query repair,
  release, and verification evidence without reverse-parsing one opaque payload

## Release-Unit Binding Placeholder

Until `06` freezes the first mapper and service family names, lane `07` should
not invent a runtime-owned binding table.

Use the existing release-governance contract name as the placeholder target:

- `RELEASE_UNIT_BINDING_TRACE`

Assume the eventual detach target can identify at least:

- `releaseBindingTraceId`
- `releaseUnitId`
- `projectId`
- `guidedStateId`
- `assetTraceSet`
- `boundAt`

Lane `07` also assumes `06/08` will expose one concrete detach key for the
first SQL family:

- module-selection result binding by `moduleBindingResultId`
- repair apply binding by `updatedReleaseCandidateId`

If `06` keeps the same contract family name but uses different column names,
`07` should only update the placeholder mapping note and rollback draft, not the
table family itself.

Recommended concrete naming unless `06` has a blocker-level reason to differ:

- table or trace family: `RELEASE_UNIT_BINDING_TRACE`
- trace key: `releaseBindingTraceId`
- release key: `releaseUnitId`
- project key: `projectId`
- guided-state key: `guidedStateId`
- asset linkage payload: `assetTraceSet`
- timestamp: `boundAt`

Lane `07` should treat the list above as effectively frozen because it already
matches the release-governance contract vocabulary and avoids ad hoc renaming.

Current lane-07 assessment on 2026-03-21:

- no naming conflict was found against `06` start instructions
- no naming conflict was found against the governed identity convention
- no handoff document currently suggests ad hoc renaming of these release-unit fields

So the remaining `06` work is acceptance or mapper-family confirmation, not
schema-family redesign.

## API To Column Notes

Keep these response and audit fields explicit in SQL rather than only inside
payload blobs:

- `repair/open.reuseRecommendationSet` ->
  `RSN_REPAIR_SESSION.REUSE_RECOMMENDATION_SET_JSON`
- `module-selection/apply-result.pageAssemblyId` (or the same value carried from
  guided-state or page-assembly context if `06` keeps the first apply-result
  response smaller) ->
  `RSN_MODULE_BINDING_PREVIEW.PAGE_ASSEMBLY_ID` and
  `RSN_MODULE_BINDING_RESULT.PAGE_ASSEMBLY_ID`
- `module-selection/preview.themeSetId` (request or echoed response value) ->
  `RSN_MODULE_BINDING_PREVIEW.THEME_SET_ID`
- `module-selection/preview.installableModuleId` ->
  `RSN_MODULE_BINDING_PREVIEW.INSTALLABLE_MODULE_ID`
- `module-selection/preview.modulePatternFamilyId`,
  `module-selection/preview.moduleDepthProfileId` ->
  `RSN_MODULE_BINDING_PREVIEW.MODULE_PATTERN_FAMILY_ID` and
  `RSN_MODULE_BINDING_PREVIEW.MODULE_DEPTH_PROFILE_ID`
- `module-selection/preview.frontendImpactSummary`,
  `backendImpactSummary`, `dbImpactSummary`, `cssImpactSummary` ->
  `RSN_MODULE_BINDING_PREVIEW.FRONTEND_IMPACT_SUMMARY`,
  `BACKEND_IMPACT_SUMMARY`, `DB_IMPACT_SUMMARY`,
  `CSS_IMPACT_SUMMARY`
- `module-selection/preview.runtimePackageAttachPreview`,
  `rollbackPlanSummary`, `blockingIssueSet` ->
  `RSN_MODULE_BINDING_PREVIEW.RUNTIME_PACKAGE_ATTACH_PREVIEW`,
  `ROLLBACK_PLAN_SUMMARY`, `BLOCKING_ISSUE_SET_JSON`
- `repair/apply.updatedBindingSet` ->
  `RSN_REPAIR_APPLY_RUN.UPDATED_BINDING_SET_JSON`
- `repair/apply.updatedThemeOrLayoutSet` ->
  `RSN_REPAIR_APPLY_RUN.UPDATED_THEME_LAYOUT_SET_JSON`
- audit `releaseUnitId` ->
  `RSN_REPAIR_APPLY_RUN.RELEASE_UNIT_ID`
- audit `selectedElementSet` ->
  `RSN_REPAIR_APPLY_RUN.SELECTED_ELEMENT_SET_JSON`
- audit `compareBaseline` ->
  `RSN_REPAIR_APPLY_RUN.COMPARE_BASELINE`
- audit `occurredAt` ->
  `OCCURRED_AT` on repair session, repair apply run, and verification run
- audit `requestedBy`, `requestedByType`, `selectedScreenId`,
  `selectedElementSet`, and `compareBaseline` for verification are stored as
  nullable governed columns so the control plane can preserve runtime evidence
  even when the first verification caller derives them from linked repair or
  guided-state context instead of sending them inline

Contract drift note:

- lane `07` keeps `PAGE_ASSEMBLY_ID` and `THEME_SET_ID` in the first SQL family
  because downstream deploy, repair, and verification review still need those
  joins even if `06` decides not to expose both fields directly in the first
  public response payload
- if `06` freezes different response naming, `07` should only update this note
  and the mapper-level binding explanation, not remove the nullable columns from
  the first draft family

## Rollback Draft Scope

The first rollback draft should:

1. drop secondary indexes first
2. export rows grouped by `TRACE_ID`, `PROJECT_ID`, and `RELEASE_UNIT_ID` before destructive delete
3. if `ROLLBACK_ANCHOR_YN = 'Y'`, detach the release candidate binding before row delete
4. delete `RSN_REPAIR_APPLY_RUN`
5. delete `RSN_REPAIR_SESSION`
6. delete `RSN_VERIFICATION_RUN`
7. delete `RSN_MODULE_BINDING_RESULT`
8. delete `RSN_MODULE_BINDING_PREVIEW`

Do not rollback:

- `RELEASE_UNIT` rows owned by the existing platform control-plane schema
- project runtime business tables
- any project-owned SQL objects not created by this draft family

## Handoff Ready Conditions

Lane `07` can hand off to `06` and `08` when all of the following stay true:

1. the five-table first draft family remains confined to `COMMON_DB`
2. release-unit linkage is explicit in SQL rows and documented against
   `RELEASE_UNIT_BINDING_TRACE`
3. rollback draft includes a concrete detach placeholder for rollback-anchor rows
4. schema, migration, and rollback drafts name the same indexes and delete order
5. no new runtime business-table coupling or project-DB write path was added

Recommended handoff text:

- `HANDOFF READY: 06 and 08 can continue from stable SQL draft, migration family, and release-unit binding placeholder; current blocker count is 0.`

## 06 And 08 Acceptance Checklist

When lane `07` hands off, `06` should be able to confirm:

- controller or service naming can stay aligned with `module-selection`,
  `repair`, and `verification` contracts without payload renaming
- release-unit and generation trace linkage can reuse
  `RELEASE_UNIT_BINDING_TRACE`, `releaseUnitId`, and `generationRunId`
- mapper or persistence family naming can be added without changing the
  five-table SQL draft family shape

When lane `07` hands off, `08` should be able to confirm:

- runtime package matrix can reference `DB_SQL_DRAFT` rows by `projectId`,
  `releaseUnitId`, `guidedStateId`, and `screenFamilyRuleId`
- deploy and rollback rail can keep one visible rollback target per
  `ROLLBACK_ANCHOR_YN = 'Y'`
- rollback flow can start from the documented detach placeholder before any
  destructive delete

If either lane cannot confirm these points, `07` should stay `IN_PROGRESS`
instead of forcing `HANDOFF READY`.

## Migration Apply Order

Use this order in the first migration draft:

1. `RSN_MODULE_BINDING_PREVIEW`
2. `RSN_MODULE_BINDING_RESULT`
3. `RSN_REPAIR_SESSION`
4. `RSN_REPAIR_APPLY_RUN`
5. `RSN_VERIFICATION_RUN`
6. secondary indexes

Reason:

- preview/result tables establish the first governed linkage path
- repair and verification rows then attach to already-declared control-plane IDs
- secondary indexes are last so failed DDL can be retried with a smaller rollback surface

## Handoff Rule

Lane `07` can hand off to `06` and `08` when:

- the five-table family and index set are fixed
- rollback order is explicit
- the common DB versus project DB split is written down
- no new governed identity field name is introduced

Current handoff target sentence:

`HANDOFF READY: 06 and 08 can continue from stable SQL draft, migration family, and release-unit binding placeholder; current blocker count is 0.`
