# Screen Design Map

Use this reference when the request cites files under `/opt/refrence/화면설계` or when the requested feature must match screen-design artifacts rather than only the current codebase.

## Priority source files

Read these four root files first because they are the primary design anchors:

- `/opt/refrence/화면설계/1. main_home_menu_designed.html`
- `/opt/refrence/화면설계/2. main_home_menu.html`
- `/opt/refrence/화면설계/3. admin_menu_dashboard.html`
- `/opt/refrence/화면설계/4. requirements_gap_dashboard.html`

Then expand to these detail sources only as needed:

- `/opt/refrence/화면설계/설계/00_요구사항매핑.txt`
- `/opt/refrence/화면설계/화면설계서_최종통합.txt`
- `/opt/refrence/화면설계/화면설계서_상세_컴포넌트_API.txt`
- `/opt/refrence/화면설계/화면설계서_상호작용시나리오_데이터모델.txt`
- `/opt/refrence/화면설계/HTML_서비스설계_v8`
- `/opt/refrence/화면설계/설계HTML`
- `/opt/refrence/화면설계/설계HTML_완성본_v8`
- `/opt/refrence/화면설계/화면`

## What the root 1 to 4 files provide

- `1. main_home_menu_designed.html`
  - Main home menu design direction
  - User-facing IA and top navigation composition
  - Useful for preserving public information architecture and visual grouping

- `2. main_home_menu.html`
  - Full user-side menu map
  - Broad domain coverage for non-admin screens
  - Useful when the repository does not yet implement a user route but the design already places it in the menu tree

- `3. admin_menu_dashboard.html`
  - Full admin-side menu map
  - Domain-by-domain inventory of admin screens
  - Useful for deciding whether a feature belongs under existing admin domains such as `system`, `content`, `certificate`, `payment`, `trade`, `member`

- `4. requirements_gap_dashboard.html`
  - Explicit list of still-unmapped requirements
  - Distinguishes screen additions, API or data gaps, and infra or policy gaps
  - Useful to avoid implementing a screen while ignoring an accompanying API or policy dependency

## What `00_요구사항매핑.txt` adds

- Requirement coverage is organized into 14 UC domains:
  - 공통
  - 회원인증
  - 탄소배출
  - 보고서인증서
  - 탄소정보
  - 모니터링
  - 거래
  - 결제
  - 외부연계
  - 콘텐츠
  - 시스템
  - 교육훈련
  - 모바일
  - 유지보수
- The file explicitly exists to prevent omission and duplication between the proposal document and implemented use cases.
- When implementing from design artifacts, map the request to one of these UC domains first.

## What `화면설계서_최종통합.txt` adds

- Full menu trees for both user and admin menus
- Screen IDs and endpoints
- A stronger target IA than the current repository alone
- Useful when the repository has not implemented the screen yet but the design set already defines route and menu placement

## What the component and interaction documents add

- Standard alert families:
  - confirm
  - success
  - error
  - warning
  - info
  - toast
- Standard modal families:
  - login-required
  - loading
  - image preview
  - file download
  - certificate preview
  - integrated search
  - profile
  - data compare
- Repeated exception expectations:
  - `400` validation failure
  - `403` authorization failure
  - `409` invalid state transition or concurrency conflict
  - `502/503` external integration failure

## Approval and request workflow rule

Several design artifacts repeat the same architecture rule:

- User submission screens must map to admin processing screens.
- Approval-capable features must expose approve or reject actions, not only CRUD.
- Rejection reason must be stored and shown back to the user.
- Notification and audit handling are part of the workflow, not optional polish.

Representative files:

- `request_process_user_admin_mapping.html`
- `realistic_member_flow_matrix.html`
- `signup_admin_mapping_detail.html`
- `certificate_admin_mapping_detail.html`
- `trade_admin_mapping_detail.html`
- `payment_admin_mapping_detail.html`

## Canonical request-state model from design artifacts

Use this as a conceptual default only when the request is clearly a 신청형 or 승인형 flow and no better module-specific state machine exists:

- `DRAFT`
- `SUBMITTED`
- `PENDING_REVIEW`
- `APPROVED`
- `REJECTED`
- `REAPPLY`

If existing code already uses a different code system, preserve the existing code and map the conceptual states instead of renaming tables or enums casually.

## Audit and operations expectations from design artifacts

Repeated audit fields in the design set:

- `traceId`
- `actorId`
- `role`
- `beforeStatus`
- `afterStatus`
- `reason`
- `processedAt`

Repeated operational expectations:

- attachment evidence
- masking or decrypt access for sensitive data
- approval or rejection notifications
- list, detail, search, and processing-screen triads
- reapply after rejection
- reflected status in mypage or detail pages

## Practical implementation rules

- Treat the design HTML as IA and interaction reference, not production code.
- Extract route naming, actor split, action buttons, and required admin counterpart screens from those artifacts.
- Do not blindly implement speculative `/api/v1/...` paths shown in HTML comments if the current repository uses another convention. Translate the intent into the Carbonet codebase.
- If a design file names both a user page and an admin review page, implement both or explicitly report the missing half.
- If the design file shows approve or reject buttons, make status transition and rejection reason explicit in code or DTOs.
- If the design file shows popup or alert behavior around destructive or finalizing actions, include equivalent feedback in the page behavior.
