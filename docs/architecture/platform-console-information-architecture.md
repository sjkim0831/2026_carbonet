# Platform Console Information Architecture

Generated on 2026-03-15 for the Carbonet platformization track.

See also:

- `docs/architecture/operations-platform-console-architecture.md`
- `docs/architecture/platform-common-module-versioning.md`
- `docs/architecture/common-module-taxonomy.md`

## Goal

Define the main system as the platform console that replaces ad hoc IDE-driven management for common modules, projects, menus, resources, install units, and deployment governance.

## Core Position

The main system is not just another business app.

It is the authoritative platform console for:

- common module governance
- project registration and rollout control
- menu and install-unit lifecycle management
- resource ownership and delete safety
- audit, trace, and change history

This console should be the place where a top-level master account can see and control what used to be scattered across source browsing, IDE search, SQL scripts, and manual deployment notes.

## Primary Guided Flow

The console should present one guided delivery path for operators:

- project selection
- proposal and design intake
- AI mapping review
- inventory and matrix verification
- scenario and design output review
- theme and asset generation
- screen assembly
- runtime package review
- deploy
- compare and repair

## Primary Actors

### `SUPER_MASTER`

Platform-wide authority.

Can manage:

- common platform versions
- project registration and status
- project DB connection metadata
- menu and install-unit policies
- shared resource classification
- delete approval and rollback approval
- compatibility and upgrade gates
- orphan and drift scan execution

### `PROJECT_ADMIN`

Project-scoped authority.

Can manage:

- project-owned menus
- project-owned install units
- project-owned routes, screens, functions, and APIs
- project-owned DB objects within approved boundaries
- project deployment metadata for assigned projects

Cannot override:

- common platform security policy
- common shared-resource ownership
- global delete policy
- platform version publication

### `AUDITOR` or `OPERATOR`

Read-mostly or approval-focused actor.

Can review:

- audit and trace history
- install and delete plans
- drift or orphan findings
- rollout status

## Main Console Areas

### 1. Platform Overview

Shows:

- current common platform version
- deployed project count
- pending install, upgrade, and delete plans
- orphan and drift alerts
- compatibility warnings

### 2. Common Module Management

Shows and manages:

- shared jar or module versions
- `SI_COMMON` and `OPS_COMMON` module groups
- optional security, UI, data, and integration common groups
- compatibility matrix by project
- common contract versions
- installable module registry
- parameter and result contract registry
- security-sensitive dependency updates
- facade and adapter ownership
- common jar lines by framework version
- import-aware upgrade reviews
- project selection matrix for common lines
- optional library and feature-module bundle selection

### 3. Project Registry

Shows and manages:

- `projectId`
- display name
- route prefix or domain
- deployment target
- Java version
- DB driver version
- project module version
- current common-platform version
- common DB linkage status
- project DB migration status
- status and owner
- selected framework line
- selected common jar line
- selected frontend common bundle line
- selected feature module line
- main server, sub server, idle-node participation, and DB server-role bindings
- per-server deploy-readiness state by project unit
- current DB attachment target
- target DB attachment candidate
- DB switch readiness state

### 4. Menu and Install Unit Management

Shows and manages:

- menu tree
- shell item registry for header, menu, utility, and footer areas
- page IDs
- function and permission chain
- route and canonical URL
- package ownership
- selected common modules and versions
- install status
- copy, export, import, upgrade, deprecate, and delete actions
- scenario-linked menu registration
- page, feature, route, and authority chain preview
- common asset and project asset split preview
- backend chain and DB object linkage preview
- release-unit and rollback linkage preview
- menu-to-rendered-screen verification result
- post-deploy menu render check result
- current runtime menu import result
- home/admin menu tree parity status

This area should become the operational root for new feature onboarding.

Runtime systems should consume the results of this area, not expose the same authoring surfaces directly.

### 5. Resource Registry

Shows and manages:

- files
- controllers
- services
- mappers
- XML
- DTOs
- tables
- columns
- indexes
- uploaded asset definitions
- PDFs, downloads, and templates
- page design assets
- element design assets
- page assembly assets

Each resource should expose:

- `ownerScope`
- `usageMode`
- `projectId`
- `packageId`
- dependency count
- last verification result

### 5-A. Design Assembly Governance

Shows and manages:

- page-design registry
- element-design registry
- scenario-step menu binding registry
- page design-guide registry
- component slot-profile registry
- theme-set registry
- page-assembly registry
- reusable versus page-local element decisions
- theme and spacing compatibility checks
- semantic HTML5 layout profile checks
- requirement coverage audit
- missing page or element registration queue
- AI theme-set generation and approval queue
- GUI-first builder readiness status
- property and binding blocker inspector
- module selection popup and dependency review
- module selection checklist result
- module selection apply result
- module selection trace linkage view

### 6. Delete and Rollback Planning

Shows:

- generated delete plan
- dependency order
- shared blockers
- DB drop candidates
- file delete candidates
- rollback checkpoints

Delete execution should start here, not from a simple menu delete button.

### 7. Audit, Trace, and Change History

Shows:

- who changed what
- what package was installed or deleted
- what common version changed
- what project was upgraded
- what delete plan was approved

### 7-A. Product Release And Compatibility

Shows and manages:

- product family and package line
- release-unit asset matrix
- current versus target version comparison
- compatibility check result
- rollback-ready release units
- common jar and frontend bundle selection by project
- scaffold baseline versus packaged artifact version comparison
- attached library and feature-module asset matrix

All release and deploy views should visibly expose:

- current guided-step state
- bound public/admin template line set
- bound screen-family-rule set

### 7-B. Parity And Runtime Compare

Shows and manages:

- generated-result compare
- current-runtime versus generated-runtime compare
- proposal baseline versus current runtime compare
- patch delta compare
- collected current asset versus governed asset compare
- template line current versus target compare
- screen family rule current versus target compare
- guided-step state and blocker compare
- parity score by scenario family
- parity score by page family
- project proposal generation inventory
- project proposal generation matrix
- project scenario output explorer
- project design-output package explorer
- repair candidate list
- menu-to-page render verification status

### 7-BA. UI Uniformity And Repair

Shows and manages:

- screen element statistics dashboard
- page-frame drift dashboard
- shell-profile drift dashboard
- component usage and spacing drift dashboard
- action-layout drift dashboard
- immediate repair queue
- repair result history
- uniformity score by theme family
- uniformity score by page-frame family
- selected screen and selected-element repair instruction editor
- existing governed asset reuse recommendation panel
- missing component-family queue
- missing page-family queue
- requirement-gap repair queue
- slot-profile drift queue
- component family internal-layout compare view

### 7-BB. Chain And Matrix Explorer

Shows and manages:

- project and runtime matrix
- menu and scenario matrix
- page and component matrix
- event/function/API/backend/DB chain matrix
- release-unit asset matrix
- runtime truth and rollout matrix
- delete and rollback blocker matrix
- parity and uniformity matrix
- guided-step, template-line, and screen-family-rule context strip for every matrix pivot

Operators should be able to pivot from any one row to:

- owner
- scenario
- menu
- page
- component family
- backend chain
- DB object set
- release unit
- runtime target
- blocker and repair history
- compare result and repair workbench entry

### 7-C. Backend Chain Explorer

Shows and manages:

- route to controller mapping
- controller to service mapping
- service to mapper mapping
- mapper to SQL and DB object mapping
- backend security and authority bindings
- guided-step, template-line, and screen-family-rule context for the selected backend chain

### 7-D. Proposal Baseline And Patch History

Shows and manages:

- proposal-derived baseline release
- runtime patch history
- per-patch changed asset matrix
- patch rollback targets

### 7-E. Current Runtime Collection And Promotion

Shows and manages:

- current runtime page collection
- current backend chain collection
- current DB object ownership collection
- legacy asset promotion into governed catalogs
- current screen element extraction
- current popup, grid, search, and action-layout extraction
- current backend chain extraction
- reusable asset recommendation for repair or generation
- governed main-server current-state view
- main-server versus target-generated compare
- runtime-admin change visibility based on the main server as the default runtime truth source

These areas are control-plane menus and should not be deployed as ordinary runtime-admin screens.

## Public/Admin Split Governance

Proposal and project-generation surfaces should clearly show:

- public menu tree
- admin menu tree
- public scenario families
- admin scenario families
- reusable admin template line status
- shared project/runtime host set
- split URL namespace status

Operators should be able to confirm that one project can share one runtime set while still producing separate public and admin design lines.

This area should also expose:

- public template line registry
- admin template line registry
- guided step state and next AI action

### 8. Drift and Orphan Control

Shows:

- ownerless resources
- dead references
- manifest drift
- route drift
- DB objects with no current owner
- files or code artifacts missing from registry

### 9. UI Shell And Operator Guidance

Shows and governs:

- current project and system context
- breadcrumb and navigation path
- page-level state such as draft, published, degraded, rollback-ready, or read-only
- help summary and help anchors
- diagnostics and impact preview panels
- sticky bottom action bars for save, publish, approve, reject, and rollback actions
- compare views for draft versus published and current versus target

This area keeps registry, builder, deploy, observability, and policy pages visually and behaviorally aligned.

This shell should prefer an intuitive GUI-first operator experience.

Recommended defaults:

- summary cards before raw tables
- guided step wizards before free-form expert forms
- compare panes for current versus target and draft versus published
- DB object cards for table, column, key, and index review
- explicit help and diagnostics rails
- semantic page-frame and landmark previews for `header`, `nav`, `main`, `section`, and `footer`
- a consistent context-key strip before the first primary work area

Authoring, compare, repair, runtime, and deploy screens should all display the same context-key strip:

- `guidedStateId`
- `templateLineId` or template-line set
- `screenFamilyRuleId` or rule set
- `ownerLane` when responsibility or handoff matters on that surface

Raw JSON, SQL, and shell previews should remain available, but secondary.

### 10. File, Backup, Retention, And Scheduler

Shows and manages:

- file node registry
- hot and archive file placement policy
- backup and restore plans
- retention rules
- cron and scheduler registry
- expired-file and orphan cleanup history
- scheduler dependency graph
- cron execution history
- failed job retry and blocker history
- retention execution result and delete evidence
- main-server cron binding status
- per-system scheduler ownership view
- guided-step, template-line, and screen-family-rule context for scheduler ownership and retention evidence

### 10-A. Log And Operational Search

Shows and manages:

- live log tail
- historical log search
- log-family filters
- release-unit correlated log view
- deploy log artifact links
- ELK or Kibana linked dashboards
- audit and security log correlation panels
- post-deploy smoke verification result
- guided-step, template-line, and screen-family-rule context for deploy-correlated logs

### 10-B. Performance Stack Governance

Shows and manages:

- stack attachment registry
- host-class placement matrix
- memory budget review
- cache and queue health
- stack rollback history
- runtime-node safety gate
- support-node capacity view
- project-level stack attachment eligibility
- attach or detach request history

### 10-D. Module Pattern And Style Governance

Shows and manages:

- AI-assisted module intake queue
- installable module pattern family registry
- module depth profile registry
- CSS dedupe review
- missing-style or duplicate-style queue
- module attach or detach parity view
- module intake analysis history
- attach-plan approval history

### 10-C. Feature Completeness And Gap Closure

Shows and manages:

- operator feature completeness checklist
- missing control-plane screen or API queue
- missing runtime-admin feature queue
- parity blocker inventory
- request-pattern replay coverage
- current gap-to-owner assignment

### 11. AI Agent And Model Governance

Shows and manages:

- provider registry
- model registry
- AI runner nodes
- project bindings
- prompt policy
- execution history

### 12. Common Master, Notification, And Certificate

Shows and manages:

- common master values
- company type and member type
- notification provider and template bundles
- certificate profiles
- secret and rotation status
- approval policy registry
- seal-image profile registry
- approval evidence explorer

## Default Workflow

Recommended platform workflow:

1. register or update project
2. select target project and module boundary
3. define or clone install unit from menu management
4. generate or bind frontend, backend, and DB resources
5. register every resource in the registry
6. run compatibility and ownership verification
7. install or deploy
8. track changes through audit and trace
9. use delete-plan and rollback-plan instead of manual cleanup
10. expose help, comparison, and diagnostic surfaces before publish or destructive execution
11. verify runtime-deployable versus control-plane-only boundaries before packaging

## Boundaries

The platform console should manage metadata, contracts, and lifecycle authority.

The deployed project apps should execute business logic and serve user traffic.

The platform console should retain a stable common DB as its control plane, even when project business data is split into project DBs.

The platform console should not require deployed project apps to fetch live source code from the main system. Shared behavior must come from versioned artifacts, not runtime source pull.

## Recommended First Build In This Repository

1. extend `ScreenCommandCenterServiceImpl` metadata toward package and resource ownership
2. extend the help or command-center admin UI into a platform console panel
3. add project registry and version status views
4. add install-unit lifecycle actions and delete-plan preview
5. add orphan and drift reporting
6. then split common module packaging and project module rollout more aggressively
