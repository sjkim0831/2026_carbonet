# Generated Output Minimum Unit Contract

## Goal

Define the minimum publishable unit for Carbonet generated outputs.

This contract exists so generated outputs stay:

- thin
- reproducible
- authority-governed
- JSON or DB driven where possible
- traceable by stable page identity

## Core Rule

The minimum publishable output unit is not a large page source tree.

The minimum governed output unit is:

1. stable `pageId`
2. authority or feature binding
3. JSON or DB-backed schema reference
4. route and manifest binding
5. trace and release lineage

If one of these is missing, the page is not considered a complete governed
generated output.

## Minimum Unit Fields

Every publishable generated page should resolve the following fields:

- `projectId`
- `pageId`
- `menuCode`
- `routePath`
- `screenFamilyRuleId`
- `templateLineId`
- `guidedStateId`
- `authorityBinding`
- `schemaSourceType`
- `schemaSourceRef`
- `manifestVersion`
- `releaseUnitId`

## Required Meanings

### `pageId`

The stable page identity.

Rules:

- must stay stable across regeneration
- must be the main join key across route, manifest, authority, help, compare,
  and release trace
- must not be inferred only from file name

### `authorityBinding`

The page-level authority or feature policy binding.

Allowed forms:

- author-group binding
- feature-code binding
- actor-policy binding
- controlled combined binding

Rules:

- every generated page must have explicit authority metadata
- authority must resolve from governed metadata, not ad hoc page-local code
- runtime permission checks should prefer common-platform helpers over page-local
  custom logic

### `schemaSourceType`

Defines where the page structure or binding definition comes from.

Allowed values:

- `JSON_WORKSPACE`
- `DB_SCHEMA`
- `JSON_AND_DB`

Rules:

- generated pages should prefer DB or JSON-backed definitions
- page-local hard-coded structure should be the exception path
- if no governed schema source exists, publish is incomplete

### `schemaSourceRef`

Pointer to the governed schema source.

Examples:

- JSON workspace revision ID
- screen definition ID
- schema registry ID
- page assembly ID

### `route and manifest binding`

The page must bind into:

- route registry
- page manifest
- help or component registry when applicable

Rules:

- page route without manifest is incomplete
- manifest without route is incomplete
- component instance keys and help anchors should stay aligned where required

### `trace and release lineage`

The page must be releasable and explainable.

Required lineage:

- generation run
- source contract version
- overlay set if used
- release unit binding

## Thin Output Rule

Generated outputs should remain intentionally thin.

What belongs in the generated output:

- page ID and route registration
- authority binding metadata
- JSON or DB schema references
- manifest entries
- project-specific deltas
- thin adapters to common runtime helpers

What should stay outside generated output:

- reusable authority logic
- reusable rendering engines
- reusable trace logic
- reusable API client plumbing
- reusable component runtime behavior
- reusable shell and theme mechanics

Those belong in common jars, common bundles, or governed runtime layers.

## Publish Checklist

Every publishable generated page should satisfy:

- page has stable `pageId`
- page has explicit authority binding
- page has governed schema source reference
- page is present in route registry
- page is present in page manifest
- page lineage resolves to release unit

## Non-Goals

This contract does not require:

- every page to have zero custom code
- every schema to live in DB only
- every project delta to move into common code immediately

It does require that the common case stay governed, thin, and replayable.

## Carbonet Mapping

Use with:

- `docs/architecture/framework-builder-standard.md`
- `docs/architecture/builder-regeneration-without-derived-asset-edits.md`
- `docs/architecture/generation-trace-and-release-governance-contract.md`
- `docs/architecture/platform-common-module-versioning.md`
