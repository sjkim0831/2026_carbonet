# Contract Lane Reopen Protocol

Generated on 2026-03-21 for post-handoff exception handling.

## Purpose

This protocol defines when implementation lanes may reopen the `01` contract
lane after handoff.

## Reopen Only For

Reopen `01` only if one of these is true:

- a new governed identity field is required
- context-key strip semantics are insufficient
- public/admin split cannot be represented cleanly
- template-line semantics break
- screen-family-rule semantics break
- runtime-package trace semantics break
- release-unit trace semantics break

## Do Not Reopen For

Do not reopen `01` for:

- routine React implementation detail
- routine Spring controller or service detail
- routine mapper or SQL detail
- normal deploy script wiring
- ordinary compare or repair UI implementation
- minor prototype polish

## Reopen Message Format

Use this phrase:

- `BLOCKED: waiting for 01 because <specific contract-level reason>.`

Then include:

- lane number
- current file family
- affected governed identity keys
- whether implementation can continue in parallel elsewhere

## Reopen Decision

`01` should answer one of:

- `REOPEN ACCEPTED: 01 will patch the contract.`
- `REOPEN REJECTED: continue implementation under existing contracts.`
- `REOPEN PARTIAL: use temporary lane-local blocker handling, contract unchanged.`

## Fast Decision Goal

`01` should decide quickly whether the issue is:

- a real contract gap
- an implementation misunderstanding
- a lane ownership problem
