# Lane Code Start Checklists 07 10 04 03 02

Generated on 2026-03-21 for the secondary implementation wave.

## Purpose

These checklists are the final short checks before code changes begin in the
secondary implementation lanes.

## 07 DB SQL Migration Rollback Checklist

Confirm before editing:

- `06` has stabilized the first controller/service/API family names
- project ownership and release-unit linkage are known
- common DB vs project DB target is known
- SQL draft, migration draft, and rollback draft families can use consistent names

Stop and mark `BLOCKED` if:

- backend family names are still moving
- DB split assumptions are unclear
- the draft cannot identify project ownership

## 10 Installable Module And Common Lines Checklist

Confirm before editing:

- at least one runtime package attachment point exists
- attach-plan UI or contract exists for the target module flow
- the module can declare template line and screen family rule linkage
- the module upgrade path remains centralized

Stop and mark `BLOCKED` if:

- module ingestion would require blind folder attachment
- runtime package attachment point is still undefined
- common-line ownership would become ambiguous

## 04 Builder And Asset Studio Checklist

Confirm before editing:

- page-design, element-design-set, and page-assembly contracts are already frozen
- the builder target uses registered assets, not freeform page-local creation
- the screen family rule is known for the first builder target
- missing-asset and repair loops already exist as target surfaces
- if the task is builder resource ownership continuation, the owner has opened `builder-resource-ownership-current-closeout.md` and `builder-resource-ownership-queue-map.md`
- for builder resource ownership continuation, those two docs are treated as the single live entry pair

Stop and mark `BLOCKED` if:

- the builder would need to invent new asset shapes outside the contracts
- template line or screen family rule is not known
- registered-asset-only behavior cannot be preserved
- the queued builder resource ownership row is unclear or would reopen structure-governance

## 03 Theme And Design-System Checklist

Confirm before editing:

- public/admin split is explicit
- template line naming is frozen
- theme-set and spacing/token rules are already documented
- the first selector model can be implemented without changing the contracts

Stop and mark `BLOCKED` if:

- the first implementation would force new template-line semantics
- screen family rule usage becomes ambiguous
- the React shell boundary for theme controls is still unstable

## 02 Proposal Intake Checklist

Confirm before editing:

- proposal upload outputs are already modeled as governed drafts
- project binding is explicit
- candidate sets for template line and screen family rule are visible
- there is at least one consumer lane ready for proposal outputs

Stop and mark `BLOCKED` if:

- outputs are being treated like final approved artifacts
- project binding is missing
- no downstream lane can consume proposal outputs yet

## Suggested First Commit Scope

Keep the first implementation commit small:

- one SQL draft family for `07`
- one module attach-plan path for `10`
- one builder shell family for `04`
- one selector model for `03`
- one proposal draft review family for `02`
