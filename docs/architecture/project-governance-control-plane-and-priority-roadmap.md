Status: LIVE_ENTRY

# Project Governance Control Plane And Priority Roadmap

Generated on `2026-04-15`.

## Why This Document Exists

Carbonet is moving toward one operator-first control plane that should eventually manage not only:

- pages
- APIs
- functions
- assets
- authorities
- runtime verification

but also broader project-governance subjects such as:

- project directory ownership
- work schedule and milestone tracking
- issue intake and follow-up
- implementation and handoff documents
- mail dispatch and mail history
- call records and phone follow-up
- external communication evidence

That larger target is valid, but it should not be attempted as one flat bundle.

If the repository still has route/manifest drift, draft screen-command fallbacks, weak test closure, or backend compile blockers, then adding schedule, issue, mail, and call management on top will create a larger but less trustworthy control plane.

This roadmap establishes the required priority order.

## Current Judgment

The system is not yet in a state where "everything is centrally governed with strong evidence" is true.

It is in a transition state:

- inventory visibility is becoming strong
- governance surfaces now exist
- verification rules are becoming explicit
- runtime proof and repository-wide closure are still incomplete

So the correct strategy is:

1. finish repository governance closure first
2. then extend into project-governance control-plane functions
3. then extend into communications governance

## Priority Order

### P0. Repository Governance Closure

These are the non-negotiable foundations.

1. make route, manifest, help-content, and screen-command metadata agree
2. eliminate draft-only screen-command fallbacks for governed pages
3. make `audit:ui-governance` a trustworthy gate instead of a noisy report
4. repair backend compile blockers so runtime refresh and verification are always executable
5. expand baseline, smoke, and masked test-profile coverage for high-risk flows

Without these five, later project-governance screens will display incomplete or misleading data.

### P1. Verification And Evidence Closure

Once repository governance is stable, the control plane should enforce:

1. pre-change baseline capture
2. post-change regression confirmation
3. post-deploy smoke verification
4. test-only account and seed-data enforcement
5. credential and token expiry tracking
6. masked evidence retention
7. trace linkage into compare, repair, rollback, and observability

This is the minimum bar before claiming that the system is managed rather than only cataloged.

### P2. Project Governance Overlay

Only after P0 and P1 are stable should the system expand into project-level control.

Required project-governance entities:

1. project registry
2. project directory ownership map
3. schedule and milestone rows
4. issue tracker rows
5. document registry
6. decision and approval log
7. owner and escalation mapping

This layer should remain an overlay over the existing technical governance model rather than replacing it.

Examples:

- a project issue should link to `pageId`, `menuCode`, `featureCode`, `apiId`, or `traceId` when possible
- a project milestone should link to governed assets and verification closure
- a handoff document should link to the exact route, page, API, function, and patch evidence it covers

### P3. Communications Governance

Mail and call governance should not be treated as isolated CRM-style data.
They should be linked to project, issue, and verification context.

Required communication-governance entities:

1. outbound mail
2. inbound mail summary
3. mail thread or reference id
4. call log
5. callback task
6. contact scope and masking policy
7. communication-to-issue linkage
8. communication-to-project linkage

Required rules:

- sensitive contents stay masked or summarized
- operator identity and time are always recorded
- linked issue or project context is explicit
- external communication should never be the only source of operational truth

## Control Plane Model

The final control plane should be layered, not flat.

### Layer 1. Technical Governance

- route
- page manifest
- help anchors
- screen-command metadata
- feature codes
- authority exposure
- API/schema/table metadata
- runtime verification evidence

### Layer 2. Delivery Governance

- work item
- priority
- schedule
- owner
- blocker
- status
- closure evidence

### Layer 3. Communication Governance

- mail
- call
- follow-up
- external commitment
- contact record
- escalation history

Layer 2 depends on Layer 1.
Layer 3 depends on Layer 2.

Do not invert that dependency.

## Scope Rules

### What Must Be Governed First

- every route with a managed page
- every page manifest
- every screen-command page
- every menu-linked page
- every high-risk flow
- every required test profile
- every baseline and smoke result

### What Can Follow After That

- directory ownership overlays
- schedule plans
- issue lanes
- document and handoff catalogs
- communications logs

### What Must Never Be Claimed Early

Do not claim:

- "all pages are fully governed"
- "the whole project is centrally managed"
- "all verification is automated"
- "project and communications governance are complete"

until the technical closure gates actually pass.

## Recommended Near-Term Deliverables

### Immediate

1. close route/manifest/help/screen-command drift
2. remove draft fallback for the remaining governed pages
3. fix compile blockers that prevent reliable package and restart
4. expand verification-center into a real readiness matrix for:
   - page
   - menu
   - feature
   - route
   - manifest
   - screen-command
   - baseline
   - smoke
   - test profile
   - closeout status

### Next

1. add project governance tables and overlays
2. add operator project-governance page
3. add issue and schedule linkage to governed assets
4. add document registry and handoff evidence linkage

### Later

1. add mail governance
2. add call governance
3. add communications evidence and follow-up workflow

## Page Direction

The likely menu path should evolve in this order:

1. `/admin/system/verification-center`
   - technical governance and verification closure
2. `/admin/system/project-governance`
   - schedule, issue, owner, document overlay
3. `/admin/system/communication-governance`
   - mail, call, follow-up, escalation evidence

The first page is the current root because it protects trust in the later pages.

## Non-Negotiable Rule

Project schedule, issue, document, mail, and call governance must not become a decorative PM surface that sits above an unverified technical base.

Every later governance layer should resolve down to governed technical assets and verification evidence.

That is the only way the control plane stays operationally trustworthy.
