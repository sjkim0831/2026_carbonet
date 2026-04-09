# Admin Screen Builder Architecture

## Goal

Extend Carbonet from fixed admin pages into a controlled screen-builder platform where operators can:

- create a page from a menu entry
- compose layout with drag and drop
- configure component properties
- wire user events to approved actions
- bind data to fields and tables
- publish a runtime-rendered screen

This is not a simple extension of `/admin/system/environment-management`. It is a new platform layer that must integrate with:

- menu inventory
- feature and authority chain
- screen registry
- observability and audit
- runtime page rendering
- component registry governance

Use `docs/architecture/system-folder-structure-alignment.md` as the canonical placement rule when deciding whether builder code belongs in `modules/`, `apps/`, `frontend/src/`, `templates/`, or the transitional root `src/` tree.

## Page Systemization Rule

The builder should not treat an existing admin page as "already reusable" just because the route works.

A page is systemized only when it is governed as one installable unit with:

- stable `pageId`
- stable `menuCode`
- canonical route path
- page manifest
- approved component or template structure
- bootstrap/query/mutation contracts
- event/function/API linkage
- help, accessibility, security, and authority bindings
- install scope and ownership lane
- validator and rollback visibility

If a page lacks these fields, it is still a fixed page implementation, not a reusable builder asset.

Operating split:

- `carbonet-ops` owns the builder, governed settings, and publish control
- `carbonet-general` receives generated outputs as the runtime target
- operators should configure normal behavior in the builder rather than patching generated runtime files

## Non-Goals

The first version should not attempt:

- arbitrary custom React code editing
- unrestricted script execution
- unconstrained component creation
- every possible page archetype
- replacing all legacy pages at once

The correct first target is a template-limited builder for a small number of admin page types.

## Required Module Set

### 1. Builder Canvas

Responsibilities:

- drag-and-drop layout editing
- section and container hierarchy
- component reorder, duplicate, delete
- selection state
- responsive preview

Core primitives:

- page
- section
- grid row
- grid column
- card
- form block
- table block
- modal block

### 2. Component Palette

Responsibilities:

- provide approved component library
- show only components valid for current template and context

Initial component catalog:

- heading
- text
- button
- input
- textarea
- select
- checkbox
- radio
- table
- badge
- card
- modal
- tabs
- file upload
- pagination

Registry governance requirements:

- every reusable component must be registered in DB
- operators must be able to filter by component type
- operators must be able to inspect every page using a component
- operators must be able to deprecate, delete, or remap a component
- deletion must be blocked while usage remains

Primitive governance requirements:

- define one shared primitive layer for cross-surface UI atoms
- let admin/member and home/join wrappers stay as thin adapters, not separate duplicated implementations
- builder/component catalog detection should target primitive JSX names first
- raw `button`, `a`, `input`, `select`, `textarea`, `table` usage should be reduced over time after primitives exist
- prefer variants and tokens over cloned near-identical components
- preserve one canonical DOM depth and base class token family so visual inconsistencies can be detected quickly:
  - buttons: `app-btn`, `app-btn--{variant}`, `app-btn--{size}`
  - fields: `app-field`, `app-field--input|select|textarea`
  - tables: `app-table`
  - choices: `app-choice`, `app-choice--checkbox|radio`
- keep admin and home wrappers separate by import path, not by duplicated markup

### 3. Property Panel

Responsibilities:

- edit component props
- edit validation and display rules
- edit style variant within approved tokens

Examples:

- label
- placeholder
- required
- readonly
- width
- variant
- empty state text
- section title

GUI-first rules:

- property panels must prefer guided selectors and approved enums over free-text fields
- theme, spacing, density, slot profile, actor policy, and help-anchor selection should be available without source editing
- property panels must show parity, accessibility, security, and binding blockers inline
- normal page, field, layout, authority, and theme settings should be editable
  here or through equivalent governed builder surfaces instead of requiring edits
  to generated output files

### 4. Event Binding Panel

Responsibilities:

- connect approved UI events to approved actions

Initial supported events:

- `onClick`
- `onChange`
- `onSubmit`
- `onRowSelect`

Initial supported actions:

- navigate
- open modal
- close modal
- set state
- call API
- reload query
- toggle section

GUI-first rules:

- event candidates should be filtered by component family
- function candidates should be filtered by scenario family and actor policy
- API candidates should be filtered by function intent and backend-chain compatibility
- broken or missing links should open repair guidance instead of silently saving

### 5. Data Binding Modeler

Responsibilities:

- define screen state
- map component props to state or API fields
- map tables to collection responses
- define form submission payloads

Initial data sources:

- local state
- page bootstrap payload
- one query result
- one mutation result

GUI-first rules:

- parameter and result contracts should be browsable and selectable from registry
- DB object or SQL impact should be previewable without leaving the builder
- generated payload shape should be visible before publish

### 6. Schema Persistence

Responsibilities:

- store draft schema
- version schema
- publish schema
- rollback schema
- keep change history

Recommended persistence units:

- `screen_definition`
- `screen_definition_version`
- `screen_component_tree`
- `screen_event_binding`
- `screen_data_binding`
- `screen_publish_history`

### 7. Runtime Renderer

Responsibilities:

- resolve saved schema to actual React runtime
- enforce approved component registry
- enforce approved event action registry
- reject invalid draft at publish time rather than degrade silently

Rendering approach:

- menu route resolves `pageId`
- `pageId` resolves published builder schema
- runtime renderer maps schema node type to approved React component
- page-level authority and feature policy should resolve from governed page IDs
  and binding metadata, not from ad hoc page-local code

### 8. Governance and Validation

Responsibilities:

- schema validation
- authority linkage validation
- audit logging
- trace correlation
- metadata registry sync

Validation examples:

- missing required component props
- unknown event action
- API id missing from registry
- feature code missing
- unpublished route
- invalid menu linkage
- component deleted while still referenced by draft/published pages
- component standardization audit should report remaining raw tags and legacy class names by admin/home surface

Thin-runtime rules:

- every published page should have one stable `pageId`
- every published page should have explicit authority or feature binding metadata
- runtime should prefer rendering from governed DB or JSON definitions plus approved common component/runtime layers
- builder output should not duplicate common runtime behavior on a page-by-page basis unless a project-specific delta is truly required

### Authority Scope Is Mandatory

Authority scope is not optional metadata.
It is one of the core conditions that makes a page reusable, installable, and safe to regenerate.

Every page intended for builder management should declare at minimum:

- actor family
- data scope such as `GLOBAL`, `INSTT_SCOPED`, `DEPT_SCOPED`, `PROJECT_SCOPED`
- action scope such as `view`, `create`, `update`, `delete`, `approve`, `execute`, `export`
- approval-authority requirement where relevant
- grantable or delegated scope where a higher actor configures a lower actor

This scope must align across:

- menu visibility
- page payload and bootstrap loading
- query filtering
- mutation guards
- row actions and popup actions
- export, download, approve, and delete actions
- audit records and trace context

If the UI hides a button but the backend does not enforce the same scope, or if the backend filters rows but the manifest does not declare that scope, the page is not considered systemized.

### 9. GUI-First Builder Completion

The builder should be considered mature only when operators can:

- select project and scenario
- choose theme set, frame, shell, spacing, density, and slot profile
- compose page and elements
- edit properties
- wire events, functions, APIs, backend, and DB links
- inspect security, accessibility, help, diagnostics, and parity blockers
- publish scaffold-ready output

without needing raw source edits for standard work.

## Integration With Existing Carbonet Surfaces

### Environment Management

`/admin/system/environment-management` remains:

- menu inventory hub
- page registration hub
- feature creation hub

New role:

- link a menu/page to a screen-builder definition
- launch builder for a selected page
- show builder publish status
- show builder registry issue status

### Auth Group

Builder-generated pages still need:

- page VIEW feature
- action feature definitions
- role mapping

The builder must not bypass the existing authority chain.

### Screen Command / Full Stack Management

Builder pages must still appear in:

- screen registry
- audit/trace
- metadata overview
- remediation flows

The builder schema should feed those registries rather than create a separate hidden metadata source.

### UI Component Registry

Use the existing observability registry tables first:

- `UI_COMPONENT_REGISTRY`
- `UI_PAGE_COMPONENT_MAP`

Recommended pattern:

- keep reusable component lifecycle in `UI_COMPONENT_REGISTRY`
- keep manifest usage in `UI_PAGE_COMPONENT_MAP`
- calculate extra usage from builder draft/published schema at query time
- keep builder-specific metadata in JSON envelope fields until a dedicated normalized model is justified

## Recommended Data Model

This is an architectural shape, not a final SQL contract.

### Screen Definition

- `builder_id`
- `page_id`
- `menu_code`
- `template_type`
- `status`
- `owner_id`
- `current_version_id`

### Screen Definition Version

- `version_id`
- `builder_id`
- `version_no`
- `draft_json`
- `validation_status`
- `published_yn`
- `created_by`
- `created_at`

### Component Tree Node

- `node_id`
- `version_id`
- `parent_node_id`
- `component_type`
- `slot_name`
- `props_json`

### Component Registry Governance

- `component_id`
- `component_name`
- `component_type`
- `owner_domain`
- `props_schema_json`
- `design_reference`
- `active_yn`

Builder metadata envelope should additionally track:

- `status`
- `replacementComponentId`
- `sourceType`
- `propsTemplate`
- `labelEn`
- `description`
- `sort_order`
- `props_json`

### Event Binding

- `binding_id`
- `version_id`
- `node_id`
- `event_name`
- `action_type`
- `action_config_json`

### Data Binding

- `binding_id`
- `version_id`
- `node_id`
- `binding_kind`
- `source_type`
- `source_path`
- `target_prop`

## Page Types for MVP

Only these four should be builder-managed at first:

### List Page

- filter area
- toolbar
- table
- pagination

### Detail Page

- summary card
- read-only sections
- bottom action bar

### Edit Page

- form sections
- validation
- bottom save actions

### Review Page

- list
- detail modal
- approve / reject actions

## Phased Rollout

### Phase 1: Builder Skeleton

Scope:

- page-template selection
- layout canvas
- component palette
- property editing
- draft save

Not yet:

- runtime publish
- advanced events
- data binding complexity

### Phase 2: Event and Data Binding

Scope:

- approved actions
- approved API bindings
- form payload mapping
- table data mapping

### Phase 3: Runtime Publish

Scope:

- published schema resolution
- runtime renderer
- route-to-schema linkage
- menu integration

### Phase 4: Governance

Scope:

- audit and trace
- version compare
- rollback
- release approvals
- metadata synchronization

## Estimated Build Size

### Minimal MVP

- 4 to 6 weeks
- template-limited
- draft save only

### Operational First Release

- 2 to 3 months
- publishable
- validated event bindings
- menu integration

### Broad Internal Platform

- 4 to 6 months+
- runtime maturity
- rollback and history
- stronger governance

## Delivery Order

1. schema types and persistence contract
2. validator
3. minimal runtime renderer
4. builder authoring UI
5. menu/environment integration
6. audit/trace integration
7. publish and rollback

## Pilot Adoption Path

Do not claim builder readiness for all admin pages until a pilot proves the component set.

Recommended pilot order:

1. `/admin/member/list`
2. `/admin/member/company_list`
3. `/admin/member/approve`
4. `/admin/member/auth-change`

`/admin/member/list` is the correct first proof because it forces:

- search form reuse
- table block reuse
- pagination block reuse
- row action button reuse
- list query parameter mapping

## Recommended First Implementation Boundary

If implementation starts immediately, the safest first slice is:

- add `builder managed` metadata to selected page in environment management
- create builder draft editor for one template type: `EditPage`
- support only:
  - section
  - input
  - select
  - button
  - submit API
- save draft schema
- preview runtime in a controlled sandbox route

This is small enough to prove the contract without overcommitting to a universal builder.
