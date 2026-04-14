Status: LIVE_ENTRY

# Verification Center And Baseline Governance Plan

## Why

Carbonet already has many partial verification surfaces:

- route/runtime freshness checks
- screen-command metadata inspection
- runtime compare
- repair workbench
- observability and audit lookup
- Playwright and script-based smoke checks

What is still missing is one operator-facing control point that answers these questions together:

- what baseline should be preserved before editing a page
- which test account and dataset should be used
- which smoke scenarios must run after the change
- where the run log and failure evidence are stored
- how failure continues into compare, repair, rollback, and trace review

## New Console

- Route: `/admin/system/verification-center`
- Page id: `verification-center`
- Role: operator-first governance console, not the execution engine itself

The first version should be a governed catalog and run-policy screen.
It should not wait for the entire automation platform to exist before providing value.

## Scope

The screen should manage these assets explicitly.

1. Page baseline packs
2. Smoke scenario catalog
3. Test accounts and seed datasets
4. Scheduled verification sweep definitions
5. Verification run history
6. Failure routing into compare, repair, observability, and rollback evidence

## Required Baseline Pack Fields

Each governed page baseline should eventually keep:

- `pageId`
- `menuCode`
- `routePath`
- `requiredViewFeatureCode`
- baseline capture method
- preserved action signals
- required smoke scenario ids
- linked test account profile ids
- linked seed data profile ids
- last successful run id
- stale baseline status

## Test Account And Data Rules

Testability fails when accounts and data are informal.
The system should keep them as first-class governed assets.

Minimum rules:

- role-specific test account profiles
- expiration date and lock state
- reset history
- masking and secret-storage rule
- allowed project or company scope
- linked smoke scenarios
- linked seed data packs

Reusable sandbox credentials also need explicit expiry governance.
This is not optional for accounts tied to external authentication, tokens, keys, payment sandboxes, refund queues, or certificate-linked callbacks.

Minimum expiry governance:

- `issuedAt`
- `expiresAt`
- reset owner
- last reset timestamp
- reissue window
- lock state
- fail-closed rule when only expired or production-bound credentials remain

Until a persistent vault table exists, the verification center should still publish the governed profile catalog and required expiry rules so operators and AI sessions do not improvise them per task.

## Run Types

The console should distinguish run intent instead of treating every check as the same.

- `PRE_CHANGE_BASELINE`
- `POST_CHANGE_REGRESSION`
- `POST_DEPLOY_SMOKE`
- `SCHEDULED_SWEEP`
- `MANUAL_INVESTIGATION`

## Evidence Model

Verification evidence should stay traceable, even when execution happens elsewhere.

Minimum run output:

- run id
- run type
- actor
- baseline version or snapshot id
- page family / page id / menu code
- pass / warn / fail
- failed checkpoints
- trace id
- linked compare id
- linked repair id
- linked rollback evidence id
- artifact locations

Existing repository concepts already cover part of this:

- `RSN_VERIFICATION_RUN`
- runtime parity compare outputs
- observability trace and audit events
- route freshness verification scripts

## Screen Placement

This screen belongs with environment and asset governance rather than as a builder-only screen.

Reason:

- it must cover existing pages, not only builder-generated pages
- it needs asset inventory, runtime operations, security/access, and integration coverage
- it should become the entry screen for "what to preserve and what to verify" before any AI or operator edit

## MVP Sequence

1. Add `verification-center` route and UI shell
2. Centralize baseline pack catalog and operator rules
3. Bind existing route/meta/compare/repair links
4. Add persistent baseline registry storage
5. Add test account/data vault linkage
6. Add scheduled sweep execution and dashboard counts

## Operator Rule

For existing page work, do not start implementation before these are explicit:

- baseline route response
- metadata response
- one preserved action signal
- post-change rerun path
- failure routing target

This rule should remain aligned with:

- `docs/operations/ai-change-baseline-and-regression-rule.md`
