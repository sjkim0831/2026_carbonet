# Resonance AI Track Partition Map

Generated on 2026-03-21 for the Resonance implementation partitioning track.

## Goal

Define a clean execution order and conflict-safe AI work split so the Resonance operations system can be implemented without shared-contract collisions.

## Feasibility

Resonance is implementable with the current architecture.

There is no major design contradiction blocking implementation.

The main risk is not architecture. The main risk is starting feature work before shared contracts are frozen.

## Non-Negotiable Delivery Rule

Do work in this order:

1. freeze contracts
2. implement control-plane backend
3. implement control-plane frontend
4. implement scaffold and builder flows
5. implement deploy and runtime control
6. implement observability and verification

Do not reverse this order.

## AI Tracks

## Multi-Account Session Governance

Resonance parallel development should run through explicit session ownership, not informal concurrent editing.

Use this rule:

- one AI account may own one or more sessions
- one session owns one bounded file family or implementation family
- multiple AI accounts may work at the same time only when their owned families do not overlap
- no two sessions may edit the same shared contract family at the same time
- every session must define `allowedPaths`, `forbiddenPaths`, dependency order, and handoff targets before implementation starts

Minimum session classes:

- `contract session`
- `backend session`
- `frontend session`
- `builder session`
- `deploy session`
- `verification session`

Recommended ownership model:

- account or agent `A`
  - contract coordinator session
- account or agent `B`
  - control-plane backend session
- account or agent `C`
  - control-plane frontend session
- account or agent `D`
  - screen-builder and scaffold session
- account or agent `E`
  - deploy and runtime ops session
- account or agent `F`
  - observability and verification session

If fewer accounts exist:

- one account may own multiple non-conflicting sessions
- contract coordinator ownership must still remain singular

If more accounts exist:

- use the extra accounts for review, verification, or isolated project-specific work
- do not split a shared contract family without an explicit handoff and re-freeze step

### Track 1. Contract Coordinator

Owns:

- scenario-family contracts
- actor-authority contracts
- chain-matrix contracts
- installable-module lifecycle
- cron and retention lifecycle
- release-unit and compatibility contracts

Allowed outputs:

- architecture docs
- schema docs
- contract JSON examples
- shared API contracts

Must finish before:

- scaffold generation
- deploy automation
- matrix dashboards

### Track 2. Control-Plane Backend

Owns:

- common DB schema implementation
- registry services
- lifecycle APIs
- matrix query APIs
- release-unit APIs

Allowed outputs:

- backend schema and service implementation
- mappers
- DTO or VO contracts that follow frozen docs

Depends on:

- Track 1

### Track 3. Control-Plane Frontend

Owns:

- environment-management expansion
- registry screens
- matrix dashboards
- operator menus

Allowed outputs:

- React screens
- admin routing
- screen query clients

Depends on:

- Track 1
- Track 2 API stability

### Track 4. Screen Builder And Scaffold

Owns:

- scenario-first wizard
- theme and component palette
- structured scaffold generation UI
- JSON authoring and publish flow

Allowed outputs:

- screen-builder features
- scaffold payload and preview flows
- generated-file manifest views

Depends on:

- Track 1
- Track 2

### Track 5. Deploy And Runtime Ops

Owns:

- Jenkins integration
- Nomad integration
- Nginx rollout control
- server command, script, and macro execution
- runtime binding and health-check flow

Allowed outputs:

- deploy console
- runtime orchestration APIs
- rollout and rollback actions

Depends on:

- Track 1
- Track 2

### Track 6. Observability And Verification

Owns:

- audit and trace verification
- ELK correlation and search views
- complexity and drift dashboards
- accessibility and security verification surfaces

Allowed outputs:

- verification screens
- dashboard queries
- governance report views

Depends on:

- all prior tracks for final integration

## Merge Order

Use this merge order:

1. Track 1
2. Track 2
3. Track 3
4. Track 4
5. Track 5
6. Track 6

### Parallel Delivery Rule For Multiple AI Agents

When multiple AI agents are assigned, use this split:

- one agent family owns control-plane contracts and frozen schemas
- one agent family owns control-plane backend APIs and DB implementation
- one agent family owns control-plane frontend and operator menus
- one agent family owns screen-builder, scenario-first generation, and selected-screen repair
- one agent family owns deploy/runtime integration and `msaManager` absorption
- one agent family owns observability, parity compare, uniformity statistics, and verification

Do not parallelize these before contract freeze:

- menu/page/feature registration contracts
- common jar line and runtime package contracts
- event/function/API binding contracts
- DB DDL/migration/data-patch/rollback draft contracts

Safe parallelization starts only after:

- Track 1 freezes contracts
- Track 2 publishes stable backend API surfaces

Recommended per-session ownership artifacts:

- `session-ownership.md`
- `allowedPaths`
- `forbiddenPaths`
- `dependsOnTracks`
- `handoffTarget`
- `publishChecklist`

## Conflict Rules

Do not let multiple tracks edit the same family at the same time.

Shared ownership families:

- contract docs
- common DB schema
- release-unit contracts
- screen-builder manifest contracts
- runtime orchestration contracts

If a later track needs a contract change:

1. return the change to Track 1
2. re-freeze the contract

## Tmux Session Operating Note

Use `tmux` sessions as the concrete ownership container for each lane.

Recommended reference:

- [tmux-multi-account-delivery-playbook.md](/opt/projects/carbonet/docs/architecture/tmux-multi-account-delivery-playbook.md)
- [resonance-10-session-assignment.md](/opt/projects/carbonet/docs/ai/80-skills/resonance-10-session-assignment.md)

Each lane should bind one named session to one bounded ownership family before implementation begins.
3. then continue dependent work

If the operator uses wording such as `붙어`, `붙어서`, `이어서 해줘`, `무한 반복`, `무한반복`, or `1분마다 재실행`:

- keep the current track and numbered session attached unless ownership explicitly changes
- interpret numbered attachment wording by `resonance-10-session-assignment.md`
- interpret tmux-lane continuation wording by `tmux-multi-account-delivery-playbook.md`

Additional session rules:

- one session owns one merge queue at a time
- one session should publish a handoff summary before a dependent session begins implementation
- backend and frontend sessions may run together only after Track 1 contracts are frozen
- deploy and verification sessions must use published artifacts and release-unit metadata, not unpublished local state

## Clean Development Sequence

### Step 0. Freeze Shared Contracts

- scenario-family
- actor-policy
- action-layout
- chain-matrix
- installable-module
- cron-retention
- framework-line and module-line selection
- parity-compare and repair contracts
- DB SQL draft and migration review contracts

### Step 1. Build Common Data Model

- `COMMON_DB` schema
- project registry
- module registry
- release-unit registry
- chain and blocker tables

### Step 2. Build Common Backend APIs

- registry CRUD
- scenario and actor APIs
- module binding APIs
- compatibility APIs
- retention and cleanup APIs
- screen selection and selected-element repair APIs
- current-runtime collection and promotion APIs
- menu, page, feature, and common-asset linked registration APIs
- DB DDL, migration, data-patch, and rollback draft APIs

### Step 3. Build Operator Frontend

- system and server registry
- matrix dashboards
- module selection screens
- version binding screens
- parity compare and uniformity dashboards
- selected-screen repair workbench
- menu-linked page and feature authoring flows

### Step 4. Build Scenario-First Wizard

- scenario selection
- actor selection
- theme and component selection
- action layout selection
- scaffold preview

### Step 5. Build Deploy And Runtime Control

- Jenkins trigger
- Nomad trigger
- Nginx switch
- health-check
- rollback

### Step 6. Build Retention And Monitoring

- cron screens
- retention screens
- file telemetry
- DB and runtime dashboards

### Step 7. Build Verification Layer

- audit verification
- security verification
- accessibility verification
- drift and orphan views
- current runtime versus generated-result parity verification
- selected-screen repair replay verification
- menu, page, feature, common-code, backend, and DB chain verification
- DDL, migration, data-patch, and rollback SQL verification

## Success Criteria

Resonance implementation is considered orderly when:

- no page can be generated without scenario and actor policy
- no module can be attached without build and version metadata
- no deploy can happen without release-unit binding
- no cleanup can run without retention ownership
- no rollback is attempted without blocker visibility
- no parallel AI session edits a shared contract family without coordinator handoff
