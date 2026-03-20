# Governed Identity Naming Convention

## Purpose

Resonance uses a small set of governed identity keys across proposal intake,
authoring, compare, repair, package, deploy, and runtime verification.

These keys must use predictable naming so:

- AI sessions can hand off work without ambiguity
- compare and repair screens can trace the same asset family
- runtime package and release-unit evidence stay readable
- example payloads and prototypes do not drift into ad hoc demo names

## Required Identity Keys

- `guidedStateId`
- `templateLineId`
- `screenFamilyRuleId`
- `ownerLane`

## Naming Rules

### Guided State

`guidedStateId` should use a numbered flow-oriented format:

- `guided-build-01-project-select`
- `guided-build-02-proposal-map`
- `guided-build-03-scenario-output`
- `guided-build-04-design-output`
- `guided-build-05-screen-build`
- `guided-build-06-package-deploy`

Rules:

- use the `guided-build-` prefix for the primary build flow
- keep the numeric step stable once published
- use a short action suffix, not a prose sentence
- do not use temporary demo values such as `gs-*`

### Template Line

`templateLineId` should use a surface-oriented format:

- `public-line-01`
- `public-line-02`
- `admin-line-01`
- `admin-line-02`

Rules:

- use `public-line-*` for homepage and public surfaces
- use `admin-line-*` for admin and runtime-admin surfaces
- the same template line must belong to exactly one `surfaceType`
- do not use uppercase pseudo-enum values as template line IDs

### Screen Family Rule

`screenFamilyRuleId` should remain a canonical rule enum:

- `PUBLIC_HOME`
- `PUBLIC_JOIN_STEP`
- `ADMIN_LIST`
- `ADMIN_DETAIL`
- `ADMIN_LIST_REVIEW`
- `ADMIN_POPUP_SEARCH`

Rules:

- uppercase enum-like names are acceptable here
- the rule name describes the page family pattern, not a template instance
- rule IDs should be stable and reusable across projects

### Owner Lane

`ownerLane` should match the active governed work lane:

- `res-contract`
- `res-proposal`
- `res-theme`
- `res-builder`
- `res-frontend`
- `res-backend`
- `res-db`
- `res-deploy`
- `res-verify`
- `res-module`

Rules:

- use the same lane name in UI strips, trace payloads, blockers, and handoff docs
- if ownership is shared, use a slash-delimited list in stable order
- prefer one primary owner lane for repair and deploy approval

## Allowed And Disallowed Examples

Allowed:

- `guided-build-04-design-output`
- `public-line-01`
- `admin-line-02`
- `ADMIN_LIST_REVIEW`
- `res-verify`

Disallowed:

- `gs-04`
- `PUBLIC_JOIN` as a template line ID
- `ADMIN_REVIEW` as a template line ID
- `lineA`
- `owner1`

## Governance Rule

- Prototypes, JSON examples, and API examples should follow this naming convention.
- Canonical business enums such as actor types, policy codes, and screen family
  rules may remain uppercase.
- Template lines and guided states should not reuse that uppercase enum style.

## Release Rule

Governed examples or screens that expose ambiguous identity naming should be
treated as incomplete until normalized to this convention.
