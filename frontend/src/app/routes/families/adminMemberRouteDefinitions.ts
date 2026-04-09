import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";

export const ADMIN_MEMBER_ROUTE_DEFINITIONS = [
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
  { id: "member-register", label: "회원 등록", group: "admin", koPath: "/admin/member/register", enPath: "/en/admin/member/register" }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type AdminMemberRouteId = (typeof ADMIN_MEMBER_ROUTE_DEFINITIONS)[number]["id"];
