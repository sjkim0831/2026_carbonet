# Lane Code Start Checklists 05 06 08 09

Generated on 2026-03-21 for the first implementation wave.

## Purpose

These checklists are the last short checks before code changes begin in the
first implementation lanes.

## 05 Frontend Code Start Checklist

Confirm before editing:

- the target page family is already represented in a prototype
- the page exposes the context-key strip
- the page belongs to a known public/admin surface split
- the target screen family rule is already known
- the implementation will reuse existing common primitives before adding a new component
- HTML5 landmarks are planned for the shell and page body

Stop and mark `BLOCKED` if:

- the target page cannot resolve a template line
- the target page cannot resolve a screen family rule
- the page requires a new governed identity field

## 06 Backend Code Start Checklist

Confirm before editing:

- the API contract exists for the target flow
- request and response identity fields are already named
- the first controller/service boundary is clear
- mapper or persistence families can be named without changing contract terminology
- trace linkage to generation run or release unit is known

Stop and mark `BLOCKED` if:

- payload fields must be renamed to make implementation possible
- generation or release trace semantics are missing
- the backend flow cannot identify project ownership

## 08 Deploy Code Start Checklist

Confirm before editing:

- one runtime package family is already defined
- deploy console prototype is the current visual source
- release unit owns the target artifacts
- runtime package id and deploy trace id can be stated without reinterpretation
- the `08` lane session loop still routes to `res-08-deploy`
- main server runtime truth is explicit
- the role split is still `233` build / `221` run / `193` DB
- public/admin split is still visible in rollout and rollback views

Stop and mark `BLOCKED` if:

- runtime package ownership is ambiguous
- deploy flow requires a new trace semantic
- `releaseUnitId`, `runtimePackageId`, `deployTraceId`, or `ownerLane` cannot be carried into `09`
- the numbered-lane prompt no longer reattaches to the `08` deploy lane
- public/admin split disappears in rollout state

## 09 Verify Code Start Checklist

Confirm before editing:

- current, generated, baseline, and patch states are all represented
- blocker rows carry owner lane
- repair queue rows carry guided state, template line, and screen family rule
- one compare target already exists from prototype or early code
- parity and smoke checklists can be mapped to real result fields

Stop and mark `BLOCKED` if:

- compare states cannot be distinguished cleanly
- repair targets lose governed identity linkage
- blocker ownership cannot be represented with existing owner lane rules

## Suggested First Commit Scope

Keep the first implementation commit small:

- one shell or page family for `05`
- one API skeleton family for `06`
- one runtime package or deploy status family for `08`
- one compare/blocker/repair model for `09`

Do not mix unrelated families in the first commit.
