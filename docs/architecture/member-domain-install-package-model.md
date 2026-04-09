# Member Domain Install Package Model

Generated on 2026-04-08 for the current system-builder-project-domain split.

## Goal

Define how the member domain should be attached to a generated project as an installable domain package without collapsing:

- system governance
- builder/runtime-common assets
- project binding
- project-owned business execution

This document focuses on:

- member registration
- member detail and edit
- member approval
- company member and company approval adjacencies
- authority-scoped member operations

## Core Position

The member domain should not be delivered as one copied application slice.

Use this layered split:

1. `MEMBER_PROCESS_DEFINITION`
2. `MEMBER_READ_PACKAGE`
3. `MEMBER_PROJECT_BINDING`
4. `MEMBER_PROJECT_EXECUTOR`

This is a concrete specialization of:

- `PROCESS_DEFINITION`
- `PROCESS_BINDING`
- `PROJECT_EXECUTOR`

from:

- `docs/architecture/installable-business-process-package-model.md`

## What Must Stay Separate

### `SYSTEM`

Owns:

- domain package registry
- package version and compatibility matrix
- project attach and detach history
- install validation result
- rollback metadata
- project-to-package binding visibility

The system should know:

- which member package line is attached to which project
- which menus and routes were bound
- which executor capability keys are still unresolved

### `BUILDER`

Owns:

- screen family rules
- page assembly and manifest conventions
- shared component contracts
- package manifests and scaffold-ready output rules

The builder should not own:

- project-specific member save rules
- project-specific approval exceptions
- project-specific external institution integration logic

### `PROJECT`

Owns:

- project member route prefix and menu placement
- project authority group binding
- project table binding
- project-local save/update transaction logic
- project-local external integration logic

## Member Package Layers

### 1. `MEMBER_PROCESS_DEFINITION`

Reusable installable definition.

Typical contents:

- member process manifest
- page family map
- actor and authority checkpoints
- required field contract
- approval state machine
- validator rules
- rollback contract
- event/function/API binding skeleton

Typical screen families:

- `member-list`
- `member-detail`
- `member-register`
- `member-edit`
- `member-approve`
- `company-list`
- `company-detail`
- `company-account`
- `company-approve`

Good candidate outputs:

- menu and route contract
- page manifest baseline
- component registry profile references
- action and modal binding contract
- authority gate contract

### 2. `MEMBER_READ_PACKAGE`

Reusable read-heavy contract and view shape.

Typical contents:

- member search filter contract
- member summary card contract
- approval queue list contract
- authority-scoped member lookup
- company/member relation lookup
- status and badge mapping contract
- file/evidence read contract

Rule:

- prefer `COMMON_READ` or `COMMON_READ_PROJECT_BIND`
- do not mix write-heavy save logic into this layer

Good first reusable reads:

- member list rows
- member detail read model
- member approval review payload
- company approval detail payload
- authority-scoped menu/page payload shell

### 3. `MEMBER_PROJECT_BINDING`

Project attach layer.

Typical contents:

- project menu root binding
- project route base
- project authority role mapping
- project feature-code mapping
- project table or schema binding
- notification/API/theme binding
- project naming and URL policy

This layer should remain thin.

### 4. `MEMBER_PROJECT_EXECUTOR`

Project-owned behavior.

Typical contents:

- member save and update transactions
- approve and reject commands
- password reset side effects
- project-specific duplicate checks
- project-specific institution lookup or sync
- project-specific file persistence rules
- project-specific external identity and certificate links

Rule:

- do not force this layer into common reusable jars unless the rule becomes genuinely stable across projects

## Recommended Package Families

The member area should not be installed as one monolith.

Use these package families first:

### `MEMBER_CORE_READ`

Installable reusable read package.

Scope:

- list/detail/read-only payloads
- status maps
- authority gate display metadata
- approval review read models

### `MEMBER_REGISTRATION_PROCESS`

Installable process definition package.

Scope:

- register flow shape
- required input rules
- review and approval stage contract
- duplicate-check capability declaration

### `MEMBER_APPROVAL_PROCESS`

Installable process definition package.

Scope:

- approve/reject action contract
- reason capture
- audit and rollback visibility

### `MEMBER_ADMIN_BINDING`

Project binding package or project-local adapter set.

Scope:

- menu and route binding
- project authority and table binding
- page payload shell binding

### `MEMBER_EXECUTOR_CAPABILITY`

Project executor line.

Capability examples:

- `member.save`
- `member.approve`
- `member.reject`
- `member.password-reset`
- `member.org-search`
- `member.id-duplicate-check`

## Current Repository Mapping

### Frontend

Current member-related runtime/admin screens include:

- `frontend/src/features/member-list/*`
- `frontend/src/features/member-detail/*`
- `frontend/src/features/member-edit/*`
- `frontend/src/features/member-register/*`
- `frontend/src/features/member-approve/*`
- `frontend/src/features/company-list/*`
- `frontend/src/features/company-detail/*`
- `frontend/src/features/company-account/*`
- `frontend/src/features/company-approve/*`

Shared member UI refactor direction already exists in:

- `docs/frontend/member-management-refactor-plan.md`

That document should be treated as:

- page decomposition and shared UI extraction guidance

This document adds:

- installable domain package ownership

### Backend

Current mixed read-shell candidates:

- `AdminMemberPageModelAssembler`
- `AdminApprovalPageModelAssembler`
- member-management payload assembly paths under admin page services

These should move toward:

- reusable read contract
- project binding shell

Current likely project executor candidates:

- member save/update commands
- approval and reject commands
- company-account mutation commands
- password-reset execution
- institution or org lookup side-effect flows

## Install Flow For A Generated Project

The intended project attach flow is:

1. create project in the system
2. attach builder/runtime-common lines
3. choose `MEMBER_CORE_READ` package
4. choose `MEMBER_REGISTRATION_PROCESS` and optionally `MEMBER_APPROVAL_PROCESS`
5. bind menu root, route prefix, authority roles, feature codes, and table names
6. verify required executor capability keys
7. attach project executors for unresolved capabilities
8. generate or bind project runtime package
9. run compare, validator, and rollback-readiness checks

Reject attach when:

- menu root is not selected
- authority mapping is incomplete
- required table binding is unresolved
- required executor capability keys are missing
- rollback or detach path is not recorded

## Candidate Reusable Read Split

Use this initial split for member domain follow-up refactors.

### `COMMON_READ_PROJECT_BIND`

Best early candidates:

- member list payload shell
- member detail payload shell
- member approval review read payload
- company approval review read payload
- member badge and status dictionary

### `PROJECT_WRITE`

Keep project-owned:

- register save
- edit save
- approve and reject commit
- password reset execution
- project-specific duplicate-check semantics
- project-specific institution/external identity side effects

## Screen Family Ownership

Classify the main member screens like this:

- `member-list`
  - `COMMON_READ_PROJECT_BIND`
- `member-detail`
  - `COMMON_READ_PROJECT_BIND`
- `member-register`
  - screen shell installable, save path project-owned
- `member-edit`
  - screen shell installable, save path project-owned
- `member-approve`
  - read shell reusable, approval commit project-owned
- `company-list`
  - `COMMON_READ_PROJECT_BIND`
- `company-detail`
  - `COMMON_READ_PROJECT_BIND`
- `company-account`
  - screen shell installable, save path project-owned
- `company-approve`
  - read shell reusable, approval commit project-owned

## Success Test

The member domain is installable enough when:

- a generated project can attach the member package line without copying builder or common read internals
- list/detail/review member screens attach through read contracts and project bindings
- save/approve/reset behaviors attach through project executor capability keys
- menu, route, authority, and table bindings are visible in system governance
- rollback and detach visibility exist before the package is considered installable

## Immediate Next Repository Work

1. define a member package manifest example under installable manifests
2. extract member read payload contracts from current admin page assembly paths
3. classify member commands into explicit executor capability keys
4. split member routes and page payload shells into installable screen shell versus project executor responsibilities
5. add project-binding checklist entries for member package attach
