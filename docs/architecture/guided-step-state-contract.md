# Guided Step State Contract

Generated on 2026-03-21 for Resonance operator and AI continuation control.

## Goal

Define the state object that lets the operations system reopen the correct build, design, compare, or repair step for a project without restarting the whole flow.

## Core Rule

Each project should maintain one governed guided-step state per active initiative.

The state should answer:

- where the operator currently is
- what was last completed
- what is blocked
- what AI action is recommended next

## Required Fields

- `guidedStateId`
- `projectId`
- `initiativeType`
- `currentGuidedStep`
- `lastCompletedGuidedStep`
- `openBlockerStep`
- `nextRecommendedAiAction`
- `activeOwnershipLane`
- `activeReleaseUnitId`
- `activeScenarioFamilyId`
- `activePageId`
- `activeScreenFamilyId`
- `resumeUrl`
- `updatedBy`
- `updatedAt`
- `version`

## Recommended Values

Recommended `initiativeType` values:

- `PROPOSAL_ONBOARDING`
- `NEW_PROJECT_BUILD`
- `PARITY_REPAIR`
- `PATCH_RELEASE`
- `MODULE_ATTACH`

Recommended `nextRecommendedAiAction` values:

- `ANALYZE`
- `MAP`
- `GENERATE`
- `COMPARE`
- `REPAIR`
- `PACKAGE`
- `DEPLOY`

## Rules

- one blocked step should prevent later guided steps from being marked complete
- repair or compare work should reopen the relevant guided step instead of creating an untracked side flow
- the state should always reference the active ownership lane
- every generated artifact, repair result, or release-unit candidate should be able to trace back to one guided-state snapshot

## Use

This contract should be consumed by:

- guided build flow UI
- proposal onboarding UI
- runtime compare and repair workbench
- deployment readiness checks
- multi-account tmux lane coordination
