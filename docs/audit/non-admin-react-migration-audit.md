# Non-Admin React Migration Audit

Generated from the current codebase on 2026-03-14.

## Scope

- Base path: `src/main/resources/templates/egovframework/com`
- Excluded: `admin/` directory only
- Result: `60` HTML files

## Status summary

- `완료(React GET 전환)`: 43 files
- `부분전환(GET React, POST/폴백 레거시 잔존)`: 0 files
- `미전환`: 0 files
- `보조파일/공용조각`: 17 files

## Completed

These page templates are now covered by React-backed GET routes. Legacy POST flows that previously returned Thymeleaf screens have been redirected to the corresponding React paths.

- `auth/admin_login.html`
- `auth/admin_login_en.html`
- `auth/auth_choice.html`
- `auth/auth_choice_en.html`
- `auth/find_id.html`
- `auth/find_id_en.html`
- `auth/find_id_overseas.html`
- `auth/find_id_overseas_en.html`
- `auth/find_id_result.html`
- `auth/find_id_result_en.html`
- `auth/find_password.html`
- `auth/find_password_en.html`
- `auth/find_password_overseas.html`
- `auth/find_password_overseas_en.html`
- `auth/find_password_result.html`
- `auth/find_password_result_en.html`
- `auth/forbidden.html`
- `auth/login.html`
- `auth/login_en.html`
- `home/index.html`
- `home/index_en.html`
- `home/mypage.html`
- `home/mypage_en.html`
- `member/company_join_reapply.html`
- `member/company_join_status_detail.html`
- `member/company_join_status_detail_en.html`
- `member/company_join_status_guide.html`
- `member/company_join_status_search.html`
- `member/company_join_status_search_en.html`
- `member/step1_join.html`
- `member/step1_join_en.html`
- `member/step2_terms.html`
- `member/step2_terms_en.html`
- `member/step3_auth.html`
- `member/step3_auth_en.html`
- `member/step4_company_complete.html`
- `member/step4_company_complete_en.html`
- `member/step4_company_register.html`
- `member/step4_company_register_en.html`
- `member/step4_info.html`
- `member/step4_info_en.html`
- `member/step5_complete.html`
- `member/step5_complete_en.html`

## Partial

No remaining non-admin page templates are currently classified as partial. The main user-facing GET routes resolve through React, and previously identified POST/success/error fallbacks now redirect to those React routes.

## Not converted

No remaining non-admin page templates are currently classified as unconverted.

## Supporting files

These are not standalone migrated screens. They are shared fragments, error pages, shell templates, placeholders, or state-specific variants.

- `auth/content.html`
- `auth/fragment/linkFragment.html`
- `common/error/page_error.html`
- `common/fragments/footer.html`
- `common/fragments/footer_en.html`
- `common/fragments/header.html`
- `common/fragments/header_en.html`
- `home/menu_placeholder.html`
- `home/menu_placeholder_en.html`
- `home/mypage_blocked.html`
- `home/mypage_blocked_en.html`
- `home/mypage_pending.html`
- `home/mypage_pending_en.html`
- `home/mypage_rejected.html`
- `home/mypage_rejected_en.html`
- `home/react_migration_shell.html`
- `home/react_migration_shell_en.html`

## Evidence

React-backed public/auth/home/member routes:

- `src/main/java/egovframework/com/feature/auth/web/AuthPageController.java`
- `src/main/java/egovframework/com/feature/home/web/HomePageController.java`
- `src/main/java/egovframework/com/feature/member/web/MemberJoinController.java`
- `frontend/src/App.tsx`

Relevant React redirect/route coverage added for previously partial pages:

- `src/main/java/egovframework/com/feature/member/web/MemberJoinController.java`
- `src/main/java/egovframework/com/common/util/ReactPageUrlMapper.java`
- `src/main/java/egovframework/com/feature/auth/web/AuthPageController.java`
- `frontend/src/features/join-company-status/JoinCompanyStatusMigrationPage.tsx`
- `frontend/src/features/join-company-register/JoinCompanyRegisterCompleteMigrationPage.tsx`
- `frontend/src/features/public-entry/PublicEntryPages.tsx`

## Conclusion

At the route-conversion level, the non-admin area is now complete for all standalone page templates under this scope.

- `43` page templates are React-backed.
- `17` files remain as support fragments, shell templates, error pages, or state-specific placeholders.
- Legacy template files still exist on disk for reference, but the active non-admin page routes now resolve through React-backed GET screens and redirects.
