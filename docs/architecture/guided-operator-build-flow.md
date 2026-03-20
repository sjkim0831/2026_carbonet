# Guided Operator Build Flow

Generated on 2026-03-21 for Resonance operator-first project onboarding and delivery.

## Goal

Define the operator-visible primary flow so that a user can move screen by
screen, use AI-assisted actions, and reach final build and deploy outputs
without guessing the next step.

## Primary Flow

Use this primary guided flow order:

1. `Project And Runtime`
2. `Design Workspace`
3. `Proposal Mapping Draft`
4. `Project Proposal Inventory`
5. `Project Proposal Matrix`
6. `Project Scenario Output`
7. `Project Design Output`
8. `Theme Set Studio`
9. `Incremental Asset Studio`
10. `Screen Builder`
11. `Runtime Package Matrix`
12. `Deploy Console`
13. `Current Runtime Compare`
14. `Repair Workbench`

## AI Action Rule

At each guided step, the screen should expose one primary AI-assisted action:

- analyze
- map
- generate
- compare
- repair
- package
- deploy

Operators should not need to hunt for a hidden next action.

## Rules

- every guided step should expose previous and next step links
- every guided step should expose its primary AI action clearly
- later governance screens may exist, but they should not interrupt the primary
  flow unless blockers are present
- repeated operator requests should reopen the current incomplete or blocked step instead of restarting the whole flow
- each generated artifact and repair result should record the guided step that produced it

## Continuation Rule

The operations system should retain:

- `currentGuidedStep`
- `lastCompletedGuidedStep`
- `openBlockerStep`
- `nextRecommendedAiAction`

This lets operators and AI continue the same governed sequence over multiple requests.

## Operator Alias Rule

If the operator says `붙어`, `붙어서`, `이어서 해줘`, `무한 반복`, `무한반복`, or `1분마다 재실행`:

- keep the current guided step and the current numbered session attached unless ownership explicitly changes
- resume from the last unfinished point instead of restarting the full guided flow
- interpret numbered attachment wording by the same rules in `docs/ai/80-skills/resonance-10-session-assignment.md`
- interpret tmux-lane continuation wording by the same rules in `docs/architecture/tmux-multi-account-delivery-playbook.md`

Reference:

- [guided-step-state-contract.md](/opt/projects/carbonet/docs/architecture/guided-step-state-contract.md)
- [resonance-10-session-assignment.md](/opt/projects/carbonet/docs/ai/80-skills/resonance-10-session-assignment.md)
- [tmux-multi-account-delivery-playbook.md](/opt/projects/carbonet/docs/architecture/tmux-multi-account-delivery-playbook.md)
