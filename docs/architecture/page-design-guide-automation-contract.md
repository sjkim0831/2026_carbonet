# Page Design Guide Automation Contract

Generated on 2026-03-21 for Resonance page-level design guidance.

## Goal

Define how Resonance generates or maintains one design guide for every governed
page so that operators and AI sessions build screens with the same visual and
structural intent.

## Core Rule

Every page should have one attached design guide profile.

The guide may be:

- selected from a pre-registered guide family
- AI-generated from scenario, theme, and component expectations
- repaired and versioned later

## Design Guide Coverage

The guide should include at least:

- page purpose
- page family
- shell and frame expectation
- title and summary pattern
- section ordering
- button and action zone placement
- approved element families
- approved component families
- required help anchors
- required accessibility notes
- required security notes

## Required Fields

- `designGuideProfileId`
- `projectId`
- `scenarioFamilyId`
- `scenarioId`
- `pageId`
- `pageFamily`
- `themeSetId`
- `pageFrameId`
- `slotProfileSet`
- `actionLayoutProfileId`
- `sectionGuideSet`
- `componentUsageGuideSet`
- `designGuideVersion`

## Rules

- every page-design should reference one design guide profile
- the guide should be printable and reviewable from the design workspace
- AI-generated page output should show whether it followed the registered guide
