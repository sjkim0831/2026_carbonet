# Skill Boundaries

This document defines the current Carbonet skill taxonomy, overlap rules, and the preferred selection order.

## Skill Groups

### Coordination

- `carbonet-ai-session-orchestrator`
  - Role: classify ownership, split work safely, and define session boundaries.
  - Use first when the request can touch shared files, cross-cutting contracts, or multi-step implementation.
  - Do not use as the primary implementation guide for feature logic or page behavior.

### Source interpretation

- `carbonet-screen-design-workspace`
  - Role: interpret `/home/imaneya/workspace/화면설계` and decide which design artifact is canonical.
  - Use before implementation when the request is design-led or when duplicated HTML/design outputs conflict.
  - Hand off to `carbonet-feature-builder` after scope, route, actor, and workflow are resolved.

### Feature implementation

- `carbonet-feature-builder`
  - Role: implement Carbonet menus, pages, services, mappers, templates, metadata, and related admin flows.
  - Use after the design source is known and the session boundary is understood.
  - Do not use as the primary guide for central Codex runner behavior, cache-delivery policy, or system-wide observability architecture.

### Specialized admin execution

- `carbonet-codex-execution-console`
  - Role: extend `/admin/system/codex-request`, SR Workbench execution lifecycle, runner scripts, and Codex handoff behavior.
  - Use when the request is specifically about the Codex runner, `prepare -> plan -> build`, stack/queue behavior, or console page-data ownership.
  - If the task also changes ordinary admin menus or screen CRUD, pair with `carbonet-feature-builder` but keep execution-console ownership primary.

### Cross-cutting architecture

- `carbonet-audit-trace-architecture`
  - Role: define audit, trace, UI manifest, registry, and rollout governance across backend and frontend.
  - Use when the request is about tracking, metadata design, queryability, or system-wide governance.
  - If the task later becomes page implementation, hand off execution details to `carbonet-feature-builder`.

### Delivery consistency

- `carbonet-react-refresh-consistency`
  - Role: preserve correct refresh behavior for React assets, shell HTML, manifest resolution, and deployment packaging.
  - Use only when the problem is static-asset delivery, refresh visibility, or cache boundaries.
  - Do not use as the primary skill for page behavior or business workflows.

## Common Overlaps

### `carbonet-screen-design-workspace` vs `carbonet-feature-builder`

- Use `carbonet-screen-design-workspace` to decide what the screen should be.
- Use `carbonet-feature-builder` to implement it in Carbonet.
- Rule: design interpretation first, repository implementation second.

### `carbonet-feature-builder` vs `carbonet-codex-execution-console`

- Use `carbonet-codex-execution-console` when the core problem is Codex runner behavior, queue/stack flow, console page-data, or runner scripts.
- Use `carbonet-feature-builder` when the core problem is a normal menu/page/service/template feature.
- Rule: if `/admin/system/codex-request` or SR execution semantics are central, execution-console owns the task.

### `carbonet-feature-builder` vs `carbonet-audit-trace-architecture`

- Use `carbonet-audit-trace-architecture` to define what must be logged, traced, registered, or governed.
- Use `carbonet-feature-builder` to wire those requirements into a concrete page or service.
- Rule: architecture decisions first, feature wiring second.

### `carbonet-react-refresh-consistency` vs page-focused skills

- Use `carbonet-react-refresh-consistency` only when the issue is refresh mismatch, stale bundles, manifest/cache policy, or runtime jar packaging.
- Use the feature-oriented skill when the request is about the page behavior itself.

## Selection Order

1. Start with `carbonet-ai-session-orchestrator` when ownership or conflict risk is unclear.
2. Use `carbonet-screen-design-workspace` if the task is design-driven.
3. Choose exactly one primary implementation skill:
   - `carbonet-feature-builder`
   - `carbonet-codex-execution-console`
   - `carbonet-audit-trace-architecture`
   - `carbonet-react-refresh-consistency`
4. Add a secondary skill only when the task truly spans both domains.

## Anti-Duplication Rules

- Do not repeat the same “read these references first” lists across unrelated skills unless the references are truly mandatory for that skill.
- Keep broad implementation rules in `carbonet-feature-builder`.
- Keep system-wide governance rules in `carbonet-audit-trace-architecture`.
- Keep Codex runner lifecycle rules in `carbonet-codex-execution-console`.
- Keep refresh/cache rules in `carbonet-react-refresh-consistency`.
- Keep design-source selection rules in `carbonet-screen-design-workspace`.

## Current Practical Mapping

- New admin screen from design workspace:
  - `carbonet-ai-session-orchestrator` -> `carbonet-screen-design-workspace` -> `carbonet-feature-builder`
- Codex queue or SR execution change:
  - `carbonet-ai-session-orchestrator` -> `carbonet-codex-execution-console`
- Audit/trace registry rollout:
  - `carbonet-ai-session-orchestrator` -> `carbonet-audit-trace-architecture`
- React page works in source but stays stale after deploy:
  - `carbonet-ai-session-orchestrator` -> `carbonet-react-refresh-consistency`
