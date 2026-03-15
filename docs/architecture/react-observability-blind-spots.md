# React Observability Blind Spots and Safe Rollout Rules

Generated on 2026-03-14 for handoff across AI sessions and accounts.

## Goal

This document lists the parts of the React migration that are still hard to govern automatically and defines the rules for expanding observability without breaking existing behavior.

It also defines the boundary between:

- what AI can safely generate or refactor quickly
- what the Carbonet platform must continue to own as authoritative metadata
- what must remain installation-safe so menu-centered packages do not leave residue behind

## 1. What Is Already Governable

The current React migration structure can manage these reliably when a page is registered:

- screen surfaces and selectors
- frontend events
- frontend function IDs
- function input and output summaries
- API request and response field summaries
- masking rules
- related schemas and table mappings
- route transitions and menu permission metadata

Primary sources of truth:

- `src/main/java/egovframework/com/feature/admin/service/impl/ScreenCommandCenterServiceImpl.java`
- `frontend/src/app/screen-registry/pageManifests.ts`
- `frontend/src/features/help-management/ScreenCommandCenterPanel.tsx`

These sources should be extended into an installable-system governance path rather than replaced. The current gap is not the lack of metadata, but the lack of a package lifecycle around that metadata.

## 2. Current Blind Spots

These are the main areas that are not fully governed or are only partially traceable.

### 2.1 External scripts and widgets

Examples found in this repository:

- Daum postcode scripts in:
  - `frontend/src/features/join-wizard/JoinInfoMigrationPage.tsx`
  - `frontend/src/features/join-company-register/JoinCompanyRegisterMigrationPage.tsx`
  - `frontend/src/features/join-company-reapply/JoinCompanyReapplyMigrationPage.tsx`
- generic external script loader:
  - `frontend/src/app/hooks/useExternalScript.ts`

Why this is a blind spot:

- script lifecycle is controlled outside React
- widget internal state and callbacks are not fully visible
- popup or external frame behavior is not represented as component metadata

Safe treatment:

- trace widget open, success, cancel, and failure as coarse events
- do not try to trace internal third-party DOM mutations

Suggested first targets:

- instrument Daum postcode open/success/cancel/error on join info, company register, and company reapply pages first
- keep the existing widget callback flow unchanged while adding only lifecycle metadata

### 2.2 Browser-native transient state

Examples:

- `window.history.back()`
- focus transitions
- scroll position
- browser autofill
- native file picker open/close

Why this is a blind spot:

- behavior is browser-owned, not application-owned
- there is no stable business meaning for many of these transitions

Safe treatment:

- trace only meaningful intent, such as "back clicked" or "download started"
- do not emit high-volume UI noise

Suggested first targets:

- add coarse `back_clicked` telemetry where join and status flows already expose explicit back buttons
- do not add generic focus, scroll, or autofill listeners

### 2.3 Alerts, confirms, and imperative browser feedback

Examples found in many React migration screens:

- `window.alert(...)`

Why this is a blind spot:

- alert text is often UX-only and not a stable business contract
- alert open/close is not represented as a component or route

Safe treatment:

- record the validation or failure event that caused the alert
- do not rely on alert text as the primary business record

Suggested first targets:

- map repeated join and admin validation alerts to stable validation or failure event IDs
- avoid storing alert message bodies except where a masked summary is explicitly needed

### 2.4 Session storage and query-string relay state

Examples:

- `window.sessionStorage.setItem(...)`
- query-string based result pages and redirects

Why this is a blind spot:

- storage writes are easy to scatter across screens
- values may exist only as transport state between screens

Safe treatment:

- treat them as transport summaries, not authoritative persistence
- record only field summaries and masking rules

Suggested first targets:

- inventory relay fields used by join step, company status, and company reapply redirects
- classify each relay field as safe raw, masked, hashed, or metadata only before adding trace metadata

### 2.5 File uploads and downloads

Examples:

- `fileUploads` in join flows
- `/join/downloadInsttFile`

Why this is a blind spot:

- file content should not be logged
- browser upload/download progress is not meaningful as audit data

Safe treatment:

- record metadata only:
  - file count
  - original file name policy
  - file category
  - file size band
- never trace raw file bytes

Suggested first targets:

- add coarse upload/download metadata to join company register, reapply, and status-related flows first
- keep filename handling policy-oriented rather than value-oriented

### 2.6 Dynamic or broad selectors

Examples:

- selectors based on route container or broad class chains

Why this is a blind spot:

- they can drift when markup changes
- they may not identify a business element precisely

Safe treatment:

- prefer `data-help-id`
- treat missing `data-help-id` as governance debt to be fixed in the same UI touch if the page is already under management
- if missing, add a stable semantic selector in future UI work

Suggested first targets:

- replace the broadest selectors on company register, status, and reapply screens before lower-value pages
- avoid selector-only observability work that is not tied to an already-governed page or action

### 2.7 Install-unit ownership gaps

Examples already visible in this repository:

- restored admin React pages without a full package registry
- backend metadata that knows page structure but not complete install ownership
- DB mappings that exist in code but are not yet classed as `COMMON`, `PROJECT`, or `INSTALL_UNIT`

Why this is a blind spot:

- a page can be governable for observability but still not be uninstall-safe
- copy and delete flows cannot be trusted without ownership metadata
- low-traffic or hidden assets can be mistaken for garbage when they are actually valid retained assets

Safe treatment:

- every new page or function must declare `projectId`, `packageId`, and `ownerScope`
- resource ownership must be recorded before offering auto-delete or copy
- treat orphan detection and drift detection as governance, not as cleanup afterthoughts

Suggested first targets:

- classify admin restored pages under install ownership before large-scale controller splitting
- extend screen command center metadata with package and ownership views

## 3. Safe Rollout Rules

These rules are required so observability work does not damage baseline product behavior.

### 3.1 No behavior-first changes

Do not change user flow only to make observability easier.

Allowed:

- add metadata
- add typed summaries
- add non-blocking telemetry hooks
- add stable selectors

Not allowed by default:

- changing navigation logic
- changing validation order
- changing API contracts
- changing file upload semantics

### 3.2 Telemetry must be non-blocking

- UI actions must continue even if telemetry send fails
- registry sync failures must not break user-facing page rendering
- management metadata must not become a hard dependency for business actions

### 3.3 Mask first

Before adding any new field to:

- `functionInputs`
- `functionOutputs`
- `requestFields`
- `responseFields`

define whether it is:

- safe raw
- partially masked
- hashed
- dropped
- metadata only

### 3.4 Keep backend and frontend registry aligned

### 3.5 Do not turn observability into runtime coupling

Observability, registry synchronization, and install governance must not require a deployed child project to fetch source code or runtime logic dynamically from the main system.

Allowed:

- versioned package, jar, or manifest delivery
- exported install units
- compatibility-checked common modules

Not allowed by default:

- deployed projects pulling live backend source from the main system at runtime
- dynamic source inclusion as a dependency resolution mechanism
- governance that depends on the main system being online to execute ordinary project business logic

This rule exists because common code should be centrally governed, but deployed projects still need reproducible builds, rollback, and version-pinned behavior.

## 4. AI Usage Rules

AI is a strong fit for:

- restoring pixel parity from template screens
- generating page manifests, DTO scaffolds, and mapper boilerplate
- proposing menu/package/resource graphs
- updating docs and governance metadata

AI is not the authority for:

- deciding whether a shared asset can be deleted
- classifying security-sensitive fields without explicit masking rules
- treating infrequent assets as garbage
- bypassing package ownership or version gates

The safe rule is:

- AI may generate and propose
- the registry and platform policy decide install, delete, share, and upgrade behavior

## 5. Garbage vs Low-Frequency Assets

Do not classify assets as garbage based only on low usage. Use ownership and dependency criteria instead.

Garbage candidates:

- ownerless resources
- resources with no valid menu, page, function, API, or package link
- dead links to removed controllers, routes, tables, or files
- duplicate generated assets with no active owner intent
- uninstall residue left after package deletion

Not garbage by default:

- inactive but valid emergency screens
- archived or retained regulatory data assets
- low-traffic admin pages
- shared common tables and helper components
- disabled packages that still have an approved owner

Every page-level observability extension must update both:

- `ScreenCommandCenterServiceImpl`
- `pageManifests.ts`

If only one side is changed, the governance model drifts.

### 3.5 Prefer coarse-grained external tracing

For external scripts, popups, or browser-owned flows, only trace:

- open attempt
- success callback
- cancel/close
- error

Avoid pretending full internal control exists when it does not.

## 4. Incremental Update Procedure

Use this sequence for future work.

1. Add or refine the `pageId` metadata in `ScreenCommandCenterServiceImpl`.
2. Keep `frontend/src/app/screen-registry/pageManifests.ts` in sync.
3. Add or correct `data-help-id` markers so manifest instance keys and help-content anchors resolve to real DOM nodes.
4. Add function input/output and API request/response summaries.
5. Define masking rules for any sensitive fields.
6. Only then update the admin help-management panel if new metadata fields were introduced.
7. Validate:
   - `npm run build`
   - `npm run audit:ui-governance`
   - `mvn -DskipTests package`
   - `curl -sS 'http://localhost:18000/api/admin/help-management/screen-command/page?pageId=<pageId>'`

## 5. Recommended Next Blind-Spot Reductions

High-value future work that should still be safe:

- replace broad selectors with explicit `data-help-id` on company register/status/reapply screens
- classify sessionStorage relay fields explicitly in screen-command metadata
- add download event metadata for file downloads as coarse events
- add external-widget lifecycle events for Daum postcode usage
- extend admin pages with the same function/API/masking depth already added to major public flows
