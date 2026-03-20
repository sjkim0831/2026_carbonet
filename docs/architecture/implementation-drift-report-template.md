# Implementation Drift Report Template

Generated on 2026-03-21 for post-handoff execution lanes.

## Purpose

Use this template when a lane detects implementation drift that does not yet
justify reopening `01`, but still needs structured repair handling.

Typical cases:

- UI uniformity drift
- parity mismatch
- missing binding family
- runtime/package mismatch
- incomplete compare or repair linkage

## Template

### Drift Report

- reporting lane: `<02|03|04|05|06|07|08|09|10>`
- owner lane: `<res-*>`
- drift family: `<ui|parity|binding|runtime-package|trace|sql|module>`
- severity: `<low|medium|high>`

### Scope

- affected flow: `<page|api|package|compare|sql|module|proposal>`
- affected files:
  - `<path>`
  - `<path>`

### Governed Identity

- guided state: `<guided-build-*>`
- template line: `<public-line-*|admin-line-*>`
- screen family rule: `<RULE_NAME|set>`
- owner lane: `<res-*>`

### Drift Detail

- expected:
  - `<short point>`
- actual:
  - `<short point>`
- likely cause:
  - `<short point>`

### Decision

- next action:
  - `repair in current lane`
  - `handoff to another lane`
  - `open compare blocker`
  - `reopen 01`

### Phrase

- `DRIFT REPORT: <lane> detected <drift family> on <flow>; next action is <action>.`

## Minimal Example

- reporting lane: `05`
- owner lane: `res-frontend`
- drift family: `ui`
- severity: `medium`
- affected flow: `page`
- affected files:
  - `frontend/src/...`
- guided state: `guided-build-07-runtime-binding`
- template line: `admin-line-02`
- screen family rule: `ADMIN_LIST_REVIEW`
- expected:
  - `bottom action layout matches approved admin family`
- actual:
  - `button cluster is right-aligned instead of split layout`
- likely cause:
  - `page-local layout override bypassed slot profile`
- next action:
  - `repair in current lane`
- phrase:
  - `DRIFT REPORT: 05 detected ui drift on admin review page; next action is repair in current lane.`
