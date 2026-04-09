import type { RouteUnitDefinition } from "../../../framework/routes/pageUnitTypes";

export const CONTENT_SUPPORT_ROUTE_DEFINITIONS = [
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
  { id: "download-list", label: "자료실", group: "home", koPath: "/support/download_list", enPath: "/en/support/download_list" },
  { id: "notice-list", label: "공지사항", group: "home", koPath: "/support/notice_list", enPath: "/en/support/notice_list" },
  { id: "qna-list", label: "Q&A", group: "home", koPath: "/support/qna_list", enPath: "/en/support/qna_list" },
  { id: "sitemap", label: "사이트맵", group: "home", koPath: "/sitemap", enPath: "/en/sitemap" },
  { id: "home-menu-placeholder", label: "사용자 메뉴 플레이스홀더", group: "home", koPath: "/placeholder", enPath: "/en/placeholder" }
] as const satisfies ReadonlyArray<RouteUnitDefinition>;

export type ContentSupportRouteId = (typeof CONTENT_SUPPORT_ROUTE_DEFINITIONS)[number]["id"];
