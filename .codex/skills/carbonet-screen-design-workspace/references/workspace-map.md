# Workspace Map

Use this reference when a task depends on the exact structure of `/home/imaneya/workspace/화면설계`.

## Primary folders and files

- `1. main_home_menu_designed.html`
  - Main public IA and top-level composition
- `2. main_home_menu.html`
  - User-side menu inventory
- `3. admin_menu_dashboard.html`
  - Admin-side menu inventory
- `4. requirements_gap_dashboard.html`
  - Remaining gaps across screen, API, and policy scope

- `설계/00_요구사항매핑.txt`
  - Proposal-to-UC mapping across 14 domains
- `설계/00_Master_UCS.csv`
- `설계/00_Master_UCS_상세.csv`
  - UC catalog support when the prose mapping is not enough

- `화면설계서_최종통합.txt`
  - Consolidated menu tree, screen IDs, and endpoints
- `화면설계서_상세_컴포넌트_API.txt`
  - Alert, popup, modal, and component behavior
- `화면설계서_상호작용시나리오_데이터모델.txt`
  - Interaction flow and data model hints

- `HTML_서비스설계_v8`
  - Preferred integrated workflow-detail HTML set
- `설계HTML_완성본_v8`
  - Preferred final-layout mirror for polished screen structure
- `설계HTML`
- `html`
- `화면`
  - Secondary mirrors or generated outputs

- `DB_설계서_DDL.txt`
  - Schema, table, and column hints
- `행정안전부_공공데이터 공통표준용어_20251101.csv`
  - Naming normalization reference

## Canonical read order

Use this order when two or more files appear to answer the same question:

1. Root `1.`, `2.`, `3.`, `4.` files for IA and scope
2. `설계/00_요구사항매핑.txt` and `00_Master_UCS*` for requirement and UC linkage
3. `화면설계서_최종통합.txt` for routes, screen IDs, and menu trees
4. `HTML_서비스설계_v8/*_mapping_detail.html` for flow and admin-linkage detail
5. `화면설계서_상세_컴포넌트_API.txt` and `화면설계서_상호작용시나리오_데이터모델.txt` for behavior/state details
6. `설계HTML_완성본_v8` for final layout specifics
7. `설계HTML`, `html`, `화면` only as fallbacks

## Repeated workflow rule

Several HTML artifacts repeat the same implementation expectation:

- user request screens map to admin processing screens
- approval features need approve or reject handling
- rejection reason must be shown back to the user
- status must surface in detail or mypage views
- reapply is part of the flow when rejection exists

Representative detail files:

- `join_scenario_endpoint_mapping_detail.html`
- `request_process_user_admin_mapping.html`
- `signup_admin_mapping_detail.html`
- `certificate_admin_mapping_detail.html`
- `trade_admin_mapping_detail.html`
- `payment_admin_mapping_detail.html`

## Typical use patterns

- For menu placement questions, start with root `2.` or `3.` and then confirm in `화면설계서_최종통합.txt`.
- For approval-flow questions, start with the relevant `*_mapping_detail.html` file and confirm status behavior in the interaction document.
- For DB naming questions, consult `DB_설계서_DDL.txt` and then validate terminology against the standard-term CSV.
- For missing-feature audits, start from `4. requirements_gap_dashboard.html` and `설계/00_요구사항매핑.txt`.
