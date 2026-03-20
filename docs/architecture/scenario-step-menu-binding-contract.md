# Scenario Step Menu Binding Contract

Generated on 2026-03-21 for Resonance step-level menu-driven screen generation.

## Goal

Define how each scenario step can own or receive one governed menu binding so
that operators can create screens from step-level menu context.

## Core Rule

A scenario family may own many child scenarios and many scenario steps.

Each scenario step should be allowed to bind:

- one primary menu node
- optional secondary menu nodes
- one primary page family

This enables step-by-step screen creation instead of forcing one menu binding
only at scenario-family level.

## Required Fields

- `scenarioStepId`
- `scenarioId`
- `scenarioFamilyId`
- `primaryMenuCode`
- `secondaryMenuCodeSet`
- `pageFamily`
- `routeCandidateSet`
- `screenGenerationMode`
  - `STEP_SCREEN`
  - `STEP_POPUP`
  - `STEP_SECTION`

## Rules

- every scenario step with UI ownership should have a primary menu binding or an
  explicit `menuNotRequiredYn`
- screen generation should be allowed from the selected scenario step, not only
  from the whole family
- hidden or merged menu behavior may be considered later, but initial governed
  generation should assume visible step bindings first
