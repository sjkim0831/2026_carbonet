import type { LazyPageUnit } from "../../../framework/routes/pageUnitTypes";

export const ADMIN_MEMBER_PAGE_UNITS: LazyPageUnit[] = [
  { id: "auth-group", exportName: "AuthGroupMigrationPage", loader: () => import("../../../features/auth-groups/AuthGroupMigrationPage") },
  { id: "auth-change", exportName: "AuthChangeMigrationPage", loader: () => import("../../../features/auth-change/AuthChangeMigrationPage") },
  { id: "dept-role", exportName: "DeptRoleMappingMigrationPage", loader: () => import("../../../features/dept-role-mapping/DeptRoleMappingMigrationPage") },
  { id: "member-edit", exportName: "MemberEditMigrationPage", loader: () => import("../../../features/member-edit/MemberEditMigrationPage") },
  { id: "password-reset", exportName: "PasswordResetMigrationPage", loader: () => import("../../../features/password-reset/PasswordResetMigrationPage") },
  { id: "admin-permission", exportName: "AdminPermissionMigrationPage", loader: () => import("../../../features/admin-permissions/AdminPermissionMigrationPage") },
  { id: "admin-create", exportName: "AdminAccountCreateMigrationPage", loader: () => import("../../../features/admin-account-create/AdminAccountCreateMigrationPage") },
  { id: "company-account", exportName: "CompanyAccountMigrationPage", loader: () => import("../../../features/company-account/CompanyAccountMigrationPage") },
  { id: "admin-list", exportName: "AdminListMigrationPage", loader: () => import("../../../features/admin-list/AdminListMigrationPage") },
  { id: "company-list", exportName: "CompanyListMigrationPage", loader: () => import("../../../features/company-list/CompanyListMigrationPage") },
  { id: "member-approve", exportName: "MemberApproveMigrationPage", loader: () => import("../../../features/member-approve/MemberApproveMigrationPage") },
  { id: "company-approve", exportName: "CompanyApproveMigrationPage", loader: () => import("../../../features/company-approve/CompanyApproveMigrationPage") },
  { id: "certificate-approve", exportName: "CertificateApproveMigrationPage", loader: () => import("../../../features/certificate-approve/CertificateApproveMigrationPage") },
  { id: "certificate-pending", exportName: "CertificatePendingMigrationPage", loader: () => import("../../../features/certificate-pending/CertificatePendingMigrationPage") },
  { id: "virtual-issue", exportName: "VirtualIssueMigrationPage", loader: () => import("../../../features/virtual-issue/VirtualIssueMigrationPage") },
  { id: "member-list", exportName: "MemberListMigrationPage", loader: () => import("../../../features/member-list/MemberListMigrationPage") },
  { id: "member-withdrawn", exportName: "WithdrawnMemberListMigrationPage", loader: () => import("../../../features/member-list/MemberListMigrationPage") },
  { id: "member-activate", exportName: "ActivateMemberListMigrationPage", loader: () => import("../../../features/member-list/MemberListMigrationPage") },
  { id: "member-detail", exportName: "MemberDetailMigrationPage", loader: () => import("../../../features/member-detail/MemberDetailMigrationPage") },
  { id: "company-detail", exportName: "CompanyDetailMigrationPage", loader: () => import("../../../features/company-detail/CompanyDetailMigrationPage") },
  { id: "member-stats", exportName: "MemberStatsMigrationPage", loader: () => import("../../../features/member-stats/MemberStatsMigrationPage") },
  { id: "member-register", exportName: "MemberRegisterMigrationPage", loader: () => import("../../../features/member-register/MemberRegisterMigrationPage") }
];
