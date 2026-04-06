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
  | "certificate-approve"
  | "certificate-pending"
  | "virtual-issue"
  | "member-list"
  | "member-withdrawn"
  | "member-activate"
  | "member-detail"
  | "company-detail"
  | "member-stats"
  | "member-register"
  | "trade-list"
  | "trade-market"
  | "trade-report"
  | "trade-statistics"
  | "refund-list"
  | "settlement-calendar"
  | "trade-duplicate"
  | "trade-approve"
  | "trade-reject"
  | "refund-process"
  | "certificate-review"
  | "emission-result-list"
  | "emission-result-detail"
  | "certificate-statistics"
  | "emission-validate"
  | "emission-management"
  | "emission-definition-studio"
  | "emission-gwp-values"
  | "emission-survey-admin"
  | "emission-data-history"
  | "emission-site-management"
  | "certificate-rec-check"
  | "certificate-audit-log"
  | "certificate-objection-list"
  | "system-code"
  | "page-management"
  | "function-management"
  | "menu-management"
  | "faq-menu-management"
  | "full-stack-management"
  | "infra"
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
  | "new-page"
  | "ip-whitelist"
  | "access-history"
  | "error-log"
  | "login-history"
  | "member-security-history"
  | "security-history"
  | "security-policy"
  | "notification"
  | "performance"
  | "external-connection-list"
  | "external-schema"
  | "external-keys"
  | "external-usage"
  | "external-logs"
  | "external-webhooks"
  | "external-sync"
  | "external-monitoring"
  | "external-maintenance"
  | "external-retry"
  | "security-monitoring"
  | "blocklist"
  | "security-audit"
  | "monitoring-center"
  | "sensor-add"
  | "sensor-edit"
  | "sensor-list"
  | "external-connection-add"
  | "external-connection-edit"
  | "batch-management"
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
  | "board-list"
  | "board-add"
  | "post-list"
  | "banner-list"
  | "popup-list"
  | "banner-edit"
  | "popup-edit"
  | "qna-category"
  | "faq-management"
  | "file-management"
  | "admin-sitemap"
  | "tag-management"
  | "admin-menu-placeholder"
  | "join-company-register"
  | "join-company-register-complete"
  | "join-company-status"
  | "join-company-status-guide"
  | "join-company-status-detail"
  | "join-company-reapply"
  | "my-inquiry"
  | "mtn-status"
  | "mtn-version"
  | "support-faq"
  | "support-inquiry"
  | "emission-project-list"
  | "emission-reduction"
  | "emission-lci"
  | "emission-data-input"
  | "emission-report-submit"
  | "emission-lca"
  | "emission-simulate"
  | "monitoring-dashboard"
  | "monitoring-realtime"
  | "monitoring-alerts"
  | "monitoring-statistics"
  | "monitoring-share"
  | "monitoring-reduction-trend"
  | "monitoring-track"
  | "monitoring-export"
  | "co2-production-list"
  | "co2-demand-list"
  | "co2-integrity"
  | "co2-analysis"
  | "co2-search"
  | "trade-buy-request"
  | "trade-complete"
  | "trade-auto-order"
  | "trade-sell"
  | "trade-price-alert"
  | "payment-pay"
  | "payment-virtual-account"
  | "payment-refund"
  | "payment-refund-account"
  | "payment-notify"
  | "co2-credit"
  | "emission-home-validate"
  | "certificate-list"
  | "certificate-apply"
  | "certificate-report-list"
  | "certificate-report-form"
  | "certificate-report-edit"
  | "payment-history"
  | "edu-course-list"
  | "edu-my-course"
  | "edu-progress"
  | "edu-content"
  | "edu-course-detail"
  | "edu-apply"
  | "edu-survey"
  | "edu-certificate"
  | "payment-receipt"
  | "join-wizard"
  | "join-terms"
  | "join-auth"
  | "join-info"
  | "join-complete"
  | "mypage"
  | "mypage-email"
  | "mypage-notification"
  | "mypage-marketing"
  | "mypage-company"
  | "mypage-password"
  | "mypage-staff"
  | "download-list"
  | "notice-list"
  | "qna-list"
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
  { id: "certificate-approve", label: "인증서 승인", group: "admin", koPath: "/admin/certificate/approve", enPath: "/en/admin/certificate/approve" },
  { id: "certificate-pending", label: "인증서 발급 대기", group: "admin", koPath: "/admin/certificate/pending_list", enPath: "/en/admin/certificate/pending_list" },
  { id: "virtual-issue", label: "환불 계좌 검수", group: "admin", koPath: "/admin/payment/virtual_issue", enPath: "/en/admin/payment/virtual_issue" },
  { id: "member-list", label: "회원 목록", group: "admin", koPath: "/admin/member/list", enPath: "/en/admin/member/list" },
  { id: "member-withdrawn", label: "탈퇴 회원", group: "admin", koPath: "/admin/member/withdrawn", enPath: "/en/admin/member/withdrawn" },
  { id: "member-activate", label: "휴면 계정", group: "admin", koPath: "/admin/member/activate", enPath: "/en/admin/member/activate" },
  { id: "member-detail", label: "회원 상세", group: "admin", koPath: "/admin/member/detail", enPath: "/en/admin/member/detail" },
  { id: "company-detail", label: "회원사 상세", group: "admin", koPath: "/admin/member/company_detail", enPath: "/en/admin/member/company_detail" },
  { id: "member-stats", label: "회원 통계", group: "admin", koPath: "/admin/member/stats", enPath: "/en/admin/member/stats" },
  { id: "member-register", label: "회원 등록", group: "admin", koPath: "/admin/member/register", enPath: "/en/admin/member/register" },
  { id: "trade-list", label: "거래 목록", group: "home", koPath: "/trade/list", enPath: "/en/trade/list" },
  { id: "trade-market", label: "거래 시장", group: "home", koPath: "/trade/market", enPath: "/en/trade/market" },
  { id: "trade-report", label: "거래 리포트", group: "home", koPath: "/trade/report", enPath: "/en/trade/report" },
  { id: "trade-statistics", label: "정산 리포트", group: "admin", koPath: "/admin/trade/statistics", enPath: "/en/admin/trade/statistics" },
  { id: "refund-list", label: "환불 요청 목록", group: "admin", koPath: "/admin/payment/refund_list", enPath: "/en/admin/payment/refund_list" },
  { id: "settlement-calendar", label: "정산 캘린더", group: "admin", koPath: "/admin/payment/settlement", enPath: "/en/admin/payment/settlement" },
  { id: "trade-duplicate", label: "이상거래 점검", group: "admin", koPath: "/admin/trade/duplicate", enPath: "/en/admin/trade/duplicate" },
  { id: "trade-approve", label: "거래 승인", group: "admin", koPath: "/admin/trade/approve", enPath: "/en/admin/trade/approve" },
  { id: "trade-reject", label: "거래 반려 검토", group: "admin", koPath: "/admin/trade/reject", enPath: "/en/admin/trade/reject" },
  { id: "refund-process", label: "환불 처리", group: "admin", koPath: "/admin/payment/refund_process", enPath: "/en/admin/payment/refund_process" },
  { id: "certificate-review", label: "발급 검토", group: "admin", koPath: "/admin/certificate/review", enPath: "/en/admin/certificate/review" },
  { id: "emission-result-list", label: "배출 결과 목록", group: "admin", koPath: "/admin/emission/result_list", enPath: "/en/admin/emission/result_list" },
  { id: "emission-result-detail", label: "결과 상세", group: "admin", koPath: "/admin/emission/result_detail", enPath: "/en/admin/emission/result_detail" },
  { id: "certificate-statistics", label: "인증서 통계", group: "admin", koPath: "/admin/certificate/statistics", enPath: "/en/admin/certificate/statistics" },
  { id: "emission-validate", label: "검증 관리", group: "admin", koPath: "/admin/emission/validate", enPath: "/en/admin/emission/validate" },
  { id: "emission-management", label: "배출 변수 관리", group: "admin", koPath: "/admin/emission/management", enPath: "/en/admin/emission/management" },
  { id: "emission-definition-studio", label: "배출 정의 관리", group: "admin", koPath: "/admin/emission/definition-studio", enPath: "/en/admin/emission/definition-studio" },
  { id: "emission-gwp-values", label: "GWP 값 관리", group: "admin", koPath: "/admin/emission/gwp-values", enPath: "/en/admin/emission/gwp-values" },
  { id: "emission-survey-admin", label: "배출 설문 관리", group: "admin", koPath: "/admin/emission/survey-admin", enPath: "/en/admin/emission/survey-admin" },
  { id: "emission-data-history", label: "데이터 변경 이력", group: "admin", koPath: "/admin/emission/data_history", enPath: "/en/admin/emission/data_history" },
  { id: "emission-site-management", label: "배출지 관리", group: "admin", koPath: "/admin/emission/site-management", enPath: "/en/admin/emission/site-management" },
  { id: "certificate-rec-check", label: "REC 중복 확인", group: "admin", koPath: "/admin/certificate/rec_check", enPath: "/en/admin/certificate/rec_check" },
  { id: "certificate-audit-log", label: "인증서 감사 로그", group: "admin", koPath: "/admin/certificate/audit-log", enPath: "/en/admin/certificate/audit-log" },
  { id: "certificate-objection-list", label: "이의신청 처리", group: "admin", koPath: "/admin/certificate/objection_list", enPath: "/en/admin/certificate/objection_list" },
  { id: "system-code", label: "시스템 코드", group: "admin", koPath: "/admin/system/code", enPath: "/en/admin/system/code" },
  { id: "page-management", label: "화면 관리", group: "admin", koPath: "/admin/system/page-management", enPath: "/en/admin/system/page-management" },
  { id: "function-management", label: "기능 관리", group: "admin", koPath: "/admin/system/feature-management", enPath: "/en/admin/system/feature-management" },
  { id: "menu-management", label: "메뉴 관리", group: "admin", koPath: "/admin/system/menu", enPath: "/en/admin/system/menu" },
  { id: "faq-menu-management", label: "FAQ 메뉴 관리", group: "admin", koPath: "/admin/content/menu", enPath: "/en/admin/content/menu" },
  { id: "full-stack-management", label: "풀스택 관리", group: "admin", koPath: "/admin/system/full-stack-management", enPath: "/en/admin/system/full-stack-management" },
  { id: "infra", label: "인프라", group: "admin", koPath: "/admin/system/infra", enPath: "/en/admin/system/infra" },
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
  { id: "new-page", label: "새 페이지", group: "admin", koPath: "/admin/system/new-page", enPath: "/en/admin/system/new-page" },
  { id: "ip-whitelist", label: "IP 화이트리스트", group: "admin", koPath: "/admin/system/ip_whitelist", enPath: "/en/admin/system/ip_whitelist" },
  { id: "access-history", label: "접속 로그", group: "admin", koPath: "/admin/system/access_history", enPath: "/en/admin/system/access_history" },
  { id: "error-log", label: "에러 로그", group: "admin", koPath: "/admin/system/error-log", enPath: "/en/admin/system/error-log" },
  { id: "login-history", label: "로그인 이력", group: "admin", koPath: "/admin/member/login_history", enPath: "/en/admin/member/login_history" },
  { id: "member-security-history", label: "회원 접근 차단 이력", group: "admin", koPath: "/admin/member/security", enPath: "/en/admin/member/security" },
  { id: "security-history", label: "보안 이력", group: "admin", koPath: "/admin/system/security", enPath: "/en/admin/system/security" },
  { id: "security-policy", label: "보안 정책", group: "admin", koPath: "/admin/system/security-policy", enPath: "/en/admin/system/security-policy" },
  { id: "notification", label: "알림센터", group: "admin", koPath: "/admin/system/notification", enPath: "/en/admin/system/notification" },
  { id: "performance", label: "성능", group: "admin", koPath: "/admin/system/performance", enPath: "/en/admin/system/performance" },
  { id: "external-connection-list", label: "외부 연계 목록", group: "admin", koPath: "/admin/external/connection_list", enPath: "/en/admin/external/connection_list" },
  { id: "external-schema", label: "외부 스키마", group: "admin", koPath: "/admin/external/schema", enPath: "/en/admin/external/schema" },
  { id: "external-keys", label: "외부 인증키 관리", group: "admin", koPath: "/admin/external/keys", enPath: "/en/admin/external/keys" },
  { id: "external-usage", label: "API 사용량", group: "admin", koPath: "/admin/external/usage", enPath: "/en/admin/external/usage" },
  { id: "external-logs", label: "외부 연계 로그", group: "admin", koPath: "/admin/external/logs", enPath: "/en/admin/external/logs" },
  { id: "external-webhooks", label: "웹훅 설정", group: "admin", koPath: "/admin/external/webhooks", enPath: "/en/admin/external/webhooks" },
  { id: "external-sync", label: "동기화 실행", group: "admin", koPath: "/admin/external/sync", enPath: "/en/admin/external/sync" },
  { id: "external-monitoring", label: "연계 모니터링", group: "admin", koPath: "/admin/external/monitoring", enPath: "/en/admin/external/monitoring" },
  { id: "external-maintenance", label: "점검 관리", group: "admin", koPath: "/admin/external/maintenance", enPath: "/en/admin/external/maintenance" },
  { id: "external-retry", label: "재시도 관리", group: "admin", koPath: "/admin/external/retry", enPath: "/en/admin/external/retry" },
  { id: "security-monitoring", label: "보안 모니터링", group: "admin", koPath: "/admin/system/security-monitoring", enPath: "/en/admin/system/security-monitoring" },
  { id: "blocklist", label: "차단 목록", group: "admin", koPath: "/admin/system/blocklist", enPath: "/en/admin/system/blocklist" },
  { id: "security-audit", label: "보안 감사", group: "admin", koPath: "/admin/system/security-audit", enPath: "/en/admin/system/security-audit" },
  { id: "monitoring-center", label: "운영센터", group: "admin", koPath: "/admin/monitoring/center", enPath: "/en/admin/monitoring/center" },
  { id: "sensor-add", label: "센서 등록", group: "admin", koPath: "/admin/monitoring/sensor_add", enPath: "/en/admin/monitoring/sensor_add" },
  { id: "sensor-edit", label: "센서 설정", group: "admin", koPath: "/admin/monitoring/sensor_edit", enPath: "/en/admin/monitoring/sensor_edit" },
  { id: "sensor-list", label: "센서 목록", group: "admin", koPath: "/admin/monitoring/sensor_list", enPath: "/en/admin/monitoring/sensor_list" },
  { id: "external-connection-add", label: "외부연계 등록", group: "admin", koPath: "/admin/external/connection_add", enPath: "/en/admin/external/connection_add" },
  { id: "external-connection-edit", label: "외부연계 수정", group: "admin", koPath: "/admin/external/connection_edit", enPath: "/en/admin/external/connection_edit" },
  { id: "batch-management", label: "배치 관리", group: "admin", koPath: "/admin/system/batch", enPath: "/en/admin/system/batch" },
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
  { id: "board-list", label: "게시판 관리", group: "admin", koPath: "/admin/content/board_list", enPath: "/en/admin/content/board_list" },
  { id: "board-add", label: "공지 배포", group: "admin", koPath: "/admin/content/board_add", enPath: "/en/admin/content/board_add" },
  { id: "post-list", label: "게시글 목록", group: "admin", koPath: "/admin/content/post_list", enPath: "/en/admin/content/post_list" },
  { id: "banner-list", label: "배너 목록", group: "admin", koPath: "/admin/content/banner_list", enPath: "/en/admin/content/banner_list" },
  { id: "popup-list", label: "팝업 목록", group: "admin", koPath: "/admin/content/popup_list", enPath: "/en/admin/content/popup_list" },
  { id: "banner-edit", label: "배너 편집", group: "admin", koPath: "/admin/content/banner_edit", enPath: "/en/admin/content/banner_edit" },
  { id: "popup-edit", label: "팝업 스케줄", group: "admin", koPath: "/admin/content/popup_edit", enPath: "/en/admin/content/popup_edit" },
  { id: "qna-category", label: "Q&A 분류", group: "admin", koPath: "/admin/content/qna", enPath: "/en/admin/content/qna" },
  { id: "faq-management", label: "FAQ 관리", group: "admin", koPath: "/admin/content/faq_list", enPath: "/en/admin/content/faq_list" },
  { id: "file-management", label: "파일 관리", group: "admin", koPath: "/admin/content/file", enPath: "/en/admin/content/file" },
  { id: "admin-sitemap", label: "관리자 사이트맵", group: "admin", koPath: "/admin/content/sitemap", enPath: "/en/admin/content/sitemap" },
  { id: "tag-management", label: "태그 관리", group: "admin", koPath: "/admin/content/tag", enPath: "/en/admin/content/tag" },
  { id: "admin-menu-placeholder", label: "관리자 메뉴 플레이스홀더", group: "admin", koPath: "/admin/placeholder", enPath: "/en/admin/placeholder" },
  { id: "join-company-register", label: "공개 회원사 등록", group: "join", koPath: "/join/companyRegister", enPath: "/join/en/companyRegister" },
  { id: "join-company-register-complete", label: "회원사 등록 완료", group: "join", koPath: "/join/companyRegisterComplete", enPath: "/join/en/companyRegisterComplete" },
  { id: "join-company-status", label: "가입 현황 조회", group: "join", koPath: "/join/companyJoinStatusSearch", enPath: "/join/en/companyJoinStatusSearch" },
  { id: "join-company-status-guide", label: "가입 현황 안내", group: "join", koPath: "/join/companyJoinStatusGuide", enPath: "/join/en/companyJoinStatusGuide" },
  { id: "join-company-status-detail", label: "가입 현황 상세", group: "join", koPath: "/join/companyJoinStatusDetail", enPath: "/join/en/companyJoinStatusDetail" },
  { id: "join-company-reapply", label: "반려 재신청", group: "join", koPath: "/join/companyReapply", enPath: "/join/en/companyReapply" },
  { id: "emission-project-list", label: "배출량 관리", group: "home", koPath: "/emission/project_list", enPath: "/en/emission/project_list" },
  { id: "emission-reduction", label: "감축 시나리오", group: "home", koPath: "/emission/reduction", enPath: "/en/emission/reduction" },
  { id: "emission-lci", label: "LCI DB 조회", group: "home", koPath: "/emission/lci", enPath: "/en/emission/lci" },
  { id: "emission-data-input", label: "데이터 입력", group: "home", koPath: "/emission/data_input", enPath: "/en/emission/data_input" },
  { id: "emission-report-submit", label: "배출량 보고서 작성", group: "home", koPath: "/emission/report_submit", enPath: "/en/emission/report_submit" },
  { id: "emission-lca", label: "LCA 분석", group: "home", koPath: "/emission/lca", enPath: "/en/emission/lca" },
  { id: "emission-simulate", label: "시뮬레이션", group: "home", koPath: "/emission/simulate", enPath: "/en/emission/simulate" },
  { id: "monitoring-dashboard", label: "통합 대시보드", group: "home", koPath: "/monitoring/dashboard", enPath: "/en/monitoring/dashboard" },
  { id: "monitoring-realtime", label: "실시간 모니터링", group: "home", koPath: "/monitoring/realtime", enPath: "/en/monitoring/realtime" },
  { id: "monitoring-alerts", label: "경보 현황", group: "home", koPath: "/monitoring/alerts", enPath: "/en/monitoring/alerts" },
  { id: "monitoring-statistics", label: "ESG 보고서", group: "home", koPath: "/monitoring/statistics", enPath: "/en/monitoring/statistics" },
  { id: "monitoring-share", label: "이해관계자 공유", group: "home", koPath: "/monitoring/share", enPath: "/en/monitoring/share" },
  { id: "monitoring-reduction-trend", label: "성과 추이 분석", group: "home", koPath: "/monitoring/reduction_trend", enPath: "/en/monitoring/reduction_trend" },
  { id: "monitoring-track", label: "추적 리포트", group: "home", koPath: "/monitoring/track", enPath: "/en/monitoring/track" },
  { id: "monitoring-export", label: "분석 리포트 내보내기", group: "home", koPath: "/monitoring/export", enPath: "/en/monitoring/export" },
  { id: "co2-production-list", label: "생산 정보", group: "home", koPath: "/co2/production_list", enPath: "/en/co2/production_list" },
  { id: "co2-demand-list", label: "수요 정보", group: "home", koPath: "/co2/demand_list", enPath: "/en/co2/demand_list" },
  { id: "co2-integrity", label: "무결성 추적", group: "home", koPath: "/co2/integrity", enPath: "/en/co2/integrity" },
  { id: "co2-analysis", label: "품질 지표", group: "home", koPath: "/co2/analysis", enPath: "/en/co2/analysis" },
  { id: "co2-search", label: "MRV 정보", group: "home", koPath: "/co2/search", enPath: "/en/co2/search" },
  { id: "trade-buy-request", label: "구매 요청", group: "home", koPath: "/trade/buy_request", enPath: "/en/trade/buy_request" },
  { id: "trade-complete", label: "체결 현황", group: "home", koPath: "/trade/complete", enPath: "/en/trade/complete" },
  { id: "trade-auto-order", label: "자동 매칭", group: "home", koPath: "/trade/auto_order", enPath: "/en/trade/auto_order" },
  { id: "trade-sell", label: "판매 등록", group: "home", koPath: "/trade/sell", enPath: "/en/trade/sell" },
  { id: "trade-price-alert", label: "가격 알림", group: "home", koPath: "/trade/price_alert", enPath: "/en/trade/price_alert" },
  { id: "payment-pay", label: "결제 요청", group: "home", koPath: "/payment/pay", enPath: "/en/payment/pay" },
  { id: "payment-virtual-account", label: "가상계좌", group: "home", koPath: "/payment/virtual_account", enPath: "/en/payment/virtual_account" },
  { id: "payment-refund", label: "결제 환불", group: "home", koPath: "/payment/refund", enPath: "/en/payment/refund" },
  { id: "payment-refund-account", label: "환불 계좌", group: "home", koPath: "/payment/refund_account", enPath: "/en/payment/refund_account" },
  { id: "payment-notify", label: "세금계산서", group: "home", koPath: "/payment/notify", enPath: "/en/payment/notify" },
  { id: "co2-credit", label: "크레딧 조회", group: "home", koPath: "/co2/credits", enPath: "/en/co2/credits" },
  { id: "emission-home-validate", label: "산정 검증", group: "home", koPath: "/emission/validate", enPath: "/en/emission/validate" },
  { id: "certificate-list", label: "인증서 목록", group: "home", koPath: "/certificate/list", enPath: "/en/certificate/list" },
  { id: "certificate-apply", label: "인증서 신청", group: "home", koPath: "/certificate/apply", enPath: "/en/certificate/apply" },
  { id: "certificate-report-list", label: "보고서 및 인증서 목록", group: "home", koPath: "/certificate/report_list", enPath: "/en/certificate/report_list" },
  { id: "certificate-report-form", label: "보고서 작성", group: "home", koPath: "/certificate/report_form", enPath: "/en/certificate/report_form" },
  { id: "certificate-report-edit", label: "보고서 수정", group: "home", koPath: "/certificate/report_edit", enPath: "/en/certificate/report_edit" },
  { id: "payment-history", label: "결제 내역", group: "home", koPath: "/payment/history", enPath: "/en/payment/history" },
  { id: "edu-course-list", label: "교육과정 목록", group: "home", koPath: "/edu/course_list", enPath: "/en/edu/course_list" },
  { id: "edu-my-course", label: "나의 교육", group: "home", koPath: "/edu/my_course", enPath: "/en/edu/my_course" },
  { id: "edu-progress", label: "진도 관리", group: "home", koPath: "/edu/progress", enPath: "/en/edu/progress" },
  { id: "edu-content", label: "자격 연계", group: "home", koPath: "/edu/content", enPath: "/en/edu/content" },
  { id: "edu-course-detail", label: "과정 상세", group: "home", koPath: "/edu/course_detail", enPath: "/en/edu/course_detail" },
  { id: "edu-apply", label: "교육 신청", group: "home", koPath: "/edu/apply", enPath: "/en/edu/apply" },
  { id: "edu-survey", label: "설문조사", group: "home", koPath: "/edu/survey", enPath: "/en/edu/survey" },
  { id: "edu-certificate", label: "수료증", group: "home", koPath: "/edu/certificate", enPath: "/en/edu/certificate" },
  { id: "payment-receipt", label: "영수증 관리", group: "home", koPath: "/payment/receipt", enPath: "/en/payment/receipt" },
  { id: "join-wizard", label: "회원가입 위저드", group: "join", koPath: "/join/step1", enPath: "/join/en/step1" },
  { id: "join-terms", label: "회원가입 약관", group: "join", koPath: "/join/step2", enPath: "/join/en/step2" },
  { id: "join-auth", label: "회원가입 본인확인", group: "join", koPath: "/join/step3", enPath: "/join/en/step3" },
  { id: "join-info", label: "회원가입 정보입력", group: "join", koPath: "/join/step4", enPath: "/join/en/step4" },
  { id: "join-complete", label: "회원가입 완료", group: "join", koPath: "/join/step5", enPath: "/join/en/step5" },
  { id: "my-inquiry", label: "1:1 문의", group: "home", koPath: "/mtn/my_inquiry", enPath: "/en/mtn/my_inquiry" },
  { id: "mtn-status", label: "서비스 상태", group: "home", koPath: "/mtn/status", enPath: "/en/mtn/status" },
  { id: "mtn-version", label: "버전 관리", group: "home", koPath: "/mtn/version", enPath: "/en/mtn/version" },
  { id: "support-faq", label: "FAQ", group: "home", koPath: "/support/faq", enPath: "/en/support/faq" },
  { id: "support-inquiry", label: "문의 내역", group: "home", koPath: "/support/inquiry", enPath: "/en/support/inquiry" },
  { id: "mypage", label: "마이페이지", group: "home", koPath: "/mypage/profile", enPath: "/en/mypage/profile" },
  { id: "mypage-email", label: "이메일/전화 변경", group: "home", koPath: "/mypage/email", enPath: "/en/mypage/email" },
  { id: "mypage-notification", label: "알림 설정", group: "home", koPath: "/mypage/notification", enPath: "/en/mypage/notification" },
  { id: "mypage-marketing", label: "마케팅 수신", group: "home", koPath: "/mypage/marketing", enPath: "/en/mypage/marketing" },
  { id: "mypage-company", label: "기업 정보", group: "home", koPath: "/mypage/company", enPath: "/en/mypage/company" },
  { id: "mypage-password", label: "비밀번호 변경", group: "home", koPath: "/mypage/password", enPath: "/en/mypage/password" },
  { id: "mypage-staff", label: "담당자 관리", group: "home", koPath: "/mypage/staff", enPath: "/en/mypage/staff" },
  { id: "download-list", label: "자료실", group: "home", koPath: "/support/download_list", enPath: "/en/support/download_list" },
  { id: "notice-list", label: "공지사항", group: "home", koPath: "/support/notice_list", enPath: "/en/support/notice_list" },
  { id: "qna-list", label: "Q&A", group: "home", koPath: "/support/qna_list", enPath: "/en/support/qna_list" },
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
