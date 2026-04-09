import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";

export const APP_OWNED_ROUTE_DEFINITIONS = [
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
  { id: "join-company-status", label: "가입 현황 조회", group: "join", koPath: "/join/companyJoinStatusSearch", enPath: "/join/en/companyJoinStatusSearch" },
  { id: "join-company-status-guide", label: "가입 현황 안내", group: "join", koPath: "/join/companyJoinStatusGuide", enPath: "/join/en/companyJoinStatusGuide" },
  { id: "join-company-status-detail", label: "가입 현황 상세", group: "join", koPath: "/join/companyJoinStatusDetail", enPath: "/join/en/companyJoinStatusDetail" }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type AppOwnedRouteId = (typeof APP_OWNED_ROUTE_DEFINITIONS)[number]["id"];
