import { AdminHomePage, AdminLoginPage } from "./features/admin-entry/AdminEntryPages";
import { AdminAccountCreateMigrationPage } from "./features/admin-account-create/AdminAccountCreateMigrationPage";
import { AdminListMigrationPage } from "./features/admin-list/AdminListMigrationPage";
import { AdminPermissionMigrationPage } from "./features/admin-permissions/AdminPermissionMigrationPage";
import { AuthChangeMigrationPage } from "./features/auth-change/AuthChangeMigrationPage";
import { AuthGroupMigrationPage } from "./features/auth-groups/AuthGroupMigrationPage";
import { CompanyAccountMigrationPage } from "./features/company-account/CompanyAccountMigrationPage";
import { CompanyApproveMigrationPage } from "./features/company-approve/CompanyApproveMigrationPage";
import { CompanyDetailMigrationPage } from "./features/company-detail/CompanyDetailMigrationPage";
import { CompanyListMigrationPage } from "./features/company-list/CompanyListMigrationPage";
import { DeptRoleMappingMigrationPage } from "./features/dept-role-mapping/DeptRoleMappingMigrationPage";
import { JoinCompanyReapplyMigrationPage } from "./features/join-company-reapply/JoinCompanyReapplyMigrationPage";
import { JoinCompanyRegisterMigrationPage } from "./features/join-company-register/JoinCompanyRegisterMigrationPage";
import { JoinCompanyStatusMigrationPage } from "./features/join-company-status/JoinCompanyStatusMigrationPage";
import { JoinAuthMigrationPage } from "./features/join-wizard/JoinAuthMigrationPage";
import { JoinCompleteMigrationPage } from "./features/join-wizard/JoinCompleteMigrationPage";
import { JoinInfoMigrationPage } from "./features/join-wizard/JoinInfoMigrationPage";
import { JoinTermsMigrationPage } from "./features/join-wizard/JoinTermsMigrationPage";
import { JoinWizardMigrationPage } from "./features/join-wizard/JoinWizardMigrationPage";
import { MemberApproveMigrationPage } from "./features/member-approve/MemberApproveMigrationPage";
import { MemberDetailMigrationPage } from "./features/member-detail/MemberDetailMigrationPage";
import { MemberEditMigrationPage } from "./features/member-edit/MemberEditMigrationPage";
import { MemberListMigrationPage } from "./features/member-list/MemberListMigrationPage";
import { MypageMigrationPage } from "./features/mypage/MypageMigrationPage";
import { PasswordResetMigrationPage } from "./features/password-reset/PasswordResetMigrationPage";
import { HomeLandingPage } from "./features/home-entry/HomeEntryPages";
import { AuthChoicePage, FindIdPage, FindPasswordPage, PublicLoginPage } from "./features/public-entry/PublicEntryPages";
import { buildLocalizedPath, navigate } from "./lib/runtime";

type MigrationPageId =
  | "home"
  | "admin-home"
  | "signin-login"
  | "admin-login"
  | "signin-auth-choice"
  | "signin-find-id"
  | "signin-find-password"
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
  | "join-company-register"
  | "join-company-status"
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
  { id: "signin-find-password", label: "비밀번호 찾기", group: "home", koPath: "/signin/findPassword", enPath: "/en/signin/findPassword" },
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
  { id: "join-company-register", label: "공개 회원사 등록", group: "join", koPath: "/join/companyRegister", enPath: "/join/en/companyRegister" },
  { id: "join-company-status", label: "가입 현황 조회", group: "join", koPath: "/join/companyJoinStatusSearch", enPath: "/join/en/companyJoinStatusSearch" },
  { id: "join-company-reapply", label: "반려 재신청", group: "join", koPath: "/join/companyReapply", enPath: "/join/companyReapply" },
  { id: "join-wizard", label: "회원가입 위저드", group: "join", koPath: "/join/step1", enPath: "/join/en/step1" },
  { id: "join-terms", label: "회원가입 약관", group: "join", koPath: "/join/step2", enPath: "/join/en/step2" },
  { id: "join-auth", label: "회원가입 본인확인", group: "join", koPath: "/join/step3", enPath: "/join/en/step3" },
  { id: "join-info", label: "회원가입 정보입력", group: "join", koPath: "/join/step4", enPath: "/join/en/step4" },
  { id: "join-complete", label: "회원가입 완료", group: "join", koPath: "/join/step5", enPath: "/join/en/step5" },
  { id: "mypage", label: "마이페이지", group: "home", koPath: "/mypage", enPath: "/en/mypage" }
];

const FULLSCREEN_ROUTES = new Set<MigrationPageId>([
  "home",
  "admin-home",
  "signin-login",
  "admin-login",
  "signin-auth-choice",
  "signin-find-id",
  "signin-find-password",
  "mypage",
  "join-company-register",
  "join-company-status",
  "join-wizard",
  "join-terms",
  "join-auth",
  "join-info",
  "join-complete"
]);

function getInitialPage(): MigrationPageId {
  const runtimeRoute = window.__CARBONET_REACT_MIGRATION__?.route?.trim() as MigrationPageId | undefined;
  if (runtimeRoute && ROUTES.some((entry) => entry.id === runtimeRoute)) {
    return runtimeRoute;
  }
  const normalizedPath = window.location.pathname.replace(/^\/en/, "") || "/home";
  const matched = ROUTES.find((entry) => entry.koPath === normalizedPath || entry.enPath === window.location.pathname);
  return matched?.id || "home";
}

function getRouteHref(route: RouteDefinition) {
  return buildLocalizedPath(route.koPath, route.enPath);
}

function renderPage(route: MigrationPageId) {
  switch (route) {
    case "home":
      return <HomeLandingPage />;
    case "admin-home":
      return <AdminHomePage />;
    case "signin-login":
      return <PublicLoginPage />;
    case "admin-login":
      return <AdminLoginPage />;
    case "signin-auth-choice":
      return <AuthChoicePage />;
    case "signin-find-id":
      return <FindIdPage />;
    case "signin-find-password":
      return <FindPasswordPage />;
    case "auth-group":
      return <AuthGroupMigrationPage />;
    case "auth-change":
      return <AuthChangeMigrationPage />;
    case "dept-role":
      return <DeptRoleMappingMigrationPage />;
    case "member-edit":
      return <MemberEditMigrationPage />;
    case "password-reset":
      return <PasswordResetMigrationPage />;
    case "admin-permission":
      return <AdminPermissionMigrationPage />;
    case "admin-create":
      return <AdminAccountCreateMigrationPage />;
    case "company-account":
      return <CompanyAccountMigrationPage />;
    case "admin-list":
      return <AdminListMigrationPage />;
    case "company-list":
      return <CompanyListMigrationPage />;
    case "member-approve":
      return <MemberApproveMigrationPage />;
    case "company-approve":
      return <CompanyApproveMigrationPage />;
    case "member-list":
      return <MemberListMigrationPage />;
    case "member-detail":
      return <MemberDetailMigrationPage />;
    case "company-detail":
      return <CompanyDetailMigrationPage />;
    case "join-company-register":
      return <JoinCompanyRegisterMigrationPage />;
    case "join-company-status":
      return <JoinCompanyStatusMigrationPage />;
    case "join-company-reapply":
      return <JoinCompanyReapplyMigrationPage />;
    case "join-wizard":
      return <JoinWizardMigrationPage />;
    case "join-terms":
      return <JoinTermsMigrationPage />;
    case "join-auth":
      return <JoinAuthMigrationPage />;
    case "join-info":
      return <JoinInfoMigrationPage />;
    case "join-complete":
      return <JoinCompleteMigrationPage />;
    case "mypage":
      return <MypageMigrationPage />;
    default:
      return <HomeLandingPage />;
  }
}

export default function App() {
  const page = getInitialPage();
  const routePath = `${window.location.pathname}${window.location.search}`;

  if (FULLSCREEN_ROUTES.has(page)) {
    return renderPage(page);
  }

  return (
    <main>
      <section className="app-shell">
        <div className="panel route-toolbar">
          <div>
            <p className="eyebrow">React Migration Routes</p>
            <h1>Carbonet Migration Shell</h1>
            <p className="route-path">{routePath}</p>
          </div>
          <a className="primary-link" href={routePath}>
            현재 경로 열기
          </a>
        </div>

        <div className="panel">
          <div className="route-group">
            <p className="caption">Admin</p>
            <div className="migration-tabs">
              {ROUTES.filter((entry) => entry.group === "admin").map((entry) => (
                <button
                  key={entry.id}
                  className={`tab-button${page === entry.id ? " active" : ""}`}
                  onClick={() => navigate(getRouteHref(entry))}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div className="route-group">
            <p className="caption">Join</p>
            <div className="migration-tabs">
              {ROUTES.filter((entry) => entry.group === "join").map((entry) => (
                <button
                  key={entry.id}
                  className={`tab-button${page === entry.id ? " active" : ""}`}
                  onClick={() => navigate(getRouteHref(entry))}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div className="route-group">
            <p className="caption">Home</p>
            <div className="migration-tabs">
              {ROUTES.filter((entry) => entry.group === "home").map((entry) => (
                <button
                  key={entry.id}
                  className={`tab-button${page === entry.id ? " active" : ""}`}
                  onClick={() => navigate(getRouteHref(entry))}
                  type="button"
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {renderPage(page)}
    </main>
  );
}
