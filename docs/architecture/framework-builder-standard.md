# Framework Builder Standard

## Goal

Carbonet front and back must expose one recognizable framework contract so an AI builder can:

- discover page manifests from one registry shape
- discover component catalog entries from one registry shape
- export builder drafts as governed framework artifacts
- treat admin, home, and join as domains on one platform instead of separate products

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
