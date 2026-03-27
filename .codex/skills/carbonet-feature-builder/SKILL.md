---
name: carbonet-feature-builder
description: Build or extend Carbonet menus, pages, services, mappers, templates, and related DB/menu metadata in this repository. Use when Codex must implement a new Carbonet screen or business function from menu definitions, screen artifacts under `/opt/reference/screen` or `/home/imaneya/workspace/화면설계`, or existing admin/member/home patterns while preserving the current package layout, MyBatis conventions, bilingual templates, and menu-code system.
---

# Carbonet Feature Builder

Implement new Carbonet features by matching the existing project structure first, then mapping the requested menu or screen to menu codes, DB metadata, templates, services, and permissions.

Use this as the default implementation skill for normal Carbonet features. If the main problem is design-source selection, Codex runner lifecycle, refresh/cache delivery, or system-wide audit architecture, switch to the specialized skill first and return here only for repository implementation.

Keep `SKILL.md` procedural. Load the reference files only when needed:

- If the task is primarily about interpreting `/home/imaneya/workspace/화면설계` itself, use `carbonet-screen-design-workspace` first to determine the canonical design sources and workflow scope, then return here for implementation.

- Read [references/project-patterns.md](references/project-patterns.md) for the current Java, template, URL, locale, mapper, and naming conventions.
- Read [references/menu-db-map.md](references/menu-db-map.md) when adding or changing menu codes, page registration, feature codes, or authority mappings.
- Read [references/business-requirements-map.md](references/business-requirements-map.md) when the request originates from `사업내용.txt` or the `screen` folders and you need the domain intent behind the screen.
- Read [references/screen-design-map.md](references/screen-design-map.md) when the request references `/home/imaneya/workspace/화면설계` artifacts, the mirrored `설계HTML*` and `html/화면` outputs, or the root `1.`, `2.`, `3.`, `4.` files.
- If the task touches `/admin/system/security-policy`, read `/opt/projects/carbonet/docs/operations/security-policy-ops.md` first so implementation stays aligned with the current detection engines, workflow states, suppress/baseline rules, and auto-fix boundaries.

## Workflow

1. Identify the target menu, actor, and language scope.
2. If the target screen already exists as a JSP/HTML template in this repository, treat that template as the canonical source for both behavior and visual structure before designing anything.
3. For React migration work, prefer a JSP-to-React parity workflow over redesign:
   - copy the original DOM structure in the same order
   - preserve the original class names and spacing tokens whenever possible
   - if a screen looks off, stop layering new utility classes and instead copy the original page-specific CSS/classes verbatim into the React page or shared stylesheet
   - prefer page-scoped classes copied from the original template over newly invented abstractions during the parity phase
   - replace only `th:*`, literal values, and inline scripts with React props/state/events
   - keep separate state screens (`default`, `pending`, `rejected`, `blocked`, etc.) rather than merging them early
   - add shared layout components only after the page visually matches the original
   - postpone "more React-like" refactors until after parity is confirmed
4. If the request came from `/home/imaneya/workspace/화면설계`, read the root source files in this order first:
   - `1. main_home_menu_designed.html`
   - `2. main_home_menu.html`
   - `3. admin_menu_dashboard.html`
   - `4. requirements_gap_dashboard.html`
5. If more detail is needed, trace the same feature in `설계/00_요구사항매핑.txt`, `화면설계서_최종통합.txt`, and the nearest detailed HTML mapping file under `HTML_서비스설계_v8` or `설계HTML_완성본_v8`.
6. Treat the local workspace copy as the primary design source and treat duplicate folders (`html`, `설계HTML`, `설계HTML_완성본_v8`, `화면`) as mirrored outputs unless timestamps or filenames clearly indicate a newer revision.
7. If a screen implies schema, code-table, or naming changes, inspect `DB_설계서_DDL.txt` and the public-data standard-term CSV before inventing table or column names.
8. Confirm whether the feature is `ADMIN` (`AMENU1`, `/admin/...`) or user/home (`HMENU1`, `/home...`, `/mypage`, `/join...`).
9. Check whether the feature is a plain page, a request workflow, or an approval workflow.
10. Trace the closest existing implementation before designing anything new.
11. Implement from the outside in:
   - template and route
   - controller
   - service interface and implementation path already used in the domain
   - mapper class and MyBatis XML
   - DTO/VO only when needed by the current pattern
   - menu/page/feature metadata rows or SQL changes if the menu must become manageable in admin
12. Add Korean and English views together unless the request explicitly scopes to one language.
13. If the change introduces new generated files, local-runtime artifacts, environment files, logs, caches, uploads, or build outputs, review `.gitignore` in the same turn and update it when needed.
14. Verify page URL, menu code, feature code, authority assumptions, and any schema naming choices against the design docs before finishing.
15. For admin page-management or feature-management changes, treat the following as one authority chain and review them together:
   - page registration in `COMTCCMMNDETAILCODE` and `COMTNMENUINFO`
   - default `PAGE_CODE_VIEW` feature creation in `COMTNMENUFUNCTIONINFO`
   - role and user-override cleanup or exposure through `COMTNAUTHORFUNCTIONRELATE` and `COMTNUSERFEATUREOVERRIDE`
   - bilingual feedback messages and delete-impact warnings in the page templates
16. When this authority chain is touched, keep the shared controller, service, mapper XML, and page templates under one session owner and update the AI docs/CSV maps in the same turn.
17. Treat admin authority work as a full chain, not a page-local edit:
   - `menu -> page -> feature -> authority group -> member/dept assignment -> user override -> audit log`
   - non-master flows must enforce `instt_id` or company scope in controller, service, and mapper layers
   - feature or permission pickers must only expose items the current actor is allowed to grant
18. When a request mixes admin React migration with authority editing, stabilize backend contracts and scope rules first, then restore the original admin template structure, then re-attach added features.
19. For the current authority restoration track, keep these five screens aligned as one working set:
   - `auth_group`
   - `auth_change`
   - `dept_role_mapping`
   - `member_edit`
   - `admin_account`
20. When extending `메뉴 관리`, treat it as the orchestration hub for managed screens:
   - keep existing legacy page/function screens working and hide them with `useAt` instead of deleting them
   - menu creation should auto-register page metadata and the default `PAGE_CODE_VIEW` feature when safe
   - menu creation should also seed draft UI manifest metadata so `screen command`, `full-stack management`, and `sr-workbench` can inspect the new page immediately
   - page position changes should be driven by menu order, not ad hoc code edits
   - do not couple site-map exposure directly to menu visibility; prefer a dedicated site-map management surface
21. When adding admin planning or governance tools such as `WBS 관리`, prefer this ownership model:
   - DB menu tree remains the source of truth for menu inventory
   - planning fields such as owner, status, planned schedule, actual schedule, notes, and AI work instruction are stored as an overlay, not as a replacement for menu metadata
   - menu-based tools should still resolve menu URL, page ID, feature codes, and related governance metadata from existing services before inventing new registries
22. For schedule-oriented admin tools, separate planned dates and actual dates in both storage and UI:
   - planned start/end
   - actual start/end
   - derived metrics such as variance days, overdue, on-time completion rate, and missing-plan count should be computed from those fields rather than manually entered
23. When the request adds or revises admin shell bootstrap behavior, keep the shell page contract and feature page contract aligned:
   - page bootstrap data should be composed in backend services before the React screen starts rendering
   - React shell fallback behavior should not silently replace missing authority or page metadata
   - if a new admin capability introduces reusable profile or preset data, store that profile data separately from the menu tree and document which service owns it
24. Treat `/admin/system/security-policy` as an operations product, not a single page:
   - keep backend detection rules, status workflow, suppress/baseline behavior, notification routing, and auto-fix/rollback actions in sync
   - when adding a new detection, update both the detection engine output contract and the React operator workflow in the same turn
   - distinguish between real remediation and heuristic tuning; do not hide real findings just to reduce counts
   - preserve explicit categories for `auto-fixable`, `review-required`, and source/heuristic/manual governance findings
25. When security-policy changes affect real remediation paths, verify the corresponding runtime controls too:
   - JWT/session behavior
   - admin authorization/interceptor coverage
   - rate limits for sensitive admin actions
   - audit logging for restore/backup/Codex execution or similar critical paths

## Build Rules

- Preserve the current package split under `src/main/java/egovframework/com/feature/<domain>`.
- Keep templates in `src/main/resources/templates/egovframework/com/<domain-or-admin>`.
- Use `snake_case` template names and add `_en` variants for English pages.
- For React migration, prefer exact parity over abstraction. A repeated but matching structure is better than a cleaner but visibly different structure during the parity phase.
- Reuse `BaseMapperSupport`-based mapper classes and matching XML namespaces.
- Prefer extending an existing domain package over inventing a new one unless the feature is clearly isolated.
- Keep menu labels, page labels, and feature labels bilingual when the current admin pattern already does so.
- Do not invent menu-code or authority-table semantics; follow the current 4/6/8-digit code hierarchy and the existing authority relation tables.
- Preserve explicit request-state and approval relationships shown in the design artifacts when they exist.
- If the design artifact pairs a user action with an admin approval or rejection screen, treat that pairing as part of the feature scope rather than optional follow-up work.
- Reuse the shared alert, modal, toast, error, and popup behavior described in the design artifacts instead of inventing ad hoc feedback patterns.
- When multiple mirrored HTML files exist for the same flow, prefer the most integrated file first:
  - root `1.`, `2.`, `3.`, `4.` for IA and scope
  - `HTML_서비스설계_v8/*_mapping_detail.html` for user-admin workflow pairing
  - `설계HTML_완성본_v8` when a polished final layout is needed
  - `html` or `화면` only when the same file is missing elsewhere
- Use `설계/00_Master_UCS.csv` or `설계/00_Master_UCS_상세.csv` when the request needs UC IDs, coverage tracking, or proposal linkage beyond the narrative text files.
- Use `행정안전부_공공데이터 공통표준용어_20251101.csv` as a naming sanity check for new Korean labels, columns, and code names; adapt to the existing project conventions rather than copying blindly.
- When the request is ambiguous, infer structure from the nearest implemented menu, but do not infer hidden business policy. Surface that gap in the final response.
- If the feature introduces a new admin tool page and local deployment is needed for verification, package first and restart second. Do not run `mvn package` and restart in parallel because the runtime jar can copy a stale artifact.
- When working on security-policy or other diagnostic consoles, verify both sides:
  - UI behavior and operator actions
  - actual runtime remediations in Java/Spring/React code when findings are marked fixed

## Required Checks

- Does the new screen need a menu detail code row and a `COMTNMENUINFO` row?
- Does the page need one or more feature codes in `COMTNMENUFUNCTIONINFO`?
- Does the feature require role exposure through `COMTNAUTHORFUNCTIONRELATE` or existing role management screens?
- If this is a page-management change, does registration still auto-create the default `PAGE_CODE_VIEW` feature and does delete still block on non-default action features?
- If this is a page-management change, are delete impact counts and blocked-feature links still accurate for both Korean and English templates?
- Does the route need both Korean and English URL handling?
- Does the screen affect admin search, list, approval, status, attachment, or history behavior already described in `사업내용.txt`?
- Does the implementation need audit fields, status transitions, or attachment handling that already exists in nearby modules?
- Does the screen require explicit confirm, success, error, warning, toast, or modal behavior already standardized in the design docs?
- If this is a 신청형 flow, is there a matching approve or reject path, rejection reason, notification handling, and reapply or reflected-status path?
- Do duplicated design outputs disagree? If so, prefer the workspace root files and `설계HTML_완성본_v8`, and mention the conflict explicitly.
- Does the request imply new tables, columns, or domain terms that should be cross-checked against `DB_설계서_DDL.txt` and the standard-term CSV?
- Did the change create new local-only artifacts or generated outputs that require a `.gitignore` update?

## Delivery Shape

For a normal feature request, produce:

- changed files implementing the screen or function
- any required SQL or DB metadata additions
- assumptions that remained implicit in the source materials
- a short verification summary tied to route, menu, feature code, and role impact

## Source Artifacts

- Original business source: `/opt/reference/screen/사업내용.txt`
- Workspace screen-design root: `/home/imaneya/workspace/화면설계`
- Primary screen-design roots: `/home/imaneya/workspace/화면설계/1. main_home_menu_designed.html`, `/home/imaneya/workspace/화면설계/2. main_home_menu.html`, `/home/imaneya/workspace/화면설계/3. admin_menu_dashboard.html`, `/home/imaneya/workspace/화면설계/4. requirements_gap_dashboard.html`
- Requirements-to-UC mapping: `/home/imaneya/workspace/화면설계/설계/00_요구사항매핑.txt`
- UC master sheets: `/home/imaneya/workspace/화면설계/설계/00_Master_UCS.csv`, `/home/imaneya/workspace/화면설계/설계/00_Master_UCS_상세.csv`
- Consolidated screen design: `/home/imaneya/workspace/화면설계/화면설계서_최종통합.txt`
- Component and popup design: `/home/imaneya/workspace/화면설계/화면설계서_상세_컴포넌트_API.txt`
- Interaction and data model design: `/home/imaneya/workspace/화면설계/화면설계서_상호작용시나리오_데이터모델.txt`
- Schema and naming references: `/home/imaneya/workspace/화면설계/DB_설계서_DDL.txt`, `/home/imaneya/workspace/화면설계/행정안전부_공공데이터 공통표준용어_20251101.csv`
- HTML design roots: `/home/imaneya/workspace/화면설계/HTML_서비스설계_v8`, `/home/imaneya/workspace/화면설계/설계HTML`, `/home/imaneya/workspace/화면설계/설계HTML_완성본_v8`, `/home/imaneya/workspace/화면설계/html`, `/home/imaneya/workspace/화면설계/화면`
- Screen source folders: `/opt/reference/screen/0. Gnb메뉴`, `/opt/reference/screen/1. 메인화면`, `/opt/reference/screen/2. 회원인증`, `/opt/reference/screen/4. 메뉴화면`, `/opt/reference/screen/고객지원 메뉴`, `/opt/reference/screen/관리자화면`, `/opt/reference/screen/일반관리자화면`
