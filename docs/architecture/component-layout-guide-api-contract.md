# Component Layout Guide API Contract

Generated on 2026-03-21 for Resonance component-placement automation.

## Goal

Define the APIs and rules that let Resonance generate page layouts automatically
from approved component placement guides.

## Core Rule

Component placement should not depend on freehand layout decisions.

The operations system should expose governed layout-guide APIs so AI or builder
automation can:

- resolve the correct page zone
- resolve the correct slot profile
- resolve section order
- resolve action placement
- resolve which component family is allowed where

## Required API Families

### 1. `layout-guide/page`

Return the page-level guide for one page family or one scenario step.

Required request fields:

- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageFamily`
- `themeSetId`

Required response fields:

- `pageFrameId`
- `shellProfileId`
- `sectionGuideSet`
- `actionLayoutProfileId`
- `slotProfileSet`
- `allowedComponentFamilySet`

### 2. `layout-guide/component-placement`

Return the approved placement rule for one component family.

Required request fields:

- `projectId`
- `componentFamilyId`
- `pageZone`
- `themeSetId`

Required response fields:

- `slotProfileId`
- `allowedSectionSet`
- `placementOrder`
- `spacingProfileId`
- `densityProfileId`
- `interactionGuideId`

### 3. `layout-guide/auto-compose`

Return one guided placement plan for automatic screen generation.

Required request fields:

- `projectId`
- `scenarioId`
- `pageDesignId`
- `selectedComponentFamilySet`

Required response fields:

- `pageAssemblyPlan`
- `sectionPlacementSet`
- `componentPlacementSet`
- `actionPlacementSet`
- `blockerSet`

## Rules

- auto-generated screen layout must use approved slot and section guides
- a component may not be placed in a zone that is not allowed by the guide
- page-local overrides should open repair or approval flow, not silently bypass
  the guide
