import { ComponentType, Suspense, lazy, useEffect, useState } from "react";
import { getMissingInsttWarningEventName } from "./app/telemetry/fetch";
import { usePageTelemetry } from "./app/telemetry/usePageTelemetry";
import { useTelemetryTransport } from "./app/telemetry/useTelemetryTransport";
import { publishTelemetryEvent } from "./app/telemetry/events";
import { fetchPageHelp, getPageHelp } from "./app/screen-registry/helpContent";
import { getPageManifest } from "./app/screen-registry/pageManifests";
import { HelpOverlay } from "./components/help/HelpOverlay";
import { getNavigationEventName, getRuntimeLocale, navigate, replace } from "./lib/navigation/runtime";

type MigrationPageId =
  | "home"
  | "admin-home"
  | "signin-login"
  | "admin-login"
  | "signin-auth-choice"
  | "signin-find-id"
  | "signin-find-id-result"
  | "signin-find-password"
  | "signin-find-password-result"
  | "signin-forbidden"
  | "auth-group"
  | "auth-change"
  | "dept-role"
  | "member-edit"
  | "password-reset"
  | "admin-permission"
  | "admin-create"
  | "company-account"
  | "admin-list"
  | "company-list"
  | "member-approve"
  | "company-approve"
  | "member-list"
  | "member-detail"
  | "company-detail"
  | "member-stats"
  | "member-register"
  | "emission-result-list"
  | "system-code"
  | "page-management"
  | "function-management"
  | "menu-management"
  | "full-stack-management"
  | "platform-studio"
  | "screen-elements-management"
  | "event-management-console"
  | "function-management-console"
  | "api-management-console"
  | "controller-management-console"
  | "db-table-management"
  | "column-management-console"
  | "automation-studio"
  | "ip-whitelist"
  | "login-history"
  | "security-history"
  | "security-policy"
  | "security-monitoring"
  | "blocklist"
  | "security-audit"
  | "scheduler-management"
  | "codex-request"
  | "observability"
  | "help-management"
  | "sr-workbench"
  | "join-company-register"
  | "join-company-register-complete"
  | "join-company-status"
  | "join-company-status-guide"
  | "join-company-status-detail"
  | "join-company-reapply"
  | "join-wizard"
  | "join-terms"
  | "join-auth"
  | "join-info"
  | "join-complete"
  | "mypage";

type RouteDefinition = {
  id: MigrationPageId;
  label: string;
  group: "admin" | "join" | "home";
  koPath: string;
  enPath: string;
};

const ROUTES: RouteDefinition[] = [
  { id: "home", label: "홈", group: "home", koPath: "/home", enPath: "/en/home" },
  { id: "signin-login", label: "로그인", group: "home", koPath: "/signin/loginView", enPath: "/en/signin/loginView" },
  { id: "signin-auth-choice", label: "인증선택", group: "home", koPath: "/signin/authChoice", enPath: "/en/signin/authChoice" },
  { id: "signin-find-id", label: "아이디 찾기", group: "home", koPath: "/signin/findId", enPath: "/en/signin/findId" },
  { id: "signin-find-id-result", label: "아이디 찾기 결과", group: "home", koPath: "/signin/findId/result", enPath: "/en/signin/findId/result" },
  { id: "signin-find-password", label: "비밀번호 찾기", group: "home", koPath: "/signin/findPassword", enPath: "/en/signin/findPassword" },
  { id: "signin-find-password-result", label: "비밀번호 재설정 완료", group: "home", koPath: "/signin/findPassword/result", enPath: "/en/signin/findPassword/result" },
  { id: "signin-forbidden", label: "접근 거부", group: "home", koPath: "/signin/loginForbidden", enPath: "/en/signin/loginForbidden" },
  { id: "admin-home", label: "관리자 홈", group: "admin", koPath: "/admin/", enPath: "/en/admin/" },
  { id: "admin-login", label: "관리자 로그인", group: "admin", koPath: "/admin/login/loginView", enPath: "/en/admin/login/loginView" },
  { id: "auth-group", label: "권한 그룹", group: "admin", koPath: "/admin/auth/group", enPath: "/en/admin/auth/group" },
  { id: "auth-change", label: "권한 변경", group: "admin", koPath: "/admin/member/auth-change", enPath: "/en/admin/member/auth-change" },
  { id: "dept-role", label: "부서 권한 맵핑", group: "admin", koPath: "/admin/member/dept-role-mapping", enPath: "/en/admin/member/dept-role-mapping" },
  { id: "member-edit", label: "회원 수정", group: "admin", koPath: "/admin/member/edit", enPath: "/en/admin/member/edit" },
  { id: "password-reset", label: "비밀번호 초기화", group: "admin", koPath: "/admin/member/reset_password", enPath: "/en/admin/member/reset_password" },
  { id: "admin-permission", label: "관리자 권한", group: "admin", koPath: "/admin/member/admin_account/permissions", enPath: "/en/admin/member/admin_account/permissions" },
  { id: "admin-create", label: "관리자 생성", group: "admin", koPath: "/admin/member/admin_account", enPath: "/en/admin/member/admin_account" },
  { id: "company-account", label: "회원사 계정", group: "admin", koPath: "/admin/member/company_account", enPath: "/en/admin/member/company_account" },
  { id: "admin-list", label: "관리자 목록", group: "admin", koPath: "/admin/member/admin_list", enPath: "/en/admin/member/admin_list" },
  { id: "company-list", label: "회원사 목록", group: "admin", koPath: "/admin/member/company_list", enPath: "/en/admin/member/company_list" },
  { id: "member-approve", label: "회원 승인", group: "admin", koPath: "/admin/member/approve", enPath: "/en/admin/member/approve" },
  { id: "company-approve", label: "회원사 승인", group: "admin", koPath: "/admin/member/company-approve", enPath: "/en/admin/member/company-approve" },
  { id: "member-list", label: "회원 목록", group: "admin", koPath: "/admin/member/list", enPath: "/en/admin/member/list" },
  { id: "member-detail", label: "회원 상세", group: "admin", koPath: "/admin/member/detail", enPath: "/en/admin/member/detail" },
  { id: "company-detail", label: "회원사 상세", group: "admin", koPath: "/admin/member/company_detail", enPath: "/en/admin/member/company_detail" },
  { id: "member-stats", label: "회원 통계", group: "admin", koPath: "/admin/member/stats", enPath: "/en/admin/member/stats" },
  { id: "member-register", label: "회원 등록", group: "admin", koPath: "/admin/member/register", enPath: "/en/admin/member/register" },
  { id: "emission-result-list", label: "배출 결과 목록", group: "admin", koPath: "/admin/emission/result_list", enPath: "/en/admin/emission/result_list" },
  { id: "system-code", label: "시스템 코드", group: "admin", koPath: "/admin/system/code", enPath: "/en/admin/system/code" },
  { id: "page-management", label: "페이지 관리", group: "admin", koPath: "/admin/system/page-management", enPath: "/en/admin/system/page-management" },
  { id: "function-management", label: "기능 관리", group: "admin", koPath: "/admin/system/feature-management", enPath: "/en/admin/system/feature-management" },
  { id: "menu-management", label: "메뉴 관리", group: "admin", koPath: "/admin/system/menu-management", enPath: "/en/admin/system/menu-management" },
  { id: "full-stack-management", label: "풀스택 관리", group: "admin", koPath: "/admin/system/full-stack-management", enPath: "/en/admin/system/full-stack-management" },
  { id: "platform-studio", label: "플랫폼 스튜디오", group: "admin", koPath: "/admin/system/platform-studio", enPath: "/en/admin/system/platform-studio" },
  { id: "screen-elements-management", label: "화면 요소 관리", group: "admin", koPath: "/admin/system/screen-elements-management", enPath: "/en/admin/system/screen-elements-management" },
  { id: "event-management-console", label: "이벤트 관리", group: "admin", koPath: "/admin/system/event-management-console", enPath: "/en/admin/system/event-management-console" },
  { id: "function-management-console", label: "함수 콘솔", group: "admin", koPath: "/admin/system/function-management-console", enPath: "/en/admin/system/function-management-console" },
  { id: "api-management-console", label: "API 관리", group: "admin", koPath: "/admin/system/api-management-console", enPath: "/en/admin/system/api-management-console" },
  { id: "controller-management-console", label: "컨트롤러 관리", group: "admin", koPath: "/admin/system/controller-management-console", enPath: "/en/admin/system/controller-management-console" },
  { id: "db-table-management", label: "DB 테이블 관리", group: "admin", koPath: "/admin/system/db-table-management", enPath: "/en/admin/system/db-table-management" },
  { id: "column-management-console", label: "컬럼 관리", group: "admin", koPath: "/admin/system/column-management-console", enPath: "/en/admin/system/column-management-console" },
  { id: "automation-studio", label: "자동화 스튜디오", group: "admin", koPath: "/admin/system/automation-studio", enPath: "/en/admin/system/automation-studio" },
  { id: "ip-whitelist", label: "IP 화이트리스트", group: "admin", koPath: "/admin/system/ip_whitelist", enPath: "/en/admin/system/ip_whitelist" },
  { id: "login-history", label: "로그인 이력", group: "admin", koPath: "/admin/member/login_history", enPath: "/en/admin/member/login_history" },
  { id: "security-history", label: "보안 이력", group: "admin", koPath: "/admin/system/security", enPath: "/en/admin/system/security" },
  { id: "security-policy", label: "보안 정책", group: "admin", koPath: "/admin/system/security-policy", enPath: "/en/admin/system/security-policy" },
  { id: "security-monitoring", label: "보안 모니터링", group: "admin", koPath: "/admin/system/security-monitoring", enPath: "/en/admin/system/security-monitoring" },
  { id: "blocklist", label: "차단 목록", group: "admin", koPath: "/admin/system/blocklist", enPath: "/en/admin/system/blocklist" },
  { id: "security-audit", label: "보안 감사", group: "admin", koPath: "/admin/system/security-audit", enPath: "/en/admin/system/security-audit" },
  { id: "scheduler-management", label: "스케줄러 관리", group: "admin", koPath: "/admin/system/scheduler", enPath: "/en/admin/system/scheduler" },
  { id: "codex-request", label: "Codex Request", group: "admin", koPath: "/admin/system/codex-request", enPath: "/en/admin/system/codex-request" },
  { id: "observability", label: "추적 조회", group: "admin", koPath: "/admin/system/observability", enPath: "/en/admin/system/observability" },
  { id: "help-management", label: "도움말 운영", group: "admin", koPath: "/admin/system/help-management", enPath: "/en/admin/system/help-management" },
  { id: "sr-workbench", label: "SR 워크벤치", group: "admin", koPath: "/admin/system/sr-workbench", enPath: "/en/admin/system/sr-workbench" },
  { id: "join-company-register", label: "공개 회원사 등록", group: "join", koPath: "/join/companyRegister", enPath: "/join/en/companyRegister" },
  { id: "join-company-register-complete", label: "회원사 등록 완료", group: "join", koPath: "/join/companyRegisterComplete", enPath: "/join/en/companyRegisterComplete" },
  { id: "join-company-status", label: "가입 현황 조회", group: "join", koPath: "/join/companyJoinStatusSearch", enPath: "/join/en/companyJoinStatusSearch" },
  { id: "join-company-status-guide", label: "가입 현황 안내", group: "join", koPath: "/join/companyJoinStatusGuide", enPath: "/join/en/companyJoinStatusGuide" },
  { id: "join-company-status-detail", label: "가입 현황 상세", group: "join", koPath: "/join/companyJoinStatusDetail", enPath: "/join/en/companyJoinStatusDetail" },
  { id: "join-company-reapply", label: "반려 재신청", group: "join", koPath: "/join/companyReapply", enPath: "/join/en/companyReapply" },
  { id: "join-wizard", label: "회원가입 위저드", group: "join", koPath: "/join/step1", enPath: "/join/en/step1" },
  { id: "join-terms", label: "회원가입 약관", group: "join", koPath: "/join/step2", enPath: "/join/en/step2" },
  { id: "join-auth", label: "회원가입 본인확인", group: "join", koPath: "/join/step3", enPath: "/join/en/step3" },
  { id: "join-info", label: "회원가입 정보입력", group: "join", koPath: "/join/step4", enPath: "/join/en/step4" },
  { id: "join-complete", label: "회원가입 완료", group: "join", koPath: "/join/step5", enPath: "/join/en/step5" },
  { id: "mypage", label: "마이페이지", group: "home", koPath: "/mypage", enPath: "/en/mypage" }
];

function normalizeComparablePath(value: string): string {
  if (!value) {
    return "/";
  }
  return value.length > 1 && value.endsWith("/") ? value.slice(0, -1) : value;
}

function isReactManagedPath(pathname: string): boolean {
  const normalizedPath = normalizeComparablePath(pathname);
  const koComparable = normalizeComparablePath(normalizedPath.replace(/^\/en/, "") || "/home");
  const isReactShellPath = normalizedPath === "/react-migration"
    || normalizedPath === "/en/react-migration"
    || normalizedPath === "/admin/react-migration"
    || normalizedPath === "/en/admin/react-migration";

  if (isReactShellPath) {
    return true;
  }

  return ROUTES.some((entry) =>
    normalizeComparablePath(entry.koPath) === koComparable || normalizeComparablePath(entry.enPath) === normalizedPath
  );
}

function lazyNamed<TModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  exportName: TKey
) {
  return lazy(async () => {
    const module = await loader();
    return { default: module[exportName] as ComponentType };
  });
}

const HomeLandingPage = lazyNamed(() => import("./features/home-entry/HomeEntryPages"), "HomeLandingPage");
const AdminHomePage = lazyNamed(() => import("./features/admin-entry/AdminEntryPages"), "AdminHomePage");
const AdminLoginPage = lazyNamed(() => import("./features/admin-entry/AdminEntryPages"), "AdminLoginPage");
const PublicLoginPage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "PublicLoginPage");
const AuthChoicePage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "AuthChoicePage");
const FindIdPage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "FindIdPage");
const FindIdResultPage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "FindIdResultPage");
const FindPasswordPage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "FindPasswordPage");
const FindPasswordCompletePage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "FindPasswordCompletePage");
const ForbiddenPage = lazyNamed(() => import("./features/public-entry/PublicEntryPages"), "ForbiddenPage");
const AuthGroupMigrationPage = lazyNamed(() => import("./features/auth-groups/AuthGroupMigrationPage"), "AuthGroupMigrationPage");
const AuthChangeMigrationPage = lazyNamed(() => import("./features/auth-change/AuthChangeMigrationPage"), "AuthChangeMigrationPage");
const DeptRoleMappingMigrationPage = lazyNamed(() => import("./features/dept-role-mapping/DeptRoleMappingMigrationPage"), "DeptRoleMappingMigrationPage");
const MemberEditMigrationPage = lazyNamed(() => import("./features/member-edit/MemberEditMigrationPage"), "MemberEditMigrationPage");
const PasswordResetMigrationPage = lazyNamed(() => import("./features/password-reset/PasswordResetMigrationPage"), "PasswordResetMigrationPage");
const AdminPermissionMigrationPage = lazyNamed(() => import("./features/admin-permissions/AdminPermissionMigrationPage"), "AdminPermissionMigrationPage");
const AdminAccountCreateMigrationPage = lazyNamed(() => import("./features/admin-account-create/AdminAccountCreateMigrationPage"), "AdminAccountCreateMigrationPage");
const CompanyAccountMigrationPage = lazyNamed(() => import("./features/company-account/CompanyAccountMigrationPage"), "CompanyAccountMigrationPage");
const AdminListMigrationPage = lazyNamed(() => import("./features/admin-list/AdminListMigrationPage"), "AdminListMigrationPage");
const CompanyListMigrationPage = lazyNamed(() => import("./features/company-list/CompanyListMigrationPage"), "CompanyListMigrationPage");
const MemberApproveMigrationPage = lazyNamed(() => import("./features/member-approve/MemberApproveMigrationPage"), "MemberApproveMigrationPage");
const CompanyApproveMigrationPage = lazyNamed(() => import("./features/company-approve/CompanyApproveMigrationPage"), "CompanyApproveMigrationPage");
const MemberListMigrationPage = lazyNamed(() => import("./features/member-list/MemberListMigrationPage"), "MemberListMigrationPage");
const MemberDetailMigrationPage = lazyNamed(() => import("./features/member-detail/MemberDetailMigrationPage"), "MemberDetailMigrationPage");
const CompanyDetailMigrationPage = lazyNamed(() => import("./features/company-detail/CompanyDetailMigrationPage"), "CompanyDetailMigrationPage");
const MemberStatsMigrationPage = lazyNamed(() => import("./features/member-stats/MemberStatsMigrationPage"), "MemberStatsMigrationPage");
const MemberRegisterMigrationPage = lazyNamed(() => import("./features/member-register/MemberRegisterMigrationPage"), "MemberRegisterMigrationPage");
const EmissionResultListMigrationPage = lazyNamed(() => import("./features/emission-result-list/EmissionResultListMigrationPage"), "EmissionResultListMigrationPage");
const SystemCodeMigrationPage = lazyNamed(() => import("./features/system-code/SystemCodeMigrationPage"), "SystemCodeMigrationPage");
const PageManagementMigrationPage = lazyNamed(() => import("./features/page-management/PageManagementMigrationPage"), "PageManagementMigrationPage");
const FunctionManagementMigrationPage = lazyNamed(() => import("./features/function-management/FunctionManagementMigrationPage"), "FunctionManagementMigrationPage");
const MenuManagementMigrationPage = lazyNamed(() => import("./features/menu-management/MenuManagementMigrationPage"), "MenuManagementMigrationPage");
const FullStackManagementMigrationPage = lazyNamed(() => import("./features/menu-management/FullStackManagementMigrationPage"), "FullStackManagementMigrationPage");
const PlatformStudioMigrationPage = lazyNamed(() => import("./features/platform-studio/PlatformStudioMigrationPage"), "PlatformStudioMigrationPage");
const IpWhitelistMigrationPage = lazyNamed(() => import("./features/ip-whitelist/IpWhitelistMigrationPage"), "IpWhitelistMigrationPage");
const LoginHistoryMigrationPage = lazyNamed(() => import("./features/login-history/LoginHistoryMigrationPage"), "LoginHistoryMigrationPage");
const SecurityHistoryMigrationPage = lazyNamed(() => import("./features/security-history/SecurityHistoryMigrationPage"), "SecurityHistoryMigrationPage");
const SecurityPolicyMigrationPage = lazyNamed(() => import("./features/security-policy/SecurityPolicyMigrationPage"), "SecurityPolicyMigrationPage");
const SecurityMonitoringMigrationPage = lazyNamed(() => import("./features/security-monitoring/SecurityMonitoringMigrationPage"), "SecurityMonitoringMigrationPage");
const BlocklistMigrationPage = lazyNamed(() => import("./features/blocklist/BlocklistMigrationPage"), "BlocklistMigrationPage");
const SecurityAuditMigrationPage = lazyNamed(() => import("./features/security-audit/SecurityAuditMigrationPage"), "SecurityAuditMigrationPage");
const SchedulerManagementMigrationPage = lazyNamed(() => import("./features/scheduler-management/SchedulerManagementMigrationPage"), "SchedulerManagementMigrationPage");
const CodexProvisionMigrationPage = lazyNamed(() => import("./features/codex-provision/CodexProvisionMigrationPage"), "CodexProvisionMigrationPage");
const ObservabilityMigrationPage = lazyNamed(() => import("./features/observability/ObservabilityMigrationPage"), "ObservabilityMigrationPage");
const HelpManagementMigrationPage = lazyNamed(() => import("./features/help-management/HelpManagementMigrationPage"), "HelpManagementMigrationPage");
const SrWorkbenchMigrationPage = lazyNamed(() => import("./features/sr-workbench/SrWorkbenchMigrationPage"), "SrWorkbenchMigrationPage");
const JoinCompanyRegisterMigrationPage = lazyNamed(() => import("./features/join-company-register/JoinCompanyRegisterMigrationPage"), "JoinCompanyRegisterMigrationPage");
const JoinCompanyRegisterCompleteMigrationPage = lazyNamed(() => import("./features/join-company-register/JoinCompanyRegisterCompleteMigrationPage"), "JoinCompanyRegisterCompleteMigrationPage");
const JoinCompanyStatusMigrationPage = lazyNamed(() => import("./features/join-company-status/JoinCompanyStatusMigrationPage"), "JoinCompanyStatusMigrationPage");
const JoinCompanyReapplyMigrationPage = lazyNamed(() => import("./features/join-company-reapply/JoinCompanyReapplyMigrationPage"), "JoinCompanyReapplyMigrationPage");
const JoinWizardMigrationPage = lazyNamed(() => import("./features/join-wizard/JoinWizardMigrationPage"), "JoinWizardMigrationPage");
const JoinTermsMigrationPage = lazyNamed(() => import("./features/join-wizard/JoinTermsMigrationPage"), "JoinTermsMigrationPage");
const JoinAuthMigrationPage = lazyNamed(() => import("./features/join-wizard/JoinAuthMigrationPage"), "JoinAuthMigrationPage");
const JoinInfoMigrationPage = lazyNamed(() => import("./features/join-wizard/JoinInfoMigrationPage"), "JoinInfoMigrationPage");
const JoinCompleteMigrationPage = lazyNamed(() => import("./features/join-wizard/JoinCompleteMigrationPage"), "JoinCompleteMigrationPage");
const MypageMigrationPage = lazyNamed(() => import("./features/mypage/MypageMigrationPage"), "MypageMigrationPage");

function getInitialPage(): MigrationPageId {
  const pathname = window.location.pathname;
  const isReactShellPath = pathname === "/react-migration"
    || pathname === "/en/react-migration"
    || pathname === "/admin/react-migration"
    || pathname === "/en/admin/react-migration";
  const currentPath = normalizeComparablePath(window.location.pathname);
  const normalizedPath = normalizeComparablePath(window.location.pathname.replace(/^\/en/, "") || "/home");
  const matched = ROUTES.find((entry) =>
    normalizeComparablePath(entry.koPath) === normalizedPath || normalizeComparablePath(entry.enPath) === currentPath
  );
  if (matched) {
    return matched.id;
  }

  if (isReactShellPath) {
    const queryRoute = new URLSearchParams(window.location.search).get("route")?.trim();
    if (queryRoute === "codex-provision") {
      return "codex-request";
    }
    if (queryRoute && ROUTES.some((entry) => entry.id === queryRoute)) {
      return queryRoute as MigrationPageId;
    }

    const runtimeRoute = window.__CARBONET_REACT_MIGRATION__?.route?.trim() as MigrationPageId | undefined;
    if (runtimeRoute && ROUTES.some((entry) => entry.id === runtimeRoute)) {
      return runtimeRoute;
    }
  }

  if (currentPath === "/admin" || currentPath === "/en/admin") {
    return "admin-home";
  }
  if (currentPath.startsWith("/admin") || currentPath.startsWith("/en/admin")) {
    return "admin-home";
  }

  return "home";
}

function resolveCanonicalRuntimePath(): string {
  const pathname = window.location.pathname;
  const isReactShellPath = pathname === "/react-migration"
    || pathname === "/en/react-migration"
    || pathname === "/admin/react-migration"
    || pathname === "/en/admin/react-migration";
  if (!isReactShellPath) {
    return "";
  }

  const params = new URLSearchParams(window.location.search);
  const route = (params.get("route") || window.__CARBONET_REACT_MIGRATION__?.route || "").trim() as MigrationPageId;
  if (!route) {
    return "";
  }
  const matched = ROUTES.find((entry) => entry.id === route);
  if (!matched) {
    return "";
  }

  params.delete("route");
  params.delete("content");
  params.delete("language");

  const basePath = getRuntimeLocale() === "en" ? matched.enPath : matched.koPath;
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function getPageComponent(route: MigrationPageId): ComponentType {
  switch (route) {
    case "home":
      return HomeLandingPage;
    case "admin-home":
      return AdminHomePage;
    case "signin-login":
      return PublicLoginPage;
    case "admin-login":
      return AdminLoginPage;
    case "signin-auth-choice":
      return AuthChoicePage;
    case "signin-find-id":
      return FindIdPage;
    case "signin-find-id-result":
      return FindIdResultPage;
    case "signin-find-password":
      return FindPasswordPage;
    case "signin-find-password-result":
      return FindPasswordCompletePage;
    case "signin-forbidden":
      return ForbiddenPage;
    case "auth-group":
      return AuthGroupMigrationPage;
    case "auth-change":
      return AuthChangeMigrationPage;
    case "dept-role":
      return DeptRoleMappingMigrationPage;
    case "member-edit":
      return MemberEditMigrationPage;
    case "password-reset":
      return PasswordResetMigrationPage;
    case "admin-permission":
      return AdminPermissionMigrationPage;
    case "admin-create":
      return AdminAccountCreateMigrationPage;
    case "company-account":
      return CompanyAccountMigrationPage;
    case "admin-list":
      return AdminListMigrationPage;
    case "company-list":
      return CompanyListMigrationPage;
    case "member-approve":
      return MemberApproveMigrationPage;
    case "company-approve":
      return CompanyApproveMigrationPage;
    case "member-list":
      return MemberListMigrationPage;
    case "member-detail":
      return MemberDetailMigrationPage;
    case "company-detail":
      return CompanyDetailMigrationPage;
    case "member-stats":
      return MemberStatsMigrationPage;
    case "member-register":
      return MemberRegisterMigrationPage;
    case "emission-result-list":
      return EmissionResultListMigrationPage;
    case "system-code":
      return SystemCodeMigrationPage;
    case "page-management":
      return PageManagementMigrationPage;
    case "function-management":
      return FunctionManagementMigrationPage;
    case "menu-management":
      return MenuManagementMigrationPage;
    case "full-stack-management":
      return FullStackManagementMigrationPage;
    case "platform-studio":
    case "screen-elements-management":
    case "event-management-console":
    case "function-management-console":
    case "api-management-console":
    case "controller-management-console":
    case "db-table-management":
    case "column-management-console":
    case "automation-studio":
      return PlatformStudioMigrationPage;
    case "ip-whitelist":
      return IpWhitelistMigrationPage;
    case "login-history":
      return LoginHistoryMigrationPage;
    case "security-history":
      return SecurityHistoryMigrationPage;
    case "security-policy":
      return SecurityPolicyMigrationPage;
    case "security-monitoring":
      return SecurityMonitoringMigrationPage;
    case "blocklist":
      return BlocklistMigrationPage;
    case "security-audit":
      return SecurityAuditMigrationPage;
    case "scheduler-management":
      return SchedulerManagementMigrationPage;
    case "codex-request":
      return CodexProvisionMigrationPage;
    case "observability":
      return ObservabilityMigrationPage;
    case "help-management":
      return HelpManagementMigrationPage;
    case "sr-workbench":
      return SrWorkbenchMigrationPage;
    case "join-company-register":
      return JoinCompanyRegisterMigrationPage;
    case "join-company-register-complete":
      return JoinCompanyRegisterCompleteMigrationPage;
    case "join-company-status":
      return JoinCompanyStatusMigrationPage;
    case "join-company-status-guide":
      return JoinCompanyStatusMigrationPage;
    case "join-company-status-detail":
      return JoinCompanyStatusMigrationPage;
    case "join-company-reapply":
      return JoinCompanyReapplyMigrationPage;
    case "join-wizard":
      return JoinWizardMigrationPage;
    case "join-terms":
      return JoinTermsMigrationPage;
    case "join-auth":
      return JoinAuthMigrationPage;
    case "join-info":
      return JoinInfoMigrationPage;
    case "join-complete":
      return JoinCompleteMigrationPage;
    case "mypage":
      return MypageMigrationPage;
    default:
      return HomeLandingPage;
  }
}

export default function App() {
  useTelemetryTransport();
  const [locationState, setLocationState] = useState(() => `${window.location.pathname}${window.location.search}${window.location.hash}`);
  const page = getInitialPage();
  const locale = getRuntimeLocale();
  const routePath = `${window.location.pathname}${window.location.search}`;
  const manifest = getPageManifest(page);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpContent, setHelpContent] = useState(getPageHelp(page));
  const [insttWarning, setInsttWarning] = useState("");
  const CurrentPage = getPageComponent(page);

  usePageTelemetry(page, locale);

  useEffect(() => {
    const canonicalPath = resolveCanonicalRuntimePath();
    if (canonicalPath) {
      replace(canonicalPath);
    }
  }, [locationState]);

  useEffect(() => {
    function syncLocation() {
      setLocationState(`${window.location.pathname}${window.location.search}${window.location.hash}`);
      setHelpOpen(false);
      setInsttWarning("");
    }

    function handleDocumentClick(event: MouseEvent) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.hasAttribute("download") || anchor.target === "_blank") {
        return;
      }
      const nextUrl = new URL(anchor.href, window.location.origin);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }
      if (!isReactManagedPath(nextUrl.pathname)) {
        return;
      }
      event.preventDefault();
      navigate(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    }

    window.addEventListener("popstate", syncLocation);
    window.addEventListener(getNavigationEventName(), syncLocation);
    document.addEventListener("click", handleDocumentClick);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener(getNavigationEventName(), syncLocation);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  useEffect(() => {
    let timeoutId: number | undefined;

    function handleMissingInsttWarning(event: Event) {
      const customEvent = event as CustomEvent<{ url?: string }>;
      const targetUrl = customEvent.detail?.url || routePath;
      setInsttWarning(`마스터 계정이 아닌데 요청 파라미터에 instt_id 없이 API가 실행되었습니다. 요청 경로: ${targetUrl}`);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => setInsttWarning(""), 8000);
    }

    window.addEventListener(getMissingInsttWarningEventName(), handleMissingInsttWarning as EventListener);
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener(getMissingInsttWarningEventName(), handleMissingInsttWarning as EventListener);
    };
  }, [routePath]);

  useEffect(() => {
    setHelpContent(getPageHelp(page));
    fetchPageHelp(page)
      .then((payload) => {
        if (payload) {
          setHelpContent(payload);
        }
      })
      .catch(() => undefined);
  }, [page, locationState]);

  useEffect(() => {
    if (!manifest) {
      return;
    }
    publishTelemetryEvent({
      type: "layout_render",
      pageId: page,
      payloadSummary: {
        routePath: manifest.routePath,
        layoutVersion: manifest.layoutVersion,
        componentCount: manifest.components.length
      }
    });
  }, [manifest, page, routePath]);

  return (
    <>
      <button
        className="help-fab"
        onClick={() => setHelpOpen(true)}
        type="button"
      >
        도움말
      </button>

      <HelpOverlay
        open={helpOpen}
        pageId={page}
        helpContent={helpContent}
        onClose={() => setHelpOpen(false)}
      />

      {insttWarning ? (
        <div className="fixed left-1/2 top-4 z-[1200] w-[min(960px,calc(100%-32px))] -translate-x-1/2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-warning-border)] bg-[var(--kr-gov-warning-bg)] px-5 py-4 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm font-medium text-[var(--kr-gov-text-primary)]">
              {insttWarning}
            </div>
            <button
              className="shrink-0 rounded border border-[var(--kr-gov-border-light)] bg-white px-3 py-1 text-xs font-bold text-[var(--kr-gov-text-secondary)]"
              onClick={() => setInsttWarning("")}
              type="button"
            >
              닫기
            </button>
          </div>
        </div>
      ) : null}

      <Suspense fallback={<PageLoadingFallback />}>
        <CurrentPage />
      </Suspense>
    </>
  );
}

function PageLoadingFallback() {
  return (
    <div className="px-4 py-16 text-center text-[var(--kr-gov-text-secondary)]">
      화면을 불러오는 중입니다.
    </div>
  );
}
