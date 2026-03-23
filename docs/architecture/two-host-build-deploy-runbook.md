# Two-Host Build And Deploy Runbook

Generated on 2026-03-21 for the Resonance initial runtime rollout track.

## Goal

Define the concrete build-first rollout order where:

- `136.109.238.233` acts as the `Resonance Control Plane`
- `136.117.100.221` acts as the initial runtime consumer

## Project-Unit Rule

Treat each rollout as one governed `project unit` deployment.

Every run should declare:

- `projectId`
- `releaseUnitId`
- `mainServerId`
- `subServerId` when present
- `dbServerId`
- selected common-jar lines
- selected frontend-bundle lines

Do not mix unrelated project units in one deploy execution.

## Host Roles

### `34.82.141.193`

This host is the dedicated DB control target for Carbonet runtime operations.

Owns:

- CUBRID
- CAS / broker
- backup and restore
- DB connectivity checks

It does not own Jenkins, Nomad control, or artifact build authority.

### `136.109.238.233`

Owns:

- scaffold authoring
- design and requirement governance
- Jenkins pipelines
- Nomad control
- release-unit creation
- artifact publication
- deploy result recording

### `136.117.100.221`

Owns:

- runtime package receipt
- start, stop, restart, and post-deploy verification
- runtime health reporting back to Resonance
- project DB attachment and later DB-target switch execution

## Core Rule

Build on `233`. Run on `221`.

Do not treat `221` as a source-of-truth build host.

DB rule:

- `193` is the dedicated project DB target for Carbonet runtime operations
- `221` may initially connect to a copied or newly attached project DB target
- when a dedicated project DB server is added later, `221` should switch to that DB target through a governed release and verification flow

## Runbook

### Step 0. Prepare

Verify on `233`:

- project exists
- scenario and scaffold request are approved
- release-unit draft exists
- target runtime binding points to `221`
- current project DB attachment target is recorded

### Step 1. Build On `233`

Run:

1. scaffold generation
2. common artifact build if required
3. project artifact build
4. release-unit version freeze

Record:

- build artifact id
- artifact checksum
- release-unit id
- selected module and framework lines

### Step 2. Publish Artifact

Publish the built artifact from `233` into the governed artifact registry.

Minimum metadata:

- artifact path
- checksum
- build timestamp
- build host
- release-unit id
- rollback base artifact id

### Step 3. Ship To `221`

Transfer only the approved artifact set to `221`.

Do not transfer:

- mutable build workspace
- draft source files
- ad hoc shell state

### Step 4. Stop And Replace On `221`

Execute the governed macro set:

- `STOP_ONLY`
- package replace or versioned placement
- `START_ONLY`
- `POST_DEPLOY_VERIFY`

Recommended verification:

- process running
- bound port
- health endpoint
- DB connectivity
- log startup success

When the release includes a DB-target switch, verify additionally:

- new DB endpoint binding is present
- runtime can read and write project DB normally
- rollback DB target is still recorded

### Step 5. Record Runtime Result

Write back to Resonance on `233`:

- deploy target
- runtime status
- active artifact version
- verification result
- rollback checkpoint

### Step 6. Rollback If Needed

Rollback only through the release-unit chain:

- select previous approved artifact
- stop current runtime
- restore prior artifact
- restart
- verify
- record rollback result

## Required Checks

Before deploy:

- release unit approved
- artifact checksum recorded
- runtime target approved
- DB migration compatibility confirmed if needed
- server-role readiness verified for main, sub, and DB targets
- main-server smoke path and macro path verified

After deploy:

- health check passes
- runtime port bound
- DB connection verified
- logs show no startup fatal errors
- active artifact version recorded
- main-server current-runtime state recorded as the default runtime truth source
- active DB attachment target recorded for the project unit

## Non-Goals

This runbook does not define:

- later multi-host blue-green or canary rollout
- Nomad multi-allocation runtime balancing
- DB migration DDL details

Those belong in later rollout runbooks.
