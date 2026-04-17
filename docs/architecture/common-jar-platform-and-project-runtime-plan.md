# Common Jar Platform And Project Runtime Plan

Generated on 2026-04-14 for Carbonet common-jar-first platformization.

## Goal

Make Carbonet support these conditions at the same time:

- split the current single project into `COMMON_RUNTIME` and `PROJECT_RUNTIME`
- let projects boot by including approved common jars
- keep project DB ownership separate from common DB ownership
- keep project deployments independent from each other
- allow new project creation without copying the whole source tree
- allow project screen, menu, and feature growth to continue during the transition
- defer central operations and builder-console separation until later if needed

## Core Position

Yes.

The first irreversible move should be:

1. separate `COMMON_RUNTIME` from `PROJECT_RUNTIME`
2. make project runtimes start with included common jars
3. keep `CONTROL_PLANE` separation optional for the first phase

Do not wait for builder or central operations separation before doing the runtime split.

## Target Runtime Shape

Use four ownership lanes even if they still live in one repository at first:

### `COMMON_RUNTIME`

Versioned reusable runtime delivered as jars or shared bundles.

Owns:

- auth and session framework
- authority framework
- menu, page, feature, and screen registration framework
- common admin runtime shell
- common API contracts
- common payment, notification, file, audit, trace, and integration framework
- builder runtime and theme/runtime composition support
- project creation and screen registration framework behavior

Does not own:

- project business rules
- project-specific table semantics
- project-specific approval rules
- project-specific calculation logic

### `PROJECT_RUNTIME`

Project-owned runtime delivered separately per project.

Owns:

- project business pages
- project business APIs
- project DB behavior
- project approval, calculation, and status-transition logic
- project-local menu exposure
- project-local screen composition choices

### `PROJECT_ADAPTER`

Thin boundary between common runtime and project runtime.

Owns:

- project DB mapping
- project authority narrowing
- project route and menu binding
- project external endpoint selection
- project-specific translation between common contracts and project rules

Does not own:

- growing business logic
- reusable common runtime behavior

### `CONTROL_PLANE`

Central operations and builder management system.

May be separated later.

Owns:

- artifact publication
- project registration
- compatibility matrix
- project-to-server deployment selection
- rollout and rollback governance
- builder governance console
- codex launcher, msaManager, and related operator tooling

## First-Phase Rule

For the first phase:

- `CONTROL_PLANE` may stay inside the same main system
- `COMMON_RUNTIME` and `PROJECT_RUNTIME` should still be split explicitly

This is the safest order because:

- project creation becomes possible earlier
- project-specific screen growth can continue
- common jar growth stays governable before 200-plus framework modules are added

## What Must Be Split Before Adding Many Common Modules

Before expanding the common jar line aggressively, split at minimum:

1. project DB ownership
2. project business services
3. project approval and calculation executors
4. project-specific API integrations
5. project route and menu binding
6. project authority overrides

If those six are still mixed, adding many common modules will deepen coupling instead of improving reuse.

## DB Rule

DB separation is mandatory before large common-jar expansion.

Use these lanes:

### `COMMON_DB`

Stores:

- code definitions
- common menu and page definitions
- feature and authority definitions
- screen and component manifests
- theme and builder definitions
- artifact/version/compatibility metadata
- common operational metadata

### `PROJECT_DB`

Stores:

- project business data
- project workflow state
- project calculation state
- project approvals
- project-local settings
- project-local business logs

### `BINDING_LAYER`

May live as dedicated binding tables or governed project-side binding rows.

Stores:

- which project enables which common screens
- which project binds which menu, route, or theme
- which project uses which common artifact versions
- which project adapter line is active

Rule:

- common runtime must not depend directly on project business table semantics

## What Common Jar Must Support

The common jar platform should support all of these:

- project creation
- menu registration
- screen registration
- page-family runtime support
- theme/runtime composition
- common admin runtime screens
- common payment and integration frameworks
- shared auth, session, authority, trace, and audit behavior

This is acceptable even if builder-related runtime support stays inside common jars.

What may move out later:

- heavy operator-only builder consoles
- high-volume traffic governance console
- externalized security/performance test orchestration
- centralized operations dashboards

## Deployment Rule

Projects must deploy independently from each other.

Use this deployment model:

1. publish new common artifacts
2. choose project target
3. choose adapter target
4. choose project runtime version
5. assemble one governed runtime package
6. deploy only that project

Do not force all projects to move together just because a new common jar exists.

## Central Project Selection Rule

Independent project deployment still allows one central management screen.

Recommended operating model:

1. each project runtime boots separately with the same approved common runtime jar
2. each runtime exposes its own `projectId`, health, and entry metadata
3. the operations or governance screen reads the project registry
4. operators choose a project from one screen and jump to the project route or domain

That means both of these are acceptable:

- one shared common runtime package plus many project runtime processes
- many project runtime processes each already including the common jars

The central screen should not depend on a single process hosting every project at
once.

## Address Branching Rule

Project access may be split by either:

- route prefix such as `/r/P001`
- domain such as `p001.example.com`

The registry must keep these fields per project:

- selector path for the central screen
- route prefix for path-based routing
- external base URL for outside access
- domain host when domain-based routing is used

This keeps project selection, gateway routing, and external handoff aligned.

## K8s Model

Kubernetes is compatible with this plan.

Recommended first model:

- one deployment per project runtime
- project-specific ConfigMap and Secret
- project-specific DB connection values
- common jars included in the built runtime image
- adapter included in the project runtime image

Recommended runtime choice:

- prefer K8s service DNS and environment/config injection first
- do not make Eureka mandatory just because K8s exists

Config and discovery rule:

- projects may use centralized config or discovery
- projects should still be able to start from explicit config values
- handoff should not require a live central discovery system

## Project Addition Rule

New projects should be created from a governed starter template, not from full-source copying.

Minimum new-project assets:

1. `project-runtime` module
2. `project-adapter` module
3. project config profile
4. project DB connection and migration set
5. project menu and route bindings
6. project artifact lock metadata

If a new project requires editing common runtime internals immediately, the common boundary is still too mixed.

## Screen Addition Rule

Project pages and screens may continue to grow during the transition.

Use this rule for each new screen:

- common screen runtime behavior -> `COMMON_RUNTIME`
- project menu exposure -> `PROJECT_ADAPTER` or project binding
- project business save/calculate/approval logic -> `PROJECT_RUNTIME`

Do not block project delivery just because the full platform split is unfinished.

## Common Version And Project Version Rule

When a modification request arrives:

1. inspect the project's current common artifact lock
2. decide whether to keep that common version or upgrade
3. implement the project change against the chosen common version
4. record the resulting release unit
5. deploy only that project's runtime package

Default policy:

- common artifacts may move faster
- project deployments stay selective
- project versions remain independently deployable

## Recommended Repo Shape

Use one repository first if that keeps delivery practical, but make the boundaries explicit.

Recommended shape:

```text
/apps
  /runtime-assembly
  /control-plane

/modules
  /common-core
  /common-auth
  /common-admin-runtime
  /common-builder-runtime
  /common-payment
  /common-integration

/projects
  /project-template
  /project-template-adapter
  /carbonet-runtime
  /carbonet-adapter
```

Current repository starter pair:

- `projects/project-template`
- `projects/project-template-adapter`

Current deployable reference pair:

- `projects/carbonet-runtime`
- `projects/carbonet-adapter`

Rule:

- repository may be shared
- build artifacts must be separated
- deployment selection must be separated

## What To Do Now

Recommended immediate order:

1. classify current code into `COMMON_RUNTIME`, `PROJECT_RUNTIME`, `PROJECT_ADAPTER`, and `CONTROL_PLANE_LATER`
2. classify DB objects into `COMMON_DB`, `PROJECT_DB`, and `BINDING_LAYER`
3. split project business services from common candidates
4. define starter-template structure for new projects
5. define common jar lines before adding many standard framework modules
6. only then expand common jars aggressively

Use `docs/architecture/carbonet-runtime-split-classification-matrix.md` as the first working classification registry for current Carbonet route families and DB lanes.

## Practical Conclusion

For the current Carbonet direction:

- split runtime first
- delay central-console extraction if needed
- keep builder runtime inside common jars if that speeds delivery
- keep project deployments independent
- keep DB ownership explicit
- let common jars evolve
- let projects remain thin, selective, and independently deployable
