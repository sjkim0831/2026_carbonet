# Operations Platform Console Architecture

Generated on 2026-03-21 for the Carbonet operations-system separation track.

## Product Name

Recommended product name for the operations and control-plane framework:

- `Resonance`

Use this naming model:

- `Resonance Control Plane`
  - central operations system
- `Resonance Runtime`
  - project systems that consume approved artifacts
- `Resonance Builder`
  - scaffold, generation, and design-synthesis chain
- `Resonance Ops`
  - deploy, topology, server, macro, and release control area
- `Resonance AI`
  - AI provider, model, runner, and agent governance area

See also:

- `docs/architecture/resonance-design-patterns.md`
- `docs/architecture/scenario-family-generation-contracts.md`
- `docs/architecture/scaffold-request-field-catalog.md`
- `docs/architecture/app-runtime-bridge-governance-contract.md`
- `docs/architecture/design-workspace-canonical-print-workflow.md`
- `docs/architecture/security-scaffold-and-runtime-governance-contract.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
- `docs/architecture/actor-authority-generation-contracts.md`
- `docs/architecture/chain-matrix-governance-schema.md`
- `docs/architecture/db-object-integrity-contract.md`
- `docs/architecture/installable-module-lifecycle-schema.md`
- `docs/architecture/cron-retention-governance-schema.md`
- `docs/architecture/resonance-ai-track-partition-map.md`
- `docs/architecture/notification-and-certificate-governance-contracts.md`
- `docs/architecture/approval-and-seal-governance-contract.md`
- `docs/architecture/two-host-build-deploy-runbook.md`
- `docs/architecture/parity-and-smoke-checklists.md`
- `docs/architecture/event-function-api-binding-contracts.md`
- `docs/architecture/component-event-log-schema.md`
- `docs/architecture/runtime-package-matrix-and-deploy-ia.md`
- `docs/architecture/full-stack-pattern-consistency-contract.md`
- `docs/architecture/installable-module-pattern-contract.md`
- `docs/architecture/css-pattern-and-deduplication-contract.md`
- `docs/architecture/ai-assisted-module-intake-checklist.md`
- `docs/architecture/module-intake-api-contracts.md`
- `docs/architecture/module-selection-and-install-ui-contract.md`
- `docs/architecture/module-selection-api-contracts.md`
- `docs/architecture/module-selection-api-examples.md`
- `docs/architecture/module-selection-checklist.md`
- `docs/architecture/theme-set-schema.md`
- `docs/architecture/page-design-schema.md`
- `docs/architecture/element-design-set-schema.md`
- `docs/architecture/page-assembly-schema.md`
- `docs/architecture/component-slot-layout-schema.md`
- `docs/architecture/repair-and-verification-api-contracts.md`
- `docs/architecture/repair-and-verification-api-examples.md`
- `docs/architecture/missing-asset-queue-ia.md`
- `docs/architecture/operator-feature-completeness-checklist.md`
- `docs/architecture/gui-first-builder-readiness-checklist.md`
- `docs/ai/80-skills/resonance-skill-and-doc-update-pattern.md`

## Goal

Build a separate Carbonet operations system that acts as the control plane for:

- project and server registration
- common master data and common runtime artifact management
- menu, page, URL, screen, component, event, function, API, parameter, output, DB, table, and column governance
- screen wizard and UI creation
- menu registration, page registration, feature registration
- Jenkins plus Nomad deployment orchestration
- Nginx main/sub server topology management
- file placement and archive movement
- DB connection, backup, migration, and restore operations

This console is not another business app.

It is the operational authority that manages deployed systems as runtime targets.

## Uniform Asset Quality Goal

Resonance must guarantee that screens and all governed assets are:

- generated uniformly
- update-resilient
- quality-governed
- traceable
- auditable
- requirement-complete

This applies to:

- menus
- scenarios
- pages
- page frames and shells
- components and composite blocks
- events, functions, APIs, and backend chains
- DB objects, SQL drafts, and migration drafts
- help, accessibility, security, diagnostics, and logs
- release units, runtime packages, and patch baselines

No asset family may bypass the same control-plane trace, compare, quality, or rollback chain.

This also applies to internal component structure:

- the same component family in the same page zone must use the same approved slot profile
- action clusters, helper text, status badges, counters, and pagination zones must not move arbitrarily between pages

The generated systems should remain compatible with:

- eGovFrame-centered backend package, service, mapper, and deployment conventions
- Korean public-sector style review, documentation, and operator governance expectations
- NIS-sensitive security practices for traceability, access control, masking, transport security, and operational audit

## Core Position

Split Carbonet into:

- `OPERATIONS_SYSTEM`
  - control plane
  - governance metadata
  - deployment orchestration
  - topology registry
  - screen wizard and component governance
- `PROJECT_SYSTEMS`
  - actual business execution
  - user traffic
  - project-owned DB workloads
  - project runtime file usage

Keep the control plane DB separate from project business DBs.

## Project-First Execution Rule

Every Resonance flow must start from explicit project selection.

Use this rule:

- no design intake without `projectId`
- no scenario-family or scenario registration without `projectId`
- no menu, page, feature, function, API, DB, or manifest generation without `projectId`
- no build, publish, deploy, rollback, retention override, or module/version binding without `projectId`

Required operator order:

1. select project
2. confirm framework and module lines
3. confirm scenario family and scenario
4. confirm folder mapping and runtime target
5. continue to scaffold, build, or deploy

Do not allow:

- global scaffold generation in an unowned shared namespace
- project binding after code generation has already started
- shared draft assets without an owning project

This means the following full operator path is supported as one governed flow:

1. select project
2. design and register page or element assets
3. bind scenario, actor, menu, page, feature, and backend chain
4. scaffold frontend, backend, and DB artifacts
5. build runtime package
6. deploy through release unit
7. verify, patch, or roll back

### Project-Unit Generation Rule

Resonance should generate, build, and deploy by explicit project unit rather than by loose screen batches or ad hoc source folders.

Use this rule:

- one scaffold/build/deploy flow belongs to one governed `projectId`
- every generated menu, scenario, page, feature, backend chain, DB object set, common-jar selection, frontend bundle selection, and runtime package is owned by that project unit
- cross-project shared assets stay centrally versioned, but project runtime outputs are always assembled project by project
- no runtime package may contain ambiguous ownership across two unrelated projects

Required project-unit answers:

1. which project is being generated
2. which main server receives the runtime package first
3. which sub or idle targets participate in staged rollout
4. which DB server belongs to the project
5. which common artifact lines are pinned into the package
6. which project-local thin runtime outputs are included

## System Development Rule In Resonance

Resonance must declare and enforce development rules for every scaffolded and buildable system.

Use this rule:

- system development starts in the control plane, not in an arbitrary runtime node
- backend and frontend generation must resolve from approved project, framework, module, and theme selections
- import-sensitive shared code must remain centrally managed and version-selected
- scaffold, build, package, deploy, rollback, and retention must all point back to one governed release-unit chain

Every scaffold or build flow should answer:

1. which project is being built
2. which framework line is selected
3. which backend common jar line is selected
4. which frontend common bundle line is selected
5. which theme, token, CSS, and JS lines are selected
6. which feature-module lines and extra libraries are attached
7. which release unit will own the result
8. which runtime targets will receive the result

Do not allow:

- ad hoc project-local dependency upgrades outside Resonance selection flows
- runtime-side manual library drops without release-unit registration
- frontend or backend import-breaking changes to bypass central compatibility review

## Frontend-First Where Safe Rule

General systems should prefer frontend JS for behaviors that do not weaken the security boundary.

Good frontend-first candidates:

- layout coordination
- screen-local state transitions
- popup, tab, wizard, and grid interactions
- safe formatting, display transformation, and UI-only validation hints
- component-level diagnostics and interaction tracing

Do not move these into frontend-only execution:

- final permission checks
- final classification and masking decisions
- final export, download, approval, delete, or authority-changing actions
- secret-backed provider calls
- authoritative file-access decisions

This means generated runtime pages may be mostly JS-driven for ordinary interaction, while security-sensitive execution remains centrally governed in shared backend lines and common jars.

## Member Classification Security Rule

If a member or managed actor has a governed classification, every search, query, output, export, and downstream API call must respect that classification scope.

Typical classification dimensions:

- member type
- member status
- institution scope
- department scope
- tenant scope
- approval state
- privacy or sensitivity grade

Use this rule:

- list screens must default to classification-scoped search conditions
- detail screens must re-check classification scope before loading data
- exports, print, PDF, Excel, and file download must use the same classification filter chain
- generated mapper and query conditions must include classification predicates when the scenario declares them
- response shaping must not leak rows, aggregates, or file references outside the bound classification scope

Security requirements:

- classification scope is enforced in frontend visibility, backend query conditions, and output/export contracts together
- removing classification conditions in generated code is a security regression
- audit records should capture the classification scope used for search and export decisions

## Non-Negotiable Platform Rules

Every future technology added to Resonance should follow these mandatory rules:

1. `installable first`
   - the capability must be attachable and detachable through governed module binding
2. `buildable first`
   - the capability must produce versioned build artifacts before runtime use
3. `centralized governance first`
   - registration, approval, versioning, compatibility, and rollout belong to the control plane
4. `runtime separation first`
   - project systems consume approved outputs and do not become the primary governance or source-of-truth host
5. `replaceable by contract`
   - adapters and bundles must be replaceable without uncontrolled source rewriting across all project systems

Do not accept a new stack into Resonance if it requires:

- unmanaged live-source sharing
- project-local one-off installation as the only path
- hidden dependency on manual shell knowledge
- missing uninstall or rollback contract

## Central Version Governance Rule

Version-managed code that affects imports, framework compatibility, or shared runtime behavior must remain centrally governed.

This applies at minimum to:

- backend framework and shared facade lines
- backend import-sensitive lines
- frontend platform shell and shared UI bundles
- shared component bundles
- theme, token, CSS, and JS bundles
- shared feature-module bundles
- generated scaffold templates and codegen baselines

Project systems should:

- select approved lines
- consume built artifacts
- bind those selections into one release unit

Project systems should not:

- become the publication source of shared backend or frontend lines
- fork shared version lines silently
- upgrade import-sensitive assets outside the control-plane workflow

## Uniform Generation, Quality, Trace, And Requirement-Fulfillment Rule

Resonance should not treat generation, update, quality, trace, audit, and requirement coverage as separate concerns.

Use one connected rule:

1. requirements must resolve into governed menu, scenario, page, element, backend, and DB families
2. generated assets must use approved frame, theme, token, spacing, component, and action-layout profiles
3. every generated asset must produce traceable provenance
4. every update must preserve compare, patch, rollback, and audit continuity
5. every runtime package must prove parity and smoke readiness before deployment completion

Required quality outcomes:

- the same scenario family should generate the same governed structure every time
- generated screens should not drift visually or structurally when updated
- all event, function, API, backend, and DB links should stay complete after change
- all managed assets should stay visible in chain and matrix views
- every generated family should prove requirement coverage before publish

Release blockers:

- unmanaged asset family
- missing requirement coverage
- missing provenance or change trace
- missing audit or security policy
- missing compare path to current runtime, baseline, or patch target
- missing rollback target

## Missing-Asset And Parity Gap Closure Rule

Resonance should actively search for missing assets instead of assuming a scenario family is complete once generation succeeds.

The control plane should always be able to answer:

- which required pages are still missing
- which required component families are still missing
- which required popup, grid, search, upload, report, approval, and dashboard blocks are still missing
- which requirements have no mapped menu, scenario, page, backend, or DB chain
- which generated pages still drift from current runtime or approved theme-set rules

The default closure loop should therefore include:

1. requirement coverage recheck
2. missing page-family audit
3. missing component-family audit
4. binding completeness audit
5. parity and uniformity compare
6. selected-screen or selected-element repair
7. rebuild and redeploy readiness review

Do not mark a project unit parity-ready while any one of those audits still has unresolved blockers.

## AI Theme-Set Generation Rule

Resonance should allow AI-assisted generation of theme-scoped UI sets in one governed step instead of creating screens from isolated component choices.

One AI theme-set generation run should be able to produce or update together:

- theme package
- design token bundle
- color and font bundles
- spacing and density profile
- page frame family
- shell composition profile
- approved component bundle
- approved composite blocks
- starter page-design and element-design assets

Use this rule:

1. choose project
2. choose theme family or target visual direction
3. choose design-system profile such as Carbonet or KRDS-compatible
4. generate one governed theme set
5. review the theme set as a single package
6. use only approved theme-set assets during page assembly

Do not allow:

- AI to create page-local visual dialects outside a governed theme set
- component creation without token, spacing, and shell alignment
- one-off CSS or layout hacks that bypass the approved theme-set bundle

The generated theme set should be reusable across many pages and should become the default source for:

- page-design starter templates
- element-design starter templates
- shell composition choices
- approved component and composite block palettes

## Incremental One-By-One Generation Rule

Resonance should support both:

- full theme-set generation
- incremental single-unit generation

Allowed governed generation units:

- `THEME_SET`
- `PAGE_DESIGN`
- `ELEMENT_DESIGN`
- `COMPONENT_CATALOG_ITEM`
- `PAGE_ASSEMBLY`
- `BINDING_SET`

Use this rule:

1. operators may generate one unit at a time
2. each unit still belongs to a project, scenario, and governed approval chain
3. single-unit generation may reuse the currently approved theme set
4. single-unit generation may not bypass chain, matrix, compare, or rollback governance

This means:

- a single component can be created and approved
- a single element-design can be created and approved
- a single page-design can be created and approved
- a full theme set can still be generated in one pass when needed
- shell composition choices
- approved component and composite block palettes

## Architecture Chain Audit

This section checks whether the current Resonance design is chained end-to-end without major blind spots.

### Chain Status Summary

- `control-plane versus runtime split`
  - structurally sound
  - ownership boundary is explicit
- `topology chain`
  - structurally sound
  - main, sub, DB, idle, AI-runner separation is explicit
- `screen generation chain`
  - structurally sound
  - requirement -> menu -> screen -> backend/frontend scaffold -> publish is defined
- `installable and buildable module chain`
  - structurally sound
  - install, build, version, compatibility, and rollback direction is defined
- `design/theme/component chain`
  - structurally sound
  - design source -> internal catalog -> theme -> token -> screen builder is defined
- `version and release chain`
  - structurally sound
  - active/target/rollback and release-unit framing is present
- `audit, security, accessibility, and log chain`
  - structurally sound
  - ELK is positioned correctly as search and correlation, not authoritative audit
- `AI and future-stack chain`
  - structurally sound
  - provider, runner, model, and installable module pattern is defined

### Critical Validation Result

No major architectural contradiction remains in the current document set.

The most important rules are now consistent:

- shared memory is not assumed across servers
- DB is not treated as a pooled web-style runtime
- shared capabilities are installable and buildable first
- project systems consume approved outputs from the control plane
- theme and design assets are governed centrally
- AI and blockchain are optional modules, not forced baseline runtime dependencies

### HTML5, UI Parity, And Product Readiness Verdict

The current Resonance design is capable of producing general systems that are close to the current Carbonet experience, but only if the implementation respects governed shell, component, binding, and semantic-markup rules without shortcuts.

Current readiness verdict:

- `menu and screen governance coverage`
  - strong
- `control-plane versus runtime-admin separation`
  - strong
- `common-jar versus thin-runtime split`
  - strong
- `page, element, and assembly design discipline`
  - strong
- `parity and uniformity compare path`
  - strong in architecture, still dependent on implementation
- `HTML5 semantic output discipline`
  - now governed, but still requires generated page manifests and shared React shell primitives to enforce it

Remaining product-readiness risks are implementation risks rather than architecture gaps:

- generated pages may still feel awkward if semantic page frames and governed action layouts are bypassed
- parity may still drift if menu-to-rendered-screen verification is skipped in release gates
- HTML5 compliance may still regress if component authors bypass governed primitives with arbitrary markup
- popup, grid, and search families may still diverge if repair work ignores catalog reuse

Use this rule:

- HTML5 semantic verification must run as part of parity and uniformity review
- generated general systems should not be considered parity-ready unless semantic shell, form, popup, grid, and action markup passes the governed checklist

### Common-System Separation Check

The common system is separated correctly at the architecture level.

Why the separation is currently sound:

- `COMMON_DB` remains the control-plane source of truth
- project business DBs remain runtime-plane data stores
- common capabilities are modeled as installable, buildable modules instead of live shared source
- project systems are described as consumers of approved artifacts, not as parallel control planes
- shared UI, theme, CSS, design-token, auth, PDF, Excel, and policy lines are version-bound centrally

Current caution:

- the separation is well defined in architecture, but still depends on implementation contracts and screen flows being enforced consistently

### Operations-System Development Viability

The operations system is viable to build as designed.

Why this is a reasonable build target:

- the control plane and runtime plane are already separated
- common artifact, framework-line, and feature-line ownership is defined centrally
- scenario-first and actor-first generation rules are defined
- installable-module and build-first rules prevent uncontrolled sprawl
- deploy and rollback concepts are already release-unit based

The correct implementation strategy is:

- freeze shared contracts first
- build registry and lifecycle APIs second
- build UI and builder flows third
- add runtime automation after registry and release bindings are stable

### Remaining Weak Areas

The remaining gaps are not structural gaps. They are execution-contract gaps.

Still required before implementation at scale:

- exact JSON schemas for scaffold, bindings, modules, devices, and install targets
- exact table schemas for chain matrices and installable-module lifecycle
- exact runbooks for Jenkins, Nomad, Nginx, DB backup and restore, archive move, and AI runner control
- exact compatibility-check payloads and result contracts
- exact cross-repo intake rules for future module fusion such as `carbosys`
- exact multi-account AI session ownership and handoff rules for repository-local implementation

### Remaining Functional Gaps To Close

The following areas are not missing conceptually, but still need explicit implementation contracts or screens:

- i18n translation workflow and translation approval history
- certificate rotation and secret rotation runbooks
- notification-template lifecycle and delivery retry policy
- configuration diff and environment override governance
- batch and scheduler dependency visibility beyond cron ownership
- data masking rule editor and verification workflow
- test-case and QA evidence attachment to release units
- operational SLO, error budget, and alert-routing ownership
- existing-screen asset audit and promotion workflow for current Carbonet UI reuse
- design-workspace operator screens for canonical-source selection and mature print packaging
- app-runtime diagnostics and capability-status screen flow for hybrid, wrapper, and kiosk execution

### Current Chain Validation Result

At the current documentation level, the major chains are connected and there is no blocking logical contradiction in:

- project-first registration
- scenario-first generation
- actor and authority propagation
- menu, page, feature, component, event, function, and API asset governance
- classification and CSRF security binding
- security-profile, masking, file-access, and transport-security binding
- theme, token, and component catalog governance
- scaffold, build, deploy, rollback, and retention ownership

The remaining work is implementation detail, not architecture correction.

Use this interpretation:

- the chain is safe enough to start building
- no major screen-flow contradiction has been found
- no major scenario contradiction has been found
- no major common-system versus runtime-system contradiction has been found
- remaining gaps should be closed as contracts, runbooks, and validation screens

### Existing Carbonet Asset Readiness Check

The current repository already contains enough governed UI and metadata structure to support low-token, high-consistency generation if Resonance uses existing assets correctly.

Confirmed strengths in the current repository:

- `frontend/src/app/screen-registry/pageManifests.ts`
  - already provides page-level component inventories and layout zones
- `frontend/src/features/app-ui/primitives.tsx`
  - already provides governed primitive families for button, field, table, checkbox, and radio controls
- `frontend/src/features/admin-ui/pageFrames.tsx`
  - already provides reusable page-frame families
- `frontend/src/features/screen-builder/ScreenBuilderMigrationPage.tsx`
  - already uses palette, template presets, slot rules, and node-tree generation concepts
- `frontend/src/features/screen-builder/buttonCatalog.tsx`
  - already scans and normalizes reusable component usage from the existing codebase
- multiple migrated screens under `frontend/src/features/*`
  - already show repeated list/detail/edit/review patterns, especially for member, company, auth, join, security, and environment-management flows

Use this interpretation:

- Resonance does not need to invent screen generation from scratch
- it can generate from existing manifests, primitives, frame families, and discovered component usage first
- Codex should be used to fill structured gaps, not to improvise whole screens from long free-form prompts

### Token-Efficient And Accurate Generation Check

Resonance should be able to generate screens with low token waste and high consistency if it uses this order:

1. project selection
2. scenario family and scenario selection
3. actor, classification, CSRF, and security profile binding
4. page frame selection
5. theme and component-catalog selection
6. existing manifest and route-family reuse lookup
7. JSON scaffold generation
8. Codex-assisted repair only for unresolved bindings or source gaps

Why this is feasible in the current repository:

- page manifests already describe route, menu, and component-zone structure
- primitives already reduce visual and behavioral variance
- page-frame components already reduce shell variance
- screen-builder templates already show list/detail/edit/review preset thinking
- button catalog scanning already supports component normalization from existing code

Therefore:

- token-heavy prompt-only generation should be considered a fallback
- JSON and registry driven generation should be the default
- Codex should mostly receive compact normalized payloads instead of verbose design prose

### Theme, Component-Type, And Design Consistency Check

The current repository is compatible with category-driven component governance.

This is because existing assets already cluster naturally into:

- action primitives
- form primitives
- table and pagination primitives
- summary and section-card blocks
- list/detail/edit/review page frames
- join/public variants and admin variants

Resonance should classify components by:

- primitive type
- block type
- page-frame suitability
- theme compatibility
- accessibility and security posture
- version line

This means screen generation can remain consistent by:

- choosing a theme first
- loading only approved components for that theme
- preferring existing primitive wrappers over raw HTML or new one-off widgets
- preserving the same page frame and action-layout semantics across screens

### Header, Menu, And Shell Governance Rule

Homepage and admin navigation should be treated as governed shell assets, not page-local markup.

Governed shell families should include:

- public header
- public compact header
- public minimal header
- public global navigation menu
- public contextual menu
- hidden-menu shell variant
- public utility menu
- public footer
- public compact footer
- public legal-only footer
- admin header
- admin compact header
- admin left navigation
- admin top navigation
- hidden-admin-menu shell variant
- admin breadcrumb and context rail
- sticky action footer

Use this rule:

- header and menu design should be developed once as shared shell assets
- homepage build should consume approved header, menu, and footer packages instead of rebuilding them per page
- admin pages should consume approved admin shell and navigation packages
- public pages should consume approved footer packages and footer-layout rules together
- each page or scenario may choose a shell composition profile rather than one globally fixed shell
- shell composition must support menu-visible and menu-hidden variants
- shell composition must support homepage-specific, join/signin-specific, board-specific, and admin-specific variants
- menu position, shape, spacing, active state, hover state, drawer behavior, and mobile collapse behavior must come from theme and shell profiles
- footer content blocks, legal links, sitemap links, company-information rows, partner marks, and responsive collapse behavior must also come from shell profiles
- generated screens should mount inside governed shell frames rather than composing ad hoc top navigation
- shell families must expose GUI-driven item management so operators can add header items, menu items, utility items, footer links, trust badges, and information blocks without editing page source directly

Recommended governed shell assets:

- `header-shell-package`
- `menu-shell-package`
- `footer-shell-package`
- `header-item-registry.json`
- `menu-item-registry.json`
- `footer-item-registry.json`
- `shell-composition-profile.json`
- `public-home-shell-profile.json`
- `public-join-shell-profile.json`
- `public-signin-shell-profile.json`
- `public-board-shell-profile.json`
- `admin-shell-profile.json`
- `admin-compact-shell-profile.json`
- `navigation-layout-rule.json`
- `navigation-state-token-bundle.json`
- `footer-layout-rule.json`
- `footer-link-bundle.json`

Recommended shell composition selectors:

- `headerVariant`
- `menuVariant`
- `footerVariant`
- `menuVisibleYn`
- `breadcrumbVisibleYn`
- `utilityRailVisibleYn`
- `quickActionVisibleYn`
- `helpRailVisibleYn`
- `bottomActionVisibleYn`

Use this composition rule:

- one homepage may use a large public header and full menu
- another homepage may use a compact header and hidden menu
- signin or join pages may use a reduced shell with no global menu but with a legal footer
- admin pages may choose left-navigation or top-navigation variants by system profile
- boards or support modules may attach to the same theme while using a different shell composition profile

Use this item-governance rule:

- header items should be registerable as governed item rows
- menu groups and menu items should be registerable as governed item rows
- footer legal links, sitemap links, company-information blocks, trust badges, and partner marks should be registerable as governed item rows
- shell packages should consume selected item registries and item-order profiles during build
- runtime systems should receive the built shell package output rather than becoming the primary item-definition authority

Each governed shell item should support at minimum:

- `itemId`
- `itemType`
- `labelKo`
- `labelEn`
- `targetUrl`
- `iconToken`
- `visibilityPolicy`
- `displayOrder`
- `themeCompatibility`
- `publishState`
- `releaseUnitBinding`

This is required so that:

- homepage builds can differ intentionally without becoming ad hoc
- homepage and public flows keep governed footer structure and legal/trust area
- admin pages do not drift in navigation placement even when compact or hidden-menu variants are used
- common menu and button areas remain visually and behaviorally uniform
- later modules such as boards or support pages inherit the same navigation structure automatically
- operators can add or reorder shell items without breaking common shell governance

### Theme Spacing And Layout Token Rule

Theme governance must include layout density and spacing contracts, not only colors and typography.

Every approved theme should define:

- spacing scale
- section-to-section gap
- card padding
- form-row gap
- field height
- button height and button-group gap
- grid header and body density
- tab and drawer spacing
- sticky bottom-action bar padding and offset

Recommended governed theme assets:

- `spacing-token-bundle.json`
- `layout-density-profile.json`
- `component-spacing-rule.json`
- `action-bar-layout-rule.json`

Use this rule:

- components should inherit spacing and sizing from theme or layout profiles
- page authors should not tune margins and paddings ad hoc per screen when an approved rule already exists
- generated screens must reference theme spacing classes and token bundles instead of emitting one-off layout CSS
- KRDS-compatible themes must map spacing and state density explicitly, not only color tokens

This is required so that:

- search forms
- grids
- detail sections
- review modals
- bottom action bars

remain visually uniform across generated screens.

### Board And Reusable Module Compatibility Check

Future modules such as:

- notice board
- FAQ
- Q and A
- archive board
- attachment-heavy board
- approval queue board

should fit this architecture without structural change.

Reason:

- they can be expressed as scenario families
- they map naturally to `LIST_PAGE`, `DETAIL_PAGE`, `EDIT_PAGE`, and `REVIEW_PAGE`
- their buttons, search forms, grids, and attachment blocks already align with governed primitives and page frames
- their APIs, DB objects, files, and permissions can be bound through the existing scaffold chain

Use this rule:

- treat each board family as an installable feature module
- bind it to approved theme/component bundles
- keep board-specific business logic in feature modules while reusing shared primitives, frames, help, security, and release governance

### Version Compatibility Check

The current architecture is strong on version separation.

This is already compatible with:

- framework line selection
- common backend jar line selection
- import-sensitive common line selection
- frontend common bundle selection
- theme, token, CSS, and JS bundle selection
- feature-module line selection

Therefore Resonance should be able to support:

- board module version waves
- common jar upgrades
- UI common bundle upgrades
- theme and token upgrades
- per-project compatibility review
- per-project rollback to prior release unit

without forcing project systems to share live source or accept silent drift.

### Full-Stack Generation And Generation Log Rule

Resonance generation must not stop at frontend output.

When full-stack generation is selected, the system should generate and register:

- frontend screen schema
- frontend route binding
- component/event/function manifests
- backend controller
- backend service interface
- backend service implementation
- VO
- DTO
- mapper Java
- mapper XML
- DB object definitions
- reviewed DDL or migration draft
- query-shape and index expectations
- release-unit asset records

The platform should also record structured generation logs for every run.

Recommended generated log families:

- `SCAFFOLD_RUN_LOG`
- `FRONTEND_GENERATION_LOG`
- `BACKEND_GENERATION_LOG`
- `DB_GENERATION_LOG`
- `SECURITY_VERIFICATION_LOG`
- `PUBLISH_GATE_LOG`

Each generation log should record at minimum:

- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `menuCode`
- `pageId`
- `scaffoldRequestId`
- `themeId`
- `componentCatalogSelection`
- `generatedAssetSet`
- `securityProfileId`
- `classificationPolicyId`
- `csrfPolicyId`
- `dbObjectSet`
- `queryShapeSet`
- `releaseUnitId`
- `result`
- `blockingIssueSet`
- `operator`
- `generatedAt`

### Secure Backend And DB Output Rule

Backend and DB generation must remain inside the same governance chain as frontend generation.

Use this rule:

- generated controller, service, mapper, and query files must bind to scenario, actor, classification, and security policies
- generated query conditions must include classification predicates where the scenario requires them
- generated DB drafts must carry PK, FK, unique, not-null, index, audit-column, and soft-delete intent
- generated SQL or mapper statements must not bypass masking, file-access, approval, or audit policy
- generation output should produce reviewed migration drafts rather than executing uncontrolled schema change directly

Do not allow:

- frontend-only generation when the scenario explicitly requires backend or DB objects
- backend controller or service generation without registered security and authority metadata
- DB table or column generation without integrity and index review metadata
- raw query generation that ignores scoped search, export, or file-access rules

### Build-First Framework Completeness Check

For Resonance to qualify as a complete build-first framework, all of the following capability groups must exist together.

#### Already present at the architecture level

- control-plane versus runtime separation
- project-first and scenario-first generation
- actor, authority, classification, and CSRF binding
- theme, token, component catalog, and action-layout governance
- structured scaffold generation for frontend and backend chains
- installable-module and release-unit framing
- Jenkins, Nomad, Nginx, runtime topology, and rollback ownership
- retention, archive, cleanup, audit, security, and help coverage framing
- proposal and design workspace intake with mature output packages

#### Still needing explicit implementation contracts

- final `scaffold-request.json` field catalog and enum set
- final build and deploy runbooks for `193 -> 221` and later multi-node rollout
- final multi-account AI session ownership and handoff checklist

#### Already frozen as dedicated architecture contracts

- DB object integrity contract for PK, FK, index, unique, audit, and soft-delete policy
- notification and certificate governance contract
- actor-authority governance contract
- scenario-family governance contract
- installable-module lifecycle contract
- app-runtime bridge governance contract
- design-workspace canonical print workflow contract
- security scaffold and runtime governance contract
- generation trace and release governance contract

#### Build should not start before these are frozen

- scenario-family and scenario-definition contracts
- actor-authority contracts
- scaffold-request contract
- installable-module lifecycle
- release-unit version binding
- chain-matrix and blocker contracts

#### Build may proceed in parallel after freeze

- control-plane backend
- control-plane frontend
- screen builder and scaffold UI
- deploy/runtime automation
- observability and verification

### No-Miss Build Checklist

Before calling Resonance "complete enough to implement", verify that each feature family can answer all of these:

1. what scenario family owns it
2. what project owns it
3. what actor and data scope govern it
4. what menu, page, feature, component, event, function, and API assets it binds
5. what DB objects and indexes it requires
6. what help content and help anchors it exposes
7. what build artifact and release unit it produces
8. what runtime targets consume it
9. what blocks delete, rollback, or detach
10. what audit, security, accessibility, and monitoring hooks it emits

If one of those ten answers is missing, the framework is not complete for that feature family yet.

### Requirement-Driven Loss Prevention Checklist

When a screen or module is generated from requirements, Resonance should assume omission risk until all governed asset families are checked.

Every requirement-driven feature family should explicitly confirm:

1. scenario-family coverage
2. child-scenario coverage
3. home versus admin menu placement
4. button, popup, grid, tab, step, and search-form coverage
5. event, function, API, and backend chain coverage
6. controller, service, serviceImpl, VO, DTO, mapper, mapper XML, and SQL draft coverage
7. DB table, column, PK, FK, unique, index, audit-column, and masking coverage
8. help, diagnostics, validation, empty/error/loading, and blocked-action coverage
9. language, responsive, mobile-web, and app-runtime bridge coverage
10. server target, log source, audit source, and rollback checkpoint coverage

Treat the feature family as incomplete if even one of the following remains unbound:

- component asset
- popup asset
- backend asset
- DB object
- file or upload policy
- menu metadata
- authority policy
- audit or trace source
- release-unit binding

### Current Carbonet Reproducibility Check

Using the current repository as the baseline, Resonance is structurally capable of reproducing major public and admin flows, but some families still require explicit parity verification.

Confirmed reproducible families at the architecture level:

- public join and signin family
- admin login family
- admin menu, permission, help-management, and screen-builder governance family
- trace, audit, component-registry, and help-anchor family
- main versus sub runtime delivery and idle-node rollout family

Strong evidence already present in the current repository:

- public and join routes are explicitly handled in auth and scope filters and interceptors
- sitemap and route structures already model join steps, status pages, signin, and admin login
- `pageManifests.ts` and `ScreenCommandCenterServiceImpl` already expose governed page, event, API, schema, and help metadata patterns
- screen-builder draft storage and component-registry patterns already exist
- trace and audit persistence already exist as authoritative runtime families

Current high-risk parity areas that still need compare or promotion workflows:

- external identity-verification or third-party authentication adapters
- upload-heavy join or company-registration widgets with file, validation, and status-detail coupling
- hidden business rules that currently live in existing service or mapper implementations rather than explicit scenario contracts
- bilingual copy parity and mobile-responsive fine details
- popup-heavy admin flows with nested search, grid, and approval actions
- batch, cron, export, PDF, Excel, notification, and certificate-linked screens
- legacy JSP-only edge layouts that have not yet been promoted into governed component sets

Use this implementation rule:

- do not claim current-system parity for a feature family until `generated-result compare`, `binding completeness`, and `asset promotion review` all pass
- do not claim proposal-built general-system parity until `baseline versus current runtime compare` and `patch delta review` also pass

### Current Carbonet Parity Readiness Verdict

Current judgment for full system generation through Resonance:

- architecture readiness: high
- common versus project split readiness: high
- full-stack scaffold readiness for standard eGov-style backend and React/KRDS-style frontend: high
- guaranteed no-difference deployment against the current runtime: not complete yet

What is already strong enough:

- project-first, scenario-first, actor-first generation
- controller, service, serviceImpl, VO, DTO, mapper Java, mapper XML, and DB draft generation chain
- common jar and frontend bundle version selection
- proposal-driven initial build chain
- patch, rollback, and release-unit traceability
- menu, shell, component, event, function, API, and DB governance

What still needs explicit product surfaces before claiming near-zero difference from the current system:

- generated-result compare explorer
- current-runtime asset promotion and collection explorer
- proposal baseline explorer
- runtime patch history explorer
- backend chain explorer
  - controller -> service -> mapper -> SQL/DB object
- current-runtime vs generated-runtime parity dashboard
- existing-screen/component promotion workflow for legacy JSP or hand-built pages
- adapter exception registry
  - third-party identity verification
  - notification provider
  - certificate/crypto edge adapters

### Missing Menu Or Screen Areas To Add Before Product Completion

If Resonance is expected to build and deploy general systems that are visually and functionally near-parity with the current Carbonet runtime, add these explicit menu surfaces:

1. `Parity And Compare`
- generated-result compare
- current-runtime compare
- baseline vs patch compare
- collected current asset vs generated asset compare

2. `Backend Chain Explorer`
- route to controller mapping
- controller to service mapping
- service to mapper mapping
- mapper to SQL and DB object mapping
- backend security and authority binding summary

3. `Proposal Baseline And Patch History`
- initial proposal-derived baseline
- patch release history
- per-patch changed asset matrix
- patch rollback explorer

4. `Current Runtime Collection And Promotion`
- collect current page
- collect current backend chain
- collect current DB object ownership
- promote current asset into governed catalog

5. `Common vs Project Asset Split`
- common candidate asset review
- project-local candidate asset review
- shared-to-project demotion review
- project-to-common promotion review

6. `Runtime Adapter Exceptions`
- identity verification adapter registry
- provider adapter registry
- file and storage edge adapter registry
- import-sensitive exception line registry

7. `UI Uniformity And Repair`
- screen element statistics dashboard
- page-frame drift dashboard
- shell-profile drift dashboard
- component usage and spacing drift dashboard
- action-layout drift dashboard
- immediate repair queue
- repair result explorer

8. `Monitoring And Statistics`
- screen usage and path coverage dashboard
- component event volume and blocked-action rate
- popup, grid, and search usage profile
- parity score by screen family
- uniformity score by theme and page-frame family
- repair impact and recurrence dashboard

### Control-Plane Versus Runtime-Admin Menu Boundary

Use this menu boundary rule:

- all development, design, scaffold, compare, promotion, and release-control menus belong to the operations system
- general systems should expose only business and ordinary admin operation menus built from approved outputs
- runtime admin menus may manage business records, approval records, uploads, exports, and status flows
- runtime admin menus should not become secondary builders or secondary control planes

This boundary is required so that:

- general systems stay lightweight
- common jar updates remain effective
- runtime admin UI remains simpler and closer to the current Carbonet business-admin experience
- version management and rollback stay centralized

Required control-plane-only feature families:

- proposal intake and design synthesis
- scenario catalog, actor policy, and action-layout governance
- component, theme, token, shell, and help governance
- parity compare, uniformity compare, and selected-screen repair
- menu-linked page/feature authoring and registration governance
- backend chain explorer and DB object review
- SQL draft, migration draft, data patch, and rollback review
- common jar line, framework line, frontend bundle, and feature-module selection
- Jenkins, Nomad, Nginx, server registry, macro, and rollout governance
- current runtime collection and promotion

Required runtime-admin-only feature families:

- ordinary CRUD business screens
- ordinary approval and status flows
- file upload/download and export flows
- project-specific read and write actions that do not mutate control-plane governance metadata

### Shared Versus Runtime-Deployable Asset Rule

Not every governed menu, screen, or scenario should be deployed to general systems.

Treat these as shared control-plane assets:

- proposal/design intake and synthesis
- scenario-family registry and scenario governance
- theme, token, shell, component, and design assembly governance
- selected-screen repair and current-runtime collection
- parity compare and uniformity dashboards
- common module, framework line, and release-unit governance
- server, macro, deploy, cron, retention, log, and audit control

Treat these as runtime-deployable business assets:

- public home/signin/join families
- business list/detail/edit/review pages
- business popup, grid, search, report, and approval scenarios
- project-local business dashboards and inquiry pages
- project-local admin operations that remain inside ordinary business authority boundaries

Use this rule:

- shared control-plane assets stay in the operations system only
- runtime-deployable assets may be built and shipped to general systems through release units
- each scenario family, menu node, and page family must declare whether it is `CONTROL_PLANE_ONLY`, `RUNTIME_DEPLOYABLE`, or `SHARED_REFERENCE_ONLY`

### Main-Server Runtime Truth And Runtime-Admin Continuity Rule

When a feature is already deployed to a general system and reflected on its governed main server, ordinary runtime-side management and correction should still be possible from that deployed general system as long as the feature remains inside the runtime-admin boundary.

Use this rule:

- the operations system remains the only design, scaffold, build, release, compare, and rollback authority
- the deployed main server becomes the default runtime observation point for current business behavior, current rendered screens, current enabled cron families, and current runtime-admin change effects
- current-runtime collection, parity review, screen compare, and post-deploy validation must resolve against the governed main server first
- sub nodes, idle nodes, preview nodes, and patch targets may be inspected for rollout health, but they do not replace the main server as the default runtime truth source
- runtime-admin changes must remain queryable from the operations system without turning the deployed runtime into a secondary control plane

Required continuity checks:

- runtime-admin actions performed after deployment must be queryable in the operations system
- the operations system must be able to inspect `main-server current`, `target generated`, `proposal baseline`, and `patch target` as separate viewpoints
- runtime-admin data changes must remain traceable through main-server-based current-runtime views
- ordinary deployed management actions must stay available in the general system after release without requiring design-time menus to ship with it

### Server, Log, And Audit Family Coverage Rule

Every generated or installable feature family should declare infrastructure visibility together with UI and backend assets.

Minimum required runtime governance bindings:

- target server list and role
- main, sub, DB, file, idle, AI-runner, and control-plane applicability
- log source families
  - app
  - Nginx
  - Jenkins
  - Nomad
  - DB operation
  - security
  - audit
- health-check and diagnostics source
- backup and restore applicability
- rollout and rollback applicability

Do not allow a generated feature or module to ship if:

- its runtime server usage is unknown
- its log and audit sources are not declared
- its rollout target or rollback checkpoint family is missing

### Parity And Uniformity Operations Rule

The operations system should treat parity and visual uniformity as governed runtime qualities, not as subjective post-review comments.

Required operator capabilities:

- compare generated result versus current runtime result
- compare shell composition, page-frame family, component family, and backend chain
- inspect spacing, density, action-layout, and help-anchor drift by screen family
- open one page, component, popup, action-layout profile, or shell profile directly into governed repair mode
- publish a targeted repair release unit without reopening unrelated feature families

Required parity and uniformity statistics:

- `pageFrameUsageCount`
- `shellProfileUsageCount`
- `componentFamilyUsageCount`
- `popupFamilyUsageCount`
- `gridFamilyUsageCount`
- `searchFormUsageCount`
- `spacingDriftCount`
- `densityDriftCount`
- `actionLayoutDriftCount`
- `blockedActionCount`
- `missingHelpAnchorCount`
- `missingBindingCount`
- `parityVerificationScore`
- `uniformityVerificationScore`
- `repairRecurrenceScore`

Use this rule:

- do not mark a feature family as parity-ready until both `parityVerificationScore` and `uniformityVerificationScore` satisfy the approved threshold
- if a screen family violates frame, shell, spacing, button-slot, or help-anchor standards, the operations system should emit an immediate repair candidate
- repair actions must remain traceable to the exact generated asset, current runtime asset, release unit, and responsible actor or AI session

### Screen-Selection Repair And Directed Modification Rule

The operations system should allow an operator or AI worker to:

- select one governed screen from the runtime or generated screen list
- inspect the screen's included elements
  - shell profile
  - page frame
  - components
  - popup families
  - grid and search blocks
  - help anchors
  - authority gates
  - event, function, and API bindings
  - backend chain and DB object bindings
- issue one or more directed modification instructions against the selected screen or selected element set
- reuse already-governed existing Carbonet assets before creating a new component, function, popup, or backend chain

Required repair flow:

1. choose project
2. choose screen family and concrete page
3. load current runtime asset set and generated asset set side by side
4. choose target elements or chains to modify
5. resolve reusable existing assets first
6. open structured repair session
7. regenerate or patch only the affected assets
8. produce compare summary, patch release unit, and rollback target

Do not allow free-form repair that bypasses:

- existing governed component reuse
- menu/page/feature registration linkage
- authority/event/function/API linkage
- backend chain and DB object review

### Smooth Menu Registration Rule

Menu registration in Resonance should not be a separate clerical step after screen generation.

Use this rule:

- menu registration is opened from scenario-driven screen authoring
- page, feature, menu, route, authority, common-module usage, event chain, function chain, backend chain, DB chain, help chain, and release-unit chain must remain visible together
- runtime systems should receive only the resulting menu/page/feature outputs, not the authoring controls

Required linked assets for one governed menu entry:

- menu tree node
- page id and route
- feature id
- scenario family and actor policy
- common asset bindings
- component and shell profile bindings
- event, function, and API bindings
- controller, service, mapper, and DB object bindings
- help anchor summary
- release-unit and rollback checkpoints

### Current-Menu Full Registration Rule

Existing menus from the current Carbonet runtime should be registerable into Resonance without losing the original menu tree intent.

Use this rule:

- home and admin menu trees should both be importable into governed menu registries
- imported menu nodes should preserve route, authority, display order, visibility scope, and linked page or feature identity
- imported menus should be promotable into scenario-linked menu registration rather than remaining passive legacy records
- current runtime menus should be eligible for parity compare and rendered-screen verification after import

Required current-menu import coverage:

- top-level menu groups
- nested menu nodes
- hidden but authority-governed menu nodes
- home/public menu trees
- admin menu trees
- menu-to-page and menu-to-feature links

Do not treat current runtime menus as out-of-band metadata.

### Menu-To-Rendered-Screen Verification Rule

Every registered menu must prove that the linked page actually renders and behaves correctly before release approval.

Required verification chain per menu node:

- menu node -> page id
- page id -> route
- route -> shell profile and page frame
- page frame -> component set
- component set -> event/function/API bindings
- API bindings -> backend chain
- backend chain -> DB object or service contract
- page manifest -> help, accessibility, security, and authority bindings
- release unit -> deploy target -> post-deploy verification result

Required checks:

- menu click lands on the intended route
- shell/header/menu/footer composition matches the selected profile
- all declared components render without missing asset errors
- all primary actions, popup actions, grid actions, and search actions are wired
- page-level permissions and actor gates behave correctly
- no required backend, DB, or help binding is unresolved

Do not allow a menu item to be marked release-ready if it points to a page that:

- renders with missing governed assets
- falls back to ad hoc layout outside the approved frame family
- contains unresolved event/function/API chains
- depends on source-side manual patching after deploy

### Menu, Scenario, And Common-Component Generation Rule

Menu addition, scenario addition, and screen generation should behave as one connected flow rather than three separate operator tasks.

Use this rule:

1. select project
2. register or choose scenario family and child scenario
3. bind menu, page, feature, and route
4. choose approved frame, shell, theme, and common-component sets
5. assemble page from approved blocks
6. resolve event, function, API, backend, and DB bindings
7. verify menu-to-rendered-screen parity
8. build and deploy through release unit

Required generation guarantees:

- menu addition must always produce or bind a governed scenario context
- scenario addition must always produce or bind the required page, feature, route, action layout, and business action set
- screen generation must prefer approved common components and governed composite blocks over page-local custom elements
- generated result should include all required business actions for the scenario family with no silent omission
- the release gate should reject any menu or scenario whose generated screen is missing required buttons, popup flows, grid actions, search actions, approval actions, upload flows, or export actions defined by the requirement domain

Runtime confidence rule:

- a generated screen family is considered runtime-ready only when the same scenario can prove
  - complete action coverage
  - complete event/function/API/backend linkage
  - complete help/accessibility/security/authority coverage
  - menu-to-rendered-screen verification success
  - post-deploy smoke success

### Chain-Matrix Governance Rule

Resonance should manage every governed feature family through operator-facing chain and matrix views instead of scattered point screens.

Required matrix families:

- project and runtime matrix
- menu and scenario matrix
- page and component matrix
- event/function/API/backend/DB chain matrix
- release-unit asset matrix
- runtime truth and rollout matrix
- delete and rollback blocker matrix
- parity and uniformity matrix

Use this rule:

- every menu, scenario, page, component family, popup family, grid family, search-form family, backend chain, DB object family, release unit, and runtime target must appear in at least one primary matrix
- no feature family is considered complete if it cannot be located and explained through those matrices
- every release gate should check blockers from the chain matrix before publish and deploy
- every repair action should update matrix states for parity, uniformity, and runtime readiness

### Chain Safety Rule

Treat the current architecture as safe to extend if and only if every new feature or stack can answer all of these:

1. where is the source of truth
2. what installable module or asset family does it belong to
3. what build artifact does it produce
4. what release unit binds it
5. what runtime targets consume it
6. what blocks delete or rollback
7. what audit, security, accessibility, and log hooks it must emit

## Primary Operating Model

### Control Plane

Use one operations system as the main console.

It should own:

- project registry
- server registry
- common master registry
- common artifact registry
- runtime topology registry
- screen and component governance
- deploy pipeline registry
- audit and trace
- backup and migration history

It should also act as the central build authority.

Use this rule:

- project development scaffolds are generated from the operations system
- common artifacts are built in the operations system
- project artifacts are built in the operations system
- deployed systems consume published artifacts instead of performing ad hoc local builds on each runtime server
- runtime systems should receive only approved release units and patch releases, not control-plane authoring features

Development and governance screens should stay in the control plane.

Control-plane-only screen families:

- screen builder
- design workspace and proposal synthesis
- component, theme, token, and shell governance
- common module and version governance
- parity and compare explorers
- backend chain explorer
- current runtime collection and promotion
- release-unit, patch, rollback, and compatibility governance
- audit, trace, ELK, retention, and scheduler governance
- Jenkins, Nomad, server registry, macro, and rollout governance

General runtime systems should not receive those screens as normal admin menus.

### Runtime Plane

Each managed system should use this default topology:

- `main web node`
  - Nginx entrypoint
  - main web runtime
  - latest or hot file serving
- `sub web node`
  - secondary web runtime
  - archive or old-file serving when needed
- `project DB node`
  - DB only

Optional shared infrastructure:

- idle web-node pool

General runtime systems should focus on ordinary business-admin operations.

Recommended runtime-admin screen families:

- list
- search
- detail
- create
- update
- delete
- approve or reject when the business scenario requires it
- status inquiry
- file upload or download
- report or export where approved
- main-server current-state inquiry
- runtime patch history summary
- business-safe correction flows that remain inside runtime-admin authority boundaries

Do not ship runtime-admin menus that expose control-plane authoring concerns such as:

- scenario definition
- component registration
- theme or shell design
- scaffold generation
- common module publication
- runtime collection and promotion
- release-unit compare or patch authoring
- Jenkins plus Nomad control node
- AI agent and model runner nodes
- dedicated file archive nodes

Runtime-admin menus may still:

- modify ordinary business records and runtime-entered data
- confirm current rendered behavior against the governed main server
- show the last applied release unit, recent patch references, and runtime trace links
- expose project-safe management actions without becoming a secondary design or release console

### Shared-Node Rule

Share idle nodes only for web/app instances.

Do not share DB execution across projects as if DB CAS or DB RAM were a common pool.

## Topology Validation

The currently proposed Carbonet runtime topology remains valid for the current small-memory environment.

Use this validated baseline:

- `main web node`
  - public Nginx entrypoint
  - main web runtime
  - latest or hot file storage and direct Nginx serving
- `sub web node`
  - secondary web runtime
  - old-file or archive-file serving when needed
  - candidate validation or review runtime during staged rollout
- `project DB node`
  - DB only
  - backup, migration, and restore ownership
- `idle node pool`
  - Nomad-managed extra web/app instances only
  - no DB colocating
  - no authoritative latest-file ownership

Use these validation rules:

- keep the latest or hot files near the main Nginx entrypoint unless a dedicated hot-file server is introduced later
- keep old or archive files on sub or archive nodes, not on the DB node
- let Nomad scale only web/app instances on idle nodes
- place Ollama or other local-model runtimes on dedicated AI runner nodes or explicitly approved mixed-use nodes
- keep DB isolated per system or approved DB group, with explicit CAS budgets
- treat the topology as `fixed main/sub nodes plus shared idle pool`, not as one merged memory cluster

Use this rollout order:

1. fix main, sub, and DB ownership per system
2. bind latest-file and archive-file policies
3. validate Nginx upstream reachability
4. connect idle nodes to Nomad
5. add temporary web instances only after DB pool budgets are verified
6. connect AI runner nodes only after model memory and CPU budgets are verified

## Central Development And Build Rule

System development should be driven from the common operations system.

Recommended model:

- source governance and scaffold generation happen in the operations system
- common runtime modules are built and versioned in the operations system
- project modules are built in the operations system
- Jenkins runs as the authoritative build and deployment executor for all managed systems
- runtime servers should receive artifacts, not perform primary feature builds

This keeps:

- build behavior reproducible
- common artifact versioning centralized
- project rollout history auditable
- project-to-common compatibility visible before deployment

### Control Plane Versus Runtime Responsibility Chain

Use this responsibility split strictly.

`OPERATIONS_SYSTEM` owns:

- requirement-domain modules
- design-document workspace and approved drafts
- project and folder mapping
- component marketplace and theme registry
- scaffold JSON and manifest generation
- common backend/frontend/static/policy version registration
- Codex and builder API task orchestration
- Jenkins build, release-unit approval, and Nomad rollout control
- audit, trace, ELK correlation, accessibility, and security policy governance

`PROJECT_SYSTEMS` own:

- project-specific business source code after generation
- runtime configuration bound to the approved release unit
- project business DB workloads
- active runtime processes and traffic handling
- consumption of centrally published artifacts

Do not blur this boundary by treating runtime systems as ad hoc design-authoring or primary build hosts.

## Existing Carbonet Surfaces To Extend

Use existing admin surfaces as module anchors instead of inventing disconnected consoles.

### 1. `/admin/system/environment-management`

Current role:

- managed menu inventory
- page and feature linkage
- governance launch point

Extend into:

- system registry
- server registration
- common master and project-local master classification
- topology binding
- main/sub server assignment
- file placement policy
- theme assignment
- component policy assignment
- project selection, creation, copy, disable, delete

### 2. `/admin/system/screen-builder`

Current role:

- screen builder
- component registry linkage
- draft and publish flow

Extend into:

- screen creation wizard
- theme-scoped palette
- approved-component-only mode
- generated page/menu/feature bootstrap
- screen template presets by system theme
- scenario-family catalog and child-scenario selector
- scenario result-chain explorer

### 3. `/admin/system/full-stack-management` and screen command metadata

Current role:

- page, event, function, API, schema, table metadata linkage

Extend into:

- authoritative page contract explorer
- parameter and output governance
- controller/service/mapper chain visibility
- DB object ownership visibility
- current-runtime versus generated-result compare
- scenario-to-result chain verification

### 4. `/admin/system/observability`

Current role:

- audit and trace query

Extend into:

- deploy event history
- topology change history
- screen publish history
- DB migration and backup audit
- ELK-based centralized log search and correlation

### 5. `/admin/system/codex-request`

Current role:

- execution console and workflow shell

Extend into:

- Jenkins pipeline trigger view
- Nomad job trigger and rollout view
- deploy target selection
- health check, rollback, and artifact tracking
- Codex CLI-assisted scaffold and repair console
- multi-agent execution and model management console

Use this rule:

- prefer JSON and API driven generation first
- use Codex CLI as a controlled generation and repair worker second
- avoid free-form prompt-heavy page generation when the same result can be produced from structured screen metadata
- keep model/provider selection explicit and governed per task type

## Operations Console Modules

The separate operations system should be organized into these modules.

### AI Agent And Model Governance

The operations system should expose an AI-agent management area that can govern more than one provider.

Supported provider families should include:

- Codex CLI
- Gemini
- Ollama
- future provider adapters

Operators should be able to:

- register AI providers
- register models per provider
- select default model by task type
- enable or disable providers by environment
- bind allowed providers to projects or menus
- edit runner connection settings
- switch active model without rewriting app-level scaffolding contracts
- inspect execution history, cost or token metadata where available, and failure logs
- register AI runner servers in the same server inventory used for web, DB, file, and control nodes
- connect local-model runtimes such as Ollama either directly or through Nomad-managed AI jobs
- bind provider or model execution to:
  - the control-plane node
  - a dedicated AI runner node
  - a measured mixed-use node when explicitly approved

Use this rule:

- the task contract should be provider-agnostic where possible
- provider-specific adapters should stay behind a central AI execution facade
- locally hosted models such as Ollama should be manageable as first-class runtime targets
- centrally managed AI execution should respect security, audit, and prompt-policy controls
- AI runner nodes must be represented in the topology registry and server registry
- Nomad-managed AI runtimes should be isolated from the normal idle web-node pool unless mixed use has been measured and approved

## Future Technology Expansion Track

The operations system should stay open for future technology waves without forcing those technologies into the initial runtime path.

Use this product-family view for future expansion:

- `Resonance Control Plane`
  - central governance, build, deploy, version, and topology
- `Resonance Builder`
  - screen generation, design synthesis, scaffold APIs, and Codex-assisted repair
- `Resonance AI`
  - provider registry, model routing, agent execution, local model runners
- `Resonance Knowledge`
  - design, requirement, API, and source retrieval
- `Resonance Evidence`
  - immutable approval, audit, and release proofs
- `Resonance Runtime`
  - runtime bindings, release consumption, topology execution

Recommended future-technology candidates are:

- `AI agent orchestration`
  - Codex CLI, Gemini, Ollama, and future provider adapters
  - structured screen and code generation
  - repair, review, and design-synthesis workflows
- `blockchain evidence layer`
  - Hyperledger Fabric or equivalent only for hash, approval, release, and audit evidence
  - do not use as the primary file or transaction store
- `centralized object and archive storage`
  - MinIO or a later object-storage tier
  - release artifact, archive file, and proposal attachment storage
- `search and knowledge retrieval`
  - requirement, design, API, and screen metadata indexing
  - optional vector or semantic search later
- `event and workflow backbone`
  - queue, outbox, or workflow engine for approval, publish, migration, and rollback chains
- `secret and identity platform`
  - centralized secrets, machine credentials, certificates, and SSO
- `policy and feature governance`
  - feature flags, environment policy, and per-project enablement
- `service and traffic governance`
  - service discovery, internal routing, upstream templating, and staged rollout automation
- `developer portal and platform self-service`
  - standardized project creation, module attachment, and operator workflows
- `knowledge and recommendation engine`
  - recommendation of modules, components, APIs, and rollout patterns from prior system history
- `compliance and evidence automation`
  - automated proof packaging for approvals, releases, policies, and audit exports

Recommended Resonance-aligned future suites:

- `Resonance AI`
  - Codex CLI, Gemini, Ollama, provider router, evaluation harness, safe prompt templates
- `Resonance Knowledge`
  - vector search, design and requirement retrieval, design-summary generation, dependency-aware search
- `Resonance Evidence`
  - Hyperledger Fabric proof mode, signed release manifests, policy evidence bundles
- `Resonance Policy`
  - OPA-style policy engine, feature flags, environment and tenant policy packs
- `Resonance Flow`
  - workflow engine, approval chains, release gates, migration orchestration
- `Resonance Portal`
  - developer portal, service catalog, module catalog, environment request workflows

Use this rule:

- future technologies must plug into the control plane as governed modules
- project systems should consume approved outputs and bindings rather than hosting ad hoc copies of each stack

## Technology Stack Waves

Adopt new stack layers in waves.

### Wave 1: Immediate

- `Jenkins`
- `Nomad`
- `Nginx`
- `ELK` or `Loki`-class centralized logs
- `Prometheus + Grafana`
- `Consul` when service discovery or dynamic upstream resolution is needed
- central project and server registry
- common artifact version registry
- structured scaffold JSON and builder API

### Wave 2: Next

- `MinIO` or equivalent archive/object storage
- `Vault`-class secret management
- `Keycloak` or equivalent SSO and IAM
- release-unit compatibility checker
- design-document ingestion and proposal synthesis pipeline
- AI provider registry and model routing
- dedicated Ollama or local-model runner nodes
- Nomad-managed AI runtime jobs where local-model hosting is required
- `Storybook` for governed component marketplace preview
- `OpenAPI` and schema registry contracts for builder-generated API bindings
- `Harbor` or equivalent artifact and image registry when container promotion grows

### Wave 3: Later

- `Hyperledger Fabric` evidence layer
- vector or semantic search for design and requirement retrieval
- workflow or BPM engine
- feature-flag and policy service
- service-discovery and upstream automation stack
- optional GitOps or image registry promotion stack
- `OpenSearch` when search and log scale exceed the simpler initial stack
- `Temporal` or equivalent workflow engine when approval and long-running orchestration become central
- `OPA` or equivalent policy engine for centralized authorization and deployment policy checks
- `Backstage`-style internal developer portal patterns if the platform expands beyond Carbonet-managed systems

## Recommended Additional Technology Stack

Beyond the already selected baseline, the most practical additional stacks for Resonance are:

### Core Platform

- `Consul`
  - service discovery
  - runtime node and upstream registration
  - Nomad integration
- `Vault`
  - secrets
  - tokens
  - certificate material
- `Keycloak`
  - SSO
  - centralized identity and client governance

### Build And Artifact

- `Harbor`
  - governed artifact and image registry
- `Nexus` or `Artifactory`-class repository
  - jar, npm package, and build output retention
- `OpenAPI Generator` plus schema registry discipline
  - standardized API-client and contract generation

### Frontend And Design System

- `Storybook`
  - marketplace preview
  - theme and KRDS component verification
- `Style Dictionary` or equivalent token build pipeline
  - design-token publication across CSS, JS, and docs
- `Playwright`
  - accessibility and regression verification for generated screens

### AI And Knowledge

- `Ollama`
  - local model serving
- `Qdrant` or equivalent vector store
  - design and requirement retrieval when semantic search becomes needed
- `LiteLLM`-class provider router if multi-model routing expands

### Workflow And Policy

- `Temporal`
  - long-running workflow orchestration
- `OPA`
  - policy-as-code for deploy, security, and approval checks
- `Unleash` or equivalent feature-flag service
  - staged enablement and runtime feature control

### Common Runtime Library Governance

The operations system must own a dedicated common-runtime area for reusable functions such as:

- authentication and session behavior
- authority and menu visibility
- idle timeout and auto logout
- multilingual and language switching helpers
- integrated search helpers
- sitemap generation and policy helpers
- terms, privacy-policy, and consent content helpers
- PDF generation
- Excel import/export
- print support
- attachment preview
- notification adapters for SMS and email
- file handling helpers
- trace and audit hooks
- structured logging hooks for ELK ingestion
- performance-oriented lookup, cache, snapshot, and summary helpers
- algorithm profiles for heavy-hitter, dedupe, and fast-path filtering
- approval and policy checks
- accessibility helpers and validation rules
- HTTPS redirect and secure-cookie policy helpers
- TLS certificate and domain policy checks
- masking, encryption, and privacy policy helpers

Use this rule:

- common runtime code is managed centrally in the operations system
- common runtime code is published as versioned jars or internal shared artifacts
- deployed systems consume those artifacts as stable dependencies
- avoid project-by-project source copying for these common functions
- prefer facade-style interfaces whose imports and signatures change rarely

This means deployed systems should mostly depend on:

- stable controller-facing contracts
- stable service facades
- stable adapters for PDF, Excel, auth, and storage
- stable accessibility and security policy hooks
- stable public-policy and transport-security hooks

and should not require frequent import rewrites whenever the common implementation evolves.

For shared code that does require import or signature alignment:

- classify it as an import-aware common line
- keep it centrally published and centrally reviewed
- let projects opt into an approved version explicitly
- do not let those changes leak into project systems implicitly

Baseline common-function candidates from requirement mapping should include:

- language switch
- integrated search
- sitemap and public navigation policy
- terms/privacy/consent publishing
- notice/Q&A/archive board scaffolds
- PDF/Excel export and print
- attachment preview
- auto logout
- member and company-type common masters
- approval, delegation, and role-history hooks
- notification delivery
- notification template and provider binding
- certificate and secret rotation
- accessibility validation
- high-speed lookup and summary helpers for hot admin and runtime paths

### Common DB Integrity And High-Speed Rule

DB scaffolding should optimize for both integrity and speed from the start.

Use this rule:

- every generated table must declare explicit PK intent
- every FK must be documented with ownership, cascade policy, and delete blocker semantics
- every search-heavy query path must trigger index review before publish
- list, export, and approval screens should declare expected query shapes so scaffolded DB objects can generate supporting indexes
- soft-delete, audit columns, version columns, and tenant or classification columns should be standardized by policy, not added ad hoc
- physical table and column names must follow the selected project naming profile and remain friendly to eGovFrame-style persistence maintenance
- table and column comments should be generated and reviewable whenever the selected DB standard profile requires them
- GUI review should expose DB changes through structured cards and checklists, not raw SQL only

Minimum DB governance checks:

- PK exists and matches identity policy
- FK exists where relationship is governed
- unique constraint exists where duplicate prevention is business-significant
- not-null policy is explicit
- search indexes exist for default search form and grid sort paths
- export paths do not bypass the same indexed predicates used by list screens
- summary or materialized snapshot tables are considered for high-volume dashboards

Do not allow:

- scaffolded tables with no explicit key policy
- joins on large tables without reviewed FK or index shape
- search and export generation that assumes DB speed without schema review

### Common DB Standard Profile Rule

Resonance should support a selectable DB standard profile per project.

At minimum:

- `EGOVFRAME_STANDARD`
  - tuned for eGovFrame-style backend and mapper consistency
- `PUBLIC_SECTOR_STRICT`
  - stronger naming, comment, audit, and review requirements
- `PROJECT_CUSTOM`
  - controlled project-specific extension

The selected DB standard profile should affect:

- table naming templates
- column naming templates
- mandatory audit and classification columns
- comment generation rules
- FK and delete-block defaults
- index review checklist
- schema-review evidence generation

### Build-Time Traceability Rule

When Resonance generates and builds a system, operators must be able to see:

- which DB standard profile was used
- which naming and comment rules were applied
- which PK, FK, unique, and index decisions were generated
- which actor, classification, CSRF, and security policies influenced backend and DB output
- whether the final change came from a user, an AI agent, or system automation

This must be visible in:

- scaffold review
- generation run explorer
- release-unit asset matrix
- rollback target explorer

### A. Project And Server Registry

Operators can:

- add, select, disable, archive, and delete systems
- select target project before generation and deployment starts
- manage project-to-folder mapping profiles
- register main web servers
- register sub web servers
- register idle shared web nodes
- register Jenkins and Nomad control nodes
- register DB servers
- register file archive servers
- register AI agent and model-runner servers
- manage server IP addresses, internal and external ports, and access endpoints
- register reusable setup commands and provisioning scripts
- register execution macros for restart, deploy, health-check, backup, restore, file move, and AI runner control

Each project entry should expose:

- `projectId`
- `projectCode`
- `projectName`
- `sourceRootPath`
- `javaPackageRoot`
- `templateRootPath`
- `controllerPath`
- `servicePath`
- `serviceImplPath`
- `voPath`
- `dtoPath`
- `mapperJavaPath`
- `mapperXmlPath`
- `deployArtifactType`
- `jenkinsPipelineId`
- `nomadNamespace`

Each project entry should also record common-runtime bindings:

- `commonRuntimeProfile`
- `authCommonVersion`
- `pdfCommonVersion`
- `excelCommonVersion`
- `fileCommonVersion`
- `opsCommonVersion`
- `frameworkLineId`
- `backendFacadeLineId`
- `backendImportSensitiveLineId`
- `featureModuleLineId`
- `homeMenuTreeId`
- `adminMenuTreeId`
- `projectDbProfileId`
- `jsonWorkspaceProfileId`
- `fileStorageProfileId`

Each managed server entry should also expose:

- `serverId`
- `serverName`
- `primaryRole`
- `internalIp`
- `externalIp`
- `sshPort`
- `appPortRange`
- `nomadEligibleYn`
- `aiRunnerYn`
- `commandProfileId`
- `scriptBundleId`
- `macroProfileId`

Use this rule:

- raw IP addresses and ports should be managed centrally in the operations system
- recurring shell commands should be stored as governed command templates, not tribal knowledge
- home and admin menu definitions remain centrally governed and are deployed outward
- runtime systems should receive menu and scaffold outputs, not become the primary metadata authority
- setup scripts and runtime macros must be versioned, permission-scoped, and auditable
- production macros should support dry-run and approval-required modes where risk is non-trivial

### A-0A. Installable Module And Plug-In Rule

The operations system should treat new technical capabilities as installable modules instead of hard-coded one-off integrations.

Every add-on technology should support:

- install
- enable
- disable
- detach
- replace
- remove
- upgrade
- rollback

Recommended installable module families:

- `COMMON_BACKEND_MODULE`
- `COMMON_FRONTEND_MODULE`
- `STATIC_ASSET_BUNDLE`
- `CSS_BUNDLE`
- `DESIGN_SOURCE_PACKAGE`
- `THEME_EXTENSION`
- `THEME_PACKAGE`
- `DESIGN_TOKEN_PACKAGE`
- `AI_PROVIDER_ADAPTER`
- `AI_RUNNER_PROFILE`
- `LOG_PIPELINE_ADAPTER`
- `BLOCKCHAIN_EVIDENCE_ADAPTER`
- `SECURITY_POLICY_BUNDLE`
- `ACCESSIBILITY_POLICY_BUNDLE`
- `SERVER_SETUP_BUNDLE`

Use this rule:

- modules must publish explicit install and uninstall contracts
- modules must declare owned resources, dependent resources, rollback conditions, and compatibility ranges
- project systems should attach approved modules through bindings, not by uncontrolled source copying
- operators should be able to plug a module in or remove it from a project with a governed install-unit workflow

### A-0B. Build-First Module Rule

Every governed capability should also be treated as a buildable unit.

Use this rule:

- no module is considered installable unless it also has a build contract
- no module is considered removable unless its owned artifacts and bindings are traceable
- no runtime system should depend on unbuilt local edits as the authoritative source of a shared capability
- import-aware shared lines must be version-selected explicitly by the project before rollout

Minimum build-governance fields for each installable module:

- `moduleId`
- `moduleType`
- `sourceRepository`
- `sourceRootPath`
- `buildProfile`
- `artifactType`
- `artifactCoordinate`
- `artifactVersion`
- `compatibilityRange`
- `installContractVersion`
- `rollbackContractVersion`
- `importImpactClass`
- `selectionRequiredYn`

Recommended build families:

- `COMMON_BACKEND_JAR`
- `COMMON_FRONTEND_BUNDLE`
- `STATIC_ASSET_BUNDLE`
- `CSS_BUNDLE`
- `DESIGN_SOURCE_PACKAGE`
- `THEME_PACKAGE`
- `DESIGN_TOKEN_PACKAGE`
- `POLICY_BUNDLE`
- `AI_PROVIDER_ADAPTER`
- `AI_RUNNER_PACKAGE`
- `BLOCKCHAIN_EVIDENCE_ADAPTER`
- `LOG_PIPELINE_ADAPTER`
- `SERVER_SETUP_BUNDLE`

### A-0C. Chain Matrix Governance

The operations system should expose a matrix-driven governance view so that operators can manage add, update, delete, detach, and rollback without losing chain visibility.

Every governed module, screen, server, and artifact should be visible through the same chain matrix dimensions:

- ownership chain
- execution chain
- deploy chain
- delete chain
- rollback chain
- compatibility chain
- source-to-build chain
- build-to-runtime chain

Operators must be able to perform these actions from governed matrix views:

- add
- edit
- revise
- replace
- enable
- disable
- install
- uninstall
- delete
- rollback

Each matrix row should answer:

- what this resource is
- whether it belongs to the control plane or a project runtime
- what source and design documents created it
- what build outputs it produces
- what runtime targets consume it
- what dependencies block delete or replace
- what rollback target exists
- what version is active, target, and previous

Recommended operator matrices:

- `module install matrix`
- `module compatibility matrix`
- `release-unit asset matrix`
- `server role and runtime matrix`
- `screen-to-backend generation matrix`
- `theme-component-token matrix`
- `design-source to generated-artifact matrix`
- `delete and rollback blocker matrix`

### A-0. Command, Script, And Macro Governance

The operations system should provide a dedicated operator area for command and script management.

Operators should be able to:

- register command templates
- register shell or provisioning scripts
- bind scripts to server roles or projects
- define macros that execute ordered command or script steps
- define parameterized placeholders such as host, port, artifact version, environment, or release unit
- preview rendered commands before execution
- run approved macros through Jenkins, Nomad helpers, or direct operator execution
- review execution logs, exit codes, and approval history

Recommended macro families:

- `SERVER_SETUP`
- `DEPLOY_PREPARE`
- `APP_START`
- `APP_STOP`
- `APP_RESTART`
- `HEALTH_CHECK`
- `NGINX_SWITCH`
- `DB_BACKUP`
- `DB_RESTORE`
- `FILE_ARCHIVE_MOVE`
- `AI_RUNNER_START`
- `AI_RUNNER_STOP`
- `OLLAMA_MODEL_PULL`
- `NOMAD_SCALE_OUT`
- `NOMAD_SCALE_IN`

Use this rule:

- macros should reference governed command or script IDs rather than embedding uncontrolled shell text in multiple places
- sensitive macros must declare approval policy, allowed server roles, and expected side effects
- IP, account, and port substitution must come from server registry bindings

### A-0D. Cron And Retention Governance

The operations system should treat scheduled work as governed runtime assets.

Operators should be able to:

- register cron jobs and schedule policies
- bind cron jobs to projects, server roles, or module families
- preview next run time and last run history
- enable, disable, suspend, and reschedule jobs
- define retention and auto-delete rules for old files, temporary build outputs, and expired archive artifacts
- inspect deletion candidates before destructive execution
- inspect delete results, failures, retries, and orphan cleanup status

Recommended cron families:

- `FILE_ARCHIVE_MOVE_CRON`
- `FILE_RETENTION_DELETE_CRON`
- `TEMP_FILE_CLEANUP_CRON`
- `BUILD_ARTIFACT_CLEANUP_CRON`
- `LOG_RETENTION_CRON`
- `DB_BACKUP_CRON`
- `HEALTH_CHECK_CRON`
- `AI_RUNNER_MAINTENANCE_CRON`

Use this rule:

- old-file retention must always define expiration, delete policy, approval mode, and rollback grace period
- no archive or temp file should remain without an owning retention policy
- cron-managed deletion must stay traceable through ownership, retention class, delete reason, and execution history
- garbage and orphan cleanup must be treated as first-class governance, not ad hoc shell cleanup

### A-0E. Main-Server Cron Execution Rule

Runtime cron and scheduler jobs should execute on the governed main server of each system unless an exception is explicitly approved.

Use this rule:

- every cron family must declare `executionServerRole`
- default `executionServerRole` is `MAIN_WEB_NODE`
- scheduler registration must bind the job to one concrete main-server target per system
- sub, idle, AI, or control-plane nodes may run scheduler jobs only when the job family is explicitly approved for that role
- deploy and parity verification must check that required cron families are present on the main runtime target

Required scheduler metadata:

- `executionServerRole`
- `executionServerId`
- `projectId`
- `releaseUnitId`
- `jobFamily`
- `enabledYn`
- `lastVerifiedAt`

Do not allow:

- project business cron jobs floating across arbitrary idle nodes by default
- scheduler registration without a main-server ownership decision
- deployment completion when required main-server cron jobs are missing

### A-1. Requirement-Domain Module Registry

The operations system should allow operators to register and manage module families derived from the requirement-mapping source of truth.

Primary domain modules from `/opt/reference/화면설계/설계/00_요구사항매핑.txt`:

- `01_공통`
- `02_회원인증`
- `03_탄소배출`
- `04_보고서인증서`
- `05_탄소정보`
- `06_모니터링`
- `07_거래`
- `08_결제`
- `09_외부연계`
- `10_콘텐츠`
- `11_시스템`
- `12_교육훈련`
- `13_모바일`
- `14_유지보수`

Use this rule:

- every requirement-domain module must be addable to the module list in the operations system
- module list rows should link requirement domain, UC range, screen requirement IDs, menus, APIs, and install units
- operators should be able to enable, disable, split, merge, and map modules to projects without losing requirement traceability
- requirement-domain modules should remain queryable even before full screen generation begins
- requirement-domain extraction should also preserve shell, popup, report, export, notification, and approval-support candidates so they are not lost during later scaffold stages

### A-1A. Scenario-First Registration Rule

Before a menu, page, or feature is generated, the operator must register the scenario first.

Minimum scenario registration fields:

- `scenarioId`
- `requirementDomain`
- `businessGoal`
- `actorType`
- `primaryUseCase`
- `adminReviewPairYn`
- `screenType`
- `requiredApiSet`
- `requiredDbObjects`
- `requiredInstallableModules`
- `targetDeviceProfiles`
- `successOutcome`
- `failureOutcome`

Use this rule:

- no page or menu generation should start without a bound scenario
- scenario is the anchor for screen, API, DB, button, and audit policy generation
- requirement traceability should always flow through scenario ids, not only menu codes
- scenario planning should also capture popup families, search and grid blocks, upload/download sections, report/export actions, and admin-review branches where present

### A-1B. Join Scenario As The Reference Pattern

Use the membership and join family as the primary reference pattern for scenario-first generation.

Why this matters:

- one business capability can expand into many real screens
- public and admin pairs often coexist
- Korean and English variants both exist
- desktop and mobile responsive behavior both matter
- status, guide, detail, reapply, and completion flows often branch from one main scenario family

Use the join family as the base scenario bundle pattern:

- `join-entry`
- `join-terms`
- `join-auth`
- `join-info`
- `join-complete`
- `join-status-search`
- `join-status-guide`
- `join-status-detail`
- `join-reapply`
- admin review or approval pair when applicable

Treat this as evidence that one feature may generate many managed screens.

Use this rule:

- scenario registration must support parent and child scenario bundles
- one scenario family may own many route variants and many screen outputs
- language, device, review-state, and responsive variants must be modeled as governed derivatives of the same scenario family
- screen counts should not be underestimated from one menu label alone

Recommended scenario-family dimensions:

- business capability
- actor type
- language variant
- device or responsive variant
- status variant
- admin review pair
- completion or failure branch

### A-1C. Actor-Centered Authority Rule

Scenario registration must include actor and authority context from the start.

Use current Carbonet authority patterns as the baseline:

- `ROLE_SYSTEM_MASTER`
- `ROLE_SYSTEM_ADMIN`
- `ROLE_ADMIN`
- `ROLE_OPERATION_ADMIN`
- `ROLE_COMPANY_ADMIN`
- company or department-scoped derived roles
- public-user actors
- anonymous actors where allowed

Each scenario must declare:

- allowed actor types
- default author or role profiles
- data scope
- allowed UI actions
- approval authority requirement
- exception policy

Recommended authority dimensions:

- `actorType`
- `authorCode`
- `dataScope`
  - `GLOBAL`
  - `INSTT_SCOPED`
  - `DEPT_SCOPED`
  - `SELF_SCOPED`
  - `PUBLIC`
- `uiActionSet`
- `approvalAuthorityYn`
- `featurePermissionSet`
- `menuPermissionSet`
- `endpointPermissionSet`
- `componentActionPolicy`

Use this rule:

- actor policy should flow from scenario to menu, page, feature, API, component, and button action
- do not register a scenario without an actor and scope model
- public and admin-review pairs must be linked explicitly
- scoped roles such as company or department actors must inherit both actor family and data-scope policy

### A-2. Design Document Workspace Governance

The operations system should manage design documents as first-class governed assets, not as loose attachments.

Operators should be able to:

- register design-document folders per project
- manage draft, reviewed, approved, and archived design documents
- link design documents to requirement-domain modules, menus, screens, APIs, and install units
- manage source file locations and generated summary locations
- track which design documents were used during scaffold generation

Recommended managed document families:

- requirement mapping documents
- actor definition documents
- BPMN design documents
- scenario specification documents
- route and menu design documents
- component and interaction design documents
- API design documents
- DB design documents
- wireframe documents
- UI detail design documents
- screen-flow documents
- test-plan documents
- test-scenario documents
- proposal and RFP source documents
- theme design packages
- CSS or style source packages
- design token source packages

Use this rule:

- design documents live in managed folders with explicit ownership metadata
- draft content may be file-based, but searchable summaries and publish states belong in the control plane
- Codex CLI and builder APIs should reference approved or selected draft design artifacts through stable IDs, not ad hoc file browsing
- theme, CSS, and design-source packages must be attachable as installable modules, not as uncontrolled copied folders
- the reference workspace under `/opt/reference/화면설계/설계` should be queryable and printable by project, domain, document family, version, and approval state
- the operations system should produce mature output packages from those document families, not just store attachments

### A-2A. Page-And-Element Separated Design Rule

The design workspace should not force operators to design only full pages in one monolithic step.

Use a two-level design model:

- `page design`
  - page purpose
  - route and menu placement
  - page frame
  - shell composition
  - scenario family
  - actor and authority
  - help and diagnostics regions
- `element design`
  - component instances
  - popup families
  - grids
  - search forms
  - detail cards
  - upload zones
  - action bars
  - informational blocks

Use this rule:

- pages should be designed by composing governed element assets
- element assets should be independently designable, previewable, versionable, and reusable
- one page should be able to swap or refine one element family without rewriting the whole page design
- scaffold generation should consume `page design + element design + binding design`, not only a flat page draft

Required design workspaces:

- `page-design workspace`
- `element-design workspace`
- `binding-design workspace`
- `page-assembly workspace`

Required generated design outputs:

- `page-design.json`
- `element-design-set.json`
- `page-assembly.json`
- `binding-assembly.json`

Do not allow:

- a page family with no decomposed element inventory
- element changes that bypass page assembly review
- one-off local UI blocks that are not registered as governed element designs

### A-2B. Requirement Coverage And Design Registration Rule

Before a screen family is allowed to enter scaffold-ready state, the operations system should verify that no requirement-driven page or element family has been silently omitted.

Required requirement-to-design coverage checks:

- requirement-domain module -> menu coverage
- requirement-domain module -> scenario-family coverage
- scenario-family -> page-design coverage
- page-design -> element-design coverage
- element-design -> binding-design coverage
- binding-design -> backend/API/DB coverage
- page-assembly -> help/accessibility/security coverage

Required registration outputs:

- missing menu candidate list
- missing page family list
- missing element family list
- missing popup/grid/search/upload/report block list
- missing authority/help/security/accessibility binding list

Use this rule:

- do not allow direct page generation from requirements unless the requirement coverage check has been passed or explicitly waived
- every designable page and element must first exist as a governed registered design asset
- scaffold output should consume only registered page, element, and binding designs

Reference workspace indexing rule:

- index every source document by `projectId`, `requirementDomain`, `documentFamily`, `domainCode`, `version`, `approvalState`, and `canonicalSourceYn`
- allow one canonical source per document family and domain or version line
- preserve alternate drafts and superseded versions without losing provenance
- printable output packages should resolve from canonical approved sources first, then approved supplements

Required mature output packages:

- requirement summary package
- actor and authority package
- BPMN and process package
- scenario bundle package
- business-rule package
- wireframe and UI-detail package
- screen-flow package
- API and DB package
- test-plan and test-scenario package
- publish-ready scaffold package

Recommended mature output package envelope:

- `packageId`
- `projectId`
- `requirementDomain`
- `documentFamily`
- `sourceDocumentSet`
- `summaryDocumentSet`
- `scenarioFamilySet`
- `menuCandidateSet`
- `apiContractSet`
- `dbObjectSet`
- `themeAndTokenSet`
- `scaffoldRequestSet`
- `approvalState`
- `printableOutputPath`

### A-3. Proposal Intake And Design Synthesis

The operations system should support proposal and design-source ingestion so that uploaded business documents can feed the generation chain.

Supported intake sources should include:

- PDF proposal documents
- HWP proposal documents
- plain text requirement documents
- existing design workspace files

Recommended intake chain:

1. upload proposal or design source document
2. extract text and section structure
3. classify requirement domain, UC candidates, menu candidates, API candidates, and approval/admin pairs
4. extract shell elements, page groups, popup families, grid blocks, search-form blocks, upload/download flows, report/export actions, notification needs, and certificate needs
5. generate a normalized requirement summary
6. sort and group extracted results into requirement-domain modules, scenario families, menu trees, page groups, and reusable component blocks
7. generate or update managed design-document drafts
8. link those drafts to requirement-domain modules, scaffold targets, and runtime delivery targets
9. make the resulting design artifacts available to Codex CLI and builder APIs through stable document references
10. generate a printable mature output package for operator review and sign-off
11. generate scaffold-ready payloads
12. build approved common and project artifacts
13. deploy the resulting package to the selected general system runtime

Use this rule:

- uploaded proposal documents are source inputs, not immediately authoritative design
- extracted summaries and mapped drafts should be reviewable before they become approved design artifacts
- generation should preserve source-document provenance so operators can trace a screen or API back to its proposal source
- proposal intake should be able to expand into menu candidates, scenario families, KRDS-aligned theme selection, component plans, API contracts, DB bindings, and scaffold-ready output
- proposal intake should be able to expand into detailed design artifacts in operator review order, not just rough summaries
- the control plane should distinguish what becomes common reusable assets and what becomes project-local runtime assets before build starts

### A-3A. Proposal-To-System Delivery Rule

When a proposal is uploaded, Resonance should be able to drive the full chain from planning to runtime delivery.

Required proposal-derived output families:

- requirement summary
- requirement-domain module set
- menu candidate tree
- page candidate set
- scenario-family set
- actor and authority set
- component candidate set
- popup, grid, search-form, upload, report, and approval-support block set
- API candidate set
- function candidate set
- DB object candidate set
- shell composition and theme candidate set
- common-versus-project asset split plan
- scaffold-request set
- release-unit candidate

Required sequencing:

1. proposal upload
2. canonical-source selection
3. requirement and UC mapping
4. menu and page candidate extraction
5. detailed scenario-family planning
6. component and shell planning
7. API, function, and DB planning
8. common-versus-project asset split planning
9. operator review and approval
10. scaffold generation
11. build and package
12. deploy to selected general system runtime

Use this rule:

- detailed design should be generated before scaffold generation begins
- menu, page, button, popup, component, event, function, API, and DB outputs must remain linked to the proposal source set
- the resulting general system should not contain control-plane authoring tools; it should receive only approved runtime outputs
- common assets should be built and versioned centrally, while project assets should be built for the selected target project and delivered outward
- the first approved runtime from proposal synthesis should become the governed baseline for later compare, patch, and rollback flows
- later project changes should create tracked patch release units rather than replacing the original baseline invisibly

### B. Theme And Component Governance

Operators can:

- define themes
- define color sets and semantic color roles
- define typography and font bundles
- define component categories and kinds
- publish reusable components into a managed internal catalog
- define allowed component packs per theme
- define palette scope per theme
- create pages only from approved theme components
- optionally add extra approved components before page build
- extend a theme by selecting approved internal-catalog components

Recommended theme model:

- `component_category_registry`
- `component_kind_registry`
- `component_catalog_item`
- `theme_registry`
- `theme_component_bundle`
- `theme_component_rule`
- `theme_page_template`
- `design_token_bundle`
- `color_token_bundle`
- `font_bundle`
- `theme_design_system_binding`
- `theme_asset_bundle`
- `theme_css_bundle_binding`
- `theme_design_source_binding`

Use this rule:

- every component must be registered by category and kind first
- reusable components should be publishable into a centrally curated internal catalog
- theme defines the default component catalog
- theme may import approved internal-catalog components as extensions
- operators may add more approved components to a theme
- operators should be able to register and edit theme, color, font, token, CSS, and component composition through GUI screens in the operations system
- KRDS-compatible themes must bind to a KRDS token/system profile explicitly
- theme, CSS, and design-token assets must be installable and version-bound
- screen builder for a page starts from the system theme
- pages may use only registered components that belong to the selected theme or an approved theme extension
- theme sourcing should prefer existing governed Carbonet design documents, design-source packages, and approved component lines over arbitrary external theme websites

GUI-first theme development should support:

- theme create and version
- color token editing and semantic role mapping
- font family and typography scale registration
- component pack selection
- live preview against approved page frames
- publish and rollback by theme line

Recommended component-category examples:

- layout
- form input
- selection and choice
- table and list
- navigation
- modal and popup
- file and media
- chart and analytics
- status and feedback
- action and approval

Recommended design-system support:

- Carbonet custom design tokens
- KRDS-aligned token bundle
- project-specific theme extension bundle
- installable CSS bundle per theme line
- installable design-source package per theme line
- existing governed design-document line as the primary theme source

Recommended KRDS-oriented frontend stack options:

- `React + TypeScript`
  - typed component contracts and predictable builder integration
- `Vite`
  - fast local preview and build speed for theme/token-heavy UI work
- `TanStack Router` or controlled route manifest layer
  - explicit route metadata that matches screen governance
- `TanStack Query`
  - predictable async state, cache policy, and API binding control
- `React Hook Form`
  - accessible form handling that works well with generated field metadata
- `Zod`
  - schema validation for generated forms, API payloads, and builder contracts
- `Storybook`
  - component catalog, KRDS theme preview, and internal-catalog review surface
- `Tailwind CSS` with token bridge or `vanilla-extract`
  - when mapped strictly to approved design-token bundles
- `class-variance-authority`
  - component variant control without uncontrolled style drift
- `radix-ui` style primitives only when wrapped by approved KRDS-compatible Carbonet components

Use this rule:

- KRDS compatibility should be enforced through design tokens and approved component wrappers
- raw third-party component usage should not bypass theme, accessibility, or audit policy
- theme and design expansion should start from centrally governed design assets first, then approved internal-catalog extensions
- home and admin shell packages should be selected from the same governed theme family so page-level UI does not diverge from navigation-level UI

### C. Screen Wizard

Operators can:

- choose a system
- choose a target project
- confirm or override folder mapping
- choose a menu group
- choose target technology profile
- choose required APIs
- choose required installable modules
- choose supported device profiles
- choose install targets and runtime families
- create a new screen from template
- collect an existing screen into managed metadata
- pick a theme
- pick approved components
- build UI
- define standard button layout before publish
- bind events, functions, APIs, and schema fields
- register menu, page, and feature metadata
- receive and apply change requests after first generation
- request delete or deprecate flow for an existing screen
- publish to runtime

Preferred generation mode:

- structured screen metadata first
- Codex CLI-assisted refinement second
- manual source editing last

### C-A. Structured Frontend Development Rule

Frontend development should be structured the same way as backend scaffolding.

Use this rule:

- frontend pages must be generated from scenario, theme, component, action-layout, and device metadata first
- frontend source should prefer shared primitives, shared screen blocks, and registered assets over page-local custom markup
- responsive behavior should come from device-profile and layout rules, not from ad hoc per-page divergence
- language variants should reuse the same scenario family and component structure wherever possible
- header, menu, breadcrumb, quick-action rail, and bottom action bar should resolve from shell profiles before page-local layout is generated

Recommended frontend structure:

- `scenario-family`
  - one business capability and its child flows
- `page manifest`
  - route and ownership metadata
- `layout schema`
  - sections, blocks, and action zones
- `component bindings`
  - approved components only
- `device profile`
  - desktop, tablet, mobile
- `language profile`
  - Korean, English, later expansion
- `responsive rule set`
  - breakpoint and layout adaptation policy
- `frontend asset imports`
- `shell profile`
  - public-home, admin, kiosk, mobile-web shell composition
- `navigation shell binding`
  - header, menu, breadcrumb, and footer package selection
- `footer binding`
  - footer package, legal-link bundle, and trust block selection
- `shell composition profile`
  - which header, menu, footer, breadcrumb, utility, and bottom-action variants are visible on that page family
  - only approved bundles and shared assets

Use the join family as the primary frontend reference:

- multi-step wizard
- status and reapply branches
- public and admin-pair behavior
- Korean and English variants
- responsive/mobile continuity

### C-A-1. Operations UI Completeness Audit

The operations system UI should be treated as a governed product surface, not a collection of one-off admin pages.

Before a governed operations page can publish, confirm that the design defines all of the following.

#### Shell And Context

Every page should show:

- current project and system context
- breadcrumb and return path
- current state such as draft, published, degraded, read-only, or rollback candidate
- actor scope and classification scope when relevant
- nearby actions or quick-entry navigation when the workflow spans multiple pages

Do not publish pages that render a form or grid without explaining what project, runtime, or version context the operator is currently changing.

#### Frame Profile

Every page must bind to a governed frame family:

- `RegistryPage`
- `WorkspacePage`
- `ListPage`
- `DetailPage`
- `EditPage`
- `ReviewPage`
- `PolicyPage`
- `RuntimeOpsPage`
- `CompareAndDiffPage`

The frame profile controls:

- header composition
- summary-card placement
- search form placement
- grid and panel density
- bottom action-bar behavior
- help, diagnostics, and history regions

#### Mandatory UI States

Every governed page must define UI for:

- initial loading
- refreshing
- empty state
- no-result state
- no-authority state
- read-only state
- validation error state
- backend failure state
- degraded dependency state
- unsaved local change
- saved but unpublished state
- published and active state

These states must use governed UI assets and shared copy patterns, not ad hoc text.

#### Fixed Action Hierarchy

Every page must classify actions into:

- page-header actions
- search actions
- grid-toolbar actions
- section actions
- inline row actions
- bottom primary actions
- destructive actions
- approval actions

The following defaults are fixed unless the frame family explicitly overrides them:

- `조회/초기화` remain in the search-action zone
- `신규/엑셀/일괄처리` remain in the grid-toolbar zone
- `저장/승인/반려/배포` remain in the bottom primary zone
- destructive actions stay in a dedicated destructive zone with stronger confirmation

#### Help, Diagnostics, And Explanation

Every governed page must provide:

- page-level help summary
- component-level help anchors
- validation explanation for key inputs
- diagnostics for generated assets or runtime bindings when relevant
- audit and last-change summary for critical state-changing pages

At least one of the following support surfaces must exist:

- right-side help rail
- expandable diagnostics panel
- bottom history or result drawer

#### Comparison And Impact Preview

Pages that change generated code, runtime topology, release units, policy, or authority must standardize:

- draft vs published comparison
- current vs target comparison
- diff count badges
- impact summary before publish
- rollback preview and blocker list

#### Data Density And High-Speed Presentation

Operations pages must remain usable under dense data conditions.

Required rules:

- large forms must be sectioned and collapsible
- expensive charts, logs, and traces must load lazily
- large lists use pagination or bounded panes
- summaries should prefer snapshot or precomputed values where possible
- raw payloads should not displace the main operator path when structured summaries exist

#### Responsive And Input Behavior

The operations console is desktop-first, but responsive behavior must still be defined.

Minimum rules:

- desktop keeps the full shell and side rails
- tablet collapses secondary rails while keeping the bottom action bar sticky
- mobile or small-webview stacks multi-column content in a deterministic order
- button priority, authority meaning, and destructive emphasis must not change across breakpoints

#### Accessibility And Focus Model

Operations UI completeness requires:

- keyboard-first reachability for all business actions
- visible focus states
- deterministic tab order
- semantic headings and landmark regions
- accessible modal and drawer close behavior
- accessible error summary
- focus return path for grid, wizard, tab, drawer, and review-modal flows

#### Visual Governance

The operations system must feel like one platform.

Shared visual contracts should govern:

- page-header proportions
- summary-card grammar
- card spacing scale
- status badge vocabulary
- table, tab, modal, and drawer behavior
- sticky bottom action bar behavior
- empty and failure state composition

Any divergence must be recorded as a documented frame or theme exception, not left as accidental drift.

#### Intuitive GUI Preference

Resonance should prefer GUI-first governance over raw technical exposure.

Use this rule:

- show summary cards before raw tables where possible
- show guided forms and step flows before expert-only free-form editing
- show compare panes for draft versus published and current versus target
- show DB object change review through table, column, key, and index cards before raw DDL
- show build and deploy progress through timelines, gates, and checkpoints
- keep raw JSON, SQL, and shell previews available as secondary drill-down, not as the primary operator path

Do not default to:

- one giant table with dozens of technical columns as the main page
- one giant form for all governance concerns
- a flow where operators must read source code or shell logs for standard approval decisions

### C-A-2. Operations UI Publish Gate

No governed operations page should publish unless it can answer all of the following.

1. Which frame profile does it use?
2. What project and system context does it show?
3. What actor scope and classification scope does it expose?
4. Where are search, save, publish, delete, and approval actions placed?
5. What are the loading, empty, error, read-only, and draft states?
6. Where are help, diagnostics, and audit summaries shown?
7. What comparison or impact preview exists before destructive or publish actions?
8. What responsive fallback exists?
9. What keyboard and focus behavior is guaranteed?
10. What shared visual rules does it inherit, and what exceptions are documented?

This means other feature families should be inferred from join-like bundles:

- list + detail + edit + review
- step wizard + complete
- status search + guide + detail
- reject + reapply
- public page + admin review page

Authoring storage rule:

- keep working scaffold inputs, draft screen schemas, change-request payloads, and generation options in JSON
- store only approved results, searchable indexes, release history, and governance summaries in DB
- treat DB as the archive and query authority, not as the only live authoring surface

The wizard must create or bind:

- menu code
- page id
- route URL
- feature code
- manifest entry
- component registry usage rows
- target technology profile
- required API contracts
- required installable module bindings
- supported device profile bindings
- install target bindings
- scenario binding
- standard action layout definition

Recommended generation selectors:

- `technologyProfile`
  - for example `EGOV_SPRING_MVC`, `REACT_MIGRATION`, `JSP_ADMIN`, `KRDS_REACT`
- `apiContractSet`
  - selected API groups and request or response contracts
- `installableModuleSet`
  - required common backend, frontend, static, policy, AI, log, or security modules
- `deviceProfileSet`
  - desktop, tablet, mobile, kiosk, admin-console, public-web
- `installTargetSet`
  - target systems, target runtime nodes, or deploy families that may consume the generated output
- `scenarioId`
  - required scenario registration key
- `scenarioFamilyId`
  - parent scenario bundle key
- `actionLayoutProfile`
  - button placement and action-zone policy
- `languageProfile`
  - Korean, English, or governed future language lines
- `responsiveProfile`
  - desktop, tablet, mobile, or shared responsive ruleset
- `actorPolicyId`
  - authority and data-scope policy key

Use this rule:

- page and menu generation must declare what technology line the screen belongs to
- page and menu generation must declare what APIs and modules the screen depends on
- page and menu generation must declare what framework and common-module lines they target
- page and menu generation must declare what device classes it supports
- page and menu generation must declare whether the output is installable to one project, multiple projects, or the common plane
- page and menu generation must declare which scenario they satisfy
- page and menu generation must declare which scenario family they belong to
- page and menu generation must declare which standard action layout they use
- page and menu generation must declare their language and responsive profile
- page and menu generation must declare which actor policy governs view and action permissions

All screen-development assets must be governable and selectable.

This includes at minimum:

- theme packages
- color and font bundles
- layout and spacing profiles
- component catalog items
- popup, grid, and search blocks
- event and function bindings
- API contracts
- parameter and output contracts
- common runtime jars
- feature modules
- optional library bundles

Do not allow:

- page generation from unregistered ad hoc components
- module use without a governed installable binding
- parameter or output assumptions that are not declared in module or API metadata

Each component instance must also carry executable linkage:

- event binding
- function binding
- API binding
- authority or feature binding
- audit binding when the component triggers meaningful business action
- mouse interaction trace policy
- keyboard interaction trace policy
- accessibility verification policy
- security verification policy
- help anchor binding

Sensitive state-changing components must also carry:

- CSRF requirement policy
- request-signing or nonce policy when applicable
- origin and referer validation policy for browser flows

Recommended authoring artifacts:

- `screen-draft.json`
- `screen-layout.json`
- `component-binding.json`
- `event-binding.json`
- `api-binding.json`
- `function-binding.json`
- `technology-profile.json`
- `module-binding.json`
- `device-profile.json`

## C-3-C. Installable Module And Parameter-Result Contract Rule

Resonance should prefer selectable installable delivery over source-copy delivery.

Use this rule:

- modules and features should be attached through governed installable selections
- source-included delivery should be treated as an exception path, not the default
- every installable module should declare what parameters it consumes and what result set it exposes
- every screen, component, function, and API binding should be able to resolve those parameter and result contracts without manual source reading

Every installable module should publish at minimum:

- `moduleId`
- `moduleLineId`
- `moduleVersion`
- `installScope`
- `parameterContractSet`
- `resultContractSet`
- `requiredCommonJarSet`
- `requiredFrontendAssetSet`
- `requiredFeatureBindingSet`
- `requiredPolicySet`
- `releaseUnitCompatibilitySet`

Parameter and result contracts should support:

- request parameter names and types
- input validation and masking posture
- response field names and types
- result status families and failure cases
- popup/grid/search binding compatibility
- event-to-function and function-to-API wiring compatibility

This allows the operations system to:

- install a feature module without copying business source into every project
- map parameters and outputs into generated page, popup, grid, and API bindings
- compare current versus target contract shapes before deploy
- roll back to a previous module contract line when needed
- `language-profile.json`
- `responsive-profile.json`
- `install-target.json`
- `scenario-definition.json`
- `actor-policy.json`
- `member-classification-policy.json`
- `csrf-policy.json`
- `action-layout.json`
- `scaffold-request.json`
- `help-content.json`
- `help-anchor-map.json`
- `change-request.json`

## `help-content.json`

Recommended shape:

```json
{
  "pageId": "join-info",
  "languageProfileId": "ko-KR",
  "sections": [
    {
      "anchorId": "join-info.header",
      "title": "회원가입 정보 입력",
      "summary": "현재 단계에서 입력해야 하는 핵심 항목을 설명합니다.",
      "details": [
        "필수 항목은 저장 전에 모두 검증됩니다.",
        "중복 검사는 다음 단계 이동 조건입니다."
      ]
    },
    {
      "anchorId": "join-info.submit",
      "title": "제출 버튼",
      "summary": "현재 입력값을 저장하고 다음 단계로 이동합니다.",
      "details": [
        "저장 실패 시 현재 화면에 머무릅니다.",
        "보안 검증과 CSRF 정책이 함께 적용됩니다."
      ]
    }
  ],
  "status": "ACTIVE"
}
```

## `help-anchor-map.json`

Recommended shape:

```json
{
  "pageId": "join-info",
  "anchorBindings": [
    {
      "anchorId": "join-info.header",
      "instanceKey": "page.header",
      "dataHelpId": "join-info.header",
      "componentRole": "PAGE_HEADER"
    },
    {
      "anchorId": "join-info.submit",
      "instanceKey": "action.submit",
      "dataHelpId": "join-info.submit",
      "componentRole": "PRIMARY_ACTION"
    }
  ],
  "status": "ACTIVE"
}
```

Use this rule:

- help content must be generated and versioned together with the page manifest
- help anchors must bind to manifest instance keys and rendered `data-help-id` values
- help content should be language-aware and scenario-aware
- builder preview should show missing help anchors as blocking governance debt

Recommended low-token generation contract:

- page layout and component tree come from JSON
- route, menu, feature, and project mapping come from form metadata
- event, function, and API bindings come from registry selections
- member classification, CSRF, and security posture come from governed policy bindings
- Codex CLI receives only the normalized scaffold JSON, not long prose requirements, whenever structured generation is possible

Menu-driven generation should also support API-backed automation:

- choose requirement-domain module
- choose menu or screen requirement ID
- resolve mapped page, feature, API, and approval/admin pair
- generate the default screen draft and backend chain through scaffold APIs
- reopen the same generated assets through screen-builder for refinement

The wizard must also generate the implementation chain when requested:

- frontend screen source or runtime schema
- controller
- service interface
- service implementation
- VO
- DTO
- mapper Java class
- mapper XML
- metadata registration preview
- frontend route registration
- frontend API client or adapter binding
- frontend module import manifest
- frontend device capability hints and interaction policy
- frontend action-bar or button-zone manifest
- frontend responsive rule manifest
- frontend language bundle manifest
- frontend actor-gate manifest
- help content and help-anchor manifest
- backend module dependency manifest
- installable-module binding manifest

The wizard should also support controlled Codex generation for:

- missing event wiring
- function stub generation
- API adapter stub generation
- UI refinement from approved component layout
- regeneration after a structured change request

All file generation must respect the selected project and folder mapping profile.

### C-0. Menu-To-Screen Auto Generation API

The operations system should expose internal APIs that can generate a managed screen package from menu and requirement metadata.

Recommended API chain:

1. `POST /api/admin/ops/modules/resolve`
   - resolve requirement-domain module, UC, screen requirement IDs, and target menu candidates
2. `POST /api/admin/ops/scaffold/prepare`
   - create normalized scaffold JSON from menu, theme, project, and API bindings
3. `POST /api/admin/ops/scaffold/generate`
   - generate frontend screen, backend chain, and registration payloads
4. `POST /api/admin/ops/scaffold/rebuild`
   - regenerate after change request or module version update
5. `POST /api/admin/ops/scaffold/publish`
   - finalize publish and archive metadata
6. `GET /api/admin/ops/parity/compare`
   - compare current runtime, generated result, baseline, and patch target for one feature or screen family
7. `GET /api/admin/ops/uniformity/stats`
   - return page-frame, shell, component, spacing, density, and action-layout drift statistics
8. `GET /api/admin/ops/runtime/collect`
   - collect current runtime manifests and trace-backed UI statistics for promotion or repair analysis
9. `POST /api/admin/ops/repair/open`
   - open a governed repair session for one page, popup, shell profile, or component family
10. `POST /api/admin/ops/repair/apply`
   - apply a validated repair result and bind it to a patch release unit

Required generation inputs should include:

- requirement-domain module
- UC or screen requirement ID
- target menu code
- target page id
- admin/user pairing requirement when applicable
- required APIs and approval/review flow metadata
- technology profile
- installable module list
- supported device profile list
- install target list
- scenario id
- action layout profile
- actor policy id
- member classification policy id
- csrf policy id

Required generation outputs should include:

- generated page draft
- controller/service/VO/DTO/mapper/XML set
- menu/page/feature registration payload
- event/function/API binding manifests
- technology and module binding manifests
- frontend route and import manifests
- device and install-target metadata
- scenario and action-layout metadata
- actor authority and scope metadata
- classification and CSRF enforcement metadata
- requirement traceability links back to the mapped domain module
- parity comparison summaries
- uniformity statistics summaries
- runtime collection linkage for repair and promotion

Design-reference rule:

- generation APIs should accept approved design-document IDs and optional draft-document IDs
- Codex CLI assist should receive resolved design summaries and structured bindings instead of raw full proposal documents by default
- builder APIs should be able to reopen generated screens with the same design-document references attached

Help coverage rule:

- every governed page must include help content before publish
- every business-significant component, action bar, search area, result grid, and irreversible button should have a bound help anchor
- page manifests, help anchors, backend screen-command metadata, and rendered `data-help-id` markers must stay aligned
- missing help content should be treated as publish debt, not an optional later task

Minimum required help-covered regions:

- page title and summary header
- primary search form
- result grid or list region
- primary submit or save action
- approve or reject action group
- file upload and file download area
- step wizard navigation when present

### C-1. Existing Screen Collection

The operations system must support collection of existing screens, not only creation of new ones.

Collection targets:

- existing menu and route
- existing React page or JSP/template page
- existing controller, service, mapper chain
- existing APIs and DB schema linkage
- current component usage

Collection output:

- page manifest baseline
- component usage map
- event/function/API chain snapshot
- route and menu ownership link
- candidate theme assignment
- scaffold gap report for missing metadata

Recommended collection modes:

- `metadata-only import`
- `manifest + component map import`
- `full-stack ownership import`

### C-2. Change Request Flow

After first generation, the operations system must support:

- create modification request
- classify request by UI, event, API, DB, validation, or layout
- attach target page and affected component instances
- reopen screen draft from published version or current draft
- apply edits in builder or metadata form
- preview diff before publish
- save approval and publish history

Recommended states:

- `DRAFT`
- `PUBLISHED`
- `CHANGE_REQUESTED`
- `IN_REWORK`
- `REVIEW_READY`
- `REPUBLISHED`

### C-3. Delete And Deprecation Flow

The operations system must support delete or deprecate requests for existing managed screens.

Required checks before delete:

- linked menu usage
- feature and role usage
- API dependency
- DB object dependency
- component usage dependency
- published runtime binding
- audit and rollback checkpoint

Recommended outcomes:

- `DELETE_BLOCKED`
- `DEPRECATE_ONLY`
- `DELETE_APPROVAL_REQUIRED`
- `DELETE_READY`

### C-4. Component Creation Rule

Components must never be authored only as ad hoc page-local blocks inside the wizard.

Use this rule:

1. register component in the component registry first
2. assign component to one or more themes
3. expose it in the builder palette
4. drag it into the page
5. bind event, function, API, and authority contracts
6. record usage in page/component mapping
7. make runtime execution traceable by component instance key
8. require mouse and keyboard interaction traceability for governed actions
9. require accessibility and security checks before publish

GUI component authoring should support:

- component create and version
- prop schema editing
- default event registration
- function and API binding registration
- authority and audit binding registration
- theme compatibility registration
- preview and publish

Every governed component must also carry default interaction trace hooks.

Minimum trace expectation per component instance:

- component render summary
- pointer or click interaction trace
- keyboard activation trace where applicable
- focus-enter and focus-leave trace for interactive controls
- disabled or blocked action trace when authority or validation blocks execution

This applies not only to buttons, but also to:

- search inputs and selectors
- grid row actions
- popup open and close controls
- modal confirm and cancel controls
- tab switches
- wizard step navigation
- file upload and download controls
- inline edit controls
- pagination controls

This keeps:

- component reuse visible
- theme consistency enforceable
- delete and replace rules manageable
- change impact traceable across pages
- event/function/API ownership traceable at component level
- keyboard and pointer interaction auditable
- accessibility and security regressions visible before rollout

### C-4-D. Mandatory Component Event Log Rule

Resonance should treat component event logging as a platform default, not an optional enhancement.

Use this rule:

- every approved component catalog item must declare its default emitted interaction events
- every screen using that component inherits the default interaction log contract
- page-level opt-out should be disallowed except for explicitly approved low-value passive display components

Required event-log families:

- `COMPONENT_RENDER_SUMMARY`
- `COMPONENT_POINTER_ACTION`
- `COMPONENT_KEYBOARD_ACTION`
- `COMPONENT_FOCUS_CHANGE`
- `COMPONENT_STATE_CHANGE`
- `COMPONENT_BLOCKED_ACTION`

Minimum trace fields per event:

- `traceId`
- `pageId`
- `projectId`
- `scenarioId`
- `componentId`
- `instanceKey`
- `eventType`
- `actorScope`
- `result`
- `occurredAt`

When a component invokes business behavior, the trace chain must still link:

- `component event -> function -> API -> backend audit`

Do not allow:

- common components with no default interaction log contract
- popup, grid, search, or approval controls that emit business actions without trace events
- component libraries that bypass the platform trace utilities

### C-4-A. Common Component Development Rule

Resonance should treat common component development as a first-class platform capability.

Use this rule:

- common components are developed before repeated page-local variants
- screen generation should prefer approved primitives and governed composite blocks
- page-local custom UI should be allowed only when no approved common component can satisfy the scenario

Recommended component layers:

1. `primitive`
   - button
   - input
   - select
   - textarea
   - checkbox
   - radio
   - table
2. `composite block`
   - search form
   - result grid
   - action bar
   - summary card
   - file upload section
   - status timeline
   - step wizard navigation
3. `scenario-ready composite`
   - popup search dialog
   - grid + toolbar + paging block
   - detail-and-edit section
   - approval action panel

Each higher layer should still resolve to approved lower-layer primitives.

### C-4-B. Component-To-Screen Development Rule

Screen development should be driven by approved component sets.

Use this rule:

- screen builder first selects frame profile and scenario
- theme then limits the palette to approved component sets
- repeated structures such as search forms, grids, popup selectors, and bottom action bars should come from centrally governed blocks
- page-local styling and behavior drift should be minimized

This means:

- common component improvements flow into later generated screens
- generated screens remain visually and behaviorally uniform
- screen maintenance stays centered on catalog and theme updates instead of page-by-page rewrites
- menu and scenario additions keep inheriting the same governed component families instead of creating new visual dialects

### Dashboard Generation Rule

Dashboard generation should follow one governed layout family rather than ad hoc chart placement.

Use this rule:

- dashboard pages should use a governed `dashboard layout profile`
- the default dashboard profile should follow the `GWT + price-prediction` style
  - top KPI summary row
  - one primary trend or prediction panel
  - one explanation or driver panel
  - one recommendation or action panel
  - one detailed grid or drill-down section
- dashboard cards, charts, summary blocks, recommendation blocks, and drill-down grids should come from approved common component families
- non-dashboard pages should still prefer the same visual hierarchy when possible:
  - summary
  - primary content
  - secondary evidence
  - bottom action

Do not allow:

- arbitrary widget mosaics with no governed dashboard profile
- more than one competing primary chart in the same dashboard section
- page-local chart containers that bypass approved component catalog items

Screen development should be possible directly from GUI-managed assets:

- selected theme
- selected color and font bundle
- selected component catalog items
- selected event, function, and API bindings
- selected action-layout profile

The builder should not require raw hand-editing of source code for normal screen composition.

### C-4-C. Popup, Grid, Search, And API Execution Rule

A popup or modal is not complete unless its business chain is fully wired.

Every governed popup should declare:

- popup frame profile
- trigger component
- open and close event bindings
- focus-return behavior
- search form contract
- result grid contract
- paging or infinite-load policy
- row-select or action policy
- API binding set
- loading, empty, no-authority, and failure states

Every governed grid should declare:

- search input set
- default query shape
- sort columns
- row action set
- bulk action set if applicable
- selected-row behavior
- export policy if applicable

Use this rule:

- popup search forms must use the same approved search-form block family as normal pages where possible
- popup result grids must use the same approved grid family and density profile as normal pages where possible
- popup buttons must follow the same action-layout and authority-gate rules as full pages
- API calls must be bound through governed API manifests, not handwritten one-off fetch calls
- popup events must resolve through `component -> event -> function -> API -> DB/backend`

Do not publish:

- a popup with visual layout but no governed search or grid contract
- a grid with row actions that do not resolve to authority and API bindings
- a modal with no deterministic close, cancel, confirm, and focus-return behavior
- an API-bound search dialog with no loading, empty, and failure state coverage

### C-5. Project Mapping And Scaffold Contract

Before generation starts, the operator must choose:

1. target project
2. package domain or module
3. folder mapping profile
4. screen type
5. theme
6. menu ownership scope

Recommended scaffold inputs:

- `projectId`
- `menuCode`
- `pageId`
- `routePath`
- `domainPackage`
- `screenType`
- `themeId`
- `scenarioId`
- `actionLayoutProfile`
- `memberClassificationPolicyId`
- `csrfPolicyId`
- `frameworkLineId`
- `backendFacadeLineId`
- `backendImportSensitiveLineId`
- `featureModuleLineId`
- `generateControllerYn`
- `generateServiceYn`
- `generateVoYn`
- `generateDtoYn`
- `generateMapperYn`
- `generateMapperXmlYn`
- `generateFunctionBindingYn`
- `generateApiBindingYn`
- `codexAssistMode`
- `codexPromptPolicy`

Recommended scaffold outputs:

- frontend screen or schema artifact
- backend controller file
- service interface file
- service implementation file
- VO file
- DTO file
- mapper Java file
- mapper XML file
- function binding manifest
- API binding manifest
- scenario binding manifest
- action-layout manifest
- classification-scope manifest
- CSRF/security manifest
- selected framework and module-line manifest
- page/menu/feature registration script or API payload
- publish/archive metadata row set

### C-5B. CSRF And Stateful Action Security Policy

CSRF protection must be generated from governed policy, not added manually after screens exist.

Use this rule:

- every state-changing browser flow must declare a `csrfPolicyId`
- create, update, delete, approve, reject, upload, and import actions default to CSRF-protected
- read-only search and download flows may use an explicit exemption policy, but only when documented
- generated frontend forms, API clients, and backend endpoints must all bind to the same CSRF policy family
- CSRF token transport, refresh, and failure handling must be part of scaffold output, not hand-coded ad hoc

Recommended coverage:

- public join and application forms
- admin edit and approval forms
- file upload and replacement flows
- bulk actions from grids
- privileged setting changes

Do not allow:

- hidden state-changing POST endpoints without CSRF policy metadata
- per-page hand-built CSRF conventions that drift from the central security contract

### C-5A. Generated Identifier And Function Naming Policy

Generated names should remain collision-safe without forcing operators to hand-edit every identifier.

Use this rule:

- operators define a human-readable alias first
  - for example `memberJoinSubmit`, `screenSearchReset`, `companyApprove`
- the scaffold engine generates the physical identifier from:
  - `projectId`
  - `scenarioFamilyId`
  - `scenarioId`
  - `artifactKind`
  - `semanticAlias`
  - `versionLine`
- the physical identifier should append a deterministic short hash suffix
  - for example `memberJoinSubmit_a13f92`
- the same normalized inputs must always produce the same suffix
- different projects, scenarios, or artifact kinds must not silently reuse the same physical identifier

Recommended generated-identifier families:

- frontend function id
- frontend event handler key
- backend service method id
- backend mapper statement id
- generated button action id
- generated component instance key
- generated job or macro key when created from scenario scaffolding

Recommended manifest split:

- `semanticAlias`
  - operator-readable intent name
- `physicalIdentifier`
  - generated unique identifier used in code and manifests
- `hashSeedFingerprint`
  - trace value for collision review and rebuild verification

Do not use this rule:

- full unreadable random strings as the only identifier
- mutable ad hoc renaming after publish without manifest update
- manual duplicate checking as the primary collision-prevention method

The goal is:

- keep function and handler names stable across rebuilds
- prevent duplicate generated names across projects and scenarios
- preserve human-readable aliases for review, debug, and audit
- allow controlled regeneration without large rename drift

### C-8. Standard Action Layout And Reusable Screen Blocks

Frequently used structures should be centrally defined and reused.

Required reusable blocks:

- `search form`
- `grid or result table`
- `detail form`
- `approval action bar`
- `file action panel`
- `paging and summary bar`

Required action-layout zones:

- `top-left`
- `top-right`
- `search-zone`
- `grid-toolbar-left`
- `grid-toolbar-right`
- `detail-footer-left`
- `detail-footer-right`

Use this rule:

- common buttons such as search, reset, save, delete, approve, reject, download, export, and close must have a standard default zone
- operators may adjust the layout, but the screen must still reference one approved action-layout profile
- grid and search-form scaffolding should come from one shared definition and remain centrally updateable
- frontend should render these blocks from registered assets and JSON layout manifests whenever possible

### C-8A. Page Assembly From Governed Elements

Frontend generation should use the following sequence:

1. choose project and scenario family
2. choose page frame and shell profile
3. choose element families
4. design or refine element instances
5. attach event, function, API, authority, help, and diagnostics bindings
6. assemble page from governed elements
7. preview assembled page in theme and responsive contexts
8. publish page assembly for scaffold generation

This allows:

- page-level consistency
- element-level reuse
- quicker repair when one popup, grid, or search block changes
- more detailed design without losing uniformity

### C-8B. Pre-Registered Design Output Rule

Generated screens should render only from pre-registered design assets and approved component families.

Use this rule:

- page output must resolve from registered page design and page assembly assets
- element output must resolve from registered element designs and approved component catalog items
- button zones must resolve from one approved action-layout profile
- sections and layout regions must resolve from one approved page-frame family
- operators may choose among approved design variants, but may not create unmanaged visual structure at publish time

Do not allow:

- per-screen custom button placement outside the approved action-layout zones
- per-screen custom section spacing outside the theme and spacing profile
- raw one-off component output that bypasses the registered catalog and design assemblies

Recommended `codexAssistMode` values:

- `NONE`
- `SCAFFOLD_ONLY`
- `BINDING_ASSIST`
- `REPAIR_ONLY`
- `FULL_STRUCTURED_BUILD`

Recommended `codexPromptPolicy` values:

- `JSON_ONLY`
- `JSON_PLUS_SHORT_INTENT`
- `MANUAL_OVERRIDE_REQUIRED`

### C-6. JSON-First Authoring, DB Archive Later

Use this rule for fast development:

1. author and edit scaffold inputs in JSON
2. generate code and runtime artifacts from JSON
3. preview and verify the generated result
4. publish the approved result
5. store the approved result and governance index in DB for archive, search, trace, and rollback

Keep in JSON during authoring:

- project selection
- folder mapping
- menu/page/feature draft
- theme and component composition
- layout tree
- API and event bindings
- mouse interaction metadata
- keyboard interaction metadata
- accessibility decisions and exceptions
- security and masking bindings
- audit hook bindings
- change-request instructions
- generation flags for controller/service/VO/DTO/mapper/XML

Store in DB as archive or searchable result:

- published screen definition version
- generated resource ownership map
- component usage snapshot
- menu/page/feature registration result
- release artifact metadata
- mouse and keyboard interaction trace policy snapshot
- accessibility verification result
- security verification result
- audit binding and retention metadata
- audit, approval, rollback, and import history

This keeps:

- authoring fast and file-oriented
- diff and review simple
- bulk regeneration possible
- DB lighter and focused on governance and retention

### C-6-A. JSON Versus DB Source-Of-Truth Boundary

Resonance must distinguish between:

- `authoring truth`
  - mutable JSON working assets used during design, scaffold preparation, repair, and review
- `governance truth`
  - immutable or versioned DB records used for publish, search, audit, deploy selection, and rollback

Use JSON for:

- scenario work drafts
- screen layout drafts
- component-tree drafts
- menu/page/feature generation requests
- Codex or builder repair requests
- temporary compare snapshots
- design extraction summaries before approval
- scaffold request payloads and generation options

Use DB for:

- approved scenario family versions
- approved page and resource versions
- publish-ready manifests
- release-unit bindings
- deploy history
- rollback targets
- audit and approval records
- canonical design-source indexes
- JSON archive pointers and revision metadata

Do not:

- treat one operator's local JSON file as the only source of truth
- publish directly from an unmanaged local draft without revision registration
- store every in-progress authoring detail only in DB and lose fast diff workflows

### C-6-B. Durable JSON Authoring Rule

JSON authoring assets must not be ephemeral.

Every governed JSON draft must have:

- `workspaceId`
- `projectId`
- `assetFamily`
- `assetKey`
- `revisionNo`
- `contentHash`
- `storageUri`
- `canonicalDraftYn`
- `createdBy`
- `createdAt`

Durability rule:

1. JSON drafts may be edited in file-oriented workspaces
2. but every saved revision must be persisted to governed storage
3. governed storage must be referenced by stable ID, not only path
4. DB keeps the revision index and lineage
5. file/object storage keeps the revision body
6. approved publish results keep a pointer to the exact JSON revision set that produced them

Recommended storage pattern:

- JSON body in governed file or object storage
- revision metadata and lineage in `COMMON_DB`
- optional working-copy checkout on operator workstation
- checksum verification on save, publish, and rollback

### C-6-C. AI And User Edit Trace Rule

Every modification to governed JSON, generated code, or publishable asset must record:

- whether the change came from `USER`, `AI_AGENT`, or `SYSTEM_AUTOMATION`
- the acting identity
- the parent revision
- the changed asset family
- the change summary
- the before and after version references
- the release-unit impact if any

Required trace metadata:

- `editorType`
  - `USER`
  - `AI_AGENT`
  - `SYSTEM_AUTOMATION`
- `editorId`
- `agentProvider`
- `agentModel`
- `agentSessionId`
- `changeIntent`
- `diffSummary`
- `approvalState`
- `rollbackAnchorYn`

Publish rule:

- no publishable asset may exist without a trace back to the JSON revision set and editing actor set
- rollback must be able to restore either
  - the last approved JSON revision
  - the last approved published asset
  - or the last approved release unit

### C-7. Codex CLI Assisted Structured Generation

Codex CLI should be integrated as a controlled worker for screen and backend generation.

Use this operating model:

1. operator selects project, folder mapping, menu scope, theme, and approved components
2. system generates normalized scaffold JSON
3. registry-backed event, function, and API candidates are resolved
4. if the structured scaffold is complete, standard templates generate the baseline code directly
5. only the remaining refinement or repair work is sent to Codex CLI
6. Codex CLI returns changed files, summaries, and verification results
7. Jenkins validates and builds the result in the central operations system

Preferred Codex CLI usage:

- generate code from normalized JSON payloads
- repair incomplete controller/service/mapper chains
- fill boilerplate around selected APIs and function bindings
- update existing generated screens through structured change requests

Avoid this usage:

- long free-form prompts for routine CRUD screen generation
- hand-written repeated prompt text for component composition
- making Codex infer menu, API, and DB structure that already exists in metadata registries

This keeps:

- token usage low
- output format consistent
- backend scaffolding standardized
- function and API wiring easier to verify

### C-8. Scaffold, Build, Package, And Deploy Rule

Resonance should treat scaffolding and build as one governed delivery chain.

Required build chain:

1. select project
2. resolve framework line and module selection profile
3. resolve shared backend jar lines
4. resolve shared frontend bundle, theme, token, CSS, and JS lines
5. resolve attached feature modules and optional libraries
6. generate backend and frontend scaffold outputs
7. build common artifacts if required
8. build project artifacts
9. package the project runtime with selected shared artifacts
10. register the package result in the release unit
11. deploy to target runtime nodes
12. verify and keep rollback target visible

Package result should be able to include:

- project backend jar
- selected common backend jar
- selected import-sensitive backend jar when approved
- selected frontend common bundle
- selected theme and design-token package
- selected CSS and JS bundles
- selected installable feature-module bundle
- manifest and policy bundles required by the release unit

Library attachment rule:

- extra backend libraries must be attached through governed module or library selection, not arbitrary server-local copying
- extra frontend bundles must be attached through approved bundle lines
- attached libraries must appear in the release-unit asset matrix and deploy trace

Scaffold deployment rule:

- a scaffolded system is not considered deployable until backend, frontend, DB, security, and release-unit bindings are all resolved
- generated systems must be deployable from centrally built artifacts, not from live source synchronization

### C-9. No-Miss Event, Function, And API Wiring Rule

AI-assisted development through Resonance should generate screens quickly, but it must not leave business wiring incomplete.

Use this rule:

1. scenario is registered first
2. page and component layout is selected from approved frame and theme assets
3. every governed component instance resolves its event set
4. every event resolves its function binding
5. every function resolves its API or local action contract
6. every API resolves its backend and DB contract
7. authority, help, accessibility, security, and audit bindings are attached at the same time

The preferred generation flow is:

- `scenario -> action layout -> component palette -> event binding -> function binding -> API binding -> DB binding -> scaffold -> build`

Do not allow:

- visual screen generation with no action-binding coverage
- event handlers that exist only as placeholder names with no governed function contract
- function stubs that call undefined APIs
- API bindings that are not connected to backend or DB contracts

Required builder behavior:

- builder should suggest valid event candidates from component type
- builder should suggest valid function candidates from scenario family
- builder should suggest valid API candidates from function intent and actor policy
- builder should detect missing links and reopen the screen as `repair required`
- Codex assist should receive normalized unresolved-binding payloads instead of free-form screen descriptions

Publish gate:

- no generated screen may become publish-ready if `component -> event -> function -> API -> DB/backend` linkage is incomplete for any governed action path
- unresolved bindings must appear in the gap report and diagnostics panel

### C-10. AI-Fast Structured Delivery Rule

Resonance should let AI build screens and feature families quickly through governed manifests rather than large prompts.

The intended fast path is:

- choose project
- choose scenario family and scenario
- choose theme and approved component set
- resolve event, function, API, DB, and module bindings from registries
- generate scaffold JSON
- generate frontend and backend outputs from templates
- send only unresolved or exceptional gaps to AI repair

This keeps generation:

- low-token
- more accurate
- visually uniform
- easier to review
- easier to roll back

The system is considered ready for AI-fast delivery only when:

- scenario registry is populated
- component catalog and theme bundles are approved
- event/function/API registries are searchable
- builder can reopen generated screens with the same binding manifests
- release-unit packaging can include all selected shared artifacts automatically

### C-11. Component Identifier And Version Rule

Component identifiers should be stable, versionable, and collision-safe.

Use this rule:

- operators may define a readable semantic alias for the component
- the physical component identifier may be generated as a deterministic hash-based or encrypted-random style id
- the same seed fields must reproduce the same physical id on rebuild when logical identity is unchanged
- the platform should always preserve both:
  - semantic alias
  - physical component id

Recommended seed fields:

- `projectId`
- `themeId`
- `componentCategory`
- `componentKind`
- `semanticAlias`
- `versionLine`

Recommended output properties:

- short enough for code and manifest readability
- collision-resistant
- safe for code generation, route manifests, and event binding references

Do not use:

- page-local ad hoc ids with no registry row
- unreadable ids with no semantic alias preserved
- mutable ids that change on every rebuild without version change

### D. Resource Governance

Track and manage:

- frontend routes
- menus
- URLs
- pages
- page manifests
- shell templates
- CSS bundles and imports
- JS bundles and imports
- design tokens and theme assets
- surfaces and elements
- events
- frontend functions
- APIs
- request parameters
- response outputs
- DB schemas
- tables
- columns
- generated controller, service, VO, DTO, mapper, and mapper XML ownership
- collected existing-screen metadata and import state
- JSON authoring artifact references and archive pointers
- common module dependency bindings by project and install unit
- frontend asset dependency bindings
- Codex generation runs, prompt policy, and structured scaffold provenance

Use this resource-chain rule:

1. every governed asset must be version-addressable
2. every governed asset must declare owner scope
3. every governed asset must declare runtime dependency targets
4. every governed asset must declare upgrade and rollback impact
5. every governed asset must be bindable to a release unit

Minimum managed asset families:

- backend source artifacts
- frontend source artifacts
- CSS bundles and imports
- JS bundles and imports
- theme and design-token assets
- page manifests
- component bundles
- common runtime jars
- project runtime artifacts
- DB migration scripts
- public policy documents
- sitemap and trust assets

### D-1. Common Module Menu Area

The operations system should expose a dedicated common-module menu group for centrally managed features.

Recommended menus:

- common platform version dashboard
- framework line registry
- common module version registry
- installable module registry
- parameter and result contract registry
- project version binding matrix
- module and feature selection matrix
- compatibility and upgrade review
- release unit history
- sitemap and navigation governance
- terms/privacy/consent management
- SSL and certificate management
- HTTPS and domain policy management
- common auth management
- common PDF management
- common Excel management
- common file adapter management
- common audit and trace management
- common security policy management
- common accessibility management
- common notification management
- common search and language management
- common artifact version registry
- project common-module binding

Recommended actions:

- register common module
- register common version
- publish new common module version
- bind module version to selected projects
- bind framework and feature-module lines to selected projects
- review current versus target project bindings
- compare current and target common versions
- trigger compatibility checks
- approve upgrade window
- mark rollback readiness
- validate certificate expiry and domain coverage
- validate HTTPS redirect and secure-cookie policy
- publish sitemap and terms bundles
- roll out common artifact updates through Jenkins deployment flow

Version-management screens should show:

- current platform/common version
- target platform/common version
- selected framework line
- selected backend facade line
- selected import-aware line
- selected feature-module line
- project module version
- DB migration version
- API contract version
- compatibility check status
- rollout approval status
- rollback readiness
- applied deployment targets
- sitemap publish status
- active terms/privacy/consent version
- certificate issuer and expiry date
- HTTPS redirect enforcement status
- secure cookie and HSTS policy status
- public-domain binding status

### D-2. Stable Import Rule

When common functions are promoted into shared runtime modules, keep project code insulated from frequent import churn.

Use this rule:

- put unstable internal implementation behind stable common facades
- expose low-churn service contracts and helper entrypoints
- avoid requiring project-level controller or service imports to change for minor common-module upgrades
- keep project-owned code thin and mostly configuration-oriented when calling common runtime features
- ship general systems with common jars included so runtime projects do not need to re-host common implementation source
- prefer generated thin controllers, thin service adapters, thin page manifests, and thin binding profiles in project code
- keep deep shared logic, cross-cutting helpers, and volatile infrastructure logic in centrally versioned common artifacts

Preferred examples:

- auth guard and session resolver from a shared auth facade
- PDF export through a shared report facade
- Excel import/export through a shared spreadsheet facade
- file upload/download through a shared storage facade

Expected general-system source profile:

- lightweight route and page wiring
- lightweight menu binding and manifest code
- project-local mapper and business query deltas only where required
- project-local UI composition and configuration
- no duplicated common infrastructure internals unless explicitly approved as an exception line

### D-3. End-To-End Asset Chain

The operations system should make this chain explicit for every managed system:

1. choose project and target version set
2. bind common backend, frontend, asset, and policy versions
3. bind component/event/function/API contracts
4. generate scaffold JSON and manifests
5. generate or repair source artifacts
6. build common and project artifacts
7. verify accessibility, security, compatibility, and audit readiness
8. deploy to selected target nodes
9. switch traffic when healthy
10. record applied release unit and resource versions
11. support rollback using the previously bound version set

This chain should be visible from one operator flow instead of being split across unrelated screens.

### E. Deployment Control

Flow:

1. Git push received
2. operations system resolves project mapping and common artifact versions
3. scaffold JSON and binding manifests are finalized
4. Jenkins runs central generation and build
5. Codex CLI assist runs only where structured generation requires refinement or repair
6. produced artifact is versioned and registered
7. Nomad or direct deploy target is chosen
8. deploy to sub or idle node first
9. health check
10. Nginx upstream switch or expansion
11. verify application, Nginx, Jenkins, Nomad, and security logs arrive in ELK where applicable
12. audit event and release history saved

Build storage rule:

- Jenkins should consume scaffold JSON and project source from the operations system
- the build result should be registered as versioned artifact metadata in DB
- raw intermediate draft payloads do not need full DB normalization during authoring
- Codex CLI inputs should prefer normalized JSON and short intent hints over long natural-language prompts

### F. DB And Backup Control

Track and manage:

- per-project DB binding
- DB migration version
- backup run status
- restore points
- upgrade window approval
- DB copy and clone operations for new operations console setup

### G. File Placement And Archive Control

Use a simple first model:

- latest files on main web node or dedicated hot file node
- archive files on sub or dedicated archive file node

Later extension:

- DB-managed file location table
- archive movement batch
- storage node routing

Always assume file-serving will be separated and expanded over time.

Use these file-governance rules:

- treat file storage as a separately measurable runtime family
- distinguish `hot upload path`, `hot download path`, and `archive path`
- allow different hot-file nodes by user group, access frequency, upload source, or service domain when justified
- do not bind all high-frequency file traffic to a single node once telemetry shows clear hot groups

Recommended file-placement dimensions:

- project or system
- file category
- upload frequency
- download frequency
- recent access window
- uploader group or tenant group
- frequent-access user cluster
- file size class
- retention class

Recommended later file-routing policy:

1. classify upload and access patterns
2. identify hot users, hot groups, hot file families, and hot upload windows
3. bind high-frequency groups to selected hot-file nodes
4. move cold or archive files to archive nodes
5. keep file-location metadata, movement history, and rollback pointers in the control plane

Recommended file metrics:

- upload count by project, group, and hour
- download count by project, group, and hour
- top file families by access
- hot user and hot tenant lists
- hot file node saturation
- storage usage by node and category
- archive movement volume
- failed file fetch count
- file-serving latency percentiles

### G-1. File Telemetry And Relationship Routing

The operations system should expose file telemetry, user-to-file relationship views, and routing policies.

Required operator views:

- file node capacity dashboard
- hot file family dashboard
- uploader and downloader behavior dashboard
- user-group to file-node relationship view
- archive move queue and retry dashboard
- file fetch error and latency dashboard

Use this rule:

- file placement should be decided from measured behavior, not guesswork
- frequent uploader groups and frequent consumer groups may be routed to different hot nodes
- route policy changes must remain auditable and reversible
- file routing should not bypass authorization, audit, or retention policy

Recommended routing-policy families:

- `PROJECT_DEFAULT`
- `USER_GROUP_AFFINITY`
- `TENANT_AFFINITY`
- `HOT_FILE_FAMILY`
- `SIZE_CLASS_ROUTING`
- `ARCHIVE_ONLY`

### G-2. Detailed Monitoring And Statistics

The operations system should provide detailed monitoring beyond simple service up or down checks.

Required monitoring families:

- server resource monitoring
- runtime process monitoring
- app response monitoring
- Nginx traffic and upstream monitoring
- DB connection, CAS, and query monitoring
- file-serving and archive monitoring
- AI runner and model utilization monitoring
- build and deploy monitoring
- security and audit monitoring
- complexity and chain health monitoring

Recommended monitored metrics:

- CPU, RAM, disk, and network per node
- app startup time and restart count
- request rate, error rate, and latency percentiles
- Nginx upstream success, fail, and retry counts
- DB pool usage, active connections, wait time, and slow-query count
- file-serving throughput, latency, open-file count, and error rate
- archive queue depth and movement lag
- AI model memory, inference latency, queue depth, and failure count
- Jenkins queue, build time, and deployment success rate
- Nomad allocation count, pending jobs, and placement failures
- audit event volume, security alert volume, and trace completeness
- chain-matrix drift count, orphan resource count, and rollback blocker count

Recommended monitoring menus:

- runtime health dashboard
- topology pressure dashboard
- file and archive dashboard
- DB CAS and pool dashboard
- AI runner dashboard
- deploy and build dashboard
- complexity and drift dashboard
- SLO and error-budget dashboard

Use this rule:

- monitoring must support both current status and historical trend views
- monitoring should correlate project, system, server, release unit, and component where possible
- every alertable metric should map back to an operator action or runbook

## Menu Classification For The Operations System

Current Carbonet admin routes already show which areas must be governed.

Use these operational groups in the new console.

Recommended final left-navigation order should optimize for operator workflow, not architecture taxonomy only.

Use this order:

1. dashboard and overview
2. project and runtime
3. build and deploy
4. screen and UI governance
5. design workspace and requirement mapping
6. security and access governance
7. observability, audit, and log search
8. complexity, resource, and source governance
9. common module and version governance
10. optional evidence or blockchain layer

To make Resonance productizable, the left navigation should also expose platform capability families explicitly instead of hiding them inside larger technical groups.

Recommended product-grade menu set:

1. `Dashboard`
2. `Project And Runtime`
3. `Build And Deploy`
4. `Screen And UI Governance`
5. `Design Workspace`
6. `Business Menu Inventory`
7. `Security And Access`
8. `Observability And Audit`
9. `File / Backup / Retention`
10. `Common Module / Version / Compatibility`
11. `AI Agent And Model`
12. `Common Master / Notification / Certificate`
13. `Complexity / Resource / Source Governance`
14. `Optional Evidence / Blockchain`

Reason:

- operators usually begin from project selection and runtime status
- deploy decisions come earlier than deep resource forensics
- design and screen creation should sit near each other
- security and observability should remain first-class, but not hide the primary build and runtime path
- complexity and source-chain screens are critical, but they are second-order governance views, not the first screen most operators open
- file, backup, retention, common master, notification, certificate, AI, and compatibility concerns are large enough to deserve explicit product surfaces

### 1. Project And Runtime Management

Group from current system:

- `environment-management`
- `menu-management`
- `page-management`
- `function-management`
- `full-stack-management`
- `wbs-management`
- `codex-request`
- `sr-workbench`

New operations grouping:

- system registry
- server registry
- runtime topology
- deploy targets
- idle-node pool
- release and rollout
- complexity and chain management
- source and artifact workspace management

### 2. Build And Deploy Operations

Group from current system:

- `codex-request`
- `sr-workbench`
- `wbs-management`
- build/restart scripts and deploy macros
- Jenkins and Nomad execution views

New operations grouping:

- build queue and pipeline runs
- deploy targets and rollout panel
- sub-first and idle-node rollout
- restart and health-check macros
- release-unit compare, verify, and rollback
- deploy audit and deploy history

### 3. Screen And UI Governance

Group from current system:

- `screen-builder`
- `screen-runtime`
- `platform-studio`
- `screen-elements-management`
- `event-management-console`
- `function-management-console`
- `api-management-console`
- `controller-management-console`
- `db-table-management`
- `column-management-console`
- `help-management`
- `observability`

New operations grouping:

- theme registry
- component bundle management
- screen wizard
- manifest and registry explorer
- UI governance and audit
- menu-to-screen generation center

### 4. Design Workspace And Requirement Mapping

Group from current system:

- design workspace intake
- requirement mapping
- proposal upload
- canonical source selector
- mature output package builder

New operations grouping:

- source intake registry
- canonical source selector
- design summary and mapping workspace
- mature output package builder
- print and export history
- requirement-domain module registry

### 5. Security And Access Governance

Group from current system:

- `auth-group`
- `auth-change`
- `dept-role`
- `ip-whitelist`
- `security-history`
- `security-policy`
- `security-monitoring`
- `blocklist`
- `security-audit`
- `scheduler-management`

New operations grouping:

- operator role model
- project admin scope
- deploy approval
- backup/restore approval
- audit review
- blockchain proof and evidence policy when enabled

### 6. Observability, Audit, And Log Search

Group from current system:

- `observability`
- `help-management`
- ELK/Kibana linked views
- trace and audit panels

New operations grouping:

- trace explorer
- audit explorer
- deploy and release history
- security event explorer
- help and diagnostics explorer
- ELK correlation search

### 7. Business Menu Inventory

The current admin menu inventory under member, emission, content, integrations, monitoring, and operations should remain manageable as project menus, not as control-plane modules.

The operations system should classify them as:

- project business menus
- project-owned runtime pages
- project-owned APIs and DB objects

### 8. File, Backup, And Retention Governance

The operations system should expose dedicated menus for:

- hot file policy
- archive file policy
- file node and storage routing
- file telemetry and popularity routing
- backup plan registry
- restore history
- retention rule registry
- cron and scheduler registry
- orphan file and expired file cleanup

These screens should sit as first-class operational menus because they are day-two operations, not hidden implementation detail.

### 9. Common Module And Version Governance

The operations system should expose dedicated menus for:

- common module registry
- framework line registry
- common jar line registry
- frontend common bundle registry
- project version binding matrix
- compatibility review
- release-unit asset matrix
- import-aware upgrade review

These screens should stay near build and runtime governance while remaining independently searchable and operable.

### 10. AI Agent And Model Governance

The operations system should expose dedicated menus for:

- AI provider registry
- model registry
- runner node registry
- provider-to-project binding
- prompt policy registry
- execution history
- failure and retry explorer

### 11. Common Master, Notification, And Certificate Governance

The operations system should expose dedicated menus for:

- common master registry
- company type and member type registry
- notification provider registry
- notification template bundle registry
- certificate profile registry
- secret and rotation dashboard

These menus should remain distinct from project business masters because they are platform-governed shared capabilities.

### 12. Complexity, Resource, And Source Governance

The operations system should expose dedicated operator menus for chain-heavy governance.

Recommended menus:

- complexity dashboard
- ownership-chain explorer
- execution-chain explorer
- delete and rollback chain explorer
- source asset registry
- generated artifact workspace
- design document workspace
- requirement-domain module registry
- source drift and orphan scan

Each of these screens should answer:

- what resource is this
- who owns it
- what uses it
- what version is active
- what blocks delete or rollback
- which design document and requirement module produced it
- whether it is common-plane or project-system owned

### 13. Optional Blockchain Evidence Layer

If the system later enables blockchain such as Hyperledger Fabric, keep it as an optional evidence layer, not as the primary business data store.

Recommended usage:

- proposal and design-document hash proof
- approval and reject evidence hash
- release-unit proof
- audit batch proof
- certificate and report issuance proof

Use this rule:

- store hashes and proof references on-chain
- keep original files, DB rows, and runtime state in existing systems
- bind blockchain proof rows to release units, audit events, or policy documents in the control plane

## Productization And Package Delivery Rule

Resonance should be buildable and sellable as a productized platform, not just a repository-specific admin console.

Use this packaging model:

- `resonance-control-plane`
  - central UI, control APIs, registry, governance, builder, deploy console
- `resonance-common-backend-line`
  - versioned common backend jars by framework line
- `resonance-common-frontend-line`
  - versioned common frontend bundles, tokens, CSS, JS, theme assets
- `resonance-feature-module`
  - installable feature and business module bundles
- `resonance-runtime-binding`
  - project-side binding profile that chooses approved versions

### Product Packaging Families

Recommended build outputs:

- `control-plane-web`
- `control-plane-batch`
- `common-backend-jar`
- `common-import-sensitive-jar`
- `frontend-common-bundle`
- `theme-package`
- `design-token-package`
- `feature-module-bundle`
- `release-unit-manifest`

### Common Jar And System Deployment Rule

Project deployment should support bundling common jars together with project artifacts.

Use this rule:

- build common jars centrally
- publish common jars by approved version line
- let each project select approved common jar, framework, frontend bundle, token, CSS, JS, and feature-module versions
- resolve all selected lines into one governed `release unit`
- deploy the project runtime using that release unit as the single source of truth

This means a system deployment should be able to include:

- project backend jar
- selected common backend jar line
- selected import-sensitive common jar line when approved
- selected frontend common bundle line
- selected theme/token/CSS/JS bundle line
- selected feature-module bundle line

### Product-Grade Parity Delivery Rule

If Resonance is expected to replace current Carbonet-style manual development and deployment, the generated runtime package should satisfy all of these before it is considered product-grade:

- public pages do not feel visually downgraded compared with the current runtime
- admin pages do not lose action hierarchy, help coverage, popup behavior, or table/search density
- generated backend chain is complete enough to match current route, controller, service, mapper, SQL, and DB object expectations
- common runtime behavior is resolved through common jars and shared frontend bundles rather than scattered source duplication
- runtime package assembly remains reproducible through release-unit selection

Use this parity readiness rule:

- do not approve a productized runtime package until shell parity, page-frame parity, popup/grid/search parity, help coverage, authority behavior, and backend-chain parity are all reviewed together
- parity review must cover public home, public signin, join flows, admin login, list/detail/edit/review pages, popup-heavy admin workflows, export screens, file screens, and approval screens
- parity review must also verify that the runtime package behaves correctly on first deployment without requiring manual source patching on the target system

### First-Deployment Success Rule

The target general system should be able to start and operate correctly on the first governed deployment attempt.

Required checks before runtime release approval:

- all selected common jar lines resolve without missing dependency drift
- all selected frontend bundles, theme bundles, token bundles, CSS, and JS lines resolve without missing asset drift
- menu, page, feature, route, authority, help, event, function, API, backend, DB, and SQL artifacts are all present in the release-unit asset matrix
- runtime startup macros, restart macros, health checks, and rollback checkpoints are bound
- generated-result compare and uniformity checks have no blocking defect
- registered menu-to-page render verification has no blocking defect
- required log pipelines and cron or scheduler bindings are registered and verified where applicable

Do not approve release when:

- a runtime package still expects operator-side hand edits
- selected common artifact versions do not match the release-unit matrix
- generated backend or DB chain contains unresolved draft-only links

### Per-Server Deployment Validation Rule

Every project-unit deployment should declare and verify server-role readiness before the package is marked deployable.

Minimum server-role validation:

- `main web node`
  - Nginx entrypoint reachable
  - runtime package receipt path valid
  - start, stop, and restart macro valid
  - current-runtime compare available
- `sub web node`
  - runtime package receipt path valid
  - staged rollout and smoke target valid
  - rollback handoff valid
- `idle node`
  - internal port policy valid
  - Nomad or manual placement policy valid
  - health-check visibility valid
- `project DB node`
  - connection profile valid
  - migration and rollback draft applicable
  - backup and restore checkpoint valid

Do not allow deployment when:

- a target server role is missing for the project unit
- start, stop, and restart macros are not registered
- main-server smoke verification cannot run
- release-unit asset matrix does not match the target server-role map

### Multi-Project Server-Set Delivery Rule

Resonance should be able to support many projects, each with its own governed server set, while keeping design, build, compare, repair, and release centralized.

Use this rule:

- each project declares its own main, sub, DB, file/archive, idle, and scheduler ownership profile
- build and deploy remain project-unit scoped
- compare, repair, smoke, rollback, and runtime truth checks remain project-unit scoped
- no deploy execution should mix server-role ownership across unrelated projects

Minimum multi-project readiness:

- project registry stores per-project server-role bindings
- release-unit matrix can be filtered by project unit and server set
- smoke and rollback checkpoints are recorded per project unit
- current-runtime collection always resolves against the selected project's main server

### Runtime Package Assembly Rule

General systems should be deployed as assembled runtime packages, not as loosely copied source trees.

Minimum package assembly should include:

- project-local thin runtime source
- selected common jar set
- selected framework line
- selected frontend common bundle
- selected theme, token, CSS, and JS bundles
- selected installable feature modules and optional libraries
- generated page, route, menu, feature, manifest, and backend chain outputs
- governed SQL drafts and approved migration payloads when needed

The runtime package should expose:

- `releaseUnitId`
- `frameworkLineId`
- `commonJarLineSet`
- `frontendBundleLineSet`
- `featureModuleLineSet`
- `sqlDraftSet`
- `rollbackTargetReleaseUnitId`
- `parityReviewState`

### Version Upgrade Rule

Version upgrades should be handled as controlled product operations.

Use this order:

1. publish new framework or common lines centrally
2. run compatibility review by project
3. create target release unit
4. compare current vs target asset matrix
5. deploy to sub or idle target first
6. verify and switch main target
7. keep rollback release unit available

Projects should never receive silent common-code drift.

They should always:

- choose approved lines
- review compatibility
- deploy through a governed release unit
- retain rollback targets

### Productization Readiness Additions

To ship Resonance as a real product, the following platform capabilities should also exist explicitly.

### Productization Completeness Check

Before calling Resonance product-ready, confirm these are all present:

1. parity and compare explorer
2. UI uniformity and repair explorer
3. selected-screen repair workbench
4. common-versus-project asset split review
5. proposal baseline and patch history
6. backend chain explorer
7. SQL draft review and rollback review
8. runtime package matrix with common jar and bundle selection
9. support snapshot and diagnostic export
10. entitlement, onboarding, and version compatibility screens

### High-Value Operations-System Feature Set

Resonance should prioritize high-value product features first, not only basic CRUD authoring.

High-value operator features include:

- scenario-first screen and feature generation
- selected-screen compare and repair
- current-runtime collection and promotion
- common-versus-project asset split review
- release-unit compare and rollback explorer
- server, macro, deploy, and health orchestration
- SQL draft review for schema and seed-data updates
- centralized log search, log-family governance, and deploy-log correlation
- cron, retention, archive movement, and cleanup orchestration
- audit, parity, uniformity, and diagnostics dashboards
- help, accessibility, and security publish gates

These should be treated as product-core capabilities.

### No-Awkward-Screen Release Gate

Resonance should not ship screens that are technically complete but visually or behaviorally awkward.

Treat these as blocking defects:

- page shell or frame mismatch for the selected screen family
- missing title, summary, state badge, or primary action hierarchy
- popup, grid, search, and bottom action layout drift from the approved standard
- inconsistent spacing, density, or button-slot use inside the same family
- missing empty, loading, error, or no-authority state design
- generated runtime screen looking materially simpler or rougher than the current Carbonet source family

The operations system should surface these defects through:

- parity compare
- uniformity statistics
- selected-screen repair
- release-unit approval blockers

#### 1. Tenant And Customer Onboarding

The control plane should support:

- tenant or customer registration
- customer environment profile
- customer branding and theme selection
- initial module bundle selection
- default actor and authority package selection
- initial server and deploy-target bootstrap

#### 2. License And Entitlement Governance

The product should support:

- enabled feature set by customer
- enabled module set by customer
- AI provider entitlement
- advanced governance screen entitlement
- optional evidence or blockchain entitlement

This should be governed as:

- `license profile`
- `entitlement bundle`
- `customer module binding`

#### 3. Installer And Bootstrap Profiles

The product should support governed bootstrap packages for:

- control-plane installation
- runtime binding package
- common module starter package
- file and backup starter policies
- AI runner starter package

This makes first-time setup reproducible and reduces manual infrastructure drift.

#### 4. Product Support And Upgrade Supportability

The product should expose:

- upgrade advisory
- compatibility advisory
- diagnostic bundle export
- support snapshot export
- environment summary export

This allows support and operations teams to troubleshoot customer systems without ad hoc server inspection.

#### 5. Product-Grade Audit And Billing Hints

Even if billing is not implemented first, the architecture should keep room for:

- customer usage summary
- module usage summary
- AI execution usage summary
- storage and retention usage summary
- deploy frequency and environment activity summary

This keeps future product operations from requiring a redesign.

## `msaManager` Tab Mapping To Carbonet Operations Console

The existing `/opt/util/msaManager` UI already exposes useful operator habits and should be absorbed into Carbonet rather than copied blindly.

Observed top-level tabs in `msaManager.html`:

- remote-workspace
- modules
- mappings
- changes
- ops-deploy
- logs
- log-history
- analytics
- security
- security-explorer
- traffic
- accessibility
- env-settings

Map them into Carbonet like this.

### 1. Remote Workspace And File Operations

`msaManager` tab:

- `remote-workspace`

Carbonet destination:

- `environment-management`
- dedicated server/file workspace panel under the operations system

Responsibilities:

- project selection
- remote file tree view
- project-to-folder mapping
- remote workspace browse and edit approval
- file archive movement operations

### 2. Module Runtime Management

`msaManager` tab:

- `modules`

Carbonet destination:

- `environment-management`
- runtime topology and module-instance panel

Responsibilities:

- project selection
- main/sub/idle node view
- module instance state
- start/stop/restart
- fixed node versus idle-pool deployment visibility

### 3. Central Controller Mapping And API Spec

`msaManager` tab:

- `mappings`

Carbonet destination:

- `full-stack-management`
- `screen command` metadata views
- `api-management-console`
- `controller-management-console`

Responsibilities:

- route to controller mapping
- API request/response contract
- function and mapper chain
- parameter and output specification

### 4. Change Detection And Auto Deploy

`msaManager` tab:

- `changes`

Carbonet destination:

- `codex-request`
- deployment change-history panel
- builder change-request panel for screen-level edits

Responsibilities:

- source change detection
- auto-deploy policy
- change request intake
- build and deploy trigger decision
- scaffold refresh versus code-only rebuild decision
- package rebuild required or not-required classification

### 5. Operations Deploy

`msaManager` tab:

- `ops-deploy`

Carbonet destination:

- `codex-request`
- deploy target and rollout panel

Responsibilities:

- Jenkins pipeline trigger
- Nomad job rollout
- sub-first deployment
- health check
- rollback
- upstream switch tracking
- package delivery and restart policy selection
- current-runtime versus target-runtime comparison

### 6. Logs And Historical Logs

`msaManager` tabs:

- `logs`
- `log-history`

Carbonet destination:

- `observability`
- backup/deploy history extensions
- ELK search and dashboard views

Responsibilities:

- live log tail
- recent runtime errors
- historical log search
- deploy log artifact links
- Elasticsearch-backed cross-node search
- Logstash or shipper pipeline status
- Kibana dashboards for app, audit, security, deploy, and traffic logs

### 7. Analytics, Security, Traffic, Accessibility

`msaManager` tabs:

- `analytics`
- `security`
- `security-explorer`
- `traffic`
- `accessibility`

Carbonet destination:

- `observability`
- security admin pages
- future platform health dashboard

Responsibilities:

- usage and error trends
- security detection summary
- threat exploration
- traffic pressure indicators
- accessibility and quality scan status

### 8. Environment Settings

`msaManager` tab:

- `env-settings`

Carbonet destination:

- `environment-management`
- system/server/pipeline configuration panels

Responsibilities:

- server mode and environment policy
- internal port conventions
- project mapping defaults
- pipeline defaults
- deployment guardrails

## Current Carbonet Build, Package, And Restart Alignment

The operations system should absorb existing Carbonet operational behavior rather than replace it blindly.

Current script patterns already present in this repository include:

- `ops/scripts/build-restart-18000.sh`
  - frontend build
  - backend package
  - service restart
- `ops/scripts/restart-18000.sh`
- `ops/scripts/start-18000.sh`
- `ops/scripts/stop-18000.sh`
- cron and scheduler inspection scripts under `ops/cron/`

Use this rule:

- msaManager-style operator actions should map to these governed script and macro families first

### `msaManager` Improvement Rule For Current And Future Systems

The `msaManager` feature set should be reimplemented as governed operator surfaces inside Resonance, not left as a sidecar utility.

Use this rule:

- preserve useful current operator habits
  - build
  - package
  - restart
  - stop/start
  - deploy target selection
  - log and health visibility
- improve them so they understand:
  - current Carbonet runtime
  - future generated runtime systems
  - common jar and frontend bundle line selection
  - release-unit and rollback checkpoints
  - selected-screen repair and patch deployment

Do not keep duplicated operator surfaces where:

- `msaManager` does one action
- Resonance deploy console does another similar action

Instead:

- map `msaManager` actions into Resonance menus and APIs
- keep one governed source of truth for operator execution
- allow generated systems to consume the same release and restart contracts without embedding `msaManager` authoring UI
- existing build, package, restart, and verification behavior should be wrapped into Resonance command templates and macros
- do not create a second unrelated deploy flow if the current repository already has a workable package and restart chain

Recommended operational chain:

1. detect source or scaffold change
2. classify change type
   - metadata-only
   - frontend rebuild
   - backend package rebuild
   - full package and restart
3. select approved build profile
4. execute package or build script
5. deploy to selected target
6. restart or reload target service where required
7. run health-check and log verification
8. record release-unit and restart result

Recommended macro bindings:

- `BUILD_FRONTEND`
- `PACKAGE_BACKEND`
- `BUILD_AND_RESTART`
- `RESTART_ONLY`
- `STOP_ONLY`
- `START_ONLY`
- `POST_DEPLOY_VERIFY`

The operations system should let operators reuse these flows from:

- deploy console
- module runtime panel
- change-detection panel
- system-level server management screens

## Theme-Based Builder Model

### Goal

Allow operators to create screens in two modes:

- `theme-only`
  - use only the components already approved for the selected theme
- `theme-plus-approved-extra`
  - start from theme components, then add more approved components before publishing

Theme source may come from:

- Carbonet default theme
- KRDS-compatible theme
- project-specific theme extension
- approved existing design-document and design-source packages managed by the control plane

### Required Theme Objects

- `component_category_registry`
  - category id, name, status, marketplace exposure
- `component_kind_registry`
  - kind id, category id, execution profile, allowed bindings
- `component_catalog_item`
  - publishable internal-catalog component asset with version, owner, and quality state
- `theme_registry`
  - theme id, name, status, visual direction
- `theme_component_bundle`
  - theme to component mappings
- `theme_component_rule`
  - allowed, deprecated, replacement, required flags
- `theme_page_template`
  - list/detail/edit/review presets per theme
- `design_token_bundle`
  - token set, design-system family, version
- `theme_design_system_binding`
  - theme to token bundle and design-system profile binding

### Builder Rule

Before a screen draft is created:

1. choose system
2. choose theme or internal-catalog-extended theme
3. resolve design-system profile such as KRDS or Carbonet custom
4. load allowed component bundle
5. create draft page from template
6. bind menu/page/feature metadata

After a published screen exists:

1. accept change request
2. reopen from published version or collected current version
3. edit only through registered components
4. review diff
5. republish or deprecate

KRDS support rule:

- KRDS-based themes must preserve mapped token names, spacing, color, typography, and state rules
- KRDS-compatible components should be publishable in the same internal catalog with explicit compatibility metadata
- theme extension must not silently break KRDS baseline accessibility or interaction rules

### Component Interaction Accessibility And Security Rule

Every governed component must be traceable for both pointer and keyboard interaction.

Minimum requirements:

- primary click or pointer actions traceable by component instance key
- keyboard activation such as `Enter`, `Space`, shortcut, and focus-driven actions traceable by component instance key
- focus entry and major state transitions traceable for meaningful business controls
- sensitive actions must emit security and audit events
- accessibility exceptions must be recorded explicitly, not inferred silently

Do not publish components that:

- can only be activated by mouse when they represent governed business actions
- bypass audit or security checks for approval, download, export, delete, or authority-changing actions

## Data Model Additions

Add to the common control-plane model:

### System And Runtime Tables

- `SYSTEM_REGISTRY`
- `SERVER_REGISTRY`
- `SERVER_ROLE_BINDING`
- `SYSTEM_RUNTIME_TOPOLOGY`
- `DEPLOY_TARGET`
- `NOMAD_NODE_REGISTRY`
- `NOMAD_JOB_REGISTRY`
- `AI_PROVIDER_REGISTRY`
- `AI_MODEL_REGISTRY`
- `AI_RUNNER_NODE`
- `AI_PROJECT_BINDING`
- `JENKINS_PIPELINE_REGISTRY`
- `RELEASE_DEPLOY_RUN`
- `BUILD_ARTIFACT_REGISTRY`
- `PROJECT_BUILD_PROFILE`
- `COMMON_PLATFORM_VERSION`
- `COMMON_MODULE_VERSION`
- `PROJECT_VERSION_BINDING`
- `COMPATIBILITY_CHECK_RUN`
- `RELEASE_UNIT`

### Theme And Screen Tables

- `COMPONENT_CATEGORY_REGISTRY`
- `COMPONENT_KIND_REGISTRY`
- `COMPONENT_CATALOG_ITEM`
- `THEME_REGISTRY`
- `THEME_COMPONENT_BUNDLE`
- `THEME_COMPONENT_RULE`
- `THEME_PAGE_TEMPLATE`
- `DESIGN_TOKEN_BUNDLE`
- `THEME_DESIGN_SYSTEM_BINDING`
- `SCREEN_DEFINITION`
- `SCREEN_DEFINITION_VERSION`
- `SCREEN_TEMPLATE_BINDING`
- `SCREEN_IMPORT_RUN`
- `SCREEN_IMPORT_ARTIFACT`
- `SCREEN_CHANGE_REQUEST`
- `SCREEN_CHANGE_REQUEST_ITEM`
- `SCREEN_SCAFFOLD_REQUEST`
- `SCREEN_SCAFFOLD_ARTIFACT`
- `REQUIREMENT_DOMAIN_MODULE`
- `REQUIREMENT_SCREEN_MAPPING`
- `MENU_SCREEN_GENERATION_RUN`

### File And DB Control Tables

- `FILE_STORAGE_NODE`
- `FILE_ASSET_LOCATION`
- `FILE_ARCHIVE_POLICY`
- `PROJECT_DB_REGISTRY`
- `PROJECT_DB_BACKUP_HISTORY`
- `PROJECT_DB_CLONE_HISTORY`

### Observability And Log Tables

- `LOG_PIPELINE_REGISTRY`
- `LOG_SOURCE_BINDING`
- `LOG_INDEX_POLICY`
- `SECURITY_LOG_ALERT`
- `DEPLOY_LOG_CORRELATION`

## Version And Upgrade Governance Rule

The operations system must treat version control as an operator-facing workflow, not just hidden build metadata.

Use this rule:

1. register common platform and module versions centrally
2. bind approved versions to target projects
3. run compatibility checks before rollout
4. create a release unit that pins:
   - platform/common version
   - project module version
   - DB migration version
   - API contract version
5. approve upgrade window and rollback readiness
6. deploy through Jenkins and Nomad
7. record applied targets and outcome

Do not allow `latest`-style deployment without an explicit version binding and compatibility result.

Required version-binding families:

- backend framework and common jar versions
- frontend platform and UI bundle versions
- CSS and JS asset versions
- theme and design-token versions
- screen manifest and component-bundle versions
- API contract version
- DB migration version
- public policy and sitemap publish version

Release-unit chain must answer:

- what version set was approved
- what version set was built
- what version set was deployed
- what version set is currently active
- what version set is rollback target

## ELK Log Governance Rule

The operations system should manage centralized logs through an ELK-style stack.

Recommended responsibilities:

- Elasticsearch for indexed search and retention
- Logstash or compatible shippers for normalization
- Kibana for dashboards, alert views, and operator search

Minimum log families:

- application logs
- Nginx access and error logs
- Jenkins build and deploy logs
- Nomad allocation and runtime logs
- security and audit logs
- DB operation and backup logs

Required correlation keys:

- projectId
- systemId
- serverId
- releaseUnitId
- traceId
- componentId when available

Do not treat ELK as a replacement for immutable audit tables.

Use ELK for search, triage, correlation, and operational dashboards while keeping authoritative audit records in the platform data model.

## Performance-First Advanced Stack Rule

Resonance may attach advanced stacks, but the default principle is:

- add only stacks that increase speed, predictability, or operator visibility
- prefer lightweight and installable modules first
- do not force heavy stacks into every 1GB runtime node

Recommended advanced stacks by purpose:

### Fast Delivery And Edge Response

- `Nginx micro-cache`
  - fast public and read-heavy response caching
- `Brotli / gzip precompressed asset delivery`
  - lighter frontend transfer
- `static asset fingerprinting and immutable cache policy`
  - faster repeat loads with controlled refresh

### Fast Runtime Query And Session Paths

- `Redis`
  - session, token, approval-cache, and hot lookup cache
- `Caffeine` or equivalent in-process cache
  - low-latency hot-path summary and registry cache inside the JVM
- `materialized summary tables`
  - precomputed list and dashboard speedup for heavy admin pages

### Fast Search And Filter

- `OpenSearch` or `Elasticsearch`
  - optional high-volume search, not default for all runtimes
- `FTS or indexed summary view`
  - when full search engine is too heavy

### Fast Async Work

- `governed worker queue`
  - PDF, Excel, archive move, notification, and heavy report work offloaded from request path
- `scheduler with retry and dead-letter rules`
  - predictable background execution

### Fast Monitoring And Triage

- `Loki + Grafana`
  - lighter alternative when ELK is too heavy
- `Prometheus + Grafana`
  - metrics and trend visibility with low overhead
- `OpenTelemetry-compatible trace export`
  - optional request path timing and correlation

### Fast AI Assistance

- `dedicated Ollama or local-model runner node`
  - AI inference isolated from web runtime memory pressure
- `prompt/result cache`
  - repeated design and repair assistance speedup

Use this rule:

- runtime web nodes stay thin
- heavy advanced stacks should prefer dedicated support nodes
- advanced stacks remain selectable installable modules
- every attached stack must declare memory budget, target host class, and rollback path

Required operator surfaces:

- stack attachment registry
- host-class placement review
- memory budget review
- cache and queue health dashboard
- stack rollback history

Resonance should also expose:

- runtime-node safety gate for 1GB hosts
- support-node capacity view
- project-level stack eligibility review
- stack attachment and detach request history

## Operator Feature Completeness Rule

Resonance must not be treated as product-complete unless all operator-facing surfaces needed for parity closure exist and are visible in the control plane.

This includes:

- project and runtime registry
- menu/scenario/page/component authoring and gap closure
- component slot-profile governance
- theme-set, page-design, element-design, and assembly governance
- binding and backend-chain inspection
- DB and SQL review/export
- build, package, deploy, rollback, and runtime package matrix
- log search, audit correlation, and main-server scheduler governance
- performance stack governance
- parity compare, repair, and missing-asset queues
- frontend/backend/DB/runtime package pattern consistency
- approval and seal-image governance

Use the operator feature completeness checklist as a release blocker for the control-plane product itself.

## GUI-First Authoring Rule

Resonance should let operators and AI-assisted flows complete ordinary screen design, component selection, property editing, binding, compare, repair, and publish through governed GUI surfaces.

This means the control plane should expose:

- project and scenario selectors
- theme-set and shell/frame selectors
- component palette with slot-profile awareness
- property panels with governed enums and profiles
- event/function/API binding editors
- backend-chain and DB-chain previews
- inline parity, accessibility, security, and missing-asset blockers

Raw source editing may remain for exceptional cases, but standard page and component work should be GUI-completable.

## Full-Stack Pattern Consistency Rule

Resonance should keep generated assets consistent not only visually but across the entire stack.

This means:

- the selected screen family, component family, slot profile, and action layout must match the selected backend-chain family
- the backend-chain family must match the DB object and SQL draft family
- the runtime package must publish these as one explicit pattern set

Parity is not complete if frontend looks uniform but backend, DB, or package assembly patterns drift.

## Installable Module Pattern Rule

Modules added later by AI-assisted request should still be generated with the same governed structural depth and family pattern.

This means:

- each module family should keep one approved module pattern family
- each module family should keep one approved depth profile
- attached modules should declare frontend, backend, DB, SQL, package, and rollback impact consistently

## AI-Assisted Module Intake Rule

New module folders or external module candidates should not be treated as immediate auto-build inputs.

Use this flow instead:

1. register module intake request
2. let an AI agent inspect folder structure, assets, backend impact, DB impact, and CSS impact
3. normalize the candidate into governed module pattern and depth profile
4. review common-versus-runtime ownership
5. approve module attach plan
6. then allow build and runtime package assembly

Resonance should automate:

- intake request registration
- comparison and blocker display
- attach-plan review
- approved build and deploy steps

Resonance should not auto-decide by itself:

- whether a raw module folder is safe to consume as-is
- whether ownership should be common or project-local
- whether CSS conflicts are acceptable
- whether DB impact is safe without review

The control plane should expose explicit request and approval APIs for this flow instead of hiding it in ad hoc scripts.

## Module Selection And Install Rule

When screens or scenario families need optional capabilities, Resonance should let operators select installable modules through governed UI.

Use:

- inline check selection for low-risk ready modules
- install popup review for high-impact modules with dependency, CSS, backend, DB, or rollback implications

Selection results should flow into:

- module bindings
- runtime package matrix
- release-unit blockers

Current reference intake candidates already identified for this workflow:

- `/opt/reference/modules/gnrlogin-4.3.2`
- `/opt/reference/modules/certlogin-4.3.2`

These should be treated as:

- reference sources for common web/security/login behavior
- reference sources for certificate-login extensions
- not direct runtime attachments as-is

## CSS Dedupe And Style Coverage Rule

Resonance should prevent duplicate or missing CSS at release time.

This means:

- module CSS should attach only through governed CSS bundle families
- module CSS should not redefine theme/token or action-layout behavior already owned by approved theme sets
- runtime packages should verify both style presence and style dedupe state before deploy completion

## Approval And Seal Governance Rule

Approval actions and seal-image storage should remain centrally governed common capabilities.

This means:

- approval action bars, approval timelines, and evidence previews should use approved common blocks
- approval state changes should go through common backend approval facades
- seal or stamp images should be stored as governed private file assets with DB metadata, access policy, version trace, and audit events
- runtime systems may use these capabilities, but should not implement their own uncontrolled approval or seal storage logic

Required operator surfaces:

- log-family registry
- live log tail by project, system, server, and release unit
- historical search by correlation keys
- deploy log explorer
- security and audit correlation explorer
- post-deploy smoke checklist result viewer

### Post-Deploy Render, Log, And Scheduler Smoke Rule

After every governed deployment, the operations system should run and record a minimal smoke sequence.

Minimum smoke sequence:

1. verify target process is up
2. verify main route responds
3. verify registered menu-to-page render checks pass
4. verify application and Nginx logs are flowing
5. verify security and audit pipeline is alive
6. verify scheduled jobs or cron families required by the release are registered
7. verify no blocking scheduler or retention failure exists for the project

Required recorded result:

- `smokeRunId`
- `projectId`
- `releaseUnitId`
- `targetServerSet`
- `renderCheckState`
- `logCheckState`
- `schedulerCheckState`
- `auditCheckState`
- `overallState`

Do not mark deployment complete if one of these fails.

## Recommended Immediate Transition Plan

The requested transition is possible, but do it in a controlled order.

### Target Direction

- copy the current Carbonet DB into a dedicated operations-system DB
- run the operations system on the current DB server only after DB ownership has been moved away
- later create a new dedicated Carbonet project DB server again
- install Jenkins and Nomad on the operations-system server
- gradually attach runtime servers to that control plane

Current staged host intent:

- `34.82.141.193`
  - primary `Resonance Control Plane` build and governance host
  - Jenkins, Nomad control, scaffold/build authority
- `136.117.100.221`
  - initial runtime execution host for generated project artifacts
  - receives built jar packages and runs scaffolded runtime outputs

### Safe Transition Order

1. create `COMMON_DB` style operations schema
2. copy current Carbonet governance metadata into the operations DB
3. keep current project DB running separately for business traffic
4. bring up the operations system on `34.82.141.193` against the copied control DB
5. validate:
   - menu registry
   - page registry
   - feature registry
   - audit and trace
   - deploy metadata
6. install Jenkins and Nomad on `34.82.141.193`
7. generate scaffold outputs and build runtime jars from the operations system first
8. deploy the generated jar packages to `136.117.100.221`
9. validate runtime execution, restart macros, and DB connectivity on `136.117.100.221`
10. then repurpose the current DB server as the operations server only after project DB runtime is relocated when that later transition is required

### Initial DB Attachment And Later DB Server Split Rule

Resonance should support this phased rollout:

1. operations system on `34.82.141.193` uses its local control-plane DB
2. deployed general systems on `136.117.100.221` attach to a copied or newly attached project DB target
3. later, when a dedicated project DB server is prepared, `136.117.100.221` switches to that DB server
4. the control plane keeps tracking current DB attachment target, migration level, and rollback target per project unit

This allows:

- early runtime deployment without waiting for the final DB topology
- later DB-server separation without changing the control-plane ownership model
- governed rollback for both runtime package and DB target selection
11. attach web nodes, idle nodes, AI runner nodes, and future file/archive nodes

### Initial Two-Host Delivery Rule

Until more runtime hosts are attached, use this explicit delivery chain:

1. author and approve scaffold inputs in Resonance on `34.82.141.193`
2. build common artifacts and project artifacts on `34.82.141.193`
3. publish release-unit metadata on `34.82.141.193`
4. ship the selected jar package to `136.117.100.221`
5. execute start, stop, restart, and post-deploy verification macros on `136.117.100.221`
6. record deploy result, runtime status, and rollback checkpoint back in Resonance on `34.82.141.193`

Use this rule:

- `34.82.141.193` remains the build and governance authority
- `136.117.100.221` remains a runtime consumer of approved artifacts
- runtime-side source edits should not become the source of truth

### Important Caution

Do not repurpose the current DB server into an operations server before:

- the business DB runtime is moved
- backup and restore are validated
- the control-plane DB copy is verified

## Recommended First Build In This Repository

Use the following full delivery order so the system can be implemented without leaving governance blind spots.

### AI-Parallel Delivery Rule

Resonance should be built in AI-parallel tracks, but only after shared contracts are fixed first.

Use this parallelism rule:

- shared contract work stays in one coordinator track
- screen and UI work may split by bounded feature area
- backend generation work may split by bounded package area
- deploy and topology work may split only after release-unit and runtime contracts are fixed
- docs and verification should stay as an explicit final track, not an afterthought

Recommended AI work tracks:

1. `contract coordinator`
   - scenario-family
   - actor-authority
   - chain-matrix
   - installable-module
   - cron-retention
   - release-unit and compatibility contracts
2. `control-plane backend`
   - common DB schema
   - registry services
   - lifecycle and matrix APIs
3. `control-plane frontend`
   - environment-management
   - matrix dashboards
   - registry screens
4. `screen-builder and scaffold`
   - theme, component, scenario-first wizard
   - structured scaffold generation
5. `deploy and runtime ops`
   - Jenkins, Nomad, Nginx, runtime bindings
6. `observability and governance verification`
   - ELK correlation
   - audit and security verification
   - accessibility and complexity views

Use this merge order:

1. contract coordinator
2. control-plane backend
3. control-plane frontend
4. screen-builder and scaffold
5. deploy and runtime ops
6. observability and governance verification

Do not let two AI tracks edit the same shared contract family at the same time.

### Phase 0. Core Contracts First

- finalize scenario-family, actor-authority, chain-matrix, installable-module, and cron-retention schemas
- finalize project and server registry contracts
- finalize release-unit and compatibility result contracts

### Phase 1. Control Plane Foundation

- extend `environment-management` into system and server registry
- add system selection and system lifecycle actions
- add project selection and folder mapping profile management
- add server role binding
- add project topology summary
- map the current `msaManager` tabs into Carbonet menu destinations and avoid building duplicate operator surfaces

### Phase 2. Common-System Separation Enforcement

- enforce `COMMON_DB` versus `PROJECT_DB` split in implementation
- register common module families and project-owned module boundaries
- prevent project-local uncontrolled source reuse
- add project/common ownership markers across resources

### Phase 3. Theme And Component Governance

- add theme registry pages
- bind themes to approved component bundles
- extend screen builder to open with theme-scoped palette

### Phase 4. Scenario And Authority Governance

- add scenario family registry
- add scenario definition registry
- add actor policy registry
- add action-layout registry
- bind scenario and actor policy to every generated page

### Phase 5. Screen Wizard

- create new-screen wizard flow
- require project selection and folder mapping before generation
- require scenario and actor policy before generation
- auto-create menu, page, feature, manifest, and draft schema
- generate controller, service, service impl, VO, DTO, mapper, and mapper XML together when full-stack generation is selected
- support collection of existing screens into managed manifests and ownership metadata
- add change-request and rework flow for published screens
- add delete and deprecate request flow with dependency checks
- integrate with `ScreenCommandCenterServiceImpl`

### Phase 6. Installable Module And Build Governance

- add installable-module registry
- add module version and module binding flows
- add build-first validation and artifact publication contracts
- add release-unit asset matrix screens

### Phase 7. Deploy Console

- extend `codex-request` or adjacent console to:
  - select target system
  - resolve project build profile and common jar versions
  - trigger Jenkins pipeline
  - trigger Nomad or direct deploy
  - record deploy history
  - support rollback

### Phase 8. DB, File, And Retention Operations

- DB binding and backup pages
- file storage node registry
- latest/archive placement policies
- archive movement batch and audit history
- cron and retention governance
- orphan cleanup and delete preview

### Phase 9. Monitoring, Audit, And Complexity Views

- runtime health and pressure dashboards
- ELK correlation and search views
- complexity, ownership, execution, delete, and rollback chain explorers
- file telemetry and relationship routing dashboards
- SLO and error-budget views

### Phase 10. AI And Future Module Waves

- AI provider and model registry
- AI runner node and Ollama governance
- optional blockchain evidence integration
- future cross-repo module fusion intake such as `carbosys`

## Delivery Pace

Build this slowly and in layers.

Recommended pacing rule:

1. do not redesign every admin menu at once
2. absorb one `msaManager` tab family at a time
3. stabilize project/server registry before deploy automation
4. stabilize theme/component registry before mass screen generation
5. collect existing screens before forcing full builder-only creation
6. make delete and change-request flows safe before encouraging broad operator use

## Response Shape For Future Work

When implementing this platform, future tasks should be split as:

- common control-plane schema and backend services
- environment-management console expansion
- screen-builder and theme governance
- deploy and runtime operations
- observability and audit verification

This keeps the platform console coherent instead of spreading operational ownership across unrelated admin pages.
