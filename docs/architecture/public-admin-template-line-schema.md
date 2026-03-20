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

## Theme-Set Binding Contract

Each template line should resolve one approved `themeSetId`.

The binding should follow this minimum crosswalk:

| Template line field | Theme set field | Binding rule |
| --- | --- | --- |
| `themeSetId` | `themeSetId` | exact identity match is required |
| `projectId` | `projectId` | cross-project reuse is not allowed without explicit copy/version |
| `shellProfileSet` | `shellCompositionProfileSet` | every shell profile used by the template line must exist in the selected theme set |
| `pageFrameFamilySet` | `pageFrameFamilySet` | page frame family names must be a subset of the selected theme set |
| `spacingProfileId` | `spacingProfileId` | spacing profile must match exactly |
| `densityProfileId` | `densityProfileId` | density profile must match exactly |
| `componentFamilySet` | `componentCatalogSelection` | component families must be covered by the approved component catalog selection |
| `scenarioFamilySet` | `screenFamilyRuleSet` | every scenario family should resolve an approved screen-family rule in the theme set |

Operationally:

- `PUBLIC` and `ADMIN` lines may point to the same `themeSetId` when shell/frame/component rules are intentionally shared
- `PUBLIC` and `ADMIN` lines should use different `templateLineId` values even when the same `themeSetId` is reused
- when parity review finds admin-only DOM or interaction constraints, keep the same theme set if tokens/layout rules still match; split the template line before splitting the theme set
- create a new theme-set version only when visual direction, token bundle, spacing, density, or approved shell/frame/component rules change
- create a new template-line version when route namespace, menu tree, scenario family, page family, or backend facade binding changes without a visual-system change

## Handoff Checks

Before handoff to implementation or parity lanes, verify:

- selected `themeSetId` exists and is approved for the same `projectId`
- shell, frame, spacing, and density values resolve without fallback
- public/admin split is represented by template-line metadata, not undocumented page-local CSS
- parity-sensitive admin screens inherit approved shell and component families before page-local exceptions are allowed
- custom admin routes such as `observability`, `help-management`, and `sr-workbench` are assigned to a governed page type and action-slot pattern before a new template line is introduced
- KO and EN variants stay on the same template line unless menu namespace, slot composition, or page-family structure truly diverges

## Handoff Ready Condition

`05` and `09` may accept this lane as handoff-ready when:

- at least one approved admin template-line family is mapped for dashboard, list, detail, edit, and policy or workspace page types
- selected `themeSetId` coverage is documented for shell, frame, spacing, density, component family, and scenario family bindings
- custom admin routes and EN variants are classified without leaving any ungoverned visual-system branch
- parity exceptions are limited to documented page-local deltas and do not redefine shared tokens or shell rules

Recommended handoff line:

- `HANDOFF READY: 05 and 09 may continue from template-line/theme-set/parity governance docs; blocker count is 0 for current admin/public split rules.`

## Use

This schema should be consumed by:

- proposal-mapping draft review
- project scenario and design output generation
- page-design generation
- page-assembly generation
- runtime package matrix
- current runtime compare
