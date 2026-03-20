# Implementation Lane Completion Template

Generated on 2026-03-21 for execution lanes after handoff.

## Purpose

Use this template when a lane completes a meaningful scope and wants to report:

- what finished
- what remains
- whether the next lane can continue

## Template

### Completion

- lane: `<02|03|04|05|06|07|08|09|10>`
- tmux session: `<res-*>`
- owner lane: `<res-*>`
- completion state: `<PARTIAL_DONE|HANDOFF_READY|DONE>`

### Completed Scope

- completed flow: `<page|api|package|compare|sql|module|proposal>`
- completed files:
  - `<path>`
  - `<path>`

### Governed Identity

- guided state: `<guided-build-*>`
- template line: `<public-line-*|admin-line-*>`
- screen family rule: `<RULE_NAME|set>`
- theme set: `<theme-set-*|existing approved set>`
- release unit: `<optional>`

### Result

- finished:
  - `<short point>`
  - `<short point>`
- remaining:
  - `<short point>`
  - `<short point>`

### Governance Check

- governed identity preserved: `<yes|no>`
- public/admin split preserved: `<yes|no>`
- theme-set coverage preserved: `<yes|no>`
- custom route or EN variant governed: `<yes|no|n/a>`
- contract rename introduced: `<yes|no>`
- parity blocker count now: `<n>`

### Completion Phrase

- partial:
  - `PARTIAL_DONE: <lane> completed <scope>; remaining blocker count is <n>.`
- handoff:
  - `HANDOFF READY: <target lane> can continue from <file or flow>; current blocker count is <n>.`
- done:
  - `DONE: <lane> completed the agreed scope with governed identity preserved.`

## Minimal Example

- lane: `08`
- tmux session: `res-deploy`
- owner lane: `res-deploy`
- completion state: `HANDOFF_READY`
- completed flow: `package`
- completed files:
  - `ops/...`
  - `docs/architecture/runtime-package-matrix-and-deploy-ia.md`
- guided state: `guided-build-12-package-deploy`
- template line: `public-line-01 / admin-line-02`
- screen family rule: `PUBLIC_HOME / ADMIN_LIST_REVIEW`
- theme set: `theme-set-public-core-v1 / theme-set-admin-core-v1`
- finished:
  - `first runtime package assembly path connected`
  - `deploy status source mapped`
- remaining:
  - `real rollback probe still pending`
- governed identity preserved: `yes`
- public/admin split preserved: `yes`
- theme-set coverage preserved: `yes`
- custom route or EN variant governed: `n/a`
- contract rename introduced: `no`
- parity blocker count now: `1`
- completion phrase:
  - `HANDOFF READY: 09 can continue from runtime package evidence and deploy status flow; current blocker count is 1.`
