# Admin Screen Builder Phase 1 MVP

## Scope

Phase 1 should prove one thing only:

Carbonet can attach a builder-managed draft screen to an existing admin menu and render that draft in a controlled preview/runtime path.

Use together with:

- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/system-folder-structure-alignment.md`

Do not attempt universal screen creation in Phase 1.

## Phase 1 Deliverable

### Operator outcome

An operator can:

1. select an existing page menu from `/admin/system/environment-management`
2. mark it as `builder managed`
3. open a builder editor
4. choose `EditPage` template
5. place approved components
6. save a draft schema
7. preview the rendered draft

Even in Phase 1, the pilot page should still keep explicit:

- `pageId`
- `menuCode`
- canonical route
- authority scope baseline
- builder ownership lane

### Out of scope

- publish to production runtime
- rollback UI
- arbitrary event graph editing
- freeform schema authoring
- list/detail/review templates
- authority auto-generation beyond existing menu/feature chain

This document started from `EditPage` only. The current implementation already extends beyond that in three areas:

- publish/runtime snapshot path
- DB-backed component registry governance
- component usage lookup and replacement mapping

## Recommended First Template

`EditPage`

Reason:

- existing Carbonet already has strong edit-form patterns
- easier than table-heavy list builder
- simpler event model
- good proof for property panel and submit wiring

## Current Pilot Extension

The next practical pilot is `ListPage` for `/admin/member/list`.

Required reusable blocks:

- search form block
- table block
- pagination block
- top action toolbar
- row action button group

## Approved Components for Phase 1

Layout nodes:

- `page`
- `section`
- `grid_row`
- `grid_col`

Content nodes:

- `heading`
- `text`
- `input`
- `textarea`
- `select`
- `checkbox`
- `button`

No tables, tabs, modal, upload, chart in Phase 1.

For the member-list pilot, extend Phase 1 enough to allow:

- `table`
- `pagination`

## Approved Actions for Phase 1

- `set_state`
- `navigate`
- `submit_api`

Only one mutation API binding should be supported in Phase 1 preview/runtime.

## Storage Contract

### Tables

Use these tables first:

1. `COMTNSCREENBUILDERDEF`
2. `COMTNSCREENBUILDERVER`
3. `COMTNSCREENBUILDERNODE`
4. `COMTNSCREENBUILDEREVENT`

The exact draft SQL is in:

- [`admin_screen_builder_phase1_schema.sql`](/opt/projects/carbonet/docs/sql/admin_screen_builder_phase1_schema.sql)

### Why split by version and node

- builder definition stores menu/page linkage
- version stores draft lifecycle
- node stores renderable tree
- event stores safe action bindings

This keeps draft compare and later publish history possible without redesign.

## Backend Implementation Units

### 1. Domain package

Recommended package:

- prefer module-owned builder paths first:
  - `modules/screenbuilder-core`
  - `modules/screenbuilder-carbonet-adapter`

Use root `src/main/java/egovframework/com/feature/admin/screenbuilder` only when the slice is still transitional and has not been cut over yet.

### 2. Java files

Minimum set:

- `ScreenBuilderController.java`
- `ScreenBuilderService.java`
- `impl/ScreenBuilderServiceImpl.java`
- `mapper/ScreenBuilderMapper.java`
- `model/ScreenBuilderDefinitionVO.java`
- `model/ScreenBuilderVersionVO.java`
- `model/ScreenBuilderNodeVO.java`
- `model/ScreenBuilderEventVO.java`
- `model/ScreenBuilderPagePayload.java`
- `model/ScreenBuilderSaveRequest.java`

### 3. Mapper XML

- `src/main/resources/egovframework/mapper/com/feature/admin/ScreenBuilderMapper.xml`

### 4. API endpoints

Initial endpoints:

- `GET /api/admin/system/screen-builder/page`
- `POST /api/admin/system/screen-builder/draft`
- `GET /api/admin/system/screen-builder/preview`

### 5. Existing system integration

Extend environment-management page data with:

- `builderManagedYn`
- `builderDefinitionId`
- `builderVersionStatus`
- `builderLaunchUrl`

Do not store builder schema inside existing menu tables.

### 6. Component registry governance

Use these existing tables first:

1. `UI_COMPONENT_REGISTRY`
2. `UI_PAGE_COMPONENT_MAP`

Required API additions:

- component registry list
- component usage list
- component update
- component delete-if-unused
- component usage remap

## Frontend Implementation Units

### 1. New feature folder

- `frontend/src/features/screen-builder`

### 2. React files

Minimum set:

- `ScreenBuilderMigrationPage.tsx`
- `screenBuilderTypes.ts`
- `screenBuilderPalette.tsx`
- `screenBuilderCanvas.tsx`
- `screenBuilderProperties.tsx`
- `screenBuilderPreview.tsx`
- `screenBuilderState.ts`

Additional management surface:

- registry inventory with type combo filter
- selected component edit panel
- selected component usage table
- replacement/remap action flow

Primitive standardization follow-up:

- add one shared primitive file for `button/link/input/select/textarea/table/pagination/checkbox/radio`
- keep admin and home/join wrappers as presentation adapters over the same primitive base
- use the primitive names as the primary regex catalog target so screen-builder inventory stays predictable
- add an explicit audit command for remaining raw tags and legacy class names
- standardize canonical class tokens and wrapper depth so design drift can be detected quickly

### 3. Shared/admin-ui dependencies

Reuse:

- `admin-ui/common.tsx`
- `admin-ui/pageFrames.tsx`
- existing `AdminPageShell`

Do not invent a separate shell.

## Runtime Preview Contract

Phase 1 preview route:

- `/admin/system/screen-builder/preview`

Preview input:

- `builderDefinitionId`
- optional `versionId`

Preview behavior:

- render only approved node types
- reject unknown node types visibly
- reject unsupported actions visibly
- do not silently degrade
- block published runtime when component registry references are missing or deprecated

## Builder State Shape

Recommended initial JSON:

```json
{
  "templateType": "EDIT_PAGE",
  "rootNodeId": "root",
  "nodes": [
    {
      "nodeId": "root",
      "parentNodeId": null,
      "componentType": "page",
      "slotName": "root",
      "sortOrder": 0,
      "props": {}
    }
  ],
  "events": [],
  "meta": {
    "pageId": "member-edit",
    "menuCode": "A0060118"
  }
}
```

## Validation Rules

### Save-time validation

- exactly one root page node
- allowed component types only
- allowed child relationships only
- no duplicate node ids
- no cyclic parent links
- allowed action types only

### Preview-time validation

- draft exists
- version belongs to requested definition
- node tree is complete
- renderer registry contains every node type

## Menu Integration Tasks

### Environment Management

Add fields and actions:

- builder-managed badge
- open builder action
- builder draft status
- registry issue status
- publish readiness status

### Function/Authority

No new authority semantics in Phase 1.

Continue to rely on:

- page VIEW feature
- existing feature management
- auth-group mapping

## Delivery Order

### Step 1

- add SQL schema draft
- create mapper and VO contract

### Step 1.5

- move component registry to DB-backed governance
- import legacy file-backed registry rows
- add usage lookup and remap APIs

### Step 2

- create page-data API
- create draft save API

### Step 3

- create preview runtime

### Step 4

- create builder React editor

### Step 5

- connect environment-management launch/linkage

### Step 6

- add `ListPage` preset for `/admin/member/list`
- support `table` and `pagination` preview blocks
- prove query/list/pagination structure can start from builder draft

## Suggested Work Breakdown

### Backend session

- SQL
- mapper
- service
- controller
- validation

### Frontend session

- builder page
- canvas/palette/property components
- preview wiring

### Integration session

- environment-management linkage
- route registration
- smoke verification

## Acceptance Criteria

Phase 1 is done when:

- one menu can be marked builder-managed
- one draft schema can be saved
- one preview route renders the saved draft
- invalid draft shows explicit error
- no existing menu/authority behavior regresses
