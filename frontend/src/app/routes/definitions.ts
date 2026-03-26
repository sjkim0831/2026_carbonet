export type MigrationPageId =
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
  | "member-withdrawn"
  | "member-activate"
  | "member-detail"
  | "company-detail"
  | "member-stats"
  | "member-register"
  | "emission-result-list"
  | "emission-site-management"
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
  | "environment-management"
  | "screen-builder"
  | "screen-runtime"
  | "current-runtime-compare"
  | "repair-workbench"
  | "screen-flow-management"
  | "screen-menu-assignment-management"
  | "wbs-management"
  | "ip-whitelist"
  | "access-history"
  | "error-log"
  | "login-history"
  | "member-security-history"
  | "security-history"
  | "security-policy"
  | "security-monitoring"
  | "blocklist"
  | "security-audit"
  | "scheduler-management"
  | "backup-config"
  | "backup-execution"
  | "restore-execution"
  | "version-management"
  | "codex-request"
  | "unified-log"
  | "observability"
  | "help-management"
  | "sr-workbench"
  | "admin-sitemap"
  | "admin-menu-placeholder"
  | "join-company-register"
  | "join-company-register-complete"
  | "join-company-status"
  | "join-company-status-guide"
  | "join-company-status-detail"
  | "join-company-reapply"
  | "emission-project-list"
  | "join-wizard"
  | "join-terms"
  | "join-auth"
  | "join-info"
  | "join-complete"
  | "mypage"
  | "sitemap"
  | "home-menu-placeholder";

export type RouteDefinition = {
  id: MigrationPageId;
  label: string;
  group: "admin" | "join" | "home";
  koPath: string;
  enPath: string;
};

export const ROUTES: RouteDefinition[] = [
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
  { id: "member-withdrawn", label: "탈퇴 회원", group: "admin", koPath: "/admin/member/withdrawn", enPath: "/en/admin/member/withdrawn" },
  { id: "member-activate", label: "휴면 계정", group: "admin", koPath: "/admin/member/activate", enPath: "/en/admin/member/activate" },
  { id: "member-detail", label: "회원 상세", group: "admin", koPath: "/admin/member/detail", enPath: "/en/admin/member/detail" },
  { id: "company-detail", label: "회원사 상세", group: "admin", koPath: "/admin/member/company_detail", enPath: "/en/admin/member/company_detail" },
  { id: "member-stats", label: "회원 통계", group: "admin", koPath: "/admin/member/stats", enPath: "/en/admin/member/stats" },
  { id: "member-register", label: "회원 등록", group: "admin", koPath: "/admin/member/register", enPath: "/en/admin/member/register" },
  { id: "emission-result-list", label: "배출 결과 목록", group: "admin", koPath: "/admin/emission/result_list", enPath: "/en/admin/emission/result_list" },
  { id: "emission-site-management", label: "배출지 관리", group: "admin", koPath: "/admin/emission/site-management", enPath: "/en/admin/emission/site-management" },
  { id: "system-code", label: "시스템 코드", group: "admin", koPath: "/admin/system/code", enPath: "/en/admin/system/code" },
  { id: "page-management", label: "화면 관리", group: "admin", koPath: "/admin/system/page-management", enPath: "/en/admin/system/page-management" },
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
  { id: "environment-management", label: "메뉴 통합 관리", group: "admin", koPath: "/admin/system/environment-management", enPath: "/en/admin/system/environment-management" },
  { id: "screen-builder", label: "화면 빌더", group: "admin", koPath: "/admin/system/screen-builder", enPath: "/en/admin/system/screen-builder" },
  { id: "screen-runtime", label: "발행 화면 런타임", group: "admin", koPath: "/admin/system/screen-runtime", enPath: "/en/admin/system/screen-runtime" },
  { id: "current-runtime-compare", label: "현재 런타임 비교", group: "admin", koPath: "/admin/system/current-runtime-compare", enPath: "/en/admin/system/current-runtime-compare" },
  { id: "repair-workbench", label: "복구 워크벤치", group: "admin", koPath: "/admin/system/repair-workbench", enPath: "/en/admin/system/repair-workbench" },
  { id: "screen-flow-management", label: "화면 흐름 관리", group: "admin", koPath: "/admin/system/screen-flow-management", enPath: "/en/admin/system/screen-flow-management" },
  { id: "screen-menu-assignment-management", label: "화면-메뉴 귀속 관리", group: "admin", koPath: "/admin/system/screen-menu-assignment-management", enPath: "/en/admin/system/screen-menu-assignment-management" },
  { id: "wbs-management", label: "WBS 관리", group: "admin", koPath: "/admin/system/wbs-management", enPath: "/en/admin/system/wbs-management" },
  { id: "ip-whitelist", label: "IP 화이트리스트", group: "admin", koPath: "/admin/system/ip_whitelist", enPath: "/en/admin/system/ip_whitelist" },
  { id: "access-history", label: "접속 로그", group: "admin", koPath: "/admin/system/access_history", enPath: "/en/admin/system/access_history" },
  { id: "error-log", label: "에러 로그", group: "admin", koPath: "/admin/system/error-log", enPath: "/en/admin/system/error-log" },
  { id: "login-history", label: "로그인 이력", group: "admin", koPath: "/admin/member/login_history", enPath: "/en/admin/member/login_history" },
  { id: "member-security-history", label: "회원 접근 차단 이력", group: "admin", koPath: "/admin/member/security", enPath: "/en/admin/member/security" },
  { id: "security-history", label: "보안 이력", group: "admin", koPath: "/admin/system/security", enPath: "/en/admin/system/security" },
  { id: "security-policy", label: "보안 정책", group: "admin", koPath: "/admin/system/security-policy", enPath: "/en/admin/system/security-policy" },
  { id: "security-monitoring", label: "보안 모니터링", group: "admin", koPath: "/admin/system/security-monitoring", enPath: "/en/admin/system/security-monitoring" },
  { id: "blocklist", label: "차단 목록", group: "admin", koPath: "/admin/system/blocklist", enPath: "/en/admin/system/blocklist" },
  { id: "security-audit", label: "보안 감사", group: "admin", koPath: "/admin/system/security-audit", enPath: "/en/admin/system/security-audit" },
  { id: "scheduler-management", label: "스케줄러 관리", group: "admin", koPath: "/admin/system/scheduler", enPath: "/en/admin/system/scheduler" },
  { id: "backup-config", label: "백업 설정", group: "admin", koPath: "/admin/system/backup_config", enPath: "/en/admin/system/backup_config" },
  { id: "backup-execution", label: "백업 실행", group: "admin", koPath: "/admin/system/backup", enPath: "/en/admin/system/backup" },
  { id: "restore-execution", label: "복구 실행", group: "admin", koPath: "/admin/system/restore", enPath: "/en/admin/system/restore" },
  { id: "version-management", label: "버전 관리", group: "admin", koPath: "/admin/system/version", enPath: "/en/admin/system/version" },
  { id: "codex-request", label: "Codex Execution Console", group: "admin", koPath: "/admin/system/codex-request", enPath: "/en/admin/system/codex-request" },
  { id: "unified-log", label: "통합 로그", group: "admin", koPath: "/admin/system/unified_log", enPath: "/en/admin/system/unified_log" },
  { id: "observability", label: "추적 조회", group: "admin", koPath: "/admin/system/observability", enPath: "/en/admin/system/observability" },
  { id: "help-management", label: "도움말 운영", group: "admin", koPath: "/admin/system/help-management", enPath: "/en/admin/system/help-management" },
  { id: "sr-workbench", label: "SR 워크벤치", group: "admin", koPath: "/admin/system/sr-workbench", enPath: "/en/admin/system/sr-workbench" },
  { id: "admin-sitemap", label: "관리자 사이트맵", group: "admin", koPath: "/admin/content/sitemap", enPath: "/en/admin/content/sitemap" },
  { id: "admin-menu-placeholder", label: "관리자 메뉴 플레이스홀더", group: "admin", koPath: "/admin/placeholder", enPath: "/en/admin/placeholder" },
  { id: "join-company-register", label: "공개 회원사 등록", group: "join", koPath: "/join/companyRegister", enPath: "/join/en/companyRegister" },
  { id: "join-company-register-complete", label: "회원사 등록 완료", group: "join", koPath: "/join/companyRegisterComplete", enPath: "/join/en/companyRegisterComplete" },
  { id: "join-company-status", label: "가입 현황 조회", group: "join", koPath: "/join/companyJoinStatusSearch", enPath: "/join/en/companyJoinStatusSearch" },
  { id: "join-company-status-guide", label: "가입 현황 안내", group: "join", koPath: "/join/companyJoinStatusGuide", enPath: "/join/en/companyJoinStatusGuide" },
  { id: "join-company-status-detail", label: "가입 현황 상세", group: "join", koPath: "/join/companyJoinStatusDetail", enPath: "/join/en/companyJoinStatusDetail" },
  { id: "join-company-reapply", label: "반려 재신청", group: "join", koPath: "/join/companyReapply", enPath: "/join/en/companyReapply" },
  { id: "emission-project-list", label: "배출량 관리", group: "home", koPath: "/emission/project_list", enPath: "/en/emission/project_list" },
  { id: "join-wizard", label: "회원가입 위저드", group: "join", koPath: "/join/step1", enPath: "/join/en/step1" },
  { id: "join-terms", label: "회원가입 약관", group: "join", koPath: "/join/step2", enPath: "/join/en/step2" },
  { id: "join-auth", label: "회원가입 본인확인", group: "join", koPath: "/join/step3", enPath: "/join/en/step3" },
  { id: "join-info", label: "회원가입 정보입력", group: "join", koPath: "/join/step4", enPath: "/join/en/step4" },
  { id: "join-complete", label: "회원가입 완료", group: "join", koPath: "/join/step5", enPath: "/join/en/step5" },
  { id: "mypage", label: "마이페이지", group: "home", koPath: "/mypage", enPath: "/en/mypage" },
  { id: "sitemap", label: "사이트맵", group: "home", koPath: "/sitemap", enPath: "/en/sitemap" },
  { id: "home-menu-placeholder", label: "사용자 메뉴 플레이스홀더", group: "home", koPath: "/placeholder", enPath: "/en/placeholder" }
];

export function normalizeRouteId(value: string | null | undefined): MigrationPageId | "" {
  if (!value) {
    return "";
  }
  const normalized = value.trim().replace(/_/g, "-");
  if (normalized === "codex-provision") {
    return "codex-request";
  }
  return ROUTES.some((entry) => entry.id === normalized) ? normalized as MigrationPageId : "";
}
