# Builder Productization Pilot Handoff: Screen Builder

## Goal

Freeze the next pilot page family and define the coordinator-owned handoff and closeout criteria only.

This note does not authorize frontend or backend implementation by itself.

For this wave, the target is not structure cleanup.
The target is to make one page family usable enough to satisfy productization closeout.

## Active Pilot Family

- `screen-builder`

## Fixed Pilot Anchor

Use the main pilot anchor page as:

- family: `screen-builder`
- pageId: `screen-builder`
- menuCode: `A1900106`
- canonical route: `/admin/system/screen-builder`
- install scope: `COMMON_DEF_PROJECT_BIND`
- owner path: `frontend/src/features/screen-builder`

## Included Family Surface

The pilot family currently includes these governed pages:

- `screen-builder`
- `screen-runtime`
- `current-runtime-compare`
- `repair-workbench`

The pilot anchor remains `screen-builder`. Do not switch the anchor page in follow-up sessions unless a later coordinator note explicitly does so.

## Family Identity Source

Read the fixed contract from:

- `frontend/src/features/screen-builder/screenBuilderFamily.ts`
- `frontend/src/app/routes/routeCatalog.ts`
- `frontend/src/platform/screen-registry/pageManifests.ts`

## Handoff Rule

Implementation follow-up should use this family only.

The next implementation-facing session may:

- confirm the pilot family stays inside `COMMON_DEF_PROJECT_BIND`
- use the fixed anchor page identity above
- treat `screen-builder` as the primary runtime verification target
- use the family-level compare and repair pages only as supporting pilot evidence surfaces
- work toward satisfying all four closeout lines inside this one family

The next implementation-facing session must not:

- reopen pilot-family selection
- widen scope to another page family in the same turn
- leave another family in half-done pilot state
- downgrade to source-copy delivery as the default install path

## Closeout Gate

The pilot family may only be claimed closed when all of the following remain supportable for `screen-builder`:

1. `CLOSED: page systemization is complete for screen-builder; identity, authority scope, contracts, project binding, validator checks, and runtime verification target are explicit.`
2. `CLOSED: authority scope is consistently applied for screen-builder; menu, entry, query, action, approval, audit, and trace surfaces follow the same governed policy.`
3. `CLOSED: builder install and deploy closeout is complete for screen-builder; install inputs, project bindings, packaging source of truth, runtime target, and evidence surfaces are explicit.`
4. `CLOSED: project binding is explicit for screen-builder; common definition, project binding, and project executor lines are separately traceable.`

## Coordinator Completion Rule

For session 1, coordinator work is complete when:

- the pilot family is named
- the pilot anchor identity is fixed
- handoff scope is bounded to one family
- closeout criteria are linked without reopening implementation

## Closeout

`CLOSED: the next pilot page family is fixed as screen-builder; pageId, menuCode, canonical route, install scope, owner path, handoff scope, and closeout gates are coordinator-owned and explicit.`
