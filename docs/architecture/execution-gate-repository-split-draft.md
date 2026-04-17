# Execution Gate Repository Split Draft

Generated on 2026-04-16 for Carbonet gate-first common/project separation.

## Goal

Translate the updated boundary rules into a concrete repository and module shape that enforces:

- `project-runtime -> stable execution gate -> common-core`
- `operations-console -> stable execution gate -> common-core`
- no direct execution from project or operations screens into common internals

This draft is for the current Carbonet repository state, not an abstract greenfield design.

## Current Repository Reality

The repository already contains the first runtime split signal:

- `projects/carbonet-runtime`
- `projects/carbonet-adapter`
- multiple `modules/common-*`
- `modules/platform-runtime-control`

But the separation is still incomplete because:

- many modules still compile from the shared root `src/main/java`
- the executable app still assembles from the shared root plus selected modules
- there is no dedicated `stable execution gate` module yet
- admin and operations controllers still live beside project/admin controllers in the shared source tree

That means the repository has module names for separation, but not yet a hard execution boundary.

## Target Ownership Lanes

Use these five lanes as the canonical model.

### `common-core`

Owns:

- common business framework internals
- shared validation, orchestration, compare, repair, audit, and bootstrap internals
- version-specific helpers and compatibility absorption
- internal service composition

Does not expose itself directly to:

- project controllers
- project runtime services
- operations/admin pages

### `stable-gate`

Owns:

- stable execution gate interfaces
- gate DTO contracts
- request and response envelopes
- gate version metadata
- configuration-backed routing from gate request to internal executor line

This is the only public execution surface for common behavior.

### `adapter-impl`

Owns:

- project adapter implementations
- project menu and route binding
- project authority narrowing
- project DB and integration translation
- project-to-gate request construction

This layer stays thin and must not become a second common-core.

### `project-runtime`

Owns:

- project controllers and runtime entrypoints
- project pages and APIs
- project business rules
- project DB semantics

This layer may call:

- project services
- project adapters
- stable gates

This layer must not call:

- common-core internals directly
- framework-version-specific helpers directly

### `operations-console`

Owns:

- central operator screens
- rollout, deploy, compatibility, runtime control, and governance entrypoints
- operations bootstrap payload assembly

This layer must also execute through the same stable gate family, not through private common services.

## Recommended Repository Shape

The clean target shape is:

1. `modules/common-core`
2. `modules/stable-execution-gate`
3. `projects/carbonet-adapter-impl`
4. `projects/carbonet-runtime`
5. `apps/operations-console`
6. `apps/carbonet-app`

Recommended interpretation:

- `apps/carbonet-app` remains the transitional assembled app
- `apps/operations-console` becomes the dedicated operator assembly later
- `projects/carbonet-runtime` stays the project-owned runtime
- `projects/carbonet-adapter-impl` is the project-owned bridge to the gate

## Independent Project Runtime Feasibility

Yes, later independent project packaging and separate boot are realistic if the split keeps the gate rule strict.

Required conditions:

1. `project-runtime` depends on `stable-execution-gate`, not on `common-core` internals
2. project-specific binding stays in `adapter-impl`
3. each runnable app assembles its own datasource, config, and menu binding
4. operations-console remains optional and does not own project runtime boot
5. shared contracts stay in versioned jars, not in copied source slices

That means a future new project can be created by:

1. creating a thin project runtime package
2. attaching the approved adapter implementation
3. selecting shared common artifacts by version
4. binding project DB/config/theme/menu
5. booting as its own app

What still blocks full independent boot today:

- root `src/main/java` is still shared by too many lanes
- `apps/carbonet-app` still assembles mixed runtime plus operations code
- project DB and common DB ownership is not fully separated
- some controllers and support classes still live in the transitional shared tree

So the answer is:

- `gate-first split` makes later independent project boot feasible
- it does not guarantee it yet until packaging, source placement, and DB ownership are also separated

## Mapping From Current Modules

### Keep as common-owned base or fold into `common-core`

- `modules/common-auth`
- `modules/common-admin-runtime`
- `modules/common-content-runtime`
- `modules/common-payment`
- `modules/screenbuilder-core`
- common portions of `modules/platform-runtime-control`

### Recast as stable boundary material

- `modules/platform-request-contracts`
- `modules/platform-service-contracts`

These should stop being only generic contract jars and become the home of:

- gate DTOs
- gate request keys
- gate result envelopes
- `executionGateVersion`
- compatibility classification

If the current names become misleading, create `modules/stable-execution-gate` and move the public execution surface there.

### Keep as project adapter territory

- `projects/carbonet-adapter`
- `modules/screenbuilder-carbonet-adapter`
- project-specific binding code now mixed under shared controllers and services

Recommended rename target later:

- `projects/carbonet-adapter-impl`

### Keep as project runtime territory

- `projects/carbonet-runtime`
- project business controllers and services now under `src/main/java/egovframework/com/feature/**`

### Keep as operations-console territory

- operations and control-plane web entrypoints now under:
  - `egovframework/com/platform/runtimecontrol/web`
  - `egovframework/com/platform/codex/web`
  - `egovframework/com/platform/workbench/web`
  - `egovframework/com/platform/observability/web`

These should not remain mixed indefinitely with project/admin runtime entrypoints.

## Gate Contract Rule

Every common execution surface should be published through a stable gate contract.

Minimum gate families:

1. `BootstrapExecutionGate`
2. `MenuResolutionGate`
3. `RuntimeControlGate`
4. `OperationsActionGate`
5. `ScreenBuilderExecutionGate`

Each gate contract should define:

- stable request DTO
- stable response DTO
- `executionGateVersion`
- capability key set
- actor scope
- route scope
- audit contract

Do not leak:

- internal common service types
- internal mapper DTOs
- framework helper classes
- project-only request objects

## Configuration-Backed Registry Rule

Do not route gate behavior with controller-level `if` branches.

Use one configuration-backed registry per gate family:

- route or requested-path to gate binding
- feature key to executor binding
- project id to adapter binding
- operations action to common-core executor binding
- gate version to compatibility adapter binding

This is the seam that prevents a framework upgrade from becoming a 200-module rewrite.

## Current Codebase Risks To Remove First

### Risk 1. Shared source-tree compilation

Current modules such as `common-auth` and `platform-runtime-control` still compile slices from the root `src/main/java`.

Risk:

- ownership looks separated in Maven, but code placement still invites direct cross-calls

First fix:

- create module-local source directories for new gate and adapter code
- stop adding new shared-root classes for cross-boundary behavior

### Risk 2. Operations web and project/admin web mixed together

Current platform web entrypoints and admin/project controllers still coexist under the same root package tree.

Risk:

- operators and project admin flows can bypass the same stable gate rule in different ways

First fix:

- classify each controller by `PROJECT_RUNTIME`, `OPERATIONS_CONSOLE`, or `MIXED_TRANSITION`
- move new operations endpoints behind a dedicated gate-facing service first

### Risk 3. No explicit stable gate artifact

Risk:

- project code will keep importing whichever common service is convenient

First fix:

- add a dedicated gate artifact and make adapter/runtime depend on it instead of directly importing expanding common internals

## Phase Plan

### Phase 0. Freeze New Bypass Calls

Immediately enforce:

- no new `project/runtime -> common internal service` calls
- no new `operations page -> common internal service` calls
- no new version-specific helper imports outside common-core

### Phase 1. Introduce `stable-execution-gate`

Create one dedicated module for:

- gate interfaces
- gate DTOs
- gate registry contracts
- gate version metadata

Move the first public surfaces there:

- bootstrap resolution
- runtime control actions
- operations payload execution

### Phase 2. Move Callers To Gate

Refactor:

- project runtime callers
- admin/project controllers
- operations console controllers

so they call:

- adapter -> gate
- operations web -> gate

instead of calling common internals directly.

### Phase 3. Move Executors Behind Gate

Move common implementations behind internal executors:

- common-core internal services
- version absorbers
- compatibility wrappers

The caller should know only the gate contract.

### Phase 4. Split App Assemblies

After gate usage is stable:

- keep `apps/carbonet-app` as project runtime assembly
- add `apps/operations-console` for operator assembly
- keep shared UI/components where useful, but separate route scope and packaging

## First Concrete Migration Batch

Start with these areas because they already represent execution and bootstrap boundaries:

1. admin/home bootstrap and menu resolution
2. runtime control APIs
3. Codex and workbench operations endpoints
4. shared admin shell bootstrap payload assembly

These areas should prove the rule:

- same UI family is allowed
- same internal execution path is not

## Definition Of Done

This split is not complete until all of these are true:

- project runtime imports stable gate contracts, not expanding common internals
- operations console imports stable gate contracts, not expanding common internals
- common-core may change behind the gate without project rewrite
- gate version is explicit and recorded
- route bootstrap and menu execution are registry-backed
- new module code lands in module-local source trees, not only in shared root source

## Immediate Next Repository Actions

1. Add `modules/stable-execution-gate` to the root Maven reactor.
2. Define the first gate DTOs for bootstrap, menu, and runtime-control execution.
3. Repoint one existing caller path from direct internal service usage to the new gate.
4. Add a controller classification table for `PROJECT_RUNTIME` vs `OPERATIONS_CONSOLE`.
5. Stop adding new cross-boundary logic under the shared root `src/main/java` unless it is temporary compatibility glue.
