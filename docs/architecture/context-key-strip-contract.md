# Context-Key Strip Contract

## Purpose

Every governed Resonance screen should expose the same identity strip so operators and AI agents can confirm that authoring, compare, repair, package, deploy, security, backend, and scheduler views are all talking about the same target.

See also:

- `docs/architecture/governed-identity-naming-convention.md`

## Required Keys

The context-key strip should show:

- `guidedStateId`
- `templateLineId` or `templateLineSet`
- `screenFamilyRuleId` or `screenFamilyRuleSet`

Recommended companion keys:

- `projectId`
- `scenarioFamilyId`
- `releaseUnitId`
- `runtimeTargetId`
- `ownerLane`

## Required Surfaces

The strip should be visible on:

- proposal mapping draft
- design workspace
- theme-set studio
- asset studio
- screen builder
- runtime package matrix
- deploy console
- current runtime compare
- repair workbench
- backend chain explorer
- security governance
- log and scheduler governance
- module intake and module selection surfaces
- chain and matrix explorer

## Display Rule

The strip should appear before the first main work area and after the page title region.

Recommended visual structure:

- `Guided State`
- `Template Line`
- `Screen Family Rule`
- optional fourth slot for `Release Unit`, `Scenario Family`, or `Owner Lane`

## Governance Rule

- If a screen edits or verifies governed assets, it should not hide the strip.
- If the screen operates on a set instead of a single key, the strip should show a summarized set value.
- Compare and repair surfaces should display both current and target values when they differ.
- If responsibility is split across sessions or teams, `ownerLane` should be visible.
- Handoff-heavy surfaces such as compare, repair, deploy, scheduler, and module intake should favor showing `ownerLane` over less critical companion keys.
- The visible values should follow the governed identity naming convention for guided state, template line, screen family rule, and owner lane.

## Release Rule

Screens that are missing the context-key strip should be considered incomplete for governed delivery.
