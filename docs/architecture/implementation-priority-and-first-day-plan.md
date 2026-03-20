# Implementation Priority And First-Day Plan

Generated on 2026-03-21 after the `01` contract-lane freeze preparation.

## Purpose

This document defines the lowest-risk order for starting real implementation
lanes after the documentation and prototype phase.

It answers:

- which lanes should start first
- which files they should touch first
- what should be considered a good first-day outcome

## Recommended Start Order

Start in this order:

1. `05` frontend runtime and operator UI
2. `06` backend control plane
3. `08` deploy and runtime package
4. `09` verify, compare, and repair
5. `07` DB, SQL, migration, rollback
6. `04` builder and asset studio implementation
7. `10` installable module and common lines
8. `03` theme and design-system implementation details
9. `02` proposal intake implementation details

## Why This Order

### 05 First

`05` should start first because:

- the UI contracts and prototypes are already deep
- it provides visible progress fastest
- it gives `09` real compare targets early
- it forces practical validation of the context-key strip and HTML5 rules

### 06 Second

`06` should start next because:

- repair, compare, module selection, and trace APIs need concrete service boundaries
- `07` depends on stable backend names for SQL and migration drafts

### 08 Third

`08` should start after `05` and `06` have basic artifacts because:

- runtime package assembly depends on both frontend and backend outputs
- deploy and rollout screens become meaningful only when artifact families exist

### 09 Fourth

`09` should start immediately after the first visible outputs exist because:

- compare and repair become valuable only when there is something real to compare
- it protects parity early before drift accumulates

## First-Day Deliverables

### 05 Frontend

Touch first:

- `frontend/src`
- page frame and operator shell families that correspond to:
  - `project-runtime`
  - `deploy-console`
  - `current-runtime-compare`

Good first-day result:

- one governed operator shell
- one runtime page
- one compare page
- context-key strip rendered in React

### 06 Backend

Touch first:

- control-plane controller and service families for:
  - repair open/apply
  - compare request/result
  - module selection result trace

Good first-day result:

- API skeletons compile
- governed identity keys are accepted end-to-end
- no contract fields are renamed

### 08 Deploy

Touch first:

- runtime package assembly docs/scripts
- deploy console backing flow
- release-unit packaging assumptions

Good first-day result:

- one runtime package assembly path documented in code or script
- one deploy status source wired
- one rollback-ready checkpoint path declared

### 09 Verify

Touch first:

- compare/repair UI backing assumptions
- parity blocker model
- smoke and render verification sequence

Good first-day result:

- one compare result model
- one blocker list
- one repair queue path

### 07 DB

Touch first:

- SQL draft families for the first backend APIs that `06` stabilizes
- common/project DB split artifacts

Good first-day result:

- one SQL draft family
- one migration draft
- one rollback draft

## Today-First File Families

If only a few lanes can start today, use this minimum set:

- `05`
  - `frontend/src`
- `06`
  - `src/main/java`
  - `src/main/resources/egovframework/mapper`
- `08`
  - `ops`
- `09`
  - compare and repair supporting docs or code families

## Do Not Start With

Avoid starting with these as the first implementation lane:

- `07` before `06` names service/API families
- `10` before runtime and trace outputs exist
- `02` before frontend and backend lanes can consume the proposal output contracts

## First-Day Success Verdict

The first day is successful if:

- `05`, `06`, `08`, and `09` all move from `READY` or planning into actual implementation
- governed identity keys appear in real code boundaries
- at least one operator flow is visible from UI to API to runtime package trace

See also:

- `docs/architecture/lane-start-instructions-05-06-08-09.md`
- `docs/architecture/lane-start-instructions-07-10-04-03-02.md`
- `docs/architecture/lane-code-start-checklists-05-06-08-09.md`
- `docs/architecture/lane-code-start-checklists-07-10-04-03-02.md`
