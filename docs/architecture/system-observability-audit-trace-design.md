# Carbonet Audit and Trace Architecture

Generated on 2026-03-14 for the current Carbonet React migration repository.

## 1. Goal

The target state is a system where the following are queryable and governable with a shared trace model:

- page access and route transitions
- component and layout composition on each screen
- function execution with input, output, result, and duration
- API request and response summaries
- backend audit events for create, update, delete, approve, reject, download, export, and admin actions

This is not a simple logging task. It is a combined architecture for:

- audit logging
- application tracing
- UI metadata management
- screen/component registry
- operational search and governance

This repository should not stop at observability. The same metadata path should become the control plane for an installable Carbonet platform where menus, pages, functions, APIs, backend chains, DB objects, and attached assets are managed as install units.

## 1.1 Platform Direction

The intended platform shape is:

- one common platform for login, authority, menu, sitemap, observability, install orchestration, and governance
- one or more project modules such as `carbonet`, `resonance`, or later tenant-specific modules
- menu-centered install units that can be installed, copied, upgraded, deprecated, and deleted with tracked ownership
- AI-assisted design and scaffold generation, while the platform remains authoritative for ownership, dependency, deletion, and version compatibility

The first authoritative metadata builder that already exists in this repository is:

- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`

That service already assembles page options, APIs, functions, schemas, code groups, and change targets. Future installable-module work should extend that authority instead of creating a second disconnected registry.

## 2. Scope Levels

The rollout should separate four levels instead of trying to ship everything at once.

### Level 1. Backend Audit Baseline

Tracks business-significant server actions only.

- actor identity
- role or authority
- menu or page code
- function or action code
- request summary
- result summary
- changed entity key
- status transition
- timestamp, IP, user agent, request ID

### Level 2. Frontend Route and Action Trace

Tracks user-visible flow and major interactions.

- page enter and leave
- route params
- major action clicks
- API call start and end
- error boundaries
- key UI state transitions

### Level 3. Function and API Correlation

Adds end-to-end linkage across frontend functions and backend endpoints.

- `traceId`
- `spanId`
- `parentSpanId`
- `functionId`
- `apiId`
- timing and result

### Level 4. Screen Manifest and Component Registry

Makes layout and component composition manageable as assets.

- page manifest
- layout zones
- component registry
- prop schema summary
- design token version
- screenshot baseline reference

## 3. Recommended Principles

### 3.1 Separate trust boundaries

- Frontend logs are for traceability and UX diagnostics.
- Backend audit logs are the authoritative record.
- UI manifests define intended composition, not proof of execution.

### 3.2 Log for reconstruction, not raw exhaust

Do not store full DOM trees or full payloads by default. Store enough metadata to reconstruct what happened.

### 3.3 Classify data before logging

Every logged field must be classified:

- `PUBLIC`
- `INTERNAL`
- `SENSITIVE`
- `SECRET`

Only `PUBLIC` and approved `INTERNAL` values should be stored raw. Sensitive values must be masked, tokenized, hashed, or summarized.

### 3.4 Version the UI

Every page trace should carry:

- `pageId`
- `pageVersion`
- `layoutVersion`
- `designTokenVersion`

Otherwise historical trace records cannot be interpreted correctly after UI changes.

## 4. Target Architecture

## 4.1 Frontend

The frontend should introduce four layers under `frontend/src`.

- `app/telemetry`
  - trace context
  - event publisher
  - masking rules
  - route instrumentation
- `app/screen-registry`
  - page manifest definitions
  - layout zone definitions
  - component registry metadata
- `lib/api`
  - request/response interceptor support
  - trace header propagation
- `features/*`
  - screen-specific manifest binding
  - action instrumentation only at business-significant points

Recommended frontend event categories:

- `page_view`
- `page_leave`
- `layout_render`
- `component_render_summary`
- `ui_action`
- `function_call`
- `api_request`
- `api_response`
- `ui_error`

## 4.2 Backend

The backend should use a centralized trace and audit path under the existing Spring Boot structure.

- `src/main/java/egovframework/com/common/filter`
  - request trace filter
- `src/main/java/egovframework/com/common/interceptor`
  - request context interceptor
- `src/main/java/egovframework/com/common/audit`
  - audit context, masker, writer
- `src/main/java/egovframework/com/common/trace`
  - trace context and correlation utilities
- `src/main/java/egovframework/com/common/aspect`
  - service and admin action audit aspects where appropriate

Recommended backend event categories:

- `REQUEST_IN`
- `REQUEST_OUT`
- `BUSINESS_AUDIT`
- `STATE_CHANGE`
- `DOWNLOAD_AUDIT`
- `SECURITY_AUDIT`
- `ERROR_AUDIT`

## 4.3 Storage

Use separate stores or at least separate tables/index policies for:

- immutable audit log
- searchable trace events
- UI registry metadata
- optional screenshot or snapshot artifact metadata

Avoid storing all of this in one giant table.

## 4.4 Common Platform vs Project Module Split

The repository should evolve toward three ownership scopes instead of treating every feature as the same class of asset.

### Common Platform

Shared by every deployed project:

- authentication and session model
- authority groups, feature permissions, and user overrides
- menu registry and sitemap governance
- telemetry, audit, trace, masking, and retention
- install-unit registry and dependency graph
- common security transforms such as encryption, decryption, masking, and request normalization
- shared UI manifest synchronization and metadata verification

### Project Module

Thin project-owned business logic:

- project-specific controllers and route prefixes
- project-specific service rules and data queries
- project-specific DB connection or schema routing
- project-specific page bundles and business labels
- project-specific deployment target and environment metadata

### Install Unit

The actual lifecycle unit for a new page or business function:

- menu and page metadata
- function definitions and permission chain
- API contract
- controller, service, mapper, and XML links
- tables, columns, foreign-key expectations, and attachment definitions
- frontend page or template assets
- help, telemetry, and manifest metadata
- install, copy, upgrade, delete, and rollback plans

## 5. Logical Data Model

Minimum entities:

### 5.1 `trace_session`

One per end-to-end flow.

- `trace_id`
- `session_id`
- `user_id`
- `actor_type`
- `entry_page_id`
- `started_at`
- `ended_at`

### 5.2 `trace_event`

Generic technical event stream.

- `event_id`
- `trace_id`
- `span_id`
- `parent_span_id`
- `event_type`
- `page_id`
- `component_id`
- `function_id`
- `api_id`
- `result_code`
- `duration_ms`
- `payload_summary_json`
- `created_at`

### 5.3 `audit_event`

Immutable business audit record.

- `audit_id`
- `trace_id`
- `request_id`
- `actor_id`
- `actor_role`

### 5.4 `resource_registry`

Authoritative ownership ledger for installable assets.

- `resource_id`
- `project_id`
- `package_id`
- `resource_type`
- `owner_scope`
- `shared_yn`
- `logical_name`
- `physical_name`
- `source_path`
- `db_object_name`
- `status`
- `installed_at`
- `installed_by`
- `last_verified_at`

### 5.5 `resource_dependency`

Dependency graph for install, copy, upgrade, and delete plans.

- `dependency_id`
- `parent_resource_id`
- `child_resource_id`
- `dependency_type`
- `required_yn`
- `delete_order`
- `shared_block_reason`

### 5.6 `install_unit`

Lifecycle record for menu-centered packages.

- `package_id`
- `project_id`
- `menu_code`
- `page_id`
- `module_type`
- `platform_version`
- `module_version`
- `status`
- `copy_source_package_id`
- `installed_at`
- `deleted_at`

## 6. Installable Lifecycle Rules

Every generated or managed asset must belong to one of these scopes:

- `COMMON`
- `PROJECT`
- `INSTALL_UNIT`
- `EXTERNAL`

Every generated or imported asset must also carry one of these ownership modes:

- `EXCLUSIVE`
- `SHARED`
- `REFERENCE_ONLY`

Deletion is safe only when:

- the asset has a known owner
- the dependency graph has been resolved
- shared assets are either preserved or reference count is zero
- generated delete plans and orphan scans pass

Do not classify low-traffic assets as garbage solely because usage is low. Garbage in this repository means one of:

- ownerless assets
- orphaned assets
- dead references
- duplicated assets with no remaining owner intent
- delete-blocking residue left after uninstall

`INACTIVE` or `ARCHIVED` assets are not garbage if ownership and dependency are still valid.

## 7. Compatibility and Versioning Rules

Common platform code should be upgraded centrally, but deployed projects should consume it through a compatibility contract instead of direct coupling to unstable internals.

Required version identifiers:

- `platformVersion`
- `projectModuleVersion`
- `apiContractVersion`
- `pageManifestVersion`
- `designTokenVersion`

Recommended runtime rules:

- common security, encryption, masking, request normalization, and cross-cutting adapters stay in the common platform
- project modules keep business logic thin and avoid direct dependency on volatile third-party APIs
- upgrades should flow through facade or adapter layers, not through project controllers importing unstable internals directly
- Java runtime should be standardized platform-wide whenever possible, even if separate servers are used
- deployed child projects must consume common code through version-pinned packages, jars, or modules
- do not let deployed projects fetch live backend source from the main system as a runtime dependency
- every deployed project should record the exact common-platform artifact version it was built and started with

## 8. AI-Assisted Build Model

AI should be used aggressively for:

- page scaffold generation
- parity-oriented frontend restoration
- controller/service/mapper/XML boilerplate
- DTO, request/response schema drafts
- design binding and markup/CSS iteration
- resource graph documentation and rollout plans

The platform remains authoritative for:

- ownership registration
- dependency graph integrity
- delete and rollback plans
- masking and security rules
- compatibility gates
- garbage and orphan classification

This distinction is required because AI can accelerate generation, but without authoritative ownership metadata it will also accelerate drift and residue.

## 9. Rollout Sequence For This Repository

Recommended order:

1. finish admin-screen route and parity normalization
2. keep `ScreenCommandCenterServiceImpl` as the current authority for page metadata
3. add install-unit and resource-registry concepts to the existing command center model
4. classify common-platform vs project-module assets
5. introduce copy, upgrade, delete, orphan-scan, and drift-scan plans
6. then split common platform and project controllers by stable project boundaries

Do not start with controller fragmentation before the registry and ownership model exist. That produces duplicate code movement without a reliable delete or upgrade path.
- `menu_code`
- `page_id`
- `action_code`
- `entity_type`
- `entity_id`
- `before_summary_json`
- `after_summary_json`
- `result_status`
- `reason_summary`
- `ip_address`
- `created_at`

### 5.4 `ui_page_manifest`

- `page_id`
- `page_name`
- `route_path`
- `domain_code`
- `layout_version`
- `design_token_version`
- `active_yn`

### 5.5 `ui_component_registry`

- `component_id`
- `component_name`
- `component_type`
- `props_schema_json`
- `owner_domain`
- `design_reference`
- `active_yn`

### 5.6 `ui_page_component_map`

- `page_id`
- `layout_zone`
- `component_id`
- `instance_key`
- `display_order`
- `conditional_rule_summary`

## 6. Current Implementation State

This repository is no longer at design-only stage. The following are already implemented and should be treated as the current baseline for any new AI session.

### 6.1 Implemented backend baseline

- `TRACE_EVENT` persistence is active.
- `AUDIT_EVENT` persistence is active.
- UI registry persistence is active for:
  - `UI_PAGE_MANIFEST`
  - `UI_COMPONENT_REGISTRY`
  - `UI_PAGE_COMPONENT_MAP`
- Frontend telemetry ingestion is exposed through `POST /api/telemetry/events`.
- Admin search APIs are exposed through:
  - `/api/admin/observability/*`
  - `/api/admin/help-management/*`

Primary backend files:

- `src/main/java/egovframework/com/common/trace/TraceEventService.java`
- `src/main/java/egovframework/com/common/web/TelemetryController.java`
- `src/main/java/egovframework/com/common/trace/UiManifestRegistryService.java`
- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`
- `src/main/resources/egovframework/mapper/com/common/ObservabilityMapper.xml`

### 6.2 Implemented frontend baseline

- Frontend telemetry transport is already mounted from the React app.
- Screen manifest registry source of truth exists at:
  - `frontend/src/app/screen-registry/pageManifests.ts`
- Admin help-management command center already renders:
  - surfaces
  - events
  - APIs
  - schemas
  - menu permission metadata
  - function input and output specs
  - API request and response specs
  - masking rules

Primary frontend files:

- `frontend/src/app/telemetry/useTelemetryTransport.ts`
- `frontend/src/app/screen-registry/pageManifests.ts`
- `frontend/src/features/help-management/ScreenCommandCenterPanel.tsx`
- `frontend/src/lib/api/client.ts`

## 7. Current Coverage Snapshot

The current system already contains explicit page governance metadata for major admin and non-admin React migration screens.

Covered families include:

- admin member and authority management
- observability and help-management
- public signin flows
- join step1-step5
- company register, status, reapply, and completion flows
- mypage

For covered pages, the intended management target is:

- UI surface inventory
- frontend event and function linkage
- API and backend chain linkage
- schema and table linkage
- function parameter and output summaries
- API request and response field summaries
- masking rules for sensitive fields

## 8. Current Gaps

The implementation is not yet "full automatic extraction" across the whole repository.

Known limits:

- page metadata is still curated per page in `ScreenCommandCenterServiceImpl`
- function parameter and output specs are manual metadata, not AST-derived
- API request and response specs are manual metadata, not DTO reflection-derived
- remaining uncovered pages still need explicit registration in both backend and frontend registries

## 9. Handoff Notes For Another AI Session

Another account or AI session should be able to continue from this document without chat history.

### 9.1 Shared files to treat as authoritative

- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`
- `frontend/src/app/screen-registry/pageManifests.ts`
- `frontend/src/features/help-management/ScreenCommandCenterPanel.tsx`
- `frontend/src/lib/api/client.ts`

### 9.2 Required invariants

- Every new `pageId` added for governance must be added in both:
  - backend `ScreenCommandCenterServiceImpl`
  - frontend `pageManifests.ts`
- Every governed page must expose explicit `data-help-id` markers for business-significant surfaces and controls.
- `pageManifests.ts` `instanceKey` values, React `data-help-id` values, and `helpContent.ts` anchors must stay aligned for the same page.
- If a new metadata field is added to events or APIs, update both:
  - backend response builder
  - frontend TypeScript types
  - help-management panel rendering
- Do not store raw passwords, tokens, or full sensitive payloads in trace/audit metadata.
- Prefer masks, summaries, hashes, and metadata-only tracking for files.

### 9.3 CUBRID-specific caution

- Registry persistence is backed by CUBRID.
- `MENU_CODE` in `UI_PAGE_MANIFEST` is length-limited. Overlong synthetic menu codes caused runtime failures during registry sync.
- When adding synthetic page menu codes for governance-only pages, keep them short and stable.

### 9.4 Runtime caution

- During `:18000` restart, an old process may keep the port because graceful shutdown logs still show legacy classpath issues.
- If the new process does not bind, verify duplicate Java processes and retire the old PID before assuming the new build failed.

### 9.5 Blind-spot caution

- Not all React behavior is equally governable.
- Before instrumenting:
  - external widgets
  - browser-native alerts/history
  - sessionStorage relay state
  - file upload/download flows
- read:
  - `docs/architecture/react-observability-blind-spots.md`

The rule is to add coarse, non-blocking metadata and telemetry without altering business behavior.

## 10. Verification Commands

Use these exact commands when continuing the work:

```bash
cd /opt/projects/carbonet-react-migration/frontend && npm run build
cd /opt/projects/carbonet-react-migration/frontend && npm run audit:ui-governance
cd /opt/projects/carbonet-react-migration && mvn -DskipTests package
curl -sS 'http://localhost:18000/api/admin/help-management/screen-command/page?pageId=signin-login'
curl -sS 'http://localhost:18000/api/admin/help-management/screen-command/page?pageId=join-company-status-detail'
curl -sSI http://localhost:18000/react-migration
```

`npm run audit:ui-governance` is the repository-wide governance check for:

- route to manifest alignment
- manifest to backend screen-command alignment
- manifest `instanceKey` to React `data-help-id` alignment
- help-content anchor to React `data-help-id` alignment

Treat failures as governance backlog. New or changed React screens should not be considered complete until this command is clean for the touched page family.

## 11. Recommended Next Steps

If another AI session continues this track, the highest-value next work is:

1. extend the same parameter/output/masking metadata depth to the remaining admin pages
2. cover remaining uncovered React migration pages with explicit `pageId` metadata
3. consider a generated metadata path for DTO request and response schemas to reduce manual drift

## 12. Trace Keys

Standardize these keys across frontend and backend.

- `traceId`: full user flow
- `requestId`: one HTTP request
- `spanId`: one local execution span
- `parentSpanId`: parent span
- `pageId`: screen identifier
- `componentId`: component identifier
- `actionId`: user action identifier
- `functionId`: frontend or backend business function identifier
- `apiId`: API identifier
- `menuCode`: existing Carbonet menu code where applicable

Header recommendation:

- `X-Trace-Id`
- `X-Request-Id`
- `X-Page-Id`
- `X-Action-Id`

## 13. What to Log

### 7.1 Always log

- page enter and leave
- admin actions
- create, update, delete, approve, reject, reapply
- file upload and download
- permission failures
- backend exceptions
- API status, duration, and summarized request/response

### 7.2 Conditionally log

- function input and output summaries
- component render summaries
- layout render summaries
- search filters
- batch operation details

### 7.3 Never log raw by default

- password
- resident registration numbers
- full phone numbers
- email local parts when unnecessary
- business registration number full raw value
- access tokens, refresh tokens, cookies
- large file contents
- full HTML or DOM snapshots in normal production mode

## 14. UI Governance Model

To manage page, component, function, and API together, define them as governed assets.

### 8.1 Page manifest

Each migrated screen should declare:

- `pageId`
- route
- language scope
- menu code
- layout zones
- major actions
- linked APIs
- linked permissions

Each governed screen must also carry explicit `data-help-id` markers in the rendered React or template source for:

- top-level screen sections
- form groups
- table/list regions
- tab panels
- primary and secondary action controls
- file upload/download zones

### 8.2 Component registry

Each reusable component should declare:

- `componentId`
- purpose
- allowed prop summary
- visual class or layout role
- owner domain
- sensitivity notes

### 8.3 Function catalog

Each tracked business function should declare:

- `functionId`
- owner layer
- trigger source
- parameter schema summary
- result schema summary
- sensitive field policy

### 8.4 API catalog

Each endpoint should declare:

- `apiId`
- method and path
- request summary schema
- response summary schema
- masking policy
- audit required flag

## 15. Rollout Estimate

This estimate assumes one existing Carbonet codebase, current mixed React plus Spring Boot structure, and a small team that already understands the project.

### Phase A. Foundation

Scope:

- trace ID propagation
- request filter and interceptor
- frontend route and API instrumentation skeleton
- shared masking policy

Duration:

- 2 to 3 weeks

Team:

- 1 backend
- 1 frontend
- 1 part-time architect or lead

### Phase B. Backend Audit Baseline

Scope:

- server audit writer
- immutable audit table
- admin and business action hooks
- search API for audit history

Duration:

- 3 to 5 weeks

### Phase C. Frontend Event and Function Trace

Scope:

- route events
- action events
- function wrappers for major flows
- error and API correlation

Duration:

- 3 to 4 weeks

### Phase D. Page Manifest and Component Registry

Scope:

- manifest format
- registry storage
- onboarding for key migrated pages
- admin UI or query API to inspect composition

Duration:

- 4 to 6 weeks

### Phase E. Full Operationalization

Scope:

- dashboards
- retention policy
- privacy controls
- rollout to remaining pages
- quality gates in CI

Duration:

- 4 to 8 weeks

### Total realistic range

- MVP for meaningful audit and trace: 8 to 12 weeks
- broader production rollout with UI governance: 14 to 24 weeks

If the target truly includes screen manifest management, component registry, and layout-level queryability for most pages, plan closer to the upper bound.

## 16. Recommended Delivery Strategy

### Option 1. Practical MVP

Deliver first:

- backend authoritative audit
- frontend route and action trace
- API correlation
- manifest only for critical admin and join flows

Use this if the goal is operational value within one quarter.

### Option 2. Full UI Governance

Deliver first:

- all of Option 1
- page manifest registry
- component registry
- layout query APIs
- versioned screen inspection view

Use this only if the organization will actually maintain the metadata discipline.

## 17. Risks

- excessive log volume and storage cost
- privacy leakage from raw payload logging
- weak adoption if IDs and catalogs are optional
- frontend over-instrumentation causing developer friction
- stale UI registry metadata if not part of delivery workflow

## 18. Recommended First Increment in This Repository

Start with the current migration codebase in this order:

1. Add common trace context in `frontend/src/lib` and backend common filter/interceptor packages.
2. Introduce `pageId`, `actionId`, and `apiId` to migrated React pages first.
3. Add backend `audit_event` persistence for admin actions and member/company approval flows.
4. Define manifest files for the highest-value pages:
   - member list
   - member detail
   - member approve
   - company approve
   - join wizard flows
5. Add a minimal admin query screen or API to search trace and audit by `traceId`, actor, date, menu code, and action code.

## 19. Suggested Ownership

- Platform or common backend team:
  - trace filter
  - audit writer
  - masking policy
  - storage and retention
- Frontend platform or migration team:
  - route instrumentation
  - event wrappers
  - page manifest and component registry
- Domain feature teams:
  - tagging page IDs, action IDs, and function IDs
  - verifying business audit coverage

## 20. Decision Summary

For Carbonet, the most defensible target is:

- backend-centered immutable audit
- frontend trace correlation
- selective function input and output summaries
- manifest-based screen and component governance
- optional runtime component snapshot only for debug or sampled investigation

Do not start with full DOM capture. Start with trace IDs, audit tables, page manifests, and component registry.
