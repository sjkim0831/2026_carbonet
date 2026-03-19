---
name: carbonet-screen-builder
description: Design or implement a Carbonet admin screen builder that lets operators compose screens with drag-and-drop layout, property editing, data binding, event wiring, schema storage, runtime rendering, and menu integration. Use when requests mention no-code page creation, drag-and-drop UI building, component palettes, event mapping, runtime schema rendering, or extending `/admin/system/environment-management` into a screen-builder workflow.
---

# Carbonet Screen Builder

Use this skill when the user wants Carbonet to create or evolve a drag-and-drop screen builder instead of a single fixed page.

Read only what you need:

- Read [`/opt/projects/carbonet/docs/architecture/admin-screen-builder-architecture.md`](/opt/projects/carbonet/docs/architecture/admin-screen-builder-architecture.md) first for the canonical architecture, phased rollout, storage model, and scope boundaries.
- Read [`/opt/projects/carbonet/docs/architecture/admin-screen-builder-phase1-mvp.md`](/opt/projects/carbonet/docs/architecture/admin-screen-builder-phase1-mvp.md) when the user asks for concrete Phase 1 implementation scope, table/API/React breakdown, or delivery order.
- Read [`/opt/projects/carbonet/docs/sql/admin_screen_builder_phase1_schema.sql`](/opt/projects/carbonet/docs/sql/admin_screen_builder_phase1_schema.sql) when the request needs table design, draft/publish/version storage, or a starting SQL contract.
- Read [`/opt/projects/carbonet/docs/frontend/admin-screen-layout-standard.md`](/opt/projects/carbonet/docs/frontend/admin-screen-layout-standard.md) when the request touches layout slots, action placement, page frames, or UI consistency rules.
- Read [`/opt/projects/carbonet/.codex/skills/carbonet-audit-trace-architecture/SKILL.md`](/opt/projects/carbonet/.codex/skills/carbonet-audit-trace-architecture/SKILL.md) if the request also needs audit, trace, manifest, registry, or runtime observability.
- Read [`/opt/projects/carbonet/.codex/skills/carbonet-feature-builder/SKILL.md`](/opt/projects/carbonet/.codex/skills/carbonet-feature-builder/SKILL.md) if the request includes actual Carbonet menu/page/service implementation beyond the builder platform itself.

## Use Cases

- drag-and-drop admin page builder
- no-code or low-code screen composer
- component palette and property panel
- event binding editor
- runtime screen schema renderer
- menu integration for generated pages
- schema versioning, publish, preview, rollback
- builder-backed page templates such as list/detail/edit/review

## Default Scope Rules

Treat screen-builder work as four layers:

1. `builder authoring UI`
2. `schema persistence and validation`
3. `runtime renderer`
4. `menu / authority / metadata integration`

Do not jump straight to “build every screen”. Start from the narrowest viable template set:

- list
- detail
- edit
- review

## Workflow

1. Classify the request:
   - architecture only
   - MVP design
   - builder UI implementation
   - schema/runtime implementation
   - menu integration
2. Decide the release phase:
   - Phase 1: layout + component palette
   - Phase 2: event/data binding
   - Phase 3: runtime/publish
   - Phase 4: governance/audit/rollback
3. Fix the canonical storage contract before UI work:
   - screen schema id
   - version id
   - component tree
   - event bindings
   - data bindings
   - publish status
4. Keep menu integration separate from builder authoring:
   - menu tree remains the inventory source of truth
   - builder schema is an overlay attached to a menu/page
5. Define allowed components explicitly. Avoid an unbounded palette in early phases.
6. For event binding, support only a small action set first:
   - navigate
   - open modal
   - set field/state
   - submit API
   - refresh query
7. Require validation before publish:
   - broken component references
   - missing API/schema links
   - invalid event target
   - missing authority metadata
8. If implementation is requested, build in this order:
   - schema types
   - validation
   - minimal runtime renderer
   - authoring UI
   - menu/environment integration
   - audit and publish history

## Delivery Rules

- Prefer template-limited MVP over a universal builder.
- Keep builder schema versioned and draft-first.
- Keep runtime rendering deterministic; do not hide missing bindings silently.
- Use existing environment-management, auth-group, screen-command, and full-stack metadata flows instead of inventing disconnected registries.
- Treat generated or builder-managed pages as installable runtime assets with explicit ownership and delete rules.

## Response Shape

For planning requests, provide:

- phase scope
- required modules
- storage contract
- runtime contract
- menu and authority impact
- rollout order
- first implementation slice with exact page/API/table ownership when the request is implementation-oriented

For implementation requests, provide:

- changed files
- schema/storage assumptions
- menu integration impact
- verification summary
