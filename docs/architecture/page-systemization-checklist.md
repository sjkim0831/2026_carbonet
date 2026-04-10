# Page Systemization Checklist

## Goal

Provide an operator-facing checklist for deciding whether one page is ready to be treated as a governed builder asset.

Use this document together with:

- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/actor-authority-generation-contracts.md`
- `docs/architecture/system-builder-project-domain-install-target.md`

## Required Checklist

Mark a page as systemized only when every item below is satisfied.

### 1. Stable Identity

- `pageId` is fixed and documented
- `menuCode` is fixed and documented
- canonical route is fixed
- page family is declared
- ownership lane is declared
- install scope is declared

### 2. Runtime Structure

- page manifest exists
- approved template or component-tree profile exists
- frame/layout slot profile exists
- help binding exists
- accessibility binding exists where needed
- security binding exists where needed

### 3. Authority Scope

- actor family is explicit
- data scope is explicit
- action scope is explicit
- approval-authority requirement is explicit where relevant
- delegated or grantable authority rule is explicit where relevant
- frontend visibility and backend execution gates agree

### 4. Data And Action Contracts

- bootstrap payload contract exists
- query contract exists
- mutation contract exists
- event to function/API linkage exists
- backend chain owner is explicit
- DB impact is visible where relevant

### 5. Install And Project Binding

- install owner or page-family owner is explicit
- project binding inputs are explicit
- theme or presentation binding inputs are explicit where relevant
- validator checks are explicit
- rollback evidence expectations are explicit

### 6. Deploy And Runtime Traceability

- page can be identified the same way in builder, runtime, audit, and deploy evidence
- publish/regeneration path is known
- runtime verification target URL is known
- compare or repair surface is known where relevant

## Failure Cases

Do not mark a page systemized when any of these remain true:

- route exists but `pageId` still drifts
- menu and page authority differ
- buttons hide actions that backend still permits
- project binding inputs are implicit tribal knowledge
- rollback or validator evidence is missing
- runtime verification target is unknown

## Closeout Sentence

Use this sentence when the page is ready:

`CLOSED: page systemization is complete for <pageId>; identity, authority scope, contracts, project binding, validator checks, and runtime verification target are explicit.`
