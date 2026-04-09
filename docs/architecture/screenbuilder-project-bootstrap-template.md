# Screen Builder Project Bootstrap Template

## Goal

Provide a repeatable path to attach the extracted builder into a new project without copying builder internals.

The target shape is:

- import builder jars
- add one project adapter module
- provide project-specific beans only
- keep builder core untouched

This document assumes the broader product direction in:

- `docs/architecture/installable-builder-upgrade-roadmap.md`

## Bootstrap Shape

Recommended backend module line for a new project:

- `screenbuilder-core`
- optional shared support modules used by the chosen adapter
- `screenbuilder-<project>-adapter`
- `<project>-app`

If the new project follows the Carbonet-style split, the dependency direction should be:

- `<project>-app` -> `screenbuilder-<project>-adapter`
- `screenbuilder-<project>-adapter` -> `screenbuilder-core`

## Minimum Project Adapter Responsibilities

The new project adapter should own:

- menu catalog mapping
- command page lookup
- component registry lookup
- authority contract lookup
- runtime compare bridge
- request-context policy
- menu-binding policy
- artifact naming policy

The adapter may also own:

- compatibility mapper XML
- project-specific route forwarding
- project-specific API response helpers
- compatibility wrappers for old project package paths

## Core-Owned Services The Project Should Not Copy

Do not copy these from builder core into a project module:

- `ScreenBuilderDraftServiceImpl`
- `FrameworkBuilderContractService`
- `FrameworkBuilderCompatibilityService`
- builder model classes under `platform/screenbuilder/model`
- builder contract and compatibility model classes under `framework/builder/model`

## Required Bean Checklist

The project adapter should provide beans for these core ports:

- `ScreenBuilderMenuCatalogPort`
- `ScreenBuilderCommandPagePort`
- `ScreenBuilderComponentRegistryPort`
- `ScreenBuilderAuthorityContractPort`
- `ScreenBuilderRuntimeComparePort`
- `ScreenBuilderMenuBindingPolicyPort`
- `ScreenBuilderArtifactNamingPolicyPort`
- `ScreenBuilderRuntimeComparePolicyPort`
- `ScreenBuilderRequestContextPolicyPort`

The project may keep using core-owned file adapters for:

- `ScreenBuilderDraftStoragePort`
- `ScreenBuilderLegacyRegistrySourcePort`

If the project wants DB-backed draft/history storage instead, replace those two with project-owned adapters.

## Minimal Bootstrap Sequence

1. Add the builder dependencies from `templates/screenbuilder-project-bootstrap/pom-screenbuilder-dependencies.xml`.
2. Copy `templates/screenbuilder-project-bootstrap/application-screenbuilder.properties` into the new project and align the paths.
3. Create a new adapter module from `templates/screenbuilder-project-bootstrap/PROJECT-ADAPTER-CHECKLIST.md`.
4. Implement the required ports with project-specific menu, route, authority, and runtime bindings.
5. Start the app and verify that the builder controllers resolve through the project adapter beans.

## Starter Skeleton

The repository also includes a copyable sample adapter skeleton:

- `templates/screenbuilder-project-bootstrap/sample-project-adapter/pom.xml`
- `templates/screenbuilder-project-bootstrap/sample-project-adapter/README.md`
- `templates/screenbuilder-project-bootstrap/sample-project-adapter/src/main/java/com/example/project/screenbuilder/config/ScreenBuilderProjectAdapterConfiguration.java`
- `templates/screenbuilder-project-bootstrap/sample-project-adapter/src/main/java/com/example/project/screenbuilder/support/impl/*`

This skeleton gives a new project:

- a Spring configuration class
- property-driven policy adapters
- TODO placeholders for project data and runtime integrations

## Manifest And Validator Assets

The repository now also includes:

- `docs/architecture/installable-module-manifest-contract.md`
- `templates/screenbuilder-project-bootstrap/manifests/builder-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/manifests/theme-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/manifests/api-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/manifests/business-process-install-manifest.json`
- `templates/screenbuilder-project-bootstrap/bootstrap-validator-checklist.md`
- `templates/screenbuilder-project-bootstrap/validate-screenbuilder-bootstrap.sh`

These files define the minimum install metadata and the first validator path for the "3-minute bootstrap" goal.

The repository also gates their presence through:

- `ops/scripts/audit-screenbuilder-bootstrap-assets.sh`

## Success Definition

The bootstrap is successful when:

- the project compiles without copying builder core source
- builder menus and routes come from project adapter beans
- draft storage works with project-configured paths or DB adapters
- builder compatibility and contract APIs resolve through project adapter wiring

This is only the builder-bootstrap baseline.
Theme-installable and API-installable upgrades need the broader product work described in `docs/architecture/installable-builder-upgrade-roadmap.md`.

## Current Carbonet Reference

Current reference module line in this repository:

- `modules/screenbuilder-core`
- `modules/carbonet-mapper-infra`
- `modules/carbonet-web-support`
- `modules/carbonet-contract-metadata`
- `modules/carbonet-builder-observability`
- `modules/screenbuilder-carbonet-adapter`
- `apps/carbonet-app`

Use that layout as the working reference, not the old root-only source tree.
