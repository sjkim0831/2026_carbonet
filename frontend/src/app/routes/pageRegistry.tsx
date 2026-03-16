import { ComponentType, lazy } from "react";
import type { MigrationPageId } from "./definitions";

function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

const sharedPlatformLoader = () => import("../../features/platform-studio/PlatformStudioMigrationPage");
const sharedAdminEntryLoader = () => import("../../features/admin-entry/AdminEntryPages");
const sharedPublicEntryLoader = () => import("../../features/public-entry/PublicEntryPages");
const sharedJoinCompanyStatusLoader = () => import("../../features/join-company-status/JoinCompanyStatusMigrationPage");

export const pageComponents: Record<MigrationPageId, ComponentType> = {
  "home": lazyNamed(() => import("../../features/home-entry/HomeEntryPages"), "HomeLandingPage"),
  "admin-home": lazyNamed(sharedAdminEntryLoader, "AdminHomePage"),
  "signin-login": lazyNamed(sharedPublicEntryLoader, "PublicLoginPage"),
  "admin-login": lazyNamed(sharedAdminEntryLoader, "AdminLoginPage"),
  "signin-auth-choice": lazyNamed(sharedPublicEntryLoader, "AuthChoicePage"),
  "signin-find-id": lazyNamed(sharedPublicEntryLoader, "FindIdPage"),
  "signin-find-id-result": lazyNamed(sharedPublicEntryLoader, "FindIdResultPage"),
  "signin-find-password": lazyNamed(sharedPublicEntryLoader, "FindPasswordPage"),
  "signin-find-password-result": lazyNamed(sharedPublicEntryLoader, "FindPasswordCompletePage"),
  "signin-forbidden": lazyNamed(sharedPublicEntryLoader, "ForbiddenPage"),
  "auth-group": lazyNamed(() => import("../../features/auth-groups/AuthGroupMigrationPage"), "AuthGroupMigrationPage"),
  "auth-change": lazyNamed(() => import("../../features/auth-change/AuthChangeMigrationPage"), "AuthChangeMigrationPage"),
  "dept-role": lazyNamed(() => import("../../features/dept-role-mapping/DeptRoleMappingMigrationPage"), "DeptRoleMappingMigrationPage"),
  "member-edit": lazyNamed(() => import("../../features/member-edit/MemberEditMigrationPage"), "MemberEditMigrationPage"),
  "password-reset": lazyNamed(() => import("../../features/password-reset/PasswordResetMigrationPage"), "PasswordResetMigrationPage"),
  "admin-permission": lazyNamed(() => import("../../features/admin-permissions/AdminPermissionMigrationPage"), "AdminPermissionMigrationPage"),
  "admin-create": lazyNamed(() => import("../../features/admin-account-create/AdminAccountCreateMigrationPage"), "AdminAccountCreateMigrationPage"),
  "company-account": lazyNamed(() => import("../../features/company-account/CompanyAccountMigrationPage"), "CompanyAccountMigrationPage"),
  "admin-list": lazyNamed(() => import("../../features/admin-list/AdminListMigrationPage"), "AdminListMigrationPage"),
  "company-list": lazyNamed(() => import("../../features/company-list/CompanyListMigrationPage"), "CompanyListMigrationPage"),
  "member-approve": lazyNamed(() => import("../../features/member-approve/MemberApproveMigrationPage"), "MemberApproveMigrationPage"),
  "company-approve": lazyNamed(() => import("../../features/company-approve/CompanyApproveMigrationPage"), "CompanyApproveMigrationPage"),
  "member-list": lazyNamed(() => import("../../features/member-list/MemberListMigrationPage"), "MemberListMigrationPage"),
  "member-detail": lazyNamed(() => import("../../features/member-detail/MemberDetailMigrationPage"), "MemberDetailMigrationPage"),
  "company-detail": lazyNamed(() => import("../../features/company-detail/CompanyDetailMigrationPage"), "CompanyDetailMigrationPage"),
  "member-stats": lazyNamed(() => import("../../features/member-stats/MemberStatsMigrationPage"), "MemberStatsMigrationPage"),
  "member-register": lazyNamed(() => import("../../features/member-register/MemberRegisterMigrationPage"), "MemberRegisterMigrationPage"),
  "emission-result-list": lazyNamed(() => import("../../features/emission-result-list/EmissionResultListMigrationPage"), "EmissionResultListMigrationPage"),
  "system-code": lazyNamed(() => import("../../features/system-code/SystemCodeMigrationPage"), "SystemCodeMigrationPage"),
  "page-management": lazyNamed(() => import("../../features/page-management/PageManagementMigrationPage"), "PageManagementMigrationPage"),
  "function-management": lazyNamed(() => import("../../features/function-management/FunctionManagementMigrationPage"), "FunctionManagementMigrationPage"),
  "menu-management": lazyNamed(() => import("../../features/menu-management/MenuManagementMigrationPage"), "MenuManagementMigrationPage"),
  "full-stack-management": lazyNamed(() => import("../../features/menu-management/FullStackManagementMigrationPage"), "FullStackManagementMigrationPage"),
  "platform-studio": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "screen-elements-management": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "event-management-console": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "function-management-console": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "api-management-console": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "controller-management-console": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "db-table-management": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "column-management-console": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "automation-studio": lazyNamed(sharedPlatformLoader, "PlatformStudioMigrationPage"),
  "environment-management": lazyNamed(() => import("../../features/environment-management/EnvironmentManagementHubPage"), "EnvironmentManagementHubPage"),
  "ip-whitelist": lazyNamed(() => import("../../features/ip-whitelist/IpWhitelistMigrationPage"), "IpWhitelistMigrationPage"),
  "login-history": lazyNamed(() => import("../../features/login-history/LoginHistoryMigrationPage"), "LoginHistoryMigrationPage"),
  "security-history": lazyNamed(() => import("../../features/security-history/SecurityHistoryMigrationPage"), "SecurityHistoryMigrationPage"),
  "security-policy": lazyNamed(() => import("../../features/security-policy/SecurityPolicyMigrationPage"), "SecurityPolicyMigrationPage"),
  "security-monitoring": lazyNamed(() => import("../../features/security-monitoring/SecurityMonitoringMigrationPage"), "SecurityMonitoringMigrationPage"),
  "blocklist": lazyNamed(() => import("../../features/blocklist/BlocklistMigrationPage"), "BlocklistMigrationPage"),
  "security-audit": lazyNamed(() => import("../../features/security-audit/SecurityAuditMigrationPage"), "SecurityAuditMigrationPage"),
  "scheduler-management": lazyNamed(() => import("../../features/scheduler-management/SchedulerManagementMigrationPage"), "SchedulerManagementMigrationPage"),
  "codex-request": lazyNamed(() => import("../../features/codex-provision/CodexProvisionMigrationPage"), "CodexProvisionMigrationPage"),
  "observability": lazyNamed(() => import("../../features/observability/ObservabilityMigrationPage"), "ObservabilityMigrationPage"),
  "help-management": lazyNamed(() => import("../../features/help-management/HelpManagementMigrationPage"), "HelpManagementMigrationPage"),
  "sr-workbench": lazyNamed(() => import("../../features/sr-workbench/SrWorkbenchMigrationPage"), "SrWorkbenchMigrationPage"),
  "join-company-register": lazyNamed(() => import("../../features/join-company-register/JoinCompanyRegisterMigrationPage"), "JoinCompanyRegisterMigrationPage"),
  "join-company-register-complete": lazyNamed(() => import("../../features/join-company-register/JoinCompanyRegisterCompleteMigrationPage"), "JoinCompanyRegisterCompleteMigrationPage"),
  "join-company-status": lazyNamed(sharedJoinCompanyStatusLoader, "JoinCompanyStatusMigrationPage"),
  "join-company-status-guide": lazyNamed(sharedJoinCompanyStatusLoader, "JoinCompanyStatusMigrationPage"),
  "join-company-status-detail": lazyNamed(sharedJoinCompanyStatusLoader, "JoinCompanyStatusMigrationPage"),
  "join-company-reapply": lazyNamed(() => import("../../features/join-company-reapply/JoinCompanyReapplyMigrationPage"), "JoinCompanyReapplyMigrationPage"),
  "join-wizard": lazyNamed(() => import("../../features/join-wizard/JoinWizardMigrationPage"), "JoinWizardMigrationPage"),
  "join-terms": lazyNamed(() => import("../../features/join-wizard/JoinTermsMigrationPage"), "JoinTermsMigrationPage"),
  "join-auth": lazyNamed(() => import("../../features/join-wizard/JoinAuthMigrationPage"), "JoinAuthMigrationPage"),
  "join-info": lazyNamed(() => import("../../features/join-wizard/JoinInfoMigrationPage"), "JoinInfoMigrationPage"),
  "join-complete": lazyNamed(() => import("../../features/join-wizard/JoinCompleteMigrationPage"), "JoinCompleteMigrationPage"),
  "mypage": lazyNamed(() => import("../../features/mypage/MypageMigrationPage"), "MypageMigrationPage")
};

const preloadedModules: Partial<Record<MigrationPageId, Promise<unknown>>> = {};

const pagePreloaders: Partial<Record<MigrationPageId, () => Promise<unknown>>> = {
  "admin-home": sharedAdminEntryLoader,
  "admin-login": sharedAdminEntryLoader,
  "auth-group": () => import("../../features/auth-groups/AuthGroupMigrationPage"),
  "auth-change": () => import("../../features/auth-change/AuthChangeMigrationPage"),
  "dept-role": () => import("../../features/dept-role-mapping/DeptRoleMappingMigrationPage"),
  "member-edit": () => import("../../features/member-edit/MemberEditMigrationPage"),
  "password-reset": () => import("../../features/password-reset/PasswordResetMigrationPage"),
  "admin-permission": () => import("../../features/admin-permissions/AdminPermissionMigrationPage"),
  "admin-create": () => import("../../features/admin-account-create/AdminAccountCreateMigrationPage"),
  "company-account": () => import("../../features/company-account/CompanyAccountMigrationPage"),
  "admin-list": () => import("../../features/admin-list/AdminListMigrationPage"),
  "company-list": () => import("../../features/company-list/CompanyListMigrationPage"),
  "member-approve": () => import("../../features/member-approve/MemberApproveMigrationPage"),
  "company-approve": () => import("../../features/company-approve/CompanyApproveMigrationPage"),
  "member-list": () => import("../../features/member-list/MemberListMigrationPage"),
  "member-detail": () => import("../../features/member-detail/MemberDetailMigrationPage"),
  "company-detail": () => import("../../features/company-detail/CompanyDetailMigrationPage"),
  "member-stats": () => import("../../features/member-stats/MemberStatsMigrationPage"),
  "member-register": () => import("../../features/member-register/MemberRegisterMigrationPage"),
  "emission-result-list": () => import("../../features/emission-result-list/EmissionResultListMigrationPage"),
  "system-code": () => import("../../features/system-code/SystemCodeMigrationPage"),
  "page-management": () => import("../../features/page-management/PageManagementMigrationPage"),
  "function-management": () => import("../../features/function-management/FunctionManagementMigrationPage"),
  "menu-management": () => import("../../features/menu-management/MenuManagementMigrationPage"),
  "full-stack-management": () => import("../../features/menu-management/FullStackManagementMigrationPage"),
  "platform-studio": sharedPlatformLoader,
  "screen-elements-management": sharedPlatformLoader,
  "event-management-console": sharedPlatformLoader,
  "function-management-console": sharedPlatformLoader,
  "api-management-console": sharedPlatformLoader,
  "controller-management-console": sharedPlatformLoader,
  "db-table-management": sharedPlatformLoader,
  "column-management-console": sharedPlatformLoader,
  "automation-studio": sharedPlatformLoader,
  "environment-management": () => import("../../features/environment-management/EnvironmentManagementHubPage"),
  "ip-whitelist": () => import("../../features/ip-whitelist/IpWhitelistMigrationPage"),
  "login-history": () => import("../../features/login-history/LoginHistoryMigrationPage"),
  "security-history": () => import("../../features/security-history/SecurityHistoryMigrationPage"),
  "security-policy": () => import("../../features/security-policy/SecurityPolicyMigrationPage"),
  "security-monitoring": () => import("../../features/security-monitoring/SecurityMonitoringMigrationPage"),
  "blocklist": () => import("../../features/blocklist/BlocklistMigrationPage"),
  "security-audit": () => import("../../features/security-audit/SecurityAuditMigrationPage"),
  "scheduler-management": () => import("../../features/scheduler-management/SchedulerManagementMigrationPage")
};

export function getPageComponent(route: MigrationPageId): ComponentType {
  return pageComponents[route] || pageComponents.home;
}

export function preloadPageModule(route: MigrationPageId) {
  const loader = pagePreloaders[route];
  if (!loader) {
    return Promise.resolve();
  }
  if (!preloadedModules[route]) {
    preloadedModules[route] = loader();
  }
  return preloadedModules[route]!;
}
