# Admin Template Parity Inventory

Canonical source for admin React parity work:

- source folder: `src/main/resources/templates/egovframework/com/admin`
- source count: `67` html files
- rule: every admin React screen must match the source template DOM order, class structure, text, and major interaction layout before refactoring

## Fragment Files

These are shared source fragments, not standalone admin screens.

- `footer.html`
- `fragment/linkFragment.html`
- `header.html`
- `menu.html`

## React-Connected Admin Routes

These routes already have React page modules and must be kept in parity with the matching source html.

| React route id | KO path | Source template |
| --- | --- | --- |
| `admin-home` | `/admin/` | `index.html` |
| `admin-login` | `/admin/login/loginView` | `auth/admin_login.html` outside `com/admin` canonical set |
| `auth-group` | `/admin/auth/group` | `auth_group.html` |
| `auth-change` | `/admin/member/auth-change` | `auth_change.html` |
| `dept-role` | `/admin/member/dept-role-mapping` | `dept_role_mapping.html` |
| `member-edit` | `/admin/member/edit` | `member_edit.html` |
| `password-reset` | `/admin/member/reset_password` | `member_reset_password.html` |
| `admin-permission` | `/admin/member/admin_account/permissions` | `admin_account.html` permission mode |
| `admin-create` | `/admin/member/admin_account` | `admin_account.html` create mode |
| `company-account` | `/admin/member/company_account` | `company_account.html` |
| `admin-list` | `/admin/member/admin_list` | `member_admin_list.html` |
| `company-list` | `/admin/member/company_list` | `company_list.html` |
| `member-approve` | `/admin/member/approve` | `member_approve.html` |
| `company-approve` | `/admin/member/company-approve` | `company_approve.html` |
| `member-list` | `/admin/member/list` | `member_list.html` |
| `member-detail` | `/admin/member/detail` | `member_detail.html` |
| `company-detail` | `/admin/member/company_detail` | `company_detail.html` |
| `member-stats` | `/admin/member/stats` | `member_stats.html` |
| `member-register` | `/admin/member/register` | `member_register.html` |
| `emission-result-list` | `/admin/emission/result_list` | `emission_result_list.html` |
| `system-code` | `/admin/system/code` | `system_code.html` |
| `page-management` | `/admin/system/page-management` | `page_management.html` |
| `function-management` | `/admin/system/function-management` | `function_management.html` |
| `menu-management` | `/admin/system/menu-management` | `menu_management.html` |
| `ip-whitelist` | `/admin/system/ip_whitelist` | `ip_whitelist.html` |
| `login-history` | `/admin/member/login_history` | `login_history.html` |
| `security-history` | `/admin/system/security` | `security_history.html` |
| `security-policy` | `/admin/system/security-policy` | `security_policy.html` |
| `security-monitoring` | `/admin/system/security-monitoring` | `security_monitoring.html` |
| `blocklist` | `/admin/system/blocklist` | `blocklist.html` |
| `security-audit` | `/admin/system/security-audit` | `security_audit.html` |
| `scheduler-management` | `/admin/system/scheduler` | `scheduler_management.html` |
| `codex-request` | `/admin/system/codex-request` | `codex_provision.html` |
| `observability` | `/admin/system/observability` | no direct 1:1 source in `com/admin`; custom React admin screen |
| `help-management` | `/admin/system/help-management` | no direct 1:1 source in `com/admin`; custom React admin screen |
| `sr-workbench` | `/admin/system/sr-workbench` | no direct 1:1 source in `com/admin`; custom React admin screen |

## Source Templates Not Yet React-Connected

These admin templates exist in the canonical source set but do not yet have a dedicated React route/page mapping.

- `admin_list.html`
- `admin_list_en.html`
- `auth_change_en.html`
- `blocklist_en.html`
- `codex_provision_en.html`
- `company_account_en.html`
- `company_approve_en.html`
- `company_detail_en.html`
- `company_list_en.html`
- `dept_role_mapping_en.html`
- `emission_result_list_en.html`
- `function_management_en.html`
- `index_en.html`
- `ip_whitelist_en.html`
- `login_history_en.html`
- `member_admin_list_en.html`
- `member_approve_en.html`
- `member_detail_en.html`
- `member_edit_en.html`
- `member_list_en.html`
- `member_register_en.html`
- `member_reset_password_en.html`
- `menu_management_en.html`
- `menu_placeholder.html`
- `menu_placeholder_en.html`
- `page_management_en.html`
- `scheduler_management_en.html`
- `security_audit_en.html`
- `security_history_en.html`
- `security_monitoring_en.html`
- `security_policy_en.html`
- `system_code_en.html`

## Current Execution Order

1. lock shared admin layout parity in React entry files
2. keep existing connected routes aligned to source templates
3. add missing admin route ids and page modules for source templates not yet React-connected
4. implement each missing screen from source template DOM outward
5. build, package, restart, and verify route-by-route
