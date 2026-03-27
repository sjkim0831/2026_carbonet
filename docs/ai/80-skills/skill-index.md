# Skill Index

Current project-relevant skills:

See also:

- `docs/ai/80-skills/skill-boundaries.md` for overlap rules, grouping, and selection order.
- `docs/ai/80-skills/skill-gaps.md` for recurring work that still lacks a dedicated skill, including infrastructure topology and shared-runtime operations guidance.
- `docs/ai/80-skills/workspace-system-skill-doc-backlog.md` for concrete workspace-system skill/doc additions grounded in current `codex-request`, `sr-workbench`, `screen-builder`, and observability code paths.

- `carbonet-ai-session-orchestrator`
  - Purpose: classify work by shared file ownership and decide whether the task stays in one session or splits.
  - Group: coordination
  - Use for: any implementation that touches shared controllers, templates, contracts, or docs.
  - Boundary: use to plan ownership first, then hand off actual design or implementation work to a primary domain skill.
  - Key references: `STRUCTURE.md`, `docs/ai/00-governance/ai-fast-path.md`, `docs/ai/00-governance/ai-session-partitioning.md`
- `carbonet-screen-design-workspace`
  - Purpose: resolve canonical design sources under `/home/imaneya/workspace/화면설계`.
  - Group: source interpretation
  - Use for: design-driven page work, menu IA interpretation, duplicated HTML source conflicts.
  - Boundary: stop after the canonical design source, route/workflow meaning, and conflict resolution are clear; implementation belongs to `carbonet-feature-builder`.
  - Key references: workspace root `1.`, `2.`, `3.`, `4.` HTML files and design mapping text files.
- `html-screen-porter`
  - Purpose: convert HTML design inputs into Carbonet React migration pages using page-type classification, screen family assignment, and shared-frame reconstruction.
  - Group: source interpretation plus implementation bridge
  - Use for: large-volume HTML-to-React porting, page-type classification, hidden detail/edit context mapping, and design-source-driven screen reconstruction without shipping raw HTML.
  - Boundary: use after canonical source selection is clear; pair with `carbonet-feature-builder` when repository implementation and menu metadata wiring are required.
  - Key references: `.codex/skills/html-screen-porter/SKILL.md`, `docs/architecture/html-to-react-page-contract.md`, `docs/architecture/screen-family-model.md`
- `carbonet-audit-trace-architecture`
  - Purpose: design and extend audit, trace, UI manifest, and operational metadata.
  - Group: cross-cutting architecture
  - Use for: observability, parameter tracing, component registry, rollout governance, and performance-sensitive algorithm/data-structure decisions on those paths.
  - Boundary: use for system-wide logging, trace, registry, and governance design; page-specific implementation follow-through usually belongs to `carbonet-feature-builder`.
  - Key references: `docs/architecture/system-observability-audit-trace-design.md`, `docs/architecture/performance-algorithm-upgrade-notes.md`, `docs/ai/60-operations/performance-handoff-prompt-20260318.md`, `docs/ai/60-operations/audit-log-fields.md`
- `carbonet-react-refresh-consistency`
  - Purpose: keep React migration changes visible after refresh while preserving sane cache behavior.
  - Group: delivery consistency
  - Use for: React shell/static asset/resource caching changes.
  - Boundary: use only when the issue is cache, shell, manifest, build-output, or deployment freshness rather than page business behavior.
  - Key references: `docs/ai/60-operations/react-refresh-and-cache-control.md`
- `carbonet-feature-builder`
  - Purpose: implement or extend Carbonet screens, menus, services, mappers, templates, and admin metadata.
  - Group: feature implementation
  - Use for: page management, feature management, menu metadata, bilingual admin templates, admin shell bootstrap pages, author-role profile management, `PAGE_CODE_VIEW` authority-chain work, the five-screen admin permission restoration set (`auth_group`, `auth_change`, `dept_role_mapping`, `member_edit`, `admin_account`), and `/admin/system/security-policy` style admin operations consoles where backend rules, React actions, SQL preview/rollback, and runtime remediation must move together.
  - Boundary: this is the default implementation skill for normal app features, but not for Codex runner internals, refresh/cache policy, or system-wide audit architecture.
  - Key references: `.codex/skills/carbonet-feature-builder/references/*`, `docs/ai/40-backend/auth-policy.csv`, `docs/ai/50-data/table-screen-api-map.csv`, `docs/operations/security-policy-ops.md`
- `admin-screen-unifier`
  - Purpose: normalize existing admin screens to one governed design system across list, detail, edit, create, approve, and authority pages.
  - Group: feature implementation
  - Use for: button size drift, field height drift, inconsistent search cards, divergent status messages, and menu active or hidden-screen consistency issues.
  - Boundary: use when the screen already exists and the main problem is design drift rather than feature creation from scratch.
  - Key references: `.codex/skills/admin-screen-unifier/SKILL.md`, `docs/architecture/screen-context-and-flow.md`, `docs/architecture/screen-family-model.md`
- `carbonet-codex-execution-console`
  - Purpose: continue or extend the Carbonet Codex execution console and SR Workbench execution lifecycle.
  - Group: specialized admin execution
  - Use for: `/admin/system/codex-request`, `prepare -> plan -> build`, Spring Codex runner wiring, runner shell scripts, central queue behavior, and cross-account handoff docs.
  - Boundary: if the task is mainly about Codex execution lifecycle or console ownership, this skill takes precedence over `carbonet-feature-builder`.
  - Key references: `docs/architecture/codex-execution-console-handoff.md`, `ops/scripts/codex-plan.sh`, `ops/scripts/codex-build.sh`, `frontend/src/features/codex-provision/CodexProvisionMigrationPage.tsx`, `frontend/src/features/sr-workbench/SrWorkbenchMigrationPage.tsx`
- `carbonet-join-react-migration`
  - Purpose: handle join/signup React migration flows with parity and session-backed state.
  - Group: feature implementation
  - Use for: join step flows, company status/reapply, Korean-English parity in React migration.
  - Boundary: use as a focused variant of feature implementation for join flows instead of the broader `carbonet-feature-builder` guidance.
  - Key references: `/home/imaneya/.codex/skills/carbonet-join-react-migration/SKILL.md`
- `carbonet-runtime-topology-ops`
  - Purpose: design or document Carbonet runtime topology and centralized operations-system build ownership for small-memory multi-node operations.
  - Group: infrastructure operations
  - Use for: Jenkins plus Nomad coordination, main/sub web nodes, shared idle-node pools, per-system DB isolation, Nginx entrypoints, latest-vs-archive file placement, centralized scaffolding/build/deploy flow, main-server runtime-truth rules, version binding and upgrade rollout flow, active-release tracking, installable module or plug-in attachment rules, and tmux rollout layout.
  - Boundary: use for runtime/server-role allocation and deployment-topology guidance, not for application feature implementation or Codex runner internals.
  - Key references: `.codex/skills/carbonet-runtime-topology-ops/SKILL.md`, `docs/ai/80-skills/skill-boundaries.md`, `docs/ai/80-skills/skill-gaps.md`

Add new skills here with:

- skill name
- purpose
- when to use
- key references
