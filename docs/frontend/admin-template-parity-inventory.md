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

## Template-Line And Theme-Set Governance

This parity inventory should be reviewed together with:

- `docs/architecture/public-admin-template-line-schema.md`
- `docs/architecture/theme-set-schema.md`
- `docs/frontend/admin-screen-layout-standard.md`

Admin parity decisions should follow these rules:

- keep the current `themeSetId` when the source template difference is limited to DOM blocks, menu placement, admin-only actions, or route/menu binding changes
- create or revise an admin `templateLineId` when admin-only structure, scenario family, page family, slot profile, or backend facade binding diverges from the shared public line
- split the `themeSetId` only when parity work proves that visual direction, token bundle, spacing, density, shell composition, page-frame family, or approved component coverage must change
- do not treat untranslated text, route constants, or menu-tree differences as reasons to split the theme set

Suggested admin family grouping for parity review:

| Parity family | Candidate template line family | Typical source templates |
| --- | --- | --- |
| admin dashboard shell | `admin-line-dashboard` | `index.html`, `index_en.html` |
| admin list and search | `admin-line-list` | `member_list.html`, `company_list.html`, `login_history.html`, `system_code.html` |
| admin detail and review | `admin-line-detail` | `member_detail.html`, `company_detail.html`, `member_approve.html`, `company_approve.html` |
| admin edit and registration | `admin-line-edit` | `member_edit.html`, `member_register.html`, `admin_account.html`, `company_account.html` |
| admin security and monitoring | `admin-line-02` | `security_history.html`, `security_policy.html`, `security_monitoring.html`, `security_audit.html`, `blocklist.html` |

Custom React admin screens should be classified before parity exceptions are approved:

| Custom route id | Preferred page type | Template-line family guidance | Governance note |
| --- | --- | --- | --- |
| `observability` | `PolicyPage` | `admin-line-02` by default | keep shared theme set unless diagnostics or observability blocks require a new approved component family |
| `help-management` | `WorkspacePage` | `admin-line-dashboard` or a dedicated workspace variant under the same admin family set | inherit approved workspace shell and section action slots before adding page-local layout rules |
| `sr-workbench` | `WorkspacePage` | `admin-line-dashboard` or a dedicated workspace variant under the same admin family set | multi-panel builder flow should stay a template-line concern unless visual-system rules diverge |

EN variant handling should follow these rules:

- treat `_en` templates as language-profile coverage on the same template line by default
- keep the same `themeSetId`, `spacingProfileId`, and `densityProfileId` for KO/EN variants unless measured structure or content density changes force a governed split
- create a separate template-line version for EN only when route namespace, menu tree, slot profile, or page-family composition diverges beyond translation
- if EN variants require wider controls or different table density, record that as an approved responsive or language profile inside the same theme set before considering a theme split

## Approval Checks

Before closing a parity batch, confirm:

- each admin route is mapped to one candidate template-line family
- the chosen template-line family can bind to an approved `themeSetId` without missing shell/frame/component coverage
- page-local parity fixes are documented as exceptions and do not silently redefine theme tokens or spacing rules
- custom React admin screens such as `observability`, `help-management`, and `sr-workbench` declare whether they inherit an existing admin template line or require a new governed family
- EN variants are treated as language/profile coverage, not as separate visual-system branches unless the rendered structure truly diverges
- custom workspace and policy pages inherit page-type action-slot rules from `admin-screen-layout-standard.md` before bespoke exceptions are approved

## Handoff Ready Signal

This parity inventory may be handed to `05` or `09` when:

- every currently known admin route is attached to a candidate template-line family or an explicit governed custom-route note
- custom routes `observability`, `help-management`, and `sr-workbench` are classified to a page type and template-line guidance
- `_en` variants are explicitly treated as language/profile coverage unless a documented structural split exists
- no unresolved parity batch requires a new theme-set split decision

## Current Execution Order

1. lock shared admin layout parity in React entry files
2. keep existing connected routes aligned to source templates
3. add missing admin route ids and page modules for source templates not yet React-connected
4. implement each missing screen from source template DOM outward
5. build, package, restart, and verify route-by-route
