# Implementation Lane Handoff Receipt Template

Generated on 2026-03-21 for post-handoff execution lanes.

## Purpose

Use this template when an implementation lane first accepts handoff from the
`01` contract lane or from another execution lane.

It keeps receipt, acceptance, and immediate blockers in one consistent format.

## Template

### Receipt

- receiving lane: `<02|03|04|05|06|07|08|09|10>`
- received from: `<01|other lane>`
- tmux session: `<res-*>`
- owner lane: `<res-*>`
- receipt status: `<ACCEPTED|ACCEPTED_WITH_NOTE|BLOCKED>`

### Accepted Scope

- accepted flow: `<page|api|package|compare|sql|module|proposal>`
- accepted entry files:
  - `<path>`
  - `<path>`

### Governed Identity

- guided state: `<guided-build-*>`
- template line: `<public-line-*|admin-line-*>`
- screen family rule: `<RULE_NAME|set>`
- theme set: `<theme-set-*|existing approved set>`
- release unit: `<optional>`

### First Action

- first action in this lane:
  - `<short point>`
- expected first result:
  - `<short point>`

### Immediate Check

- naming convention understood: `<yes|no>`
- context-key strip rule understood: `<yes|no>`
- public/admin split understood: `<yes|no>`
- theme-set and parity governance understood: `<yes|no>`
- custom route or EN variant exception present: `<yes|no>`
- reopen of `01` required now: `<yes|no>`

### Receipt Phrase

- accepted:
  - `ACCEPTED: <lane> will continue from <file or flow> under existing governed identity rules.`
- accepted with note:
  - `ACCEPTED_WITH_NOTE: <lane> will continue from <file or flow>; first review note is <note>.`
- blocked:
  - `BLOCKED: <lane> cannot accept handoff yet because <specific reason>.`

## Minimal Example

- receiving lane: `06`
- received from: `01`
- tmux session: `res-backend`
- owner lane: `res-backend`
- receipt status: `ACCEPTED`
- accepted flow: `api`
- accepted entry files:
  - `docs/architecture/lane-start-instructions-05-06-08-09.md`
  - `docs/architecture/repair-and-verification-api-contracts.md`
- guided state: `guided-build-15-repair`
- template line: `admin-line-02`
- screen family rule: `ADMIN_LIST_REVIEW`
- theme set: `theme-set-admin-core-v1`
- first action in this lane:
  - `create repair open/apply controller and service skeleton`
- expected first result:
  - `compile-ready API skeleton with governed identity fields preserved`
- naming convention understood: `yes`
- context-key strip rule understood: `yes`
- public/admin split understood: `yes`
- theme-set and parity governance understood: `yes`
- custom route or EN variant exception present: `no`
- reopen of `01` required now: `no`
- receipt phrase:
  - `ACCEPTED: 06 will continue from repair API flow under existing governed identity rules.`
