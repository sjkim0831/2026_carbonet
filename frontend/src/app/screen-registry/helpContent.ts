import { getPageManifest } from "./pageManifests";

const HELP_SAMPLE_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='960' height='360' viewBox='0 0 960 360'><rect width='960' height='360' rx='24' fill='%23eef4fb'/><rect x='48' y='48' width='300' height='28' rx='14' fill='%2300378b' opacity='0.18'/><rect x='48' y='102' width='864' height='170' rx='18' fill='white'/><rect x='76' y='134' width='248' height='18' rx='9' fill='%2310233f' opacity='0.16'/><rect x='76' y='170' width='808' height='14' rx='7' fill='%23577287' opacity='0.14'/><rect x='76' y='198' width='730' height='14' rx='7' fill='%23577287' opacity='0.1'/><rect x='732' y='294' width='180' height='34' rx='17' fill='%2300378b' opacity='0.88'/></svg>";

export type HelpItem = {
  id: string;
  title: string;
  body: string;
  anchorSelector?: string;
  placement?: "top" | "right" | "bottom" | "left";
  imageUrl?: string;
  iconName?: string;
  highlightStyle?: "focus" | "warning" | "success" | "neutral";
  ctaLabel?: string;
  ctaUrl?: string;
};

export type PageHelpContent = {
  pageId: string;
  title: string;
  summary: string;
  items: HelpItem[];
};

const PAGE_HELP: Record<string, PageHelpContent> = {
  home: {
    pageId: "home",
    title: "홈 도움말",
    summary: "메인 배너, 통합 검색, 핵심 서비스, 운영 현황 요약을 안내합니다.",
    items: [
      { id: "hero", title: "메인 배너", body: "포털의 핵심 안내와 대표 진입 버튼이 있는 첫 화면입니다.", anchorSelector: '[data-help-id="home-hero"]', placement: "top", iconName: "home", highlightStyle: "focus" },
      { id: "search", title: "통합 검색", body: "자주 찾는 메뉴와 검색 키워드로 필요한 정보를 빠르게 찾습니다.", anchorSelector: '[data-help-id="home-search"]', placement: "bottom", iconName: "search", highlightStyle: "success" },
      { id: "services", title: "핵심 서비스", body: "회원 가입, 인증, 통계 등 주요 서비스를 카드형으로 바로 이동할 수 있습니다.", anchorSelector: '[data-help-id="home-services"]', placement: "right", iconName: "apps", highlightStyle: "neutral" },
      { id: "summary", title: "운영 현황 요약", body: "최근 운영 지표와 요약 통계를 확인합니다.", anchorSelector: '[data-help-id="home-summary"]', placement: "left", iconName: "monitoring", highlightStyle: "warning" }
    ]
  },
  "admin-home": {
    pageId: "admin-home",
    title: "관리자 홈 도움말",
    summary: "운영 대시보드 카드와 승인 대기, 심사 진행 현황을 안내합니다.",
    items: [
      { id: "cards", title: "운영 요약 카드", body: "현재 회원 수, 배출량 산정 통계, 인증 심사 현황을 요약합니다.", anchorSelector: '[data-help-id="admin-home-cards"]', placement: "top", iconName: "space_dashboard", highlightStyle: "focus" },
      { id: "approvals", title: "승인 대기", body: "최근 가입 승인 대기 목록을 확인하고 전체보기로 이동할 수 있습니다.", anchorSelector: '[data-help-id="admin-home-approvals"]', placement: "right", iconName: "pending_actions", highlightStyle: "success" },
      { id: "progress", title: "심사 진행 현황", body: "단계별 심사 진행 상태와 비율을 시각적으로 확인합니다.", anchorSelector: '[data-help-id="admin-home-progress"]', placement: "left", iconName: "analytics", highlightStyle: "neutral" }
    ]
  },
  "signin-login": {
    pageId: "signin-login",
    title: "로그인 도움말",
    summary: "공지 영역, 회원 구분 탭, 로그인 폼, 간편인증 진입을 안내합니다.",
    items: [
      { id: "notice", title: "공지 영역", body: "시스템 점검이나 운영 공지사항을 먼저 확인합니다.", anchorSelector: '[data-help-id="signin-login-notice"]', placement: "top", iconName: "campaign", highlightStyle: "neutral" },
      { id: "tabs", title: "회원 구분 탭", body: "국내 기업 회원과 해외 기업 회원 로그인을 전환합니다.", anchorSelector: '[data-help-id="signin-login-tabs"]', placement: "bottom", iconName: "tabs", highlightStyle: "focus" },
      { id: "form", title: "로그인 폼", body: "아이디, 비밀번호, 아이디 저장, 자동 로그인을 입력합니다.", anchorSelector: '[data-help-id="signin-login-form"]', placement: "right", iconName: "login", highlightStyle: "success" },
      { id: "simple", title: "간편인증 로그인", body: "간편인증, 공동인증서, 금융인증서로 로그인할 수 있습니다.", anchorSelector: '[data-help-id="signin-login-simple-auth"]', placement: "left", iconName: "verified_user", highlightStyle: "warning" }
    ]
  },
  "signin-auth-choice": {
    pageId: "signin-auth-choice",
    title: "인증수단 선택 도움말",
    summary: "간편인증, 공동인증서, 금융인증서를 선택하는 화면입니다.",
    items: [
      { id: "options", title: "인증수단 선택", body: "원하는 인증수단을 선택하면 인증 정보 저장 후 홈으로 이동합니다.", anchorSelector: '[data-help-id="signin-auth-choice-options"]', placement: "top", iconName: "fact_check", highlightStyle: "focus" }
    ]
  },
  "signin-find-id": {
    pageId: "signin-find-id",
    title: "아이디 찾기 도움말",
    summary: "기본 정보 입력과 인증수단 선택으로 아이디를 찾습니다.",
    items: [
      { id: "form", title: "입력 폼", body: "성명과 이메일을 입력하고 필요 시 인증번호를 확인합니다.", anchorSelector: '[data-help-id="signin-find-id-form"]', placement: "top", iconName: "badge", highlightStyle: "focus" },
      { id: "methods", title: "본인인증 수단", body: "국내 사용자는 본인인증 수단을 선택해 아이디 찾기를 진행합니다.", anchorSelector: '[data-help-id="signin-find-id-methods"]', placement: "bottom", iconName: "fingerprint", highlightStyle: "success" }
    ]
  },
  "signin-find-id-result": {
    pageId: "signin-find-id-result",
    title: "아이디 찾기 결과 도움말",
    summary: "마스킹된 아이디와 다음 행동을 안내합니다.",
    items: [
      { id: "result", title: "결과 카드", body: "마스킹된 아이디 또는 조회 실패 결과를 확인합니다.", anchorSelector: '[data-help-id="signin-find-id-result-card"]', placement: "top", iconName: "assignment_ind", highlightStyle: "focus" },
      { id: "actions", title: "다음 행동", body: "로그인하기 또는 비밀번호 재설정으로 이동할 수 있습니다.", anchorSelector: '[data-help-id="signin-find-id-result-actions"]', placement: "bottom", iconName: "arrow_forward", highlightStyle: "neutral" }
    ]
  },
  "signin-find-password": {
    pageId: "signin-find-password",
    title: "비밀번호 재설정 도움말",
    summary: "본인확인과 새 비밀번호 설정을 단계별로 진행합니다.",
    items: [
      { id: "verify", title: "본인확인 단계", body: "아이디와 인증수단 또는 이메일 인증으로 본인확인을 진행합니다.", anchorSelector: '[data-help-id="signin-find-password-verify"]', placement: "top", iconName: "person_search", highlightStyle: "focus" },
      { id: "reset", title: "새 비밀번호 설정", body: "정책에 맞는 새 비밀번호와 확인 비밀번호를 입력합니다.", anchorSelector: '[data-help-id="signin-find-password-reset"]', placement: "right", iconName: "lock_reset", highlightStyle: "success" },
      { id: "actions", title: "완료 버튼", body: "취소 또는 비밀번호 변경 완료를 실행합니다.", anchorSelector: '[data-help-id="signin-find-password-actions"]', placement: "bottom", iconName: "task_alt", highlightStyle: "neutral" }
    ]
  },
  "signin-find-password-result": {
    pageId: "signin-find-password-result",
    title: "비밀번호 재설정 완료 도움말",
    summary: "비밀번호 변경 완료 결과와 로그인 이동 버튼을 안내합니다.",
    items: [
      { id: "card", title: "완료 안내", body: "비밀번호 변경 완료와 보안 안내 메시지를 확인합니다.", anchorSelector: '[data-help-id="signin-find-password-result-card"]', placement: "top", iconName: "check_circle", highlightStyle: "success" },
      { id: "action", title: "로그인 이동", body: "로그인 화면으로 바로 이동합니다.", anchorSelector: '[data-help-id="signin-find-password-result-action"]', placement: "bottom", iconName: "login", highlightStyle: "focus" }
    ]
  },
  "signin-forbidden": {
    pageId: "signin-forbidden",
    title: "접근 거부 도움말",
    summary: "접근 거부 사유와 현재 페이지의 제한 상태를 안내합니다.",
    items: [
      { id: "card", title: "접근 거부 카드", body: "현재 페이지에 접근할 수 없는 이유와 제한 상태를 확인합니다.", anchorSelector: '[data-help-id="signin-forbidden-card"]', placement: "top", iconName: "block", highlightStyle: "warning" }
    ]
  },
  "member-approve": {
    pageId: "member-approve",
    title: "회원 승인 도움말",
    summary: "검색, 일괄 승인/반려, 행 단위 승인 흐름을 안내합니다.",
    items: [
      { id: "search", title: "검색 조건", body: "검색어, 회원유형, 상태로 승인 대상을 좁힐 수 있습니다.", anchorSelector: '[data-help-id="member-approve-search"]' },
      { id: "batch", title: "일괄 처리", body: "여러 회원을 선택한 뒤 선택 승인 또는 선택 반려를 수행합니다.", anchorSelector: '[data-help-id="member-approve-batch-actions"]' },
      { id: "table", title: "대상 목록", body: "목록에서 각 회원의 상태와 유형을 확인하고 개별 승인 또는 반려를 실행합니다.", anchorSelector: '[data-help-id="member-approve-table"]' }
    ]
  },
  "member-list": {
    pageId: "member-list",
    title: "회원 목록 도움말",
    summary: "회원 검색과 목록 확인 방법을 안내합니다.",
    items: [
      { id: "search", title: "검색 영역", body: "검색어, 회원유형, 상태를 조합해 회원 목록을 필터링합니다.", anchorSelector: '[data-help-id="member-list-search"]' },
      { id: "table", title: "회원 목록", body: "회원 ID, 이름, 회사명, 이메일, 유형, 상태를 한 번에 확인합니다.", anchorSelector: '[data-help-id="member-list-table"]' }
    ]
  },
  "member-detail": {
    pageId: "member-detail",
    title: "회원 상세 도움말",
    summary: "특정 회원의 기본 정보와 비밀번호 초기화 이력을 조회합니다.",
    items: [
      { id: "lookup", title: "회원 조회", body: "상단 입력창에 회원 ID를 넣고 조회하면 상세 정보를 불러옵니다.", anchorSelector: '[data-help-id="member-detail-lookup"]' },
      { id: "summary", title: "기본 정보", body: "회원 상태, 유형, 연락처 등 핵심 속성을 확인합니다.", anchorSelector: '[data-help-id="member-detail-summary"]' },
      { id: "history", title: "초기화 이력", body: "비밀번호 초기화 시간, 처리자, 사유를 확인합니다.", anchorSelector: '[data-help-id="member-detail-history"]' }
    ]
  },
  "member-edit": {
    pageId: "member-edit",
    title: "회원 수정 도움말",
    summary: "회원 기본정보, 권한, 주소, 증빙 문서를 수정하는 화면입니다.",
    items: [
      { id: "summary", title: "계정 요약", body: "회원 ID, 상태, 업무 역할과 기관 참조 정보를 확인합니다.", anchorSelector: '[data-help-id="member-edit-summary"]' },
      { id: "form", title: "회원 기본 정보", body: "이름, 이메일, 연락처, 회원 유형과 상태를 수정합니다.", anchorSelector: '[data-help-id="member-edit-form"]' },
      { id: "permissions", title: "권한 편집", body: "기준 롤과 개별 기능 권한을 조정합니다.", anchorSelector: '[data-help-id="member-edit-permissions"]' },
      { id: "actions", title: "저장 및 상세 이동", body: "회원 상세로 이동하거나 수정 내용을 저장합니다.", anchorSelector: '[data-help-id="member-edit-actions"]' }
    ]
  },
  observability: {
    pageId: "observability",
    title: "추적 조회 도움말",
    summary: "감사 로그와 요청 추적 이벤트를 같은 화면에서 조회합니다.",
    items: [
      { id: "filters", title: "공통 필터", body: "traceId와 pageId로 흐름을 좁힌 뒤 audit 또는 trace 탭을 선택합니다.", anchorSelector: '[data-help-id="observability-filters"]' },
      {
        id: "audit",
        title: "감사 로그",
        body: "actorId, actionCode 기준으로 업무성 이벤트를 조회합니다. traceId를 클릭하면 추적 탭으로 이동합니다.",
        anchorSelector: '[data-help-id="observability-audit-table"]',
        placement: "right",
        iconName: "receipt_long",
        highlightStyle: "focus",
        ctaLabel: "운영 화면 열기",
        ctaUrl: "/admin/system/observability"
      },
      {
        id: "trace",
        title: "추적 이벤트",
        body: "apiId, resultCode 기준으로 요청 흐름을 확인하고 durationMs로 지연을 점검합니다.",
        anchorSelector: '[data-help-id="observability-trace-table"]',
        placement: "left",
        iconName: "account_tree",
        highlightStyle: "success"
      }
    ]
  },
  "help-management": {
    pageId: "help-management",
    title: "도움말 운영 도움말",
    summary: "화면별 도움말 메타데이터와 단계형 overlay 내용을 관리합니다.",
    items: [
      {
        id: "select",
        title: "대상 화면 선택",
        body: "pageId를 선택하고 현재 DB/JSON 상태를 불러옵니다.",
        anchorSelector: '[data-help-id="help-management-select"]',
        placement: "bottom",
        iconName: "web",
        highlightStyle: "focus"
      },
      {
        id: "page",
        title: "기본 정보 편집",
        body: "제목, 요약, 버전, 활성 여부를 저장합니다.",
        anchorSelector: '[data-help-id="help-management-page-form"]',
        placement: "right",
        iconName: "edit_note",
        highlightStyle: "neutral",
        imageUrl: HELP_SAMPLE_IMAGE
      },
      {
        id: "items",
        title: "단계 편집",
        body: "각 단계의 title, body, anchor selector를 수정하고 순서를 조정합니다.",
        anchorSelector: '[data-help-id="help-management-items"]',
        placement: "left",
        iconName: "view_carousel",
        highlightStyle: "warning"
      }
    ]
  },
  "sr-workbench": {
    pageId: "sr-workbench",
    title: "SR 워크벤치 도움말",
    summary: "화면 요소를 기준으로 SR 티켓을 만들고 승인/실행 준비 상태를 관리합니다.",
    items: [
      { id: "draft", title: "SR 초안", body: "대상 화면, 요소, 이벤트, 수정 레이어를 선택하고 SR 요약과 상세 지시를 입력합니다.", anchorSelector: '[data-help-id="sr-ticket-draft"]' },
      { id: "direction", title: "해결 지시", body: "생성된 direction과 Codex command prompt를 승인 전에 검토합니다.", anchorSelector: '[data-help-id="sr-direction-preview"]' },
      { id: "ticket-table", title: "승인 및 실행 준비", body: "발행된 티켓을 승인/반려하고 Codex 실행 준비 상태로 전환합니다.", anchorSelector: '[data-help-id="sr-ticket-table"]' }
    ]
  },
  "join-wizard": {
    pageId: "join-wizard",
    title: "회원가입 시작 도움말",
    summary: "회원가입 유형을 선택하고 다음 단계로 이동하는 화면입니다.",
    items: [
      { id: "type", title: "회원유형 선택", body: "업무 유형에 맞는 카드형 항목을 선택하면 이후 입력 단계가 달라질 수 있습니다.", anchorSelector: '[data-help-id="join-step1-cards"]' },
      { id: "actions", title: "단계 이동", body: "홈으로 돌아가거나 다음 단계로 이동할 수 있습니다.", anchorSelector: '[data-help-id="join-step1-actions"]' },
      { id: "guide", title: "가입 안내", body: "회원 유형별 유의사항을 확인한 뒤 진행합니다.", anchorSelector: '[data-help-id="join-step1-guide"]' }
    ]
  },
  "join-terms": {
    pageId: "join-terms",
    title: "약관 동의 도움말",
    summary: "필수 약관과 선택 항목을 검토하고 동의 상태를 관리합니다.",
    items: [
      { id: "all", title: "전체 동의", body: "필수 약관을 한 번에 선택할 수 있지만, 내용 확인 후 동의하는 것이 좋습니다.", anchorSelector: '[data-help-id="join-step2-all-agree"]' },
      { id: "terms", title: "필수 약관", body: "이용약관과 개인정보 수집 및 이용 동의는 필수입니다.", anchorSelector: '[data-help-id="join-step2-required-terms"]' },
      { id: "marketing", title: "마케팅 수신", body: "선택 항목이며 미동의 상태여도 다음 단계로 진행할 수 있습니다.", anchorSelector: '[data-help-id="join-step2-marketing"]' }
    ]
  },
  "company-approve": {
    pageId: "company-approve",
    title: "회원사 승인 도움말",
    summary: "회원사 승인 대상 검색, 일괄 처리, 행 단위 승인을 안내합니다.",
    items: [
      { id: "search", title: "검색 조건", body: "검색어와 상태 기준으로 회원사 승인 대상을 좁힐 수 있습니다.", anchorSelector: '[data-help-id="company-approve-search"]' },
      { id: "batch", title: "일괄 처리", body: "복수 기관을 선택해서 승인 또는 반려할 수 있습니다.", anchorSelector: '[data-help-id="company-approve-batch-actions"]' },
      { id: "table", title: "승인 목록", body: "기관명, 사업자번호, 대표자, 상태를 확인하고 개별 처리합니다.", anchorSelector: '[data-help-id="company-approve-table"]' }
    ]
  },
  "company-detail": {
    pageId: "company-detail",
    title: "회원사 상세 도움말",
    summary: "기관 정보와 첨부 파일을 조회하는 화면입니다.",
    items: [
      { id: "lookup", title: "기관 조회", body: "기관 ID를 입력해 상세 정보를 불러옵니다.", anchorSelector: '[data-help-id="company-detail-lookup"]' },
      { id: "summary", title: "기관 요약", body: "기관명, 대표자, 회원유형, 상태, 담당자 이메일을 확인합니다.", anchorSelector: '[data-help-id="company-detail-summary"]' },
      { id: "files", title: "첨부 파일", body: "기관과 연결된 첨부 파일 목록을 확인합니다.", anchorSelector: '[data-help-id="company-detail-files"]' }
    ]
  },
  "company-account": {
    pageId: "company-account",
    title: "회원사 계정 도움말",
    summary: "기관 조회, 회원사 기본 정보 편집, 첨부 파일 확인을 안내합니다.",
    items: [
      { id: "lookup", title: "기관 조회와 저장", body: "기관 ID로 조회한 뒤 저장 권한이 있으면 회원사 정보를 갱신할 수 있습니다.", anchorSelector: '[data-help-id="company-account-lookup"]' },
      { id: "membership", title: "회원 유형 선택", body: "회원사 유형 카드를 선택해 이후 정보 구성을 맞춥니다.", anchorSelector: '[data-help-id="company-account-membership"]' },
      { id: "business", title: "회원사 정보 입력", body: "회원 유형, 기업명, 대표자, 사업자번호와 주소를 입력합니다.", anchorSelector: '[data-help-id="company-account-business"]' },
      { id: "contact", title: "담당자 정보", body: "담당자 이름, 이메일, 연락처를 입력합니다.", anchorSelector: '[data-help-id="company-account-contact"]' },
      { id: "files", title: "첨부 파일", body: "기존 첨부 문서를 확인하고 신규 파일을 추가할 수 있습니다.", anchorSelector: '[data-help-id="company-account-files"]' }
    ]
  },
  "auth-group": {
    pageId: "auth-group",
    title: "권한 그룹 도움말",
    summary: "권한 분류별 조회, 권한 그룹 생성, 기능 매핑 저장을 안내합니다.",
    items: [
      { id: "filters", title: "권한 그룹 조회", body: "권한 분류, 회사, 권한 그룹을 선택해 조회 범위를 조정합니다.", anchorSelector: '[data-help-id="auth-group-filters"]' },
      { id: "create", title: "권한 그룹 생성", body: "새 권한 그룹 코드를 입력해 생성합니다.", anchorSelector: '[data-help-id="auth-group-create"]' },
      { id: "features", title: "기능 매핑", body: "선택한 권한 그룹에 연결할 기능 코드를 저장합니다.", anchorSelector: '[data-help-id="auth-group-features"]' }
    ]
  },
  "join-auth": {
    pageId: "join-auth",
    title: "본인 확인 도움말",
    summary: "인증 수단을 선택해 다음 단계로 진행합니다.",
    items: [
      { id: "methods", title: "인증 수단 선택", body: "원패스, 공동인증서, 금융인증서, 간편인증, 이메일 인증 중 하나를 선택합니다.", anchorSelector: '[data-help-id="join-step3-methods"]' }
    ]
  },
  "join-info": {
    pageId: "join-info",
    title: "정보 입력 도움말",
    summary: "사용자 정보, 기관 정보, 증빙 문서를 입력하고 가입을 제출합니다.",
    items: [
      { id: "user", title: "사용자 정보", body: "아이디, 비밀번호, 연락처, 이메일을 입력하고 중복 확인을 진행합니다.", anchorSelector: '[data-help-id="join-step4-user"]' },
      { id: "org", title: "기관 정보", body: "기관 검색, 사업자번호, 부서명, 주소를 입력합니다.", anchorSelector: '[data-help-id="join-step4-org"]' },
      { id: "files", title: "증빙 문서", body: "지원 파일 형식과 크기를 확인한 뒤 증빙 문서를 업로드합니다.", anchorSelector: '[data-help-id="join-step4-files"]' }
    ]
  },
  "join-complete": {
    pageId: "join-complete",
    title: "가입 완료 도움말",
    summary: "신청 완료 후 확인 가능한 정보와 다음 행동을 안내합니다.",
    items: [
      { id: "summary", title: "신청 완료 정보", body: "이름, 아이디, 소속 기관과 승인 안내를 확인합니다.", anchorSelector: '[data-help-id="join-step5-summary"]' },
      { id: "actions", title: "다음 이동", body: "홈으로 돌아가거나 이후 승인 안내를 기다립니다.", anchorSelector: '[data-help-id="join-step5-actions"]' }
    ]
  },
  mypage: {
    pageId: "mypage",
    title: "마이페이지 도움말",
    summary: "본인 정보와 소속 기관 정보를 수정하는 화면입니다.",
    items: [
      { id: "basic", title: "기본 정보", body: "이름, 이메일, 연락처, 직함을 수정합니다.", anchorSelector: '[data-help-id="mypage-basic-info"]' },
      { id: "org", title: "소속 기관 정보", body: "기관명과 사업자등록번호 등 조직 정보를 확인합니다.", anchorSelector: '[data-help-id="mypage-org-info"]' },
      { id: "actions", title: "저장/로그아웃", body: "변경 내용을 저장하거나 현재 세션을 종료할 수 있습니다.", anchorSelector: '[data-help-id="mypage-actions"]' }
    ]
  }
};

export function getPageHelp(pageId: string): PageHelpContent {
  const explicit = PAGE_HELP[pageId];
  if (explicit) {
    return explicit;
  }
  const manifest = getPageManifest(pageId);
  if (!manifest) {
    return {
      pageId,
      title: "화면 도움말",
      summary: "이 화면에 등록된 상세 도움말이 없습니다.",
      items: []
    };
  }
  return {
    pageId,
    title: `${pageId} 도움말`,
    summary: "등록된 화면 구성요소를 기준으로 기본 도움말을 표시합니다.",
    items: manifest.components.map((component, index) => ({
      id: `${pageId}-component-${index + 1}`,
      title: component.componentId,
      body: `${component.layoutZone} 영역에 배치된 구성요소입니다.${component.propsSummary?.length ? ` 주요 속성: ${component.propsSummary.join(", ")}` : ""}`,
      placement: "top",
      highlightStyle: "neutral"
    }))
  };
}

export async function fetchPageHelp(pageId: string): Promise<PageHelpContent | null> {
  if (!pageId) {
    return null;
  }
  try {
    const response = await fetch(`/api/help/page?pageId=${encodeURIComponent(pageId)}`, {
      credentials: "include"
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json() as {
      pageId?: string;
      title?: string;
      summary?: string;
      items?: Array<Record<string, unknown>>;
    };
    if (!payload || (!payload.title && !payload.summary && (!payload.items || payload.items.length === 0))) {
      return null;
    }
    return {
      pageId: String(payload.pageId || pageId),
      title: String(payload.title || ""),
      summary: String(payload.summary || ""),
      items: (payload.items || []).map((item, index) => ({
        id: String(item.id || item.itemId || `${pageId}-item-${index + 1}`),
        title: String(item.title || ""),
        body: String(item.body || ""),
        anchorSelector: item.anchorSelector ? String(item.anchorSelector) : undefined,
        placement: item.placement ? String(item.placement) as HelpItem["placement"] : undefined,
        imageUrl: item.imageUrl ? String(item.imageUrl) : undefined,
        iconName: item.iconName ? String(item.iconName) : undefined,
        highlightStyle: item.highlightStyle ? String(item.highlightStyle) as HelpItem["highlightStyle"] : undefined,
        ctaLabel: item.ctaLabel ? String(item.ctaLabel) : undefined,
        ctaUrl: item.ctaUrl ? String(item.ctaUrl) : undefined
      }))
    };
  } catch {
    return null;
  }
}
