# Public Admin Template Line Schema

Generated on 2026-03-21 for Resonance split-surface template reuse.

## Goal

Define reusable template-line contracts so public screens and admin screens can share one project and runtime set while still using separate governed template families.

## Core Rule

One project may contain both:

- public template lines
- admin template lines

These lines should remain separately versioned and reusable.

Admin lines should be explicitly copyable into a new project with only small functional deltas.

## Required Fields

- `templateLineId`
- `projectId`
- `surfaceType`
- `templateLineFamily`
- `templateLineName`
- `copyableYn`
- `reusableYn`
- `shellProfileSet`
- `pageFrameFamilySet`
- `actionLayoutProfileSet`
- `slotProfileSet`
- `componentFamilySet`
- `themeSetId`
- `spacingProfileId`
- `densityProfileId`
- `urlNamespacePrefix`
- `menuTreeBindingId`
- `scenarioFamilySet`
- `pageFamilySet`
- `backendFacadeLineId`
- `approvalState`
- `version`

## Recommended Values

Recommended `surfaceType` values:

- `PUBLIC`
- `ADMIN`

Recommended `templateLineFamily` values:

- `public-line-home`
- `public-line-signin`
- `public-line-01`
- `public-line-board`
- `admin-line-list`
- `admin-line-detail`
- `admin-line-edit`
- `admin-line-02`
- `admin-line-dashboard`

## Rules

- one template line should bind to exactly one `surfaceType`
- public and admin template lines may share one project, one domain, and one runtime host set
- public and admin template lines should still keep separate menu trees and scenario families
- admin template lines should prefer copy-and-adjust reuse rather than ad hoc redesign
- template-line changes should remain traceable through release-unit and parity compare flows

## Use

This schema should be consumed by:

- proposal-mapping draft review
- project scenario and design output generation
- page-design generation
- page-assembly generation
- runtime package matrix
- current runtime compare
