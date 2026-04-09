# Installable Module Manifest Contract

## Goal

Define the minimum manifest shape required to treat builder, theme, and API packages as installable modules instead of loose source/code bundles.

This contract supports:

- `3-minute new-project bootstrap`
- version-pinned upgrades
- compatibility checks before install
- governed bind, validate, rollback, and upgrade flows

## Manifest Families

Every installable module must declare a manifest family:

- `builder-package`
- `theme-package`
- `api-package`
- `business-process-package`

## Common Required Fields

Every installable module manifest must contain:

- `manifestVersion`
- `moduleType`
- `moduleId`
- `moduleVersion`
- `displayName`
- `installScope`
- `compatibility`
- `requiredBindings`
- `artifacts`
- `validatorChecks`
- `rollback`

## Common Field Rules

### `manifestVersion`

Use an explicit contract version such as `1.0`.

### `moduleType`

Allowed values:

- `builder-package`
- `theme-package`
- `api-package`
- `business-process-package`

### `installScope`

Allowed values:

- `COMMON`
- `PROJECT`
- `PROJECT_BIND`

### `compatibility`

Must declare at minimum:

- supported core or runtime version range
- required adapter capability keys
- blocking compatibility checks

### `requiredBindings`

Declare the project/runtime bindings that must exist before installation succeeds.

Typical examples:

- `projectId`
- `menuRoot`
- `routeBase`
- `authorityProfile`
- `themeBinding`
- `apiNamespace`

### `artifacts`

Declare the installable assets that the module contributes.

Typical examples:

- `jar`
- `bundle`
- `mapperXml`
- `themeAssets`
- `apiSpec`
- `pageManifest`

### `validatorChecks`

Declare the checks that must pass before install/upgrade.

Typical examples:

- required beans present
- required properties present
- storage writable
- menu root resolvable
- compatibility range satisfied
- routes/controllers exposed

### `rollback`

Declare at minimum:

- rollback support flag
- rollback unit id
- rollback artifact set

## Builder Package Requirements

A `builder-package` manifest must also declare:

- `coreArtifacts`
- `adapterArtifacts`
- `requiredPorts`
- `bootstrapDefaults`

## Theme Package Requirements

A `theme-package` manifest must also declare:

- `themeTokens`
- `pageFrameOverrides`
- `componentOverrides`
- `ownershipLane`
- `projectBindingMode`
- `componentOverrideGroups`
- `bindingTargets`
- `previewAssets`

Theme packages may contain many component overrides.
That is acceptable if they stay in the presentation lane.

Theme packages must not own:

- project business DTOs
- project service logic
- project DB transactions
- project-specific controller behavior

Theme packages should own:

- token systems
- frame and slot variants
- component appearance overrides
- preview assets
- theme-local composition presets
- folder/package-oriented design assets that can be copied and modified

Theme packages may be copied as folder units and edited as a new theme variant.
That is acceptable if the folder remains presentation-only and the install lifecycle still runs by manifest.

## API Package Requirements

A `api-package` manifest must also declare:

- `apiContracts`
- `authScopes`
- `requestSchemas`
- `responseSchemas`

## Business Process Package Requirements

A `business-process-package` manifest must also declare:

- `processStages`
- `stateTransitions`
- `executorCapabilities`
- `screenPackageDependencies`
- `processBindings`

Business process packages should own:

- process definition
- stage and transition contracts
- validator and rollback rules
- read-heavy workflow screen dependencies

Business process packages must not own:

- project-only transaction logic
- project-only calculations
- project-only external integration side effects

## Success Definition

An installable module is not complete until:

- its manifest exists
- its validator checks exist
- its rollback metadata exists
- its admin screens operate on the manifest-driven lifecycle rather than placeholder UI
