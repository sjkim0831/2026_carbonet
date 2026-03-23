# Member Management Admin Authority Policy

## Scope

This policy governs the `/admin/member/*` area only. It does not redefine global authority handling for unrelated `/admin/system/*` screens.

## Administrator hierarchy

- `webmaster` or `ROLE_SYSTEM_MASTER`
  - Master scope across all companies.
  - Can create company accounts.
  - Can approve company signups.
  - Can view and manage all company admins and all company members.
- `ROLE_SYSTEM_ADMIN` and legacy `ROLE_ADMIN`
  - Company-scoped administrator.
  - Can view and manage member-management data only inside the actor `insttId`.
  - Can create lower company admins only.
  - Can open admin list and admin permission screens for same-company admins.
- `ROLE_OPERATION_ADMIN`
  - Company-scoped operator.
  - Can view and process member-management data only inside the actor `insttId`.
  - Cannot open admin list or company-management pages.

## Route rules

### Master only

- `/admin/member/company_account`
- `/admin/member/company_list`
- `/admin/member/company_detail`
- `/admin/member/company-approve`
- `/admin/member/company-file`
- matching `/api/admin/member/company-*`
- `/api/admin/companies/search`

### Company admin only

- `/admin/member/admin_list`
- `/admin/member/admin_account`
- `/admin/member/admin_account/permissions`
- matching `/api/admin/member/admin-*`

### Company-scoped member operations

- `/admin/member/list`
- `/admin/member/register`
- `/admin/member/edit`
- `/admin/member/detail`
- `/admin/member/reset_password`
- `/admin/member/approve`
- matching `/api/admin/member/list|edit|detail|reset-password|approve*`

## Query scoping

- Non-master admins in member-management must resolve the actor `insttId`.
- Member list, member detail, member edit, member approval, and related APIs must always constrain by the actor `insttId`.
- Admin list and admin permission screens must only expose same-company admin accounts for non-master actors.
- Company-management screens remain master-only and do not rely on company self-scope.

## Grant rules

- An administrator may only assign roles lower than the actor's own effective role rank.
- Feature assignment is limited to the actor's grantable feature set plus the target's current role to avoid accidental lockout during edits.
- Company-scoped admins must not assign global/master roles.

## Approval review

- Member approval detail modal accepts reject reason input and records it with the approval action payload.
- Company approval detail modal accepts reject reason input and persists `RJCT_RSN` for rejected institution records.

## Maintenance notes

- If a new `/admin/member/*` route is added, update:
  - `AdminMainAuthInterceptor`
  - `AdminMemberPagePayloadService` or `AdminApprovalPagePayloadService`
  - `AdminMenuTreeService`
  - `SiteMapServiceImpl`
- Keep menu exposure rules aligned with the interceptor. Hidden menus must not remain directly accessible without the same authority check.
