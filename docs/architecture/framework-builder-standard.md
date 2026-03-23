# Framework Builder Standard

## Goal

Carbonet front and back must expose one recognizable framework contract so an AI builder can:

- discover page manifests from one registry shape
- discover component catalog entries from one registry shape
- export builder drafts as governed framework artifacts
- treat admin, home, and join as domains on one platform instead of separate products

Operating ownership split:

- `carbonet-ops` owns builder rules, publish policy, compatibility, and regeneration control
- `carbonet-general` consumes approved generated outputs as the runtime target system

## Canonical Directories

Frontend canonical layer:

- `frontend/src/framework/contracts`
- `frontend/src/framework/registry`
- `frontend/src/framework/api`

Backend canonical layer:

- `src/main/java/egovframework/com/framework/builder/model`
- `src/main/java/egovframework/com/framework/builder/service`
- `src/main/java/egovframework/com/framework/builder/web`
- `src/main/java/egovframework/com/framework/authority/model`
- `src/main/java/egovframework/com/framework/authority/service`
- `src/main/java/egovframework/com/framework/authority/web`

Existing feature folders remain valid. They are implementation folders, not contract folders.

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

- page registry: `UiManifestRegistryService` + `ObservabilityMapper`
- component registry: `ScreenBuilderDraftService` + `ObservabilityMapper`
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
