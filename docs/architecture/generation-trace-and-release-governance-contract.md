# Generation Trace And Release Governance Contract

## Goal

Define how Resonance tracks:

- what was generated
- what was changed
- who changed it
- which version set was selected
- what was deployed
- what can be rolled back

This contract covers frontend, backend, DB, design-source, and release-unit traceability together.

## Core Rule

Every governed asset must be traceable across these states:

1. source input
2. scaffold request
3. generated draft
4. reviewed draft
5. published asset
6. bound release unit
7. deployed runtime
8. rollback target

No generated asset should exist in runtime without a trace back to:

- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `guidedStateId`
- `screenFamilyRuleId`
- `templateLineId`
- `ownerLane`
- `scaffoldRequestId`
- `releaseUnitId`

No governed edit should be allowed to disappear just because it started as JSON.

JSON working revisions, AI-assisted patches, user edits, and published artifacts must all remain connected through one lineage.

Thin-output release rule:

- generated outputs should remain thin and traceable
- release units should primarily bind approved common artifacts plus project-specific page, authority, route, and schema definitions
- each published page must remain traceable by stable `pageId` and its authority or feature binding lineage

## Required Trace Objects

### `GENERATION_RUN`

- `generationRunId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `guidedStateId`
- `screenFamilyRuleId`
- `templateLineId`
- `ownerLane`
- `menuCode`
- `pageId`
- `scaffoldRequestId`
- `builderVersion`
- `builderRulePackVersion`
- `templatePackVersion`
- `sourceContractVersion`
- `overlaySchemaVersion`
- `overlaySetId`
- `overlayHash`
- `compatibilityVerdict`
- `migrationPlanId`
- `generationMode`
  - `FRONTEND_ONLY`
  - `FULL_STACK`
  - `REPAIR_ONLY`
  - `REGENERATE`
- `editorType`
  - `USER`
  - `AI_AGENT`
  - `SYSTEM_AUTOMATION`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `operator`
- `startedAt`
- `completedAt`
- `result`
- `blockingIssueCount`

### `GENERATED_ASSET_TRACE`

- `assetTraceId`
- `generationRunId`
- `assetFamily`
  - `FRONTEND_SCREEN`
  - `FRONTEND_ROUTE`
  - `COMPONENT_BINDING`
  - `HELP_BINDING`
  - `CONTROLLER`
  - `SERVICE`
  - `SERVICE_IMPL`
  - `VO`
  - `DTO`
  - `MAPPER_JAVA`
  - `MAPPER_XML`
  - `DB_OBJECT`
  - `DDL_DRAFT`
  - `QUERY_PROFILE`
  - `SCREEN_FAMILY_RULE`
  - `TEMPLATE_LINE`
- `assetId`
- `versionLine`
- `jsonRevisionRef`
- `changeType`
  - `CREATE`
  - `UPDATE`
  - `REGENERATE`
  - `DEPRECATE`
- `sourceRefSet`
- `securityProfileId`
- `approvalState`

### `ASSET_CHANGE_TRACE`

- `changeTraceId`
- `assetTraceId`
- `editorType`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `changeSummary`
- `beforeVersionRef`
- `afterVersionRef`
- `beforeJsonRevisionRef`
- `afterJsonRevisionRef`
- `diffSummary`
- `reviewer`
- `reviewState`

### `JSON_WORKSPACE_REVISION`

- `jsonRevisionId`
- `workspaceId`
- `projectId`
- `assetFamily`
- `assetKey`
- `revisionNo`
- `parentJsonRevisionId`
- `editorType`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `storageUri`
- `contentHash`
- `approvalState`
- `createdAt`

### `JSON_PUBLISH_BINDING_TRACE`

- `publishBindingTraceId`
- `projectId`
- `scenarioId`
- `publishedAssetSet`
- `jsonRevisionSet`
- `overlayIdSet`
- `publishedVersionRef`
- `releaseUnitId`
- `boundAt`

## Builder Overlay And Compatibility Rule

Generation lineage should also remain compatible with:

- `docs/architecture/builder-overlay-schema-and-governance-contract.md`
- `docs/architecture/builder-version-compatibility-and-upgrade-contract.md`

This means:

- regeneration must record which approved overlay set participated
- publish must record which builder version and compatibility verdict produced
  the asset set
- unsupported source or overlay versions must fail before publish, not after
  runtime deployment

### `RELEASE_UNIT_BINDING_TRACE`

- `releaseBindingTraceId`
- `releaseUnitId`
- `projectId`
- `guidedStateId`
- `ownerLaneSet`
- `selectedFrameworkLine`
- `selectedCommonJarLine`
- `selectedImportSensitiveLine`
- `selectedFrontendBundleLine`
- `selectedThemeTokenLine`
- `selectedFeatureModuleLine`
- `patternFamilySet`
- `screenFamilyRuleSet`
- `templateLineSet`
- `assetTraceSet`
- `boundAt`

### `DEPLOYMENT_TRACE`

- `deploymentTraceId`
- `releaseUnitId`
- `projectId`
- `targetServerSet`
- `deployMode`
  - `MAIN_ONLY`
  - `SUB_FIRST`
  - `IDLE_FIRST`
- `runtimeResult`
- `healthCheckSummary`
- `rollbackReadyYn`
- `deployedAt`

### `PROPOSAL_BASELINE_TRACE`

- `proposalBaselineTraceId`
- `projectId`
- `synthesisRunId`
- `guidedStateId`
- `designOutputPackageId`
- `baselineReleaseUnitId`
- `baselineRuntimeVersionRef`
- `createdAt`

### `RUNTIME_PATCH_TRACE`

- `runtimePatchTraceId`
- `projectId`
- `releaseUnitId`
- `guidedStateId`
- `ownerLane`
- `patchScope`
  - `PAGE_ONLY`
  - `FEATURE_ONLY`
  - `MODULE_ONLY`
  - `FULL_RELEASE`
- `changedAssetSet`
- `beforeReleaseUnitId`
- `afterReleaseUnitId`
- `rollbackTargetReleaseUnitId`
- `editorType`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `reason`
- `createdAt`

## Frontend Structure And Collection Rule

Frontend should remain structured and collectible.

Required collectible frontend assets:

- page manifest
- route definition
- layout schema
- component binding manifest
- help content
- help anchor map
- action layout manifest
- theme and token bindings
- runtime diagnostics manifest

The same rule applies to authoring assets:

- draft layout JSON
- component-binding JSON
- action-layout JSON
- help-content JSON
- API and function binding JSON

They must be collectible, versioned, and linked to published assets.

Use this rule:

- every generated or collected frontend screen must be normalizable into the same manifest family
- existing screens should be collectible into governed manifests before forcing full rewrite
- page-local custom structure is allowed only if it can still be mapped into the governed manifest and frame contracts

## Version Selection And Rollback Rule

Deployment must happen through explicit release-unit selection.

Operators should be able to:

- choose a target version set
- inspect current vs target asset matrix
- inspect generated asset provenance
- deploy selected release unit
- promote from sub or idle to main
- rollback to the previous approved release unit

Rollback must preserve visibility into:

- which generated assets were introduced
- which common jar and frontend lines were active
- which template lines and screen family rules were active
- which DB drafts or migrations were included
- what security checklist state was attached
- which JSON working revisions produced the deployed artifacts
- whether the final change came from AI, user, or automated repair
- which proposal-derived baseline the runtime still traces back to
- what patch-level runtime deltas exist after the initial proposal-based build

## Proposal-Baseline And Patch Rollback Rule

Systems first created from a proposal or RFP should keep that initial generated state as a governed baseline.

Use this rule:

- the first approved runtime built from proposal synthesis should create a `proposal baseline`
- later changes should be recorded as patch traces, not as untracked overwrites
- rollback should support both:
  - return to the last approved patch release
  - return to the original proposal-derived baseline release
- patch release units should always declare what changed relative to the proposal baseline and the immediately previous runtime

This is required so that:

- one generated system can evolve safely after go-live
- operators can isolate and roll back one bad change without losing the entire system history
- the original proposal-derived design intent remains visible even after many later edits

## JSON Durability And Recovery Rule

Use this rule:

1. JSON authoring bodies live in governed storage
2. DB keeps revision metadata, lineage, approval state, and rollback anchors
3. the current draft is only a pointer to the latest revision, not a mutable singleton row
4. rollback may target:
   - prior JSON revision
   - prior approved published asset version
   - prior release unit
5. deletion of JSON revisions is retention-governed and must respect rollback windows

## Required Operator Screens

- generation run explorer
- generated asset trace explorer
- asset diff and review screen
- JSON workspace revision explorer
- release-unit asset matrix
- current vs target compare screen
- deployment trace explorer
- rollback target explorer
- proposal baseline explorer
- runtime patch history explorer

## Recommended Screen IA

### 1. Generation Run Explorer

Shows:

- generation run timeline
- project, scenario, menu, page context
- generation mode
- operator and AI assist mode
- result and blocking issue count

Filters:

- project
- scenario family
- generation mode
- date range
- result state

### 2. Generated Asset Trace Explorer

Shows:

- asset family
- asset id
- generated version line
- source refs
- security profile
- approval state

Drill-down should open:

- source package
- scaffold request
- generated diff summary
- linked release units

### 3. Release-Unit Asset Matrix

Shows:

- current version set
- target version set
- framework line
- common jar lines
- frontend common line
- theme/token/CSS/JS lines
- feature module lines
- generated asset coverage
- security checklist status

This screen should answer:

- what exactly is being deployed
- what changed from the previous release unit
- what rollback target exists
- which JSON revisions and AI or user edits are included

### 4. JSON Workspace Revision Explorer

Shows:

- workspace and asset family
- revision chain
- editor type and identity
- AI provider, model, and session if applicable
- content hash and storage URI
- approval state
- rollback anchor state

Operators should be able to:

- diff revisions
- restore a prior draft revision
- promote a revision as the publish candidate
- inspect which published assets consumed the revision

### 5. Rollback Target Explorer

Shows:

- rollback-ready release units
- server and target coverage
- deploy success history
- rollback blockers
- DB and file movement implications

Operators should be able to compare:

- current
- target
- rollback target

from one screen.

## Publish Blockers

Do not publish or deploy if:

- a generated asset has no trace back to scenario and scaffold request
- a publish candidate cannot resolve its JSON revision lineage
- AI or user modification provenance is missing
- selected version lines are incomplete
- release unit lacks asset matrix coverage
- rollback target is undefined
- generated frontend assets cannot be collected into governed manifest format

## Non-Goals

- replacing source control history
- low-level diff storage for every text line
- runtime hot patching outside release-unit governance
