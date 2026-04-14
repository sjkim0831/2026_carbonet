# System Governance Scope And Verification Readiness

Status: LIVE_ENTRY

Generated on `2026-04-15`.

## Goal

Answer these operational questions in one place:

- is token-saving work finished
- are newly added screens, features, assets, and authorities actually governed
- can operators run immediate verification and inspect the result now
- are all management-critical elements covered inside an explicit scope model

## Executive Status

### 1. Token-saving and doc-routing work

Status: `PARTIAL_DONE`

Current result:

- low-token routing gate exists
- reference reduction policy exists
- orchestration retention inventory exists
- high-parallel and token-expiry continuity rules exist
- example docs are now labeled `EXAMPLE_ONLY`

Still not fully closed:

- old orchestration docs still have many live references
- `resonance-10-session-assignment.md` is still widely linked
- prompt/lane starter docs are still duplicated and not yet reduced to one operator path

Primary current references:

- `docs/ai/00-governance/ai-skill-doc-routing-matrix.md`
- `docs/ai/00-governance/ai-reference-reduction-policy.md`
- `docs/ai/00-governance/ai-orchestration-doc-retention-inventory.md`

### 2. Governance coverage for screens, features, assets, and permissions

Status: `PARTIAL_TO_STRONG`

Current result:

- asset-management scope is explicitly modeled across seven governed families
- admin system screen completion is audited as `COMPLETE`, `PARTIAL`, or `SCAFFOLD`
- page metadata, menu linkage, feature codes, manifest data, and change targets are queryable for governed pages
- external-key governance pages expose event, API, schema, change-target, and permission metadata

Primary references:

- `docs/architecture/system-asset-management-screen-and-menu-plan.md`
- `docs/architecture/admin-system-screen-completion-audit.md`
- `.codex/skills/carbonet-audit-trace-architecture/SKILL.md`

### 3. Immediate verification readiness

Status: `PARTIAL`

What works now:

- runtime metadata query over local HTTPS works
- governed page metadata can be inspected immediately through the admin help-management screen-command API
- route access responds and enforces login redirect over HTTPS

What is still weak:

- `frontend/scripts/check-ui-governance.mjs` was drifted and has been partially repaired
- the script now reaches current file locations, but still reports a large route-to-manifest mismatch set
- that mismatch may include real drift and parser assumptions mixed together, so the gate is not yet a clean pass/fail signal

### 4. Scope completeness for management-critical elements

Status: `PARTIAL_DONE`

Current scope model is explicit for:

1. service inventory assets
2. runtime infrastructure assets
3. security and access assets
4. integration assets
5. content and file assets
6. governance metadata assets
7. recovery and lifecycle assets

Still needs stronger closure:

- unified operator view for all managed elements
- stronger mutation/evidence closure for `PARTIAL` screens
- clean verification gate that proves manifest, route, help-content, and backend metadata alignment without false positives

## Evidence Collected This Turn

### Verified local runtime behavior

1. `https://127.0.0.1:18000/admin/system/asset-inventory`
   - responds with `302`
   - redirects to admin login
   - confirms the route is live and guarded

2. `https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=asset-inventory`
   - returns `200` JSON
   - includes:
     - `page`
     - `surfaces`
     - `changeTargets`
     - `menuPermission`
     - `manifestRegistry`
     - `summaryMetrics`

3. `https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=asset-impact`
   - returns governed metadata for the asset-impact page
   - includes menu and feature linkage plus manifest components

4. `https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=external-keys`
   - returns governed metadata for external-key management
   - includes:
     - event definitions
     - API definitions
     - schema definitions
     - change targets
     - feature-code and menu-permission linkage

### Verified local verification gate state

Command:

- `npm run audit:ui-governance` in `frontend`

Observed result:

- the script runs and produces repository-wide findings
- current output still reports `193 issue(s)` and `1 warning(s)`

Interpretation:

- this is progress, because the gate now runs instead of crashing immediately
- it is not yet a trusted closeout gate, because many findings may come from route-parsing assumptions rather than only real governance drift

## Current Operational Judgment

### Token-saving

Not finished, but meaningfully improved.

The repository now has:

- smaller default read rules
- retention rules
- example labeling
- high-parallel and token-expiry continuity rules

The remaining work is reference cleanup and consolidation, not missing direction.

### Governance of new screens and features

Partially yes.

For governed pages such as:

- `asset-inventory`
- `asset-impact`
- `external-keys`

the runtime metadata already shows:

- route
- menu code
- required view feature code
- feature rows
- manifest components
- change targets
- related tables

That means these pages are not unmanaged stubs from a metadata perspective.

### Immediate verification

Possible, but not yet fully closed.

You can already:

- call route URLs
- call page-governance metadata APIs
- inspect menu/feature/manifest/change-target metadata

You cannot yet rely on one clean repository-wide governance gate without additional cleanup in `check-ui-governance.mjs`.

### Scope coverage

Broadly yes at the model level.

Not yet fully yes at the operational closeout level.

The scope families are defined, but several screens in that scope are still explicitly marked `PARTIAL` in the screen-completion audit.

## Immediate Commands

### Runtime metadata and route checks

```bash
curl -k -sS 'https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=asset-inventory'
curl -k -sS 'https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=asset-impact'
curl -k -sS 'https://127.0.0.1:18000/api/admin/help-management/screen-command/page?pageId=external-keys'
curl -k -sSI 'https://127.0.0.1:18000/admin/system/asset-inventory'
```

### Frontend governance gate

```bash
cd frontend
npm run audit:ui-governance
```

## Next Practical Work

1. repair `frontend/scripts/check-ui-governance.mjs` so route parsing matches the current route-definition source
2. apply `docs/operations/ai-change-baseline-and-regression-rule.md` as the default pre-change and post-change regression rule for existing page work
3. classify the current `186` findings into:
   - parser false positives
   - real manifest drift
   - real help-marker drift
   - backend metadata drift
4. add one operator-facing readiness matrix for:
   - page
   - menu code
   - view feature code
   - mutation feature codes
   - manifest
   - runtime route check
   - closeout status
5. keep dynamic-menu pages such as `repair-workbench` classified as governed inventory, while removing any truly unbound inventory gaps from generated output
6. upgrade the remaining `PARTIAL` asset-management and integration-governance screens
7. continue shrinking old orchestration references so token-saving work can be considered closed

## New Priority Rule

Use the project-wide governance priority in:

- `docs/architecture/project-governance-control-plane-and-priority-roadmap.md`

Interpretation:

1. repository governance closure comes first
2. verification and evidence closure comes second
3. project schedule, issue, and document control follows after that
4. mail and call governance follow only after the first three layers are trustworthy
