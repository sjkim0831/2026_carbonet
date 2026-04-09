# Framework Builder Standard

## Goal

Carbonet front and back must expose one recognizable framework contract so an AI builder can:

- discover page manifests from one registry shape
- discover component catalog entries from one registry shape
- export builder drafts as governed framework artifacts
- treat admin, home, and join as domains on one platform instead of separate products

Use together with:

- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/system-folder-structure-alignment.md`

Operating ownership split:

- `carbonet-ops` owns builder rules, publish policy, compatibility, and regeneration control
- `carbonet-general` consumes approved generated outputs as the runtime target system

## Canonical Directories

Frontend canonical layer:

- `frontend/src/framework/contracts`
- `frontend/src/framework/registry`
- `frontend/src/framework/api`
- `frontend/src/framework/hooks`
- `frontend/src/framework/index.ts`

Backend canonical layer:
- `modules/screenbuilder-core`
- `modules/screenbuilder-runtime-common-adapter`
- `modules/screenbuilder-carbonet-adapter`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- `modules/carbonet-web-support`

Legacy root framework paths under `src/main/java/egovframework/com/framework/**` should be treated as transitional when equivalent live module ownership exists.

Existing feature folders remain valid. They are implementation folders, not contract folders.

Page standard rule:

- no page should be treated as framework-builder compliant unless its identity, manifest, authority scope, and binding contracts satisfy `page-systemization-minimum-contract.md`

Admin-binding rule:

- request locale, menu semantics, and repository wiring that remain Carbonet-specific should stay behind admin adapters
- framework services should depend on support ports, not admin controller helper logic
- framework API controllers should reuse shared response and error handling support instead of per-controller ad hoc wrappers
- Carbonet adapter implementations should use `Carbonet*Adapter` naming so framework ports and project bindings stay easy to distinguish during module cutover
- framework compatibility row-to-contract mapping should stay in `framework/builder/support` so DB-shape translation does not sprawl across services
- screenbuilder project bindings should follow the same `Carbonet*Adapter` naming rule instead of mixing `Admin*Adapter` and `Carbonet*Adapter`

Canonical shared metadata source:

- `src/main/resources/framework/contracts/framework-contract-metadata.json`

Frontend should consume generated metadata copied from that source:

- `frontend/src/generated/frameworkContractMetadata.json`

Frontend import rule:

- import public framework APIs from `frontend/src/framework`
- import type-only shared contracts from `frontend/src/framework/contracts`
- keep framework-wide fetch and normalization hooks inside `frontend/src/framework/hooks`
- avoid scattering direct imports across multiple sibling files when the barrel already exposes the same contract

Do not hand-edit frontend metadata first. Update the canonical resource and regenerate.

CI or local verification should fail when these two drift:

- `npm --prefix frontend run audit:framework-contract-metadata`
- `npm --prefix frontend run audit:generated-output`

## Contract Rules

Every builder-facing export must resolve through the same top-level contract:

- `frameworkId`
- `frameworkName`
- `contractVersion`
- `source`
- `generatedAt`
- `pages`
- `components`
- `builderProfiles`

Authority contract fields:

- `policyId`
- `frameworkId`
- `contractVersion`
- `generatedAt`
- `authorityRoles`
- `allowedScopePolicies`
- `tierOrder`

Page contract fields:

- `pageId`
- `label`
- `routePath`
- `menuCode`
- `domainCode`
- `layoutVersion`
- `designTokenVersion`
- `componentCount`
- `components[]`

Surface contract fields:

- `componentId`
- `instanceKey`
- `layoutZone`
- `displayOrder`
- `propsSummary[]`
- `conditionalRuleSummary`

Component contract fields:

- `componentId`
- `label`
- `componentType`
- `ownerDomain`
- `status`
- `sourceType`
- `replacementComponentId`
- `designReference`
- `propsSchemaJson`
- `usageCount`
- `routeCount`
- `instanceCount`
- `labels[]`
- `builderReady`

Authority role contract fields:

- `roleKey`
- `authorCode`
- `label`
- `description`
- `tier`
- `actorType`
- `scopePolicy`
- `hierarchyLevel`
- `inherits[]`
- `featureCodes[]`
- `builtIn`
- `builderReady`

## Standard Builder Profiles

Allowed page-frame profiles:

- `dashboard-page`
- `list-page`
- `detail-page`
- `edit-page`
- `builder-page`

Allowed layout zones:

- `header`
- `sidebar`
- `content`
- `footer`
- `actions`

Allowed artifact units:

- `page-manifest`
- `component-registry`
- `screen-builder-draft`

## Source Mapping

Frontend static contract source:

- page registry: `frontend/src/app/screen-registry/pageManifests.ts`
- component catalog: `frontend/src/features/screen-builder/catalog/buttonCatalogCore.ts`
- normalized export: `frontend/src/framework`

Backend runtime contract source:

- page registry: `carbonet-builder-observability` `UiManifestRegistryService` + `UiObservabilityRegistryMapper`
- component registry: `ScreenBuilderDraftService` + `carbonet-builder-observability` `UiObservabilityRegistryMapper`
- normalized API: `/api/admin/framework/builder-contract`
- authority registry: `AuthGroupManageService` + existing author/feature conventions
- normalized API: `/api/admin/framework/authority-contract`

## Builder Output Rule

AI builder outputs should be treated as publishable only if they can be reduced to:

1. page manifest entries
2. approved component registry entries
3. screen-builder draft or published schema
4. authority role policy entries

If an output cannot be expressed through this contract, it is not yet framework-compliant.

Thin output rule:

- generated project outputs should stay as thin as possible
- normal runtime behavior should resolve from approved common jars, shared frontend bundles, and governed registries
- project outputs should primarily carry page identity, route binding, authority binding, manifest data, JSON or DB-backed schema, and project-local business deltas
- repeated shared behavior should move back into common artifacts instead of accumulating inside project output files

## Regeneration Rule

Framework-compliant outputs should also follow the regeneration model in
`docs/architecture/builder-regeneration-without-derived-asset-edits.md`.

In practice this means:

- source contracts remain authoritative
- approved overlays remain declarative
- generated frontend, backend, DB, and deploy artifacts remain derived outputs
- builder evolution should prefer regeneration over hand-editing generated files
- overlay behavior should follow
  `docs/architecture/builder-overlay-schema-and-governance-contract.md`
- builder upgrades should follow
  `docs/architecture/builder-version-compatibility-and-upgrade-contract.md`

Additional fixed rule:

- all normal output configuration should be expressed in builder-controlled inputs, rules, profiles, or overlays
- runtime target systems should receive regenerated outputs rather than hand-maintained generated files

## Enforcement Priorities

Framework standardization is not complete until these enforcement steps exist:

1. builder and compatibility versions are persisted and queryable
2. overlay precedence is executable and deterministic
3. thin-output minimum-unit validation blocks publish when identity, authority,
   schema, manifest, or lineage data is incomplete
4. generated-output direct-edit detection runs in CI
5. common runtime artifact version compatibility is tracked against generated
   outputs
6. operator control-plane UI exposes builder version, overlay set, compatibility
   verdict, and publish readiness

Near-term rollout order:

1. `06` control-plane DB and mapper completion
2. `09` regenerate parity and repair verification
3. `08` common-jar and release-unit deployment closure
4. `05` builder-only regeneration proof on one real page

## Additional Governance Gaps To Watch

Even after the priorities above, the framework is still incomplete if these are
not addressed:

1. generation must stay deterministic across reruns and across operators
2. rollback must restore the same builder, overlay, and release-unit state
3. secrets and environment bindings must stay outside generated outputs
4. partial publish must not bypass release-unit compatibility decisions
5. emergency runtime patches must be tracked, expired, and regenerated away
6. project boundaries must prevent overlay, schema, or authority leakage across
   target systems
