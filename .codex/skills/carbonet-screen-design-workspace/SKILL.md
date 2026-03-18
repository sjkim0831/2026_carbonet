---
name: carbonet-screen-design-workspace
description: Use when a request is driven by `/home/imaneya/workspace/화면설계` artifacts and Codex must interpret the design workspace, choose the canonical source among duplicated exports, map screens to routes or workflows, and extract UI, admin-linkage, schema, or requirement details for Carbonet work.
---

# Carbonet Screen Design Workspace

Use this skill when the request references the local design workspace at `/home/imaneya/workspace/화면설계`.

This skill resolves source-of-truth design inputs. After the canonical design artifacts and workflow meaning are clear, move implementation work to `carbonet-feature-builder`.

Keep the workflow lightweight. Read only the files needed for the current task.

## Source of truth

Treat `/home/imaneya/workspace/화면설계` as the primary design workspace for Carbonet-related screen work.

The folder mixes canonical docs, mirrored HTML exports, and support references:

- root `1.`, `2.`, `3.`, `4.` files for IA and coverage anchors
- `설계` for requirement-to-UC mapping
- `화면설계서_*` text files for consolidated route, interaction, and component rules
- `HTML_서비스설계_v8` for integrated mapping-detail HTML
- `설계HTML_완성본_v8` for polished final HTML layouts
- `설계HTML`, `html`, `화면` as mirrored or generated outputs
- `DB_설계서_DDL.txt` for schema clues
- `행정안전부_공공데이터 공통표준용어_20251101.csv` for naming checks

Read [references/workspace-map.md](references/workspace-map.md) when you need the exact file-selection order or the meaning of specific artifact groups.

## Required workflow

1. Start from the user request and classify it as one of:
   - IA/menu placement
   - screen layout or interaction
   - request and approval workflow
   - endpoint or route mapping
   - DB/schema or naming support
2. Read the root files first when the request scope is broad:
   - `1. main_home_menu_designed.html`
   - `2. main_home_menu.html`
   - `3. admin_menu_dashboard.html`
   - `4. requirements_gap_dashboard.html`
3. Move to the narrowest detailed source that matches the task:
   - `설계/00_요구사항매핑.txt` or `00_Master_UCS*` for UC and proposal mapping
   - `화면설계서_최종통합.txt` for route, menu tree, and screen IDs
   - `화면설계서_상세_컴포넌트_API.txt` for alert, popup, and component behavior
   - `화면설계서_상호작용시나리오_데이터모델.txt` for state transitions and data model hints
   - `HTML_서비스설계_v8/*_mapping_detail.html` for user-admin linkage and flow details
   - `설계HTML_완성본_v8` for final layout detail
4. Treat duplicate files under `설계HTML`, `html`, and `화면` as fallback mirrors unless they are clearly newer.
5. If the request implies a user submission flow, check whether the design also defines:
   - admin processing screen
   - approve or reject action
   - rejection reason
   - status exposure to the user
   - reapply path
6. If the request implies schema or naming decisions, cross-check `DB_설계서_DDL.txt` and the standard-term CSV before inventing names.
7. If sources conflict, prefer the higher-priority source and state the conflict explicitly in the final response.

## Practical rules

- Treat HTML artifacts as design references, not production code.
- Use design artifacts to discover scope gaps even when implementation should follow existing repository patterns.
- Do not blindly copy speculative API paths from HTML comments into the app; translate intent into the actual codebase conventions.
- When a design artifact shows paired user and admin screens, consider the pair part of the same feature scope.
- When a design artifact shows alerts, modals, downloads, or status banners, preserve those behaviors in implementation or call out the mismatch.
- Prefer the smallest set of files that answers the question; do not bulk-load the entire workspace.

## Output expectations

For design-driven tasks, report:

- which workspace files were treated as canonical
- any conflicts between duplicated artifacts
- the derived route, actor, state, or schema conclusions
- any missing implementation half such as absent admin review or reapply flow
