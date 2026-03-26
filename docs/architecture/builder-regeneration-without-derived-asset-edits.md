# Builder Regeneration Without Derived Asset Edits

## Goal

Define how Carbonet AI builder should keep updating framework outputs without
manually editing the generated frontend, backend, DB, or deploy artifacts.

The core rule is:

- builder logic may evolve
- source design assets may evolve
- approved overlays may evolve
- derived implementation artifacts should be regenerated, not hand-maintained

## Core Principle

Treat generated implementation files as derived assets, not as the primary
system of record.

The durable sources of truth must stay outside the generated files:

1. request and design source contracts
2. governed builder rules and templates
3. approved overlays and extension bindings
4. trace, approval, and publish lineage

Operating ownership split:

- `carbonet-ops` is the builder and control-plane owner
- `carbonet-general` is the generated-output target runtime system
- builder-side configuration belongs in `carbonet-ops`
- generated outputs deployed to `carbonet-general` remain replaceable derived assets

If a change requires editing a generated file directly, that change should be
classified as one of:

- missing builder rule
- missing extension point
- emergency patch outside normal regeneration

Normal product evolution should be handled by updating the builder-side source
layers and regenerating.

This also means:

- do not fix `carbonet-general` by hand-editing generated outputs as the normal workflow
- fix builder rules, builder inputs, overlays, or compatibility policy in `carbonet-ops`
- regenerate and republish to `carbonet-general`

Target output shape:

- generated outputs should be intentionally thin
- common runtime behavior should execute from approved common jars and shared bundles
- page rendering should prefer governed DB or JSON definitions where possible
- generated project files should mostly declare page IDs, authority bindings, route bindings, manifest references, and project-specific deltas
- if a generated file starts owning large reusable behavior, that behavior should be considered for promotion back into common artifacts

## Five-Layer Architecture

### 1. Intent And Source Layer

This is the durable business-authoring layer.

Store:

- project requirement summary
- scenario and workflow definitions
- page design schema
- element design set
- page assembly schema
- authority policy inputs
- menu and route ownership inputs
- theme and template-line selections

Rules:

- free-form AI prompts are not enough on their own
- every accepted instruction must be normalized into governed contracts
- source inputs must remain versioned and replayable

## 2. Builder Rule And Template Layer

This is the durable generation logic layer.

Store:

- builder profiles
- layout and screen-family rules
- component registry policies
- event/function/API binding rules
- code templates
- naming conventions
- validation rules
- migration and compatibility rules between builder versions

Rules:

- this layer is the primary target for framework evolution
- template and rule changes must be versioned
- a builder version must declare which source contract versions it can consume

## 3. Overlay And Extension Layer

This layer captures approved customization that should survive regeneration
without hand-editing derived artifacts.

Store:

- field or section visibility overrides
- approved route exceptions
- authority and feature binding overrides
- theme token overrides
- module attach-plan selections
- extension-slot bindings
- controlled patch specifications

Rules:

- overlays must be declarative
- overlays must attach to stable keys such as `pageId`, `componentId`,
  `instanceKey`, `templateLineId`, and `screenFamilyRuleId`
- overlays must not bypass registry or manifest governance
- if a customization cannot be expressed as overlay data, add a governed
  extension point before allowing manual edits
- all normal customization should be entered through the builder or governed
  overlay flows, not by editing generated artifacts in the target runtime system

## 4. Derived Artifact Layer

This layer is fully regenerable.

Derived artifacts include:

- frontend routes and pages
- component-binding manifests
- controller, service, VO, DTO, mapper drafts
- SQL drafts and migration drafts
- help-anchor and action-layout manifests
- release-unit and runtime package manifests

Rules:

- derived artifacts are disposable and reproducible
- publishable outputs must always be reproducible from layers 1 to 3
- builder upgrades should prefer regeneration over direct patching
- hand-edited derived files create drift and should be treated as governance debt
- `carbonet-general` should be treated as a deployment target for regenerated
  outputs, not as the place where output truth is maintained
- page-level identity and authority should remain explicit even when most runtime
  behavior is delegated to common artifacts

## 5. Verification And Runtime Lineage Layer

This layer proves that regenerated outputs are still valid and traceable.

Store:

- generation run records
- asset trace records
- JSON workspace revision lineage
- publish bindings
- release-unit bindings
- deployment traces
- compare, blocker, repair, and smoke-check results

Rules:

- a regeneration is incomplete without verification
- runtime artifacts must remain traceable back to source, builder version, and
  overlay set
- repair should feed back into layer 2 or layer 3 instead of silently editing
  derived outputs

## Update Modes

The builder should support these modes explicitly:

### New Build

- create the first governed output set from source and rules

### Regenerate

- rebuild derived artifacts from the same source plus updated builder rules

### Upgrade

- apply a builder-version migration path and then regenerate

### Repair

- use compare and blocker outputs to correct source contracts, builder rules, or
  overlays, then regenerate

### Emergency Patch

- allow a temporary runtime fix only with explicit trace and debt registration

Emergency patch is the exception path, not the normal maintenance path.

## Required Storage Separation

To avoid contamination, Carbonet should store these families separately.

### Authoritative Source Storage

- governed request inputs
- design and schema drafts
- authority and route contracts

### Builder Governance Storage

- builder rule packs
- code template packs
- compatibility matrices
- validation profiles

### Overlay Storage

- extension bindings
- override sets
- attach-plan decisions
- approved controlled patches

### Derived Output Storage

- generated code and manifests
- generated SQL and migration payloads
- release packaging outputs

### Trace Storage

- generation lineage
- approval state
- publish and deploy history
- rollback targets

## Non-Contamination Rules

These rules are required if Carbonet wants repeatable, low-drift output.

1. Do not treat chat history as the primary source of truth.
2. Do not rely on prompt wording alone to preserve customization.
3. Do not store user-specific manual edits only inside generated code.
4. Do not allow unmanaged local draft changes to publish directly.
5. Do not let builder upgrades silently reinterpret stable identity keys.
6. Do not allow generated code to become the only copy of business intent.

## Extension-Point Rule

If operators need stable customization without derived-file editing, the builder
must expose explicit extension points such as:

- slot-level layout hooks
- action bar composition hooks
- field visibility and ordering hooks
- authority and feature binding hooks
- API adapter hooks
- theme token hooks
- release-unit packaging hooks

## Execution Checklist

Use this checklist when moving Carbonet from documented regeneration intent to
an enforceable operating model.

1. Persist `builderVersion`, `sourceContractVersion`, and `overlaySchemaVersion`
   in control-plane storage for every generation and compatibility run.
2. Move compatibility-check results from file-backed storage into governed
   control-plane tables and query APIs.
3. Implement overlay precedence and conflict-resolution rules in service code,
   not only in documentation.
4. Add regenerate regression checks that prove `pageId`, `menuCode`,
   `routePath`, and authority bindings remain stable across rebuilds.
5. Enforce generated-output no-hand-edit policy in CI for
   `carbonet-general`-bound derived areas.
6. Record a compatibility matrix between common jar versions and generated
   output manifest versions.
7. Provision real menu, page, feature, and author bindings for
   `screen-builder`, `screen-runtime`, and `current-runtime-compare`.
8. Ensure menu-code bootstrap and authority bootstrap stay aligned for every
   builder-owned admin page.
9. Block publish when the thin-output minimum unit is incomplete:
   `pageId`, authority binding, schema reference, manifest binding, and lineage.
10. Wire a `compare -> blocker -> repair -> recheck` loop so regeneration
    failures produce governed repair input rather than direct output edits.
11. Fix the publish boundary between `carbonet-ops` and `carbonet-general`
    around explicit `release unit` packages.
12. Compute impact automatically when common jars or shared bundles change.
13. Add a governance rule that promotes duplicated generated behavior back into
    common artifacts.
14. Prove one real screen can be created, updated, and republished using only
    builder-side configuration and overlays.
15. Show builder version, overlay set, compatibility verdict, and publish
    readiness in operator-facing control-plane UI.

## Priority Order

Close the execution checklist in this order:

1. backend control-plane persistence and mapper binding
2. regenerate parity and repair automation
3. common-jar plus release-unit deployment enforcement
4. one end-to-end builder-only regeneration proof

## Additional Blind Spots

These items are easy to miss even after the main checklist is done:

1. deterministic generation ordering must be fixed so the same source package
   produces the same output file ordering, identifiers, and manifests
2. rollback must restore builder version, overlay set, release-unit binding, and
   runtime package together instead of rolling back only code files
3. secrets and environment-specific values must never leak into generated
   artifacts and should stay in runtime configuration or secret stores
4. partial publish must be governed so one page or one package cannot drift away
   from the compatibility verdict of the release unit it belongs to
5. emergency patches need explicit expiry and debt tracking so temporary runtime
   fixes do not become hidden permanent forks
6. generated-output delete or cleanup should check lineage and ownership before
   removing files, bundles, or DB artifacts
7. cross-project contamination must be blocked so one project's overlays,
   schemas, or authority bindings cannot be reused accidentally by another
   target runtime
8. builder-side test fixtures and golden outputs should be versioned, otherwise
   regeneration quality drifts without obvious production failures

A missing extension point should be fixed in the builder, not worked around by
editing generated artifacts forever.

## Carbonet Mapping

This model should align with existing Carbonet contracts:

- source contracts:
  - `docs/architecture/page-design-schema.md`
  - `docs/architecture/element-design-set-schema.md`
  - `docs/architecture/page-assembly-schema.md`
- builder contract:
  - `docs/architecture/framework-builder-standard.md`
- overlay contract:
  - `docs/architecture/builder-overlay-schema-and-governance-contract.md`
- version compatibility contract:
  - `docs/architecture/builder-version-compatibility-and-upgrade-contract.md`
- trace and release lineage:
  - `docs/architecture/generation-trace-and-release-governance-contract.md`
- builder surface:
  - `docs/architecture/admin-screen-builder-architecture.md`

## Recommended Runtime Policy

Default policy should be:

- source and overlay editable
- builder rules versioned
- derived outputs regenerable
- publish guarded by verification
- target runtime systems consume regenerated outputs only
- all normal output settings are controlled in the builder side
- runtime hotfixes allowed only as traced exceptions

## Practical Completion Criteria

Carbonet can claim this model is working when:

1. the same source package can regenerate the same governed outputs
2. builder version upgrades can replay old sources through compatibility rules
3. approved customization survives regeneration through overlays
4. compare or repair findings feed back into builder or overlay layers
5. generated artifacts can be replaced without losing business intent

## Short Verdict

Yes, Carbonet can keep updating outputs by modifying the builder instead of the
generated artifacts, but only if:

- source contracts stay authoritative
- overlays stay declarative
- derived outputs stay disposable
- lineage and verification stay mandatory
