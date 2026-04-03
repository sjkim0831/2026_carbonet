---
name: carbonet-ai-session-orchestrator
description: Plan and standardize conflict-free AI session ownership for all Carbonet work. Use this first to classify tasks by ownership, path boundaries, and handoff rules before deciding whether the work stays in one session or splits into many.
---

# Carbonet AI Session Orchestrator

Use this skill first for any task that needs a safe session boundary decision.

Read only what you need:

- Read [`/opt/projects/carbonet/docs/ai/00-governance/ai-fast-path.md`](/opt/projects/carbonet/docs/ai/00-governance/ai-fast-path.md) for default AI operating rules.
- Read [`/opt/projects/carbonet/docs/ai/00-governance/ai-session-partitioning.md`](/opt/projects/carbonet/docs/ai/00-governance/ai-session-partitioning.md) for the canonical session split standard.
- Read [`/opt/projects/carbonet/docs/ai/60-operations/session-orchestration/README.md`](/opt/projects/carbonet/docs/ai/60-operations/session-orchestration/README.md) before creating or reopening durable session artifacts.
- Read [`/opt/projects/carbonet/docs/operations/account-relogin-continuity-playbook.md`](/opt/projects/carbonet/docs/operations/account-relogin-continuity-playbook.md) when the operator wants a fresh login or new account to resume work without overlap.
- Read [`/opt/projects/carbonet/docs/architecture/install-unit-lifecycle-and-resource-governance.md`](/opt/projects/carbonet/docs/architecture/install-unit-lifecycle-and-resource-governance.md) when the request affects menu lifecycle, install/copy/delete, resource ownership, or garbage/orphan decisions.
- Read [`/opt/projects/carbonet/docs/architecture/platform-common-module-versioning.md`](/opt/projects/carbonet/docs/architecture/platform-common-module-versioning.md) when the request affects common-platform sharing, jar/module packaging, or version-pinned rollout decisions.
- Read [`/opt/projects/carbonet/docs/architecture/common-module-taxonomy.md`](/opt/projects/carbonet/docs/architecture/common-module-taxonomy.md) when the request affects whether work belongs in `SI_COMMON`, `OPS_COMMON`, or a project-specific module.
- Read [`/opt/projects/carbonet/docs/architecture/common-db-and-project-db-splitting.md`](/opt/projects/carbonet/docs/architecture/common-db-and-project-db-splitting.md) when the request affects common DB retention, project DB splitting, or scaffolding and migration control across multiple DBs.
- Read [`/opt/projects/carbonet/docs/architecture/platform-console-information-architecture.md`](/opt/projects/carbonet/docs/architecture/platform-console-information-architecture.md) when the request affects super-master workflow, project registry, or main-console scope definition.
- Read [`/opt/projects/carbonet/docs/architecture/db-migration-and-upgrade-operations.md`](/opt/projects/carbonet/docs/architecture/db-migration-and-upgrade-operations.md) when the request affects release timing, DB migration sequencing, rollback planning, or cutover strategy.
- Read [`/opt/projects/carbonet/docs/architecture/platform-control-plane-data-model.md`](/opt/projects/carbonet/docs/architecture/platform-control-plane-data-model.md) when the request affects common-DB table design for project registry, install units, resources, common modules, or release units.

## Use Cases

- any new implementation request
- frontend and backend moving together
- shared contract or shared file conflict risk
- multi-session execution planning
- merge-safe batch design
- defining allowed paths and handoff rules
- confirming that a task is safe to keep in one session
- common-platform and project-module split work
- install-unit registry or menu-lifecycle work
- resource ownership and uninstall-safety work

## Workflow

1. Classify requested work into:
   - independent
   - shared resource
   - dependency ordered
2. Before splitting by path alone, classify the ownership scope:
   - common platform
   - project module
   - install unit
   - docs and verification
3. Identify conflict groups by file family, contract family, ownership scope, and version boundary.
4. Decide whether the work should stay in one session or split.
5. Assign one owner for each shared file family.
6. Create the minimum safe session set:
   - coordinator
   - one or two frontend sessions
   - one or two backend sessions
   - documentation and verification
7. Define `allowedPaths` and `forbiddenPaths` for every session.
8. Fix contracts before implementation:
   - API
   - DTO or VO
   - events
   - DB impact
   - package ownership
   - delete or orphan rules
9. Define handoff order and merge order.

## Re-Login Continuity Rule

When the operator wants work to survive account re-login or a new session:

1. Reopen the latest durable plan under `docs/ai/60-operations/session-orchestration/active/`.
2. Reconcile it against the real working tree with `git status --short`.
3. Record shared-file ownership before doing new implementation.
4. Capture current blockers, next step, and verification state in a handoff note before stopping.
5. Do not open a new implementation lane until the resumed lane's allowed paths are clear.

## Delivery Rules

- For simple isolated work, allow the classification to end in one session.
- Prefer 4 to 6 sessions for 10 work items unless work is exceptionally isolated.
- Never default to one session per bullet item.
- Keep one session responsible for one shared file family.
- Use coordinator ownership for common infrastructure and cross-cutting contracts.
- Ensure the verification session owns repository map updates when the work changes screens, APIs, or DB impact.
- Do not split common-platform compatibility work across multiple sessions if they touch the same facade, contract, or registry family.
- If the task includes install/copy/delete behavior, keep ownership-model changes and delete-safety verification in the same session.
- Do not recommend runtime source sharing between deployed child systems and the main platform. Session planning should assume versioned artifacts and reproducible builds.

## Response Shape

For planning requests, provide:

- grouped work items
- session list
- allowed paths per session
- forbidden paths per session
- dependency order
- shared file ownership
- merge or review order

For implementation requests, provide:

- the same session plan first
- then carry out the work in a conflict-safe order

When the request is about platformization, explicitly group work as:

- common platform contracts
- project-specific business thin layer
- install-unit registry and lifecycle
- UI and docs verification

## Default Rule

Apply this skill automatically before starting implementation, even if the final result is a single-session execution plan.
