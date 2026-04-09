import type { LazyPageUnit } from "../../../framework/routes/pageUnitTypes";

export const CONTENT_SUPPORT_PAGE_UNITS: LazyPageUnit[] = [
  { id: "board-list", exportName: "BoardListMigrationPage", loader: () => import("../../../features/board-list/BoardListMigrationPage") },
  { id: "board-add", exportName: "BoardAddMigrationPage", loader: () => import("../../../features/board-add/BoardAddMigrationPage") },
  { id: "post-list", exportName: "PostListMigrationPage", loader: () => import("../../../features/post-list/PostListMigrationPage") },
  { id: "banner-list", exportName: "BannerListMigrationPage", loader: () => import("../../../features/banner-list/BannerListMigrationPage") },
  { id: "popup-list", exportName: "PopupListMigrationPage", loader: () => import("../../../features/popup-list/PopupListMigrationPage") },
  { id: "banner-edit", exportName: "BannerEditMigrationPage", loader: () => import("../../../features/banner-edit/BannerEditMigrationPage") },
  { id: "popup-edit", exportName: "PopupEditMigrationPage", loader: () => import("../../../features/popup-edit/PopupEditMigrationPage") },
  { id: "qna-category", exportName: "QnaCategoryMigrationPage", loader: () => import("../../../features/qna-category/QnaCategoryMigrationPage") },
  { id: "faq-management", exportName: "FaqManagementMigrationPage", loader: () => import("../../../features/faq-management/FaqManagementMigrationPage") },
  { id: "file-management", exportName: "FileManagementMigrationPage", loader: () => import("../../../features/file-management/FileManagementMigrationPage") },
  { id: "admin-sitemap", exportName: "AdminSitemapMigrationPage", loader: () => import("../../../features/admin-sitemap/AdminSitemapMigrationPage") },
  { id: "tag-management", exportName: "TagManagementMigrationPage", loader: () => import("../../../features/tag-management/TagManagementMigrationPage") },
  { id: "admin-menu-placeholder", exportName: "AdminMenuPlaceholderPage", loader: () => import("../../../features/admin-placeholder/AdminMenuPlaceholderPage") },
  { id: "download-list", exportName: "DownloadListMigrationPage", loader: () => import("../../../features/download-list") },
  { id: "notice-list", exportName: "NoticeListMigrationPage", loader: () => import("../../../features/notice-list") },
  { id: "qna-list", exportName: "QnaListMigrationPage", loader: () => import("../../../features/qna-list") },
  { id: "sitemap", exportName: "SitemapMigrationPage", loader: () => import("../../../features/sitemap/SitemapMigrationPage") },
  { id: "home-menu-placeholder", exportName: "HomeMenuPlaceholderPage", loader: () => import("../../../features/home-placeholder/HomeMenuPlaceholderPage") }
];
