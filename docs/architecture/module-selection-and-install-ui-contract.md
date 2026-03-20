# Module Selection And Install UI Contract

Generated on 2026-03-21 for Resonance module-selection authoring UX.

## Goal

Define how operators select installable modules during screen, scenario, or project-unit generation.

## Core Rule

Installable modules should be selectable through governed UI, not hidden defaults.

Use two modes:

- quick check selection for low-risk modules
- install popup for modules with dependency, CSS, backend, DB, or rollback impact

## Selection Modes

### 1. Inline Check Mode

Use when:

- the module is already approved
- the module has no unresolved blockers
- the module has no DB or CSS dedupe impact

Required UI:

- checkbox or toggle
- required/recommended/optional label
- current version
- short impact summary
- target template line summary
- target screen family rule summary

### 2. Install Popup Mode

Use when:

- the module has dependencies
- the module changes CSS or style coverage
- the module changes backend or DB
- the module requires rollback review
- the module was recently AI-normalized

Required popup content:

- module family and version
- dependency set
- pattern family and depth profile
- frontend impact
- backend and DB impact
- CSS dedupe and style coverage state
- target template line
- target screen family rule
- runtime package attach preview
- rollback path

## Required States

Each candidate module should show:

- `selectionClass`
  - `REQUIRED`
  - `RECOMMENDED`
  - `OPTIONAL`
- `installReadyYn`
- `dependencyResolvedYn`
- `styleReadyYn`
- `dbImpactReviewedYn`
- `rollbackReadyYn`

## Validation Rules

Do not allow the operator to continue when:

- a required module is not selected
- a selected module still has unresolved dependency blockers
- a selected module has red style dedupe or DB impact status
- the install popup has not been acknowledged for a high-impact module

## Use

This contract should be consumed by:

- scenario wizard
- screen builder
- project-unit build flow
- runtime package matrix
