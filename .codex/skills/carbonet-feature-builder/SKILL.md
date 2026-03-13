---
name: carbonet-feature-builder
description: Build or extend Carbonet menus, pages, services, mappers, templates, and related DB/menu metadata in this repository. Use when Codex must implement a new Carbonet screen or business function from menu definitions, screen artifacts under `/opt/reference/screen`, `/opt/reference/screen/사업내용.txt`, or existing admin/member/home patterns while preserving the current package layout, MyBatis conventions, bilingual templates, and menu-code system.
---

# Carbonet Feature Builder

Implement new Carbonet features by matching the existing project structure first, then mapping the requested menu or screen to menu codes, DB metadata, templates, services, and permissions.

Keep `SKILL.md` procedural. Load the reference files only when needed:

- Read [references/project-patterns.md](references/project-patterns.md) for the current Java, template, URL, locale, mapper, and naming conventions.
- Read [references/menu-db-map.md](references/menu-db-map.md) when adding or changing menu codes, page registration, feature codes, or authority mappings.
- Read [references/business-requirements-map.md](references/business-requirements-map.md) when the request originates from `사업내용.txt` or the `screen` folders and you need the domain intent behind the screen.
- Read [references/screen-design-map.md](references/screen-design-map.md) when the request references `/opt/refrence/화면설계` artifacts, especially the root `1.`, `2.`, `3.`, `4.` files, `설계/00_요구사항매핑.txt`, or HTML design outputs.

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
4. If the request came from `/opt/refrence/화면설계`, read the root source files in this order first:
   - `1. main_home_menu_designed.html`
   - `2. main_home_menu.html`
   - `3. admin_menu_dashboard.html`
   - `4. requirements_gap_dashboard.html`
5. If more detail is needed, trace the same feature in `설계/00_요구사항매핑.txt`, `화면설계서_최종통합.txt`, and the nearest detailed HTML mapping file.
6. Confirm whether the feature is `ADMIN` (`AMENU1`, `/admin/...`) or user/home (`HMENU1`, `/home...`, `/mypage`, `/join...`).
7. Check whether the feature is a plain page, a request workflow, or an approval workflow.
8. Trace the closest existing implementation before designing anything new.
9. Implement from the outside in:
   - template and route
   - controller
   - service interface and implementation path already used in the domain
   - mapper class and MyBatis XML
   - DTO/VO only when needed by the current pattern
   - menu/page/feature metadata rows or SQL changes if the menu must become manageable in admin
10. Add Korean and English views together unless the request explicitly scopes to one language.
11. Verify page URL, menu code, feature code, and authority assumptions against the existing DB conventions before finishing.

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
- When the request is ambiguous, infer structure from the nearest implemented menu, but do not infer hidden business policy. Surface that gap in the final response.

## Required Checks

- Does the new screen need a menu detail code row and a `COMTNMENUINFO` row?
- Does the page need one or more feature codes in `COMTNMENUFUNCTIONINFO`?
- Does the feature require role exposure through `COMTNAUTHORFUNCTIONRELATE` or existing role management screens?
- Does the route need both Korean and English URL handling?
- Does the screen affect admin search, list, approval, status, attachment, or history behavior already described in `사업내용.txt`?
- Does the implementation need audit fields, status transitions, or attachment handling that already exists in nearby modules?
- Does the screen require explicit confirm, success, error, warning, toast, or modal behavior already standardized in the design docs?
- If this is a 신청형 flow, is there a matching approve or reject path, rejection reason, notification handling, and reapply or reflected-status path?

## Delivery Shape

For a normal feature request, produce:

- changed files implementing the screen or function
- any required SQL or DB metadata additions
- assumptions that remained implicit in the source materials
- a short verification summary tied to route, menu, feature code, and role impact

## Source Artifacts

- Original business source: `/opt/reference/screen/사업내용.txt`
- Primary screen-design roots: `/opt/refrence/화면설계/1. main_home_menu_designed.html`, `/opt/refrence/화면설계/2. main_home_menu.html`, `/opt/refrence/화면설계/3. admin_menu_dashboard.html`, `/opt/refrence/화면설계/4. requirements_gap_dashboard.html`
- Requirements-to-UC mapping: `/opt/refrence/화면설계/설계/00_요구사항매핑.txt`
- Consolidated screen design: `/opt/refrence/화면설계/화면설계서_최종통합.txt`
- Component and popup design: `/opt/refrence/화면설계/화면설계서_상세_컴포넌트_API.txt`
- Interaction and data model design: `/opt/refrence/화면설계/화면설계서_상호작용시나리오_데이터모델.txt`
- HTML design roots: `/opt/refrence/화면설계/HTML_서비스설계_v8`, `/opt/refrence/화면설계/설계HTML`, `/opt/refrence/화면설계/설계HTML_완성본_v8`, `/opt/refrence/화면설계/화면`
- Screen source folders: `/opt/reference/screen/0. Gnb메뉴`, `/opt/reference/screen/1. 메인화면`, `/opt/reference/screen/2. 회원인증`, `/opt/reference/screen/4. 메뉴화면`, `/opt/reference/screen/고객지원 메뉴`, `/opt/reference/screen/관리자화면`, `/opt/reference/screen/일반관리자화면`
