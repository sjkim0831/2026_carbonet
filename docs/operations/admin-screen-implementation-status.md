# Admin Screen Implementation Status

Generated from `frontend/src/app/routes/definitions.ts`, `frontend/src/app/routes/pageRegistry.tsx`, `docs/frontend/admin-template-parity-inventory.md`, and the current `git status --short` snapshot.

Generated on: `2026-04-06`

Scope: remaining admin routes only for `배출/인증`, `거래`, `콘텐츠`.

## Start Command

1. `bash ops/scripts/codex-resume-status.sh`
2. `bash ops/scripts/codex-admin-status.sh`

## Status Rules

- `done`: remaining-scope route is connected in `pageRegistry` and there is no route-specific dirty feature work in the current working tree
- `in_progress`: the route's feature directory or route-specific files are dirty in the current working tree
- `not_started`: remaining-scope route exists in `definitions.ts` but has no page component mapping in `pageRegistry`
- `preloader missing` in notes means the route has a page mapping but no dedicated preloader entry

## Summary

- 배출/인증: `10`
- 거래: `17`
- 콘텐츠: `4`
- remaining admin routes total: `31`
- done: `31`
- in_progress: `0`
- not_started: `0`

## Current Table

| Domain | Status | Route id | Label | KO path | Feature | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 배출/인증 | `done` | `admin-login` | 관리자 로그인 | `/admin/login/loginView` | `frontend/src/features/admin-entry/` | parity inventory connected |
| 배출/인증 | `done` | `auth-group` | 권한 그룹 | `/admin/auth/group` | `frontend/src/features/auth-groups/` | parity inventory connected |
| 배출/인증 | `done` | `auth-change` | 권한 변경 | `/admin/member/auth-change` | `frontend/src/features/auth-change/` | parity inventory connected |
| 배출/인증 | `done` | `dept-role` | 부서 권한 맵핑 | `/admin/member/dept-role-mapping` | `frontend/src/features/dept-role-mapping/` | parity inventory connected |
| 거래 | `done` | `member-edit` | 회원 수정 | `/admin/member/edit` | `frontend/src/features/member-edit/` | parity inventory connected |
| 배출/인증 | `done` | `password-reset` | 비밀번호 초기화 | `/admin/member/reset_password` | `frontend/src/features/password-reset/` | parity inventory connected |
| 배출/인증 | `done` | `admin-permission` | 관리자 권한 | `/admin/member/admin_account/permissions` | `frontend/src/features/admin-permissions/` | parity inventory connected |
| 배출/인증 | `done` | `admin-create` | 관리자 생성 | `/admin/member/admin_account` | `frontend/src/features/admin-account-create/` | parity inventory connected |
| 거래 | `done` | `company-account` | 회원사 계정 | `/admin/member/company_account` | `frontend/src/features/company-account/` | parity inventory connected |
| 배출/인증 | `done` | `admin-list` | 관리자 목록 | `/admin/member/admin_list` | `frontend/src/features/admin-list/` | parity inventory connected |
| 거래 | `done` | `company-list` | 회원사 목록 | `/admin/member/company_list` | `frontend/src/features/company-list/` | parity inventory connected |
| 거래 | `done` | `member-approve` | 회원 승인 | `/admin/member/approve` | `frontend/src/features/member-approve/` | parity inventory connected |
| 거래 | `done` | `company-approve` | 회원사 승인 | `/admin/member/company-approve` | `frontend/src/features/company-approve/` | parity inventory connected |
| 거래 | `done` | `member-list` | 회원 목록 | `/admin/member/list` | `frontend/src/features/member-list/` | parity inventory connected |
| 거래 | `done` | `member-withdrawn` | 탈퇴 회원 | `/admin/member/withdrawn` | `frontend/src/features/member-list/` | custom or parity-untracked route |
| 거래 | `done` | `member-activate` | 휴면 계정 | `/admin/member/activate` | `frontend/src/features/member-list/` | custom or parity-untracked route |
| 거래 | `done` | `member-detail` | 회원 상세 | `/admin/member/detail` | `frontend/src/features/member-detail/` | parity inventory connected |
| 거래 | `done` | `company-detail` | 회원사 상세 | `/admin/member/company_detail` | `frontend/src/features/company-detail/` | parity inventory connected |
| 거래 | `done` | `member-stats` | 회원 통계 | `/admin/member/stats` | `frontend/src/features/member-stats/` | parity inventory connected |
| 거래 | `done` | `member-register` | 회원 등록 | `/admin/member/register` | `frontend/src/features/member-register/` | parity inventory connected |
| 배출/인증 | `done` | `emission-result-list` | 배출 결과 목록 | `/admin/emission/result_list` | `frontend/src/features/emission-result-list/` | parity inventory connected |
| 배출/인증 | `done` | `emission-site-management` | 배출지 관리 | `/admin/emission/site-management` | `frontend/src/features/emission-site-management/` | custom or parity-untracked route |
| 거래 | `done` | `login-history` | 로그인 이력 | `/admin/member/login_history` | `frontend/src/features/login-history/` | parity inventory connected |
| 콘텐츠 | `done` | `notification` | 알림센터 | `/admin/system/notification` | `frontend/src/features/notification-center/` | custom or parity-untracked route |
| 거래 | `done` | `external-connection-list` | 외부 연계 목록 | `/admin/external/connection_list` | `frontend/src/features/external-connection-list/` | custom or parity-untracked route |
| 거래 | `done` | `external-sync` | 동기화 실행 | `/admin/external/sync` | `frontend/src/features/external-sync/` | custom or parity-untracked route |
| 거래 | `done` | `external-connection-add` | 외부연계 등록 | `/admin/external/connection_add` | `frontend/src/features/external-connection-add/` | custom or parity-untracked route |
| 거래 | `done` | `external-connection-edit` | 외부연계 수정 | `/admin/external/connection_edit` | `frontend/src/features/external-connection-edit/` | custom or parity-untracked route |
| 콘텐츠 | `done` | `help-management` | 도움말 운영 | `/admin/system/help-management` | `frontend/src/features/help-management/` | parity inventory connected |
| 콘텐츠 | `done` | `admin-sitemap` | 관리자 사이트맵 | `/admin/content/sitemap` | `frontend/src/features/admin-sitemap/` | custom or parity-untracked route |
| 콘텐츠 | `done` | `admin-menu-placeholder` | 관리자 메뉴 플레이스홀더 | `/admin/placeholder` | `frontend/src/features/admin-placeholder/` | custom or parity-untracked route |

## In-Progress Routes


## Preloader Gaps


## Use Rule

- treat this file as the canonical remaining-route snapshot for AI session restarts
- refresh it with `bash ops/scripts/codex-admin-status.sh` before opening a new admin implementation lane
- if this file and `git status --short` disagree, the working tree wins
