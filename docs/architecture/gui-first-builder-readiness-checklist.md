# GUI-First Builder Readiness Checklist

Generated on 2026-03-21 for Resonance GUI-first authoring maturity.

## Goal

Confirm that operators and AI-assisted flows can build a governed screen through GUI surfaces without falling back to raw source editing for normal work.

Use together with:

- `docs/architecture/page-systemization-minimum-contract.md`
- `docs/architecture/system-folder-structure-alignment.md`

## 1. Project And Scenario Readiness

Confirm the GUI can:

- require `projectId` selection before authoring
- require scenario family and scenario selection
- show linked menu, route, actor policy, and release-unit target
- show stable `pageId`, `menuCode`, install scope, and ownership lane before publish

## 2. Theme And Layout Readiness

Confirm the GUI can:

- choose approved theme set
- choose page frame profile
- choose shell composition profile
- choose spacing and density profiles
- preview semantic HTML5 layout before publish

## 3. Component And Slot Readiness

Confirm the GUI can:

- choose only approved component catalog items
- choose component slot profiles by page zone
- show internal slot preview for same-family components
- block page-local drift outside approved slot profiles

## 4. Property And Assembly Readiness

Confirm the GUI can:

- edit component properties through a property panel
- assemble page from page-design and element-design assets
- show missing required props, missing bindings, and missing help anchors inline
- compare draft versus approved assembly

## 5. Binding Readiness

Confirm the GUI can:

- edit event bindings
- edit function bindings
- edit API bindings
- preview backend-chain target
- preview DB-chain target
- block publish when a binding family is incomplete

## 6. Security And Accessibility Readiness

Confirm the GUI can:

- select actor policy
- select explicit data scope and action scope
- select classification and CSRF policy
- select help anchors and diagnostics policy
- preview accessibility blockers
- preview security blockers

## 7. Publish And Runtime Readiness

Confirm the GUI can:

- export scaffold-ready payload
- show runtime package impact
- show compare result against current runtime
- open repair session from failed parity or uniformity rows
- publish only when release blockers are zero

## Completion Standard

Resonance is GUI-first ready only when all seven areas above can be completed from governed screens without raw manual source edits for ordinary page, component, and binding work.

No page should be called GUI-first ready if authority scope remains implicit or if the page cannot still be recognized as one systemized unit after regeneration, install, and runtime binding.
