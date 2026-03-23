import { ReactNode, SyntheticEvent, useEffect, useMemo, useState } from "react";
import {
  invalidateFrontendSessionCache,
  fetchAdminMenuTree,
  getAdminMenuTreeRefreshEventName,
  type AdminMenuDomain,
  type AdminMenuGroup
} from "../../lib/api/client";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { buildLocalizedPath, isEnglish, navigate } from "../../lib/navigation/runtime";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AdminPageShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  contextStrip?: ReactNode;
  sidebarVariant?: string;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
};

type GnbItem = {
  key: string;
  label: string;
  href: string;
  domain: string;
};

type MenuLinkLike = {
  code?: string;
  text?: string;
  tEn?: string;
  u?: string;
};

const GOV_SYMBOL = "/img/egovframework/kr_gov_symbol.png";
const GOV_FOOTER_SYMBOL = "/img/egovframework/kr_gov_symbol.png";
const GOV_SYMBOL_FALLBACK = "/img/egovframework/kr_gov_symbol.svg";
const ADMIN_SESSION_STORAGE_KEY = "adminSessionExpireAt";
const ADMIN_SESSION_DURATION_MS = 60 * 60 * 1000;
const ADMIN_SESSION_WARNING_MS = 5 * 60 * 1000;
const ADMIN_SESSION_DANGER_MS = 60 * 1000;

function handleGovSymbolError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "1") {
    image.style.display = "none";
    return;
  }
  image.dataset.fallbackApplied = "1";
  image.src = GOV_SYMBOL_FALLBACK;
}

function readStoredAdminSessionExpireAt() {
  const stored = window.sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) || "";
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isFreshAdminLoginNavigation() {
  if (!document.referrer) {
    return false;
  }
  try {
    const referrer = new URL(document.referrer, window.location.origin);
    return referrer.origin === window.location.origin
      && (referrer.pathname === "/admin/login/loginView"
        || referrer.pathname === "/en/admin/login/loginView");
  } catch {
    return false;
  }
}

function ensureAdminSessionExpireAt() {
  const now = Date.now();
  if (isFreshAdminLoginNavigation()) {
    const next = now + ADMIN_SESSION_DURATION_MS;
    window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, String(next));
    return next;
  }
  const stored = readStoredAdminSessionExpireAt();
  if (stored > now) {
    return stored;
  }
  const next = now + ADMIN_SESSION_DURATION_MS;
  window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, String(next));
  return next;
}

function formatAdminSessionRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getFallbackGnbItems(en: boolean): GnbItem[] {
  return [
    {
      key: "대시보드",
      label: en ? "Dashboard" : "대시보드",
      href: buildLocalizedPath("/admin/", "/en/admin/"),
      domain: "대시보드"
    },
    {
      key: "회원관리",
      label: en ? "Members" : "회원관리",
      href: buildLocalizedPath("/admin/member/list", "/en/admin/member/list"),
      domain: "회원관리"
    },
    { key: "배출/인증", label: en ? "Emission / Certification" : "배출/인증", href: "#", domain: "배출/인증" },
    { key: "거래/정산", label: en ? "Trade / Settlement" : "거래/정산", href: "#", domain: "거래/정산" },
    { key: "콘텐츠", label: en ? "Content" : "콘텐츠", href: "#", domain: "콘텐츠" },
    { key: "외부연계", label: en ? "External Linkage" : "외부연계", href: "#", domain: "외부연계" },
    {
      key: "시스템",
      label: en ? "System" : "시스템",
      href: buildLocalizedPath("/admin/system/code", "/en/admin/system/code"),
      domain: "시스템"
    },
    {
      key: "모니터링",
      label: en ? "Monitoring" : "모니터링",
      href: buildLocalizedPath("/admin/member/login_history", "/en/admin/member/login_history"),
      domain: "모니터링"
    }
  ];
}

function getFallbackMenuTree(): Record<string, AdminMenuDomain> {
  return {
    대시보드: {
      label: "대시보드",
      labelEn: "Dashboard",
      summary: "",
      groups: [
        {
          title: "대시보드",
          titleEn: "Dashboard",
          icon: "dashboard",
          links: [
            { text: "운영 대시보드", tEn: "Operations Dashboard", u: buildLocalizedPath("/admin/", "/en/admin/"), icon: "dashboard" }
          ]
        }
      ]
    },
    회원관리: {
      label: "회원관리",
      labelEn: "Members",
      summary: "",
      groups: [
        {
          title: "회원",
          titleEn: "Members",
          icon: "group",
          links: [
            { text: "회원 목록", tEn: "Member List", u: buildLocalizedPath("/admin/member/list", "/en/admin/member/list"), icon: "badge" },
            { text: "회원 승인", tEn: "Member Approval", u: buildLocalizedPath("/admin/member/approve", "/en/admin/member/approve"), icon: "task" },
            { text: "탈퇴 회원", tEn: "Withdrawn Members", u: buildLocalizedPath("/admin/member/list?sbscrbSttus=D", "/en/admin/member/list?sbscrbSttus=D"), icon: "person_remove" },
            { text: "휴면 계정", tEn: "Dormant Accounts", u: buildLocalizedPath("/admin/member/list?sbscrbSttus=X", "/en/admin/member/list?sbscrbSttus=X"), icon: "bedtime" },
            { text: "회원사 목록", tEn: "Company List", u: buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list"), icon: "apartment" },
            { text: "회원사 승인", tEn: "Company Approval", u: buildLocalizedPath("/admin/member/company-approve", "/en/admin/member/company-approve"), icon: "domain_verification" },
            { text: "관리자 목록", tEn: "Admin List", u: buildLocalizedPath("/admin/member/admin_list", "/en/admin/member/admin_list"), icon: "admin_panel_settings" }
          ]
        }
      ]
    },
    시스템: {
      label: "시스템",
      labelEn: "System",
      summary: "",
      groups: [
        {
          title: "환경",
          titleEn: "Environment",
          icon: "settings",
          links: [
            { text: "코드 관리", tEn: "Code Management", u: buildLocalizedPath("/admin/system/code", "/en/admin/system/code"), icon: "category" },
            { text: "페이지 관리", tEn: "Page Management", u: buildLocalizedPath("/admin/system/page-management", "/en/admin/system/page-management"), icon: "web" },
            { text: "기능 관리", tEn: "Function Management", u: buildLocalizedPath("/admin/system/feature-management", "/en/admin/system/feature-management"), icon: "extension" },
            { text: "메뉴 관리", tEn: "Menu Management", u: buildLocalizedPath("/admin/system/menu-management", "/en/admin/system/menu-management"), icon: "account_tree" },
            { text: "메뉴 통합 관리", tEn: "Menu Unified Management", u: buildLocalizedPath("/admin/system/environment-management", "/en/admin/system/environment-management"), icon: "tune" },
            { text: "풀스택 관리", tEn: "Full-Stack Management", u: buildLocalizedPath("/admin/system/full-stack-management", "/en/admin/system/full-stack-management"), icon: "hub" },
            { text: "플랫폼 스튜디오", tEn: "Platform Studio", u: buildLocalizedPath("/admin/system/platform-studio", "/en/admin/system/platform-studio"), icon: "dashboard_customize" },
            { text: "화면 요소 관리", tEn: "Screen Elements", u: buildLocalizedPath("/admin/system/screen-elements-management?focus=surfaces", "/en/admin/system/screen-elements-management?focus=surfaces"), icon: "crop_landscape" },
            { text: "이벤트 관리", tEn: "Event Management", u: buildLocalizedPath("/admin/system/event-management-console?focus=events", "/en/admin/system/event-management-console?focus=events"), icon: "bolt" },
            { text: "함수 콘솔", tEn: "Function Console", u: buildLocalizedPath("/admin/system/function-management-console?focus=functions", "/en/admin/system/function-management-console?focus=functions"), icon: "functions" },
            { text: "API 관리", tEn: "API Management", u: buildLocalizedPath("/admin/system/api-management-console?focus=apis", "/en/admin/system/api-management-console?focus=apis"), icon: "api" },
            { text: "컨트롤러 관리", tEn: "Controller Management", u: buildLocalizedPath("/admin/system/controller-management-console?focus=controllers", "/en/admin/system/controller-management-console?focus=controllers"), icon: "account_tree" },
            { text: "DB 테이블 관리", tEn: "DB Table Management", u: buildLocalizedPath("/admin/system/db-table-management?focus=db", "/en/admin/system/db-table-management?focus=db"), icon: "database" },
            { text: "컬럼 관리", tEn: "Column Management", u: buildLocalizedPath("/admin/system/column-management-console?focus=columns", "/en/admin/system/column-management-console?focus=columns"), icon: "view_column" },
            { text: "자동화 스튜디오", tEn: "Automation Studio", u: buildLocalizedPath("/admin/system/automation-studio?focus=automation", "/en/admin/system/automation-studio?focus=automation"), icon: "smart_toy" }
          ]
        },
        {
          title: "AI 운영",
          titleEn: "AI Operations",
          icon: "smart_toy",
          links: [
            { text: "도움말 운영", tEn: "Help Management", u: buildLocalizedPath("/admin/system/help-management", "/en/admin/system/help-management"), icon: "help_center" },
            { text: "SR 워크벤치", tEn: "SR Workbench", u: buildLocalizedPath("/admin/system/sr-workbench", "/en/admin/system/sr-workbench"), icon: "assignment" },
            { text: "Codex 요청", tEn: "Codex Request", u: buildLocalizedPath("/admin/system/codex-request", "/en/admin/system/codex-request"), icon: "smart_toy" },
            { text: "WBS 관리", tEn: "WBS Management", u: buildLocalizedPath("/admin/system/wbs-management", "/en/admin/system/wbs-management"), icon: "calendar_month" }
          ]
        }
      ]
    },
    콘텐츠: {
      label: "콘텐츠",
      labelEn: "Content",
      summary: "",
      groups: [
        {
          title: "콘텐츠 운영",
          titleEn: "Content Operations",
          icon: "inventory_2",
          links: [
            { text: "사이트맵", tEn: "Sitemap", u: buildLocalizedPath("/admin/content/sitemap", "/en/admin/content/sitemap"), icon: "map" }
          ]
        }
      ]
    },
    모니터링: {
      label: "모니터링",
      labelEn: "Monitoring",
      summary: "",
      groups: [
        {
          title: "로그",
          titleEn: "Logs",
          icon: "monitoring",
          links: [
            { text: "로그인 이력", tEn: "Login History", u: buildLocalizedPath("/admin/member/login_history", "/en/admin/member/login_history"), icon: "history" },
            { text: "보안 이력", tEn: "Security History", u: buildLocalizedPath("/admin/system/security", "/en/admin/system/security"), icon: "policy" },
            { text: "보안 정책", tEn: "Security Policy", u: buildLocalizedPath("/admin/system/security-policy", "/en/admin/system/security-policy"), icon: "shield" }
          ]
        },
      ]
    }
  };
}

function cloneMenuTree(source: Record<string, AdminMenuDomain>): Record<string, AdminMenuDomain> {
  return Object.fromEntries(
    Object.entries(source).map(([domainKey, domain]) => [
      domainKey,
      {
        ...domain,
        groups: (domain.groups || []).map((group) => ({
          ...group,
          links: [...(group.links || [])]
        }))
      }
    ])
  );
}

function resolveFallbackDomainKey(label: string) {
  const normalized = label.trim();
  if (!normalized) {
    return "회원관리";
  }
  if (normalized === "회원" || normalized === "회원사" || normalized === "관리자") {
    return "회원관리";
  }
  if (normalized === "시스템") {
    return "시스템";
  }
  if (normalized === "콘텐츠") {
    return "콘텐츠";
  }
  if (normalized === "모니터링") {
    return "모니터링";
  }
  if (normalized === "홈" || normalized === "대시보드") {
    return "대시보드";
  }
  return "회원관리";
}

function ensureCurrentPageInMenuTree(
  source: Record<string, AdminMenuDomain>,
  currentPath: string,
  title: string,
  breadcrumbs?: BreadcrumbItem[],
  en?: boolean
) {
  const currentFull = resolveMenuComparablePath(currentPath, false);
  const currentBase = pathOnly(currentFull);
  const nextTree = cloneMenuTree(source);

  for (const domain of Object.values(nextTree)) {
    for (const group of domain.groups || []) {
      const matched = (group.links || []).some((link) => {
        const targetFull = resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true);
        const targetBase = pathOnly(targetFull);
        return targetFull === currentFull || targetBase === currentBase;
      });
      if (matched) {
        return nextTree;
      }
    }
  }

  const sectionLabel = breadcrumbs?.[1]?.label || "";
  const pageLabel = breadcrumbs?.[breadcrumbs.length - 1]?.label || title || currentBase;
  const domainKey = resolveFallbackDomainKey(sectionLabel);
  const domain = nextTree[domainKey];
  if (!domain) {
    return nextTree;
  }

  const groupIndex = (domain.groups || []).findIndex((group) => {
    const groupTitle = en ? (group.titleEn || group.title) : group.title;
    return groupTitle === sectionLabel || group.title === sectionLabel;
  });

  const targetGroup = groupIndex >= 0
    ? domain.groups[groupIndex]
    : domain.groups[0];

  if (!targetGroup) {
    return nextTree;
  }

  targetGroup.links = [
    {
      text: pageLabel,
      tEn: pageLabel,
      u: currentFull,
      icon: "radio_button_checked"
    },
    ...targetGroup.links
  ];

  return nextTree;
}

function normalizeComparablePath(value: string) {
  if (!value) {
    return "/";
  }
  try {
    const url = new URL(value, window.location.origin);
    const normalizedPath = url.pathname.length > 1 && url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
    if (normalizedPath === "/admin/member/withdrawn") {
      return "/admin/member/list?sbscrbSttus=D";
    }
    if (normalizedPath === "/en/admin/member/withdrawn") {
      return "/en/admin/member/list?sbscrbSttus=D";
    }
    if (normalizedPath === "/admin/member/activate") {
      return "/admin/member/list?sbscrbSttus=X";
    }
    if (normalizedPath === "/en/admin/member/activate") {
      return "/en/admin/member/list?sbscrbSttus=X";
    }
    return `${normalizedPath}${url.search}`;
  } catch {
    return value;
  }
}

function resolveMenuComparablePath(value: string, preserveDirectMenu = true) {
  const normalized = normalizeComparablePath(value);
  try {
    const url = new URL(normalized, window.location.origin);
    const pathname = pathOnly(url.pathname);

    if (pathname === "/admin/member/edit"
      || pathname === "/en/admin/member/edit"
      || pathname === "/admin/member/detail"
      || pathname === "/en/admin/member/detail") {
      return pathname.startsWith("/en/") ? "/en/admin/member/list" : "/admin/member/list";
    }

    if (pathname === "/admin/member/company_detail" || pathname === "/en/admin/member/company_detail") {
      return pathname.startsWith("/en/") ? "/en/admin/member/company_list" : "/admin/member/company_list";
    }

    if (pathname === "/admin/member/admin_account/permissions" || pathname === "/en/admin/member/admin_account/permissions") {
      return pathname.startsWith("/en/") ? "/en/admin/member/admin_list" : "/admin/member/admin_list";
    }

    if (!preserveDirectMenu) {
      return `${pathname}${url.search}`;
    }

    return normalized;
  } catch {
    return normalized;
  }
}

function pathOnly(value: string) {
  const [pathname] = normalizeComparablePath(value).split("?");
  return pathname;
}

function resolveMenuLinkRuntimeUrl(link: MenuLinkLike | undefined) {
  const rawUrl = String(link?.u || "").trim();
  const code = String(link?.code || "").trim().toUpperCase();
  if (code === "A0010102") {
    return buildLocalizedPath("/admin/member/register", "/en/admin/member/register");
  }
  if (code === "A0010203") {
    return buildLocalizedPath("/admin/member/company_account", "/en/admin/member/company_account");
  }
  if (code === "A0010106") {
    return buildLocalizedPath("/admin/member/withdrawn", "/en/admin/member/withdrawn");
  }
  if (code === "A0010107") {
    return buildLocalizedPath("/admin/member/activate", "/en/admin/member/activate");
  }
  return rawUrl;
}

function resolveFirstDomainPath(domain: AdminMenuDomain | undefined) {
  if (!domain) {
    return "#";
  }
  for (const group of domain.groups || []) {
    for (const link of group.links || []) {
      const runtimeUrl = resolveMenuLinkRuntimeUrl(link);
      if (runtimeUrl && runtimeUrl !== "#") {
        return runtimeUrl;
      }
    }
  }
  return "#";
}

function resolveActiveDomainKey(menuTree: Record<string, AdminMenuDomain>, currentPath: string) {
  const currentFull = resolveMenuComparablePath(currentPath, false);
  const currentBase = pathOnly(currentFull);

  for (const [domainKey, domain] of Object.entries(menuTree)) {
    for (const group of domain.groups || []) {
      for (const link of group.links || []) {
        const targetFull = resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true);
        const targetBase = pathOnly(targetFull);
        if (targetFull === currentFull || targetBase === currentBase) {
          return domainKey;
        }
      }
    }
  }

  return Object.keys(menuTree)[0] || "";
}

function resolveActiveLinkIndex(links: MenuLinkLike[], currentPath: string) {
  const currentFull = resolveMenuComparablePath(currentPath, false);
  const currentBase = pathOnly(currentFull);
  const exactIndex = links.findIndex((link) => resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true) === currentFull);
  if (exactIndex >= 0) {
    return exactIndex;
  }
  return links.findIndex((link) => pathOnly(resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true)) === currentBase);
}

function normalizeMenuSearchText(value: string | undefined) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function scoreMenuSearchMatch(query: string, ...candidates: Array<string | undefined>) {
  if (!query) {
    return 0;
  }

  let bestScore = 0;
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeMenuSearchText(candidate);
    if (!normalizedCandidate) {
      continue;
    }
    if (normalizedCandidate === query) {
      bestScore = Math.max(bestScore, 3);
      continue;
    }
    const tokens = normalizedCandidate.split(" ");
    if (tokens.includes(query)) {
      bestScore = Math.max(bestScore, 2);
      continue;
    }
    if (normalizedCandidate.includes(query)) {
      bestScore = Math.max(bestScore, 1);
    }
  }

  return bestScore;
}

function filterMenuGroups(groups: AdminMenuGroup[] | undefined, rawQuery: string, en: boolean) {
  const normalizedQuery = normalizeMenuSearchText(rawQuery);
  const sourceGroups = groups || [];

  if (!normalizedQuery) {
    return {
      groups: sourceGroups,
      visibleLinkCount: sourceGroups.reduce((count, group) => count + (group.links || []).length, 0)
    };
  }

  const evaluatedGroups = sourceGroups.map((group) => {
    const linkEntries = (group.links || []).map((link) => ({
      link,
      score: scoreMenuSearchMatch(
        normalizedQuery,
        link.text,
        link.tEn,
        en ? link.tEn : link.text
      )
    }));

    return {
      group,
      groupScore: scoreMenuSearchMatch(
        normalizedQuery,
        group.title,
        group.titleEn,
        en ? group.titleEn : group.title
      ),
      linkEntries
    };
  });

  const hasStrongLinkMatch = evaluatedGroups.some((group) => group.linkEntries.some((entry) => entry.score >= 2));

  const filteredGroups = evaluatedGroups.flatMap(({ group, groupScore, linkEntries }) => {
    const matchedLinks = linkEntries
      .filter((entry) => entry.score > 0 && (!hasStrongLinkMatch || entry.score >= 2))
      .map((entry) => entry.link);

    if (matchedLinks.length > 0) {
      return [{ ...group, links: matchedLinks }];
    }

    if (groupScore > 0 && !hasStrongLinkMatch) {
      return [{ ...group }];
    }

    return [];
  });

  return {
    groups: filteredGroups,
    visibleLinkCount: filteredGroups.reduce((count, group) => count + (group.links || []).length, 0)
  };
}

async function handleAdminLogout() {
  try {
    await fetch(buildLocalizedPath("/admin/login/actionLogout", "/en/admin/login/actionLogout"), {
      method: "POST",
      credentials: "include"
    });
  } finally {
    invalidateFrontendSessionCache();
    navigate(buildLocalizedPath("/admin/login/loginView", "/en/admin/login/loginView"));
  }
}

export function AdminPageShell({
  title,
  subtitle,
  actions,
  breadcrumbs,
  contextStrip,
  sidebarVariant: _sidebarVariant,
  loading = false,
  loadingLabel,
  children
}: AdminPageShellProps) {
  const en = isEnglish();
  const embeddedInLegacyAdminShell = typeof document !== "undefined" && (() => {
    const root = document.getElementById("root");
    if (!root) {
      return false;
    }
    if (root.closest("#main-content")) {
      return true;
    }
    return !!root.closest(".js-admin-layout-shell");
  })();
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const menuState = useAsyncValue(fetchAdminMenuTree, []);
  const fallbackMenuTree = useMemo(
    () => ensureCurrentPageInMenuTree(getFallbackMenuTree(), currentPath, title, breadcrumbs, en),
    [breadcrumbs, currentPath, en, title]
  );
  const menuTree = Object.keys(menuState.value || {}).length ? (menuState.value || {}) : fallbackMenuTree;
  const fallbackGnbItems = getFallbackGnbItems(en);
  const activeDomainKey = useMemo(
    () => resolveActiveDomainKey(menuTree, currentPath),
    [menuTree, currentPath]
  );
  const [selectedDomainKey, setSelectedDomainKey] = useState(activeDomainKey);
  const [menuFilter, setMenuFilter] = useState("");
  const selectedDomain = menuTree[selectedDomainKey] || menuTree[activeDomainKey];
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [sessionRemainingMs, setSessionRemainingMs] = useState(() => Math.max(0, ensureAdminSessionExpireAt() - Date.now()));
  const [sessionRefreshPending, setSessionRefreshPending] = useState(false);
  const filteredSelectedDomain = useMemo(
    () => filterMenuGroups(selectedDomain?.groups, menuFilter, en),
    [selectedDomain?.groups, menuFilter, en]
  );

  useEffect(() => {
    const eventName = getAdminMenuTreeRefreshEventName();
    const handleMenuTreeRefresh = () => {
      void menuState.reload();
    };
    window.addEventListener(eventName, handleMenuTreeRefresh);
    return () => {
      window.removeEventListener(eventName, handleMenuTreeRefresh);
    };
  }, [menuState]);

  useEffect(() => {
    if (activeDomainKey) {
      setSelectedDomainKey(activeDomainKey);
    }
  }, [activeDomainKey]);

  useEffect(() => {
    if (!selectedDomain) {
      return;
    }
    const nextState: Record<string, boolean> = {};
    (selectedDomain.groups || []).forEach((group, index) => {
      const hasActiveLink = (group.links || []).some((link) => {
        const targetFull = resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true);
        const targetBase = pathOnly(targetFull);
        return targetFull === resolveMenuComparablePath(currentPath, false) || targetBase === pathOnly(resolveMenuComparablePath(currentPath, false));
      });
      nextState[group.title || `group-${index}`] = hasActiveLink || index === 0;
    });
    setOpenGroups(nextState);
  }, [currentPath, selectedDomain]);

  useEffect(() => {
    let expired = false;

    const syncTimer = () => {
      const nextExpireAt = ensureAdminSessionExpireAt();
      const remaining = Math.max(0, nextExpireAt - Date.now());
      setSessionRemainingMs(remaining);
      if (remaining <= 0 && !expired) {
        expired = true;
        window.alert(en ? "Your session has expired. You will be logged out." : "세션이 만료되어 로그아웃됩니다.");
        void handleAdminLogout();
      }
    };

    const handleActivity = () => {
      const savedExpireAt = readStoredAdminSessionExpireAt();
      const remaining = savedExpireAt - Date.now();
      if (remaining > ADMIN_SESSION_WARNING_MS) {
        return;
      }
      const nextExpireAt = Date.now() + ADMIN_SESSION_DURATION_MS;
      window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, String(nextExpireAt));
      setSessionRemainingMs(Math.max(0, nextExpireAt - Date.now()));
    };

    syncTimer();
    const intervalId = window.setInterval(syncTimer, 1000);
    window.addEventListener("storage", syncTimer);
    document.addEventListener("click", handleActivity, { passive: true });
    document.addEventListener("keydown", handleActivity);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncTimer);
      document.removeEventListener("click", handleActivity);
      document.removeEventListener("keydown", handleActivity);
    };
  }, [en]);

  const gnbItems: GnbItem[] = useMemo(() => {
    const domainEntries = Object.entries(menuTree);
    if (!domainEntries.length) {
      return fallbackGnbItems;
    }
    return domainEntries.map(([domainKey, domain]) => ({
      key: domainKey,
      label: en ? (domain.labelEn || domain.label || domainKey) : (domain.label || domainKey),
      href: resolveFirstDomainPath(domain),
      domain: domainKey
    }));
  }, [en, fallbackGnbItems, menuTree]);

  function toggleGroup(groupId: string) {
    setOpenGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  }

  async function handleSessionExtend() {
    const confirmed = window.confirm(en ? "Extend the current session?" : "현재 세션을 연장하시겠습니까?");
    if (!confirmed) {
      return;
    }

    setSessionRefreshPending(true);
    try {
      const response = await fetch(buildLocalizedPath("/admin/login/refreshSession", "/en/admin/login/refreshSession"), {
        method: "GET",
        credentials: "same-origin",
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json() as { status?: string; accessExpiresIn?: number };
      if (payload?.status !== "success") {
        throw new Error("REFRESH_FAILED");
      }
      const nextExpireAt = Date.now() + (typeof payload.accessExpiresIn === "number" ? payload.accessExpiresIn : ADMIN_SESSION_DURATION_MS);
      window.sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, String(nextExpireAt));
      setSessionRemainingMs(Math.max(0, nextExpireAt - Date.now()));
      window.alert(en ? "The session has been extended." : "세션이 연장되었습니다.");
    } catch {
      window.alert(en
        ? "Failed to extend the session. You will be redirected to login."
        : "세션 연장에 실패했습니다. 로그인 화면으로 이동합니다.");
      await handleAdminLogout();
    } finally {
      setSessionRefreshPending(false);
    }
  }

  const sessionTimerClassName = [
    "hidden lg:flex items-center gap-2 px-3 py-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white text-[12px] font-bold text-[var(--kr-gov-text-secondary)]",
    sessionRemainingMs <= ADMIN_SESSION_DANGER_MS
      ? "session-danger"
      : (sessionRemainingMs <= ADMIN_SESSION_WARNING_MS ? "session-warning" : "")
  ].filter(Boolean).join(" ");
  const resolvedLoadingLabel = loadingLabel || (en ? "Loading page data." : "화면을 불러오는 중입니다.");

  if (embeddedInLegacyAdminShell) {
    return (
      <>
        {children}
        {loading ? (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]">
            <div className="min-w-[18rem] rounded-[calc(var(--kr-gov-radius)+6px)] border border-slate-200 bg-white/95 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 shrink-0">
                  <span className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
                  <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--kr-gov-blue)] border-r-[var(--kr-gov-blue)]" />
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">
                    {en ? "Preparing screen" : "화면 준비 중"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                    {resolvedLoadingLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="relative bg-[#f8f9fa] text-[var(--kr-gov-text-primary)] h-screen overflow-hidden flex flex-col">
      <a className="skip-link" href="#main-content">{en ? "Skip to content" : "본문 바로가기"}</a>

      <div className="bg-[var(--kr-gov-bg-gray)] border-b border-[var(--kr-gov-border-light)] z-50 shrink-0">
        <div className="max-w-full mx-auto px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img alt={en ? "Government Symbol of the Republic of Korea" : "대한민국정부 상징"} className="h-3.5" data-fallback-applied="0" onError={handleGovSymbolError} src={GOV_SYMBOL} />
            <span className="text-[12px] font-medium text-[var(--kr-gov-text-secondary)]">
              {en ? "Official Government Service of the Republic of Korea" : "대한민국정부 공식 누리집"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-[var(--kr-gov-text-secondary)]">
            <span>
              <span id="admin-login-label">{en ? "Admin Login:" : "관리자 로그인:"}</span>{" "}
              <span>관리자</span>
            </span>
            <button className="hover:underline" onClick={() => void handleAdminLogout()} type="button">
              {en ? "Logout" : "로그아웃"}
            </button>
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-[var(--kr-gov-border-light)] z-40 shrink-0">
        <div className="max-w-full mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <a
                className="flex items-center gap-2"
                href={buildLocalizedPath("/admin/", "/en/admin/")}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(buildLocalizedPath("/admin/", "/en/admin/"));
                }}
              >
                <span className="material-symbols-outlined text-[32px] text-[var(--kr-gov-blue)]">eco</span>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold tracking-tight text-[var(--kr-gov-text-primary)]">
                    {en ? "CCUS Integrated Management System" : "CCUS 통합관리 시스템"}
                  </h1>
                  <p className="text-[10px] text-[var(--kr-gov-blue)] font-black uppercase tracking-widest">Admin Dashboard</p>
                </div>
              </a>
            </div>

            <nav aria-label={en ? "Admin Main Menu" : "관리자 주 메뉴"} className="hidden xl:flex self-stretch items-start space-x-2 pt-2" id="adminGnbMenu">
              {gnbItems.map((item) => {
                const active = item.domain === (selectedDomainKey || activeDomainKey);
                return (
                  <a
                    data-domain={item.domain}
                    className={`js-gnb-menu px-5 py-1.5 text-[16px] font-bold hover:text-[var(--kr-gov-blue)] ${active ? "text-[var(--kr-gov-blue)]" : "text-[var(--kr-gov-text-secondary)]"}`}
                    href={item.href}
                    key={item.label}
                    onClick={(event) => {
                      event.preventDefault();
                      setSelectedDomainKey(item.domain);
                    }}
                  >
                  {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className={sessionTimerClassName} id="admin-session-timer">
                <span className="material-symbols-outlined text-[18px]">timer</span>
                <span id="admin-session-label">{en ? "Session" : "세션"}</span>
                <span className="min-w-[44px] text-[var(--kr-gov-blue)]" id="admin-session-remaining">{formatAdminSessionRemaining(sessionRemainingMs)}</span>
                <button
                  className="px-2 py-1 rounded border border-[var(--kr-gov-border-light)] text-[11px] font-bold hover:bg-gray-100 disabled:opacity-60"
                  disabled={sessionRefreshPending}
                  id="admin-session-refresh"
                  onClick={() => void handleSessionExtend()}
                  type="button"
                >
                  {sessionRefreshPending ? (en ? "..." : "...") : (en ? "Extend" : "연장")}
                </button>
              </div>
              <div className="hidden md:flex items-center gap-1 mr-1">
                <a
                  className={`px-3 py-1.5 text-[12px] font-bold rounded border border-[var(--kr-gov-border-light)] ${en ? "text-[var(--kr-gov-text-secondary)] hover:bg-gray-100" : "bg-[var(--kr-gov-blue)] text-white"}`}
                  href="/admin/"
                  id="admin-lang-ko"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/admin/");
                  }}
                >
                  {en ? "KOR" : "한글"}
                </a>
                <a
                  className={`px-3 py-1.5 text-[12px] font-bold rounded border border-[var(--kr-gov-border-light)] ${en ? "bg-[var(--kr-gov-blue)] text-white" : "text-[var(--kr-gov-text-secondary)] hover:bg-gray-100"}`}
                  href="/en/admin/"
                  id="admin-lang-en"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/en/admin/");
                  }}
                >
                  ENG
                </a>
              </div>
              <div className="relative help-button">
                <button
                  aria-label={en ? "Help" : "도움말"}
                  className="p-2.5 text-[var(--kr-gov-text-secondary)] hover:bg-gray-100 rounded-full flex items-center gap-1.5"
                  id="admin-help-btn"
                  type="button"
                >
                  <span className="material-symbols-outlined">help</span>
                  <span className="text-[14px] font-bold hidden lg:inline" id="admin-help-text">{en ? "Help" : "도움말"}</span>
                </button>
                <div className="help-tooltip invisible opacity-0 absolute right-0 top-full mt-2 w-72 p-4 bg-white border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] shadow-xl z-50 text-sm transition-all">
                  <h4 className="font-bold text-[var(--kr-gov-blue)] mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span>{en ? "Dashboard Guide" : "대시보드 가이드"}</span>
                  </h4>
                  <ul className="space-y-2 text-[12px] text-[var(--kr-gov-text-secondary)]">
                    <li className="flex gap-2"><span className="text-blue-500">•</span><span>{en ? "Top cards summarize real-time indicators." : "상단 카드는 실시간 주요 지표를 요약합니다."}</span></li>
                    <li className="flex gap-2"><span className="text-blue-500">•</span><span>{en ? "Pending members can be processed immediately." : "미승인 회원은 바로 처리할 수 있습니다."}</span></li>
                    <li className="flex gap-2"><span className="text-blue-500">•</span><span>{en ? "Critical logs require immediate action." : "CRITICAL 로그는 즉시 조치가 필요합니다."}</span></li>
                  </ul>
                  <button className="mt-3 w-full py-1.5 bg-[var(--kr-gov-bg-gray)] text-[11px] font-bold rounded hover:bg-gray-200" type="button">
                    {en ? "Download Full Manual" : "상세 매뉴얼 다운로드"}
                  </button>
                </div>
              </div>
              <button aria-label={en ? "Notifications" : "알림"} className="p-2.5 text-[var(--kr-gov-text-secondary)] hover:bg-gray-100 rounded-full relative" id="admin-notice-btn" type="button">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button aria-label={en ? "Settings" : "설정"} className="p-2.5 text-[var(--kr-gov-text-secondary)] hover:bg-gray-100 rounded-full" id="admin-settings-btn" type="button">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="js-admin-layout-shell flex flex-1 min-h-0">
        <aside aria-label={en ? "Admin Side Menu" : "관리자 사이드 메뉴"} className="js-admin-lnb w-72 bg-white p-5 flex flex-col">
          <div className="mb-6">
            <div className="relative">
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-[var(--kr-gov-radius)] text-sm focus:ring-2 focus:ring-[var(--kr-gov-blue)] focus:border-[var(--kr-gov-blue)] outline-none"
                id="gnbMenuFilter"
                onChange={(event) => setMenuFilter(event.target.value)}
                placeholder={en ? "Search menu (e.g. log, approval)" : "메뉴 검색 (예: 로그, 승인)"}
                type="text"
                value={menuFilter}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            </div>
          </div>

          <div className="js-admin-lnb-body space-y-5" id="gnbTreeWrap">
            {filteredSelectedDomain.groups.map((group: AdminMenuGroup, index) => {
              const groupKey = group.title || `group-${index}`;
              const activeLinkIndex = resolveActiveLinkIndex(group.links || [], currentPath);
              const groupHasActive = activeLinkIndex >= 0;
              const expanded = menuFilter.trim() ? true : (openGroups[groupKey] ?? groupHasActive ?? index === 0);
              return (
                <div className="gnb-tree-group" key={groupKey}>
                  <button
                    aria-controls={`${groupKey}-links`}
                    aria-expanded={expanded ? "true" : "false"}
                    className={`gnb-tree-title ${groupHasActive || index === 0 ? "active" : "inactive"}`}
                    type="button"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">{group.icon || "folder_open"}</span>
                      {en ? (group.titleEn || group.title) : group.title}
                    </span>
                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? "" : "-rotate-90"}`}>expand_more</span>
                  </button>
                    <div className={`gnb-tree-links space-y-1 ${expanded ? "" : "hidden"}`} id={`${groupKey}-links`}>
                    {(group.links || []).map((link, linkIndex) => {
                      const active = linkIndex === activeLinkIndex;
                      const runtimeUrl = resolveMenuLinkRuntimeUrl(link);
                      return (
                        <a
                          className={`admin-sidebar-link ${active ? "active" : ""}`}
                          href={runtimeUrl || "#"}
                          onClick={(e) => {
                            e.preventDefault();
                            if (runtimeUrl) navigate(runtimeUrl);
                          }}
                          key={`${groupKey}-${link.code || runtimeUrl}-${linkIndex}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{link.icon || (active ? "check_circle" : "chevron_right")}</span>
                          {en ? (link.tEn || link.text) : link.text}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {menuFilter.trim() && filteredSelectedDomain.groups.length === 0 ? (
              <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-[var(--kr-gov-text-secondary)]">
                {en ? "No menu matched the entered text." : "입력한 텍스트와 일치하는 메뉴가 없습니다."}
              </div>
            ) : null}
          </div>

          <div className="mt-auto border-t pt-4 border-[var(--kr-gov-border-light)]">
            <div className="p-4 bg-blue-50 rounded-[var(--kr-gov-radius)] border border-blue-100 text-[13px]">
              <p className="font-bold text-[var(--kr-gov-blue)] mb-1">
                {selectedDomain ? `${en ? (selectedDomain.labelEn || selectedDomain.label) : selectedDomain.label} ${en ? "Domain Active" : "도메인 활성화"}` : (en ? "Menu Loading" : "메뉴 로딩 중")}
              </p>
              <p className="text-[var(--kr-gov-text-secondary)]">
                {selectedDomain
                  ? (en
                    ? `Currently displaying ${filteredSelectedDomain.visibleLinkCount} menus${menuFilter.trim() ? " matching the search" : ""}`
                    : `현재 ${menuFilter.trim() ? "검색 결과 " : "전체 메뉴 "}${filteredSelectedDomain.visibleLinkCount}개 노출 중`)
                  : (menuState.loading ? (en ? "Loading menus from server" : "서버 메뉴를 불러오는 중입니다") : (en ? "Fallback menu applied" : "기본 메뉴가 적용되었습니다"))}
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-8" id="main-content">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[var(--kr-gov-text-secondary)] mb-4">
              <span className="material-symbols-outlined text-[18px]">home</span>
              {breadcrumbs.map((item, index) => (
                <div className="flex items-center gap-2" key={`${item.label}-${index}`}>
                  {index > 0 ? <span className="material-symbols-outlined text-[16px]">chevron_right</span> : null}
                  {item.href ? <a className="hover:underline" href={item.href}>{item.label}</a> : <span className="font-bold text-[var(--kr-gov-blue)]">{item.label}</span>}
                </div>
              ))}
            </nav>
          ) : null}

          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-black text-[var(--kr-gov-text-primary)]">{title}</h2>
              {subtitle ? <p className="text-[var(--kr-gov-text-secondary)] text-sm mt-1">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex gap-2">{actions}</div> : null}
          </div>

          {contextStrip}
          {children}
        </main>
      </div>

      <footer className="bg-white border-t border-[var(--kr-gov-border-light)] z-40 relative">
        <div className="max-w-full mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img alt={en ? "Government Symbol of the Republic of Korea" : "대한민국정부 상징"} className="h-8 grayscale opacity-70" data-fallback-applied="0" onError={handleGovSymbolError} src={GOV_FOOTER_SYMBOL} />
            <div className="text-[12px] text-[var(--kr-gov-text-secondary)] leading-tight border-l border-gray-200 pl-4">
              <p className="font-bold text-[13px] mb-0.5">{en ? "Net Zero CCUS Integrated Management HQ (Admin Console)" : "탄소중립 CCUS 통합관리본부 (Admin Console)"}</p>
              <p>© 2025 CCUS Integration Management Portal. All rights reserved.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-medium text-[var(--kr-gov-text-secondary)]">
            <a className="hover:underline" href="#">{en ? "Terms of Service" : "서비스 이용약관"}</a>
            <span className="text-gray-300">|</span>
            <a className="hover:underline" href="#">{en ? "Privacy Policy" : "개인정보처리방침"}</a>
            <span className="text-gray-300">|</span>
            <div className="bg-[var(--kr-gov-bg-gray)] px-3 py-1 rounded-[5px] text-[11px] font-bold border border-gray-200">
              <span>{en ? "Last Updated: 2025.08.14 14:45" : "최종 업데이트: 2025.08.14 14:45"}</span>
            </div>
          </div>
        </div>
      </footer>
      {loading ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]">
          <div className="min-w-[18rem] rounded-[calc(var(--kr-gov-radius)+6px)] border border-slate-200 bg-white/95 px-6 py-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-10 shrink-0">
                <span className="absolute inset-0 rounded-full border-[3px] border-slate-200" />
                <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[var(--kr-gov-blue)] border-r-[var(--kr-gov-blue)]" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">
                  {en ? "Preparing screen" : "화면 준비 중"}
                </p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
                  {resolvedLoadingLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
