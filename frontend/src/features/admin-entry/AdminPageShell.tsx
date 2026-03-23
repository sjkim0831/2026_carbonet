import { ReactNode, SyntheticEvent, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  invalidateFrontendSessionCache,
  fetchAdminMenuTree,
  getAdminMenuTreeRefreshEventName,
  readAdminMenuTreeSnapshot,
  type AdminMenuDomain,
  type AdminMenuGroup,
  type AdminMenuLink
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
  icon?: string;
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
    { key: "대시보드", label: en ? "Dashboard" : "대시보드", href: buildLocalizedPath("/admin/", "/en/admin/"), domain: "대시보드" },
    { key: "회원관리", label: en ? "Members" : "회원관리", href: buildLocalizedPath("/admin/member/list", "/en/admin/member/list"), domain: "회원관리" },
    { key: "시스템", label: en ? "System" : "시스템", href: buildLocalizedPath("/admin/system/code", "/en/admin/system/code"), domain: "시스템" },
    { key: "모니터링", label: en ? "Monitoring" : "모니터링", href: buildLocalizedPath("/admin/member/login_history", "/en/admin/member/login_history"), domain: "모니터링" }
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
            { text: "회원 목록", tEn: "Member List", u: buildLocalizedPath("/admin/member/list", "/en/admin/member/list"), icon: "list_alt" },
            { text: "신규 회원 등록", tEn: "New Member Registration", u: buildLocalizedPath("/admin/member/register", "/en/admin/member/register"), icon: "person_add" },
            { text: "가입 승인", tEn: "Sign-up Approval", u: buildLocalizedPath("/admin/member/approve", "/en/admin/member/approve"), icon: "how_to_reg" },
            { text: "탈퇴 회원", tEn: "Withdrawn Members", u: buildLocalizedPath("/admin/member/withdrawn", "/en/admin/member/withdrawn"), icon: "person_off" },
            { text: "휴면 계정", tEn: "Dormant Accounts", u: buildLocalizedPath("/admin/member/activate", "/en/admin/member/activate"), icon: "bedtime" }
          ]
        },
        {
          title: "회원사",
          titleEn: "Companies",
          icon: "apartment",
          links: [
            { text: "회원사 목록", tEn: "Company List", u: buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list"), icon: "apartment" },
            { text: "회원사 추가", tEn: "Company Create", u: buildLocalizedPath("/admin/member/company_account", "/en/admin/member/company_account"), icon: "domain_add" },
            { text: "회원사 승인", tEn: "Company Approval", u: buildLocalizedPath("/admin/member/company-approve", "/en/admin/member/company-approve"), icon: "domain_verification" }
          ]
        },
        {
          title: "관리자",
          titleEn: "Administrators",
          icon: "admin_panel_settings",
          links: [
            { text: "관리자 목록", tEn: "Admin List", u: buildLocalizedPath("/admin/member/admin_list", "/en/admin/member/admin_list"), icon: "admin_panel_settings" },
            { text: "관리자 계정 생성", tEn: "Admin Account Create", u: buildLocalizedPath("/admin/member/admin_account", "/en/admin/member/admin_account"), icon: "person_add_alt" },
            { text: "권한 변경", tEn: "Permission Changes", u: buildLocalizedPath("/admin/member/auth-change", "/en/admin/member/auth-change"), icon: "swap_horiz" },
            { text: "부서 권한 맵핑", tEn: "Department Permission Mapping", u: buildLocalizedPath("/admin/member/dept-role-mapping", "/en/admin/member/dept-role-mapping"), icon: "account_tree" }
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
          title: "시스템",
          titleEn: "System",
          icon: "settings",
          links: [
            { text: "코드 관리", tEn: "Code Management", u: buildLocalizedPath("/admin/system/code", "/en/admin/system/code"), icon: "category" },
            { text: "접속 로그", tEn: "Access History", u: buildLocalizedPath("/admin/system/access_history", "/en/admin/system/access_history"), icon: "history" },
            { text: "에러 로그", tEn: "Error Log", u: buildLocalizedPath("/admin/system/error-log", "/en/admin/system/error-log"), icon: "error" },
            { text: "보안 감사", tEn: "Security Audit", u: buildLocalizedPath("/admin/system/security-audit", "/en/admin/system/security-audit"), icon: "shield" },
            { text: "감사 로그", tEn: "Observability", u: buildLocalizedPath("/admin/system/observability", "/en/admin/system/observability"), icon: "monitoring" }
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
            { text: "로그인 이력", tEn: "Login History", u: buildLocalizedPath("/admin/member/login_history", "/en/admin/member/login_history"), icon: "history" }
          ]
        }
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
  if (normalized === "모니터링") {
    return "모니터링";
  }
  if (normalized === "홈" || normalized === "대시보드") {
    return "대시보드";
  }
  return "회원관리";
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

function pathOnly(value: string) {
  const [pathname] = normalizeComparablePath(value).split("?");
  return pathname;
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

    if ((pathname === "/admin/member/company_account" || pathname === "/en/admin/member/company_account")
      && url.searchParams.get("insttId")) {
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

function shouldHideSidebarLink(link: MenuLinkLike | undefined) {
  void link;
  return false;
}

function visibleLinks(links: AdminMenuLink[] | undefined): AdminMenuLink[] {
  return (links || []).filter((link) => !shouldHideSidebarLink(link));
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
      const matched = visibleLinks(group.links).some((link) => {
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
  const targetGroup = groupIndex >= 0 ? domain.groups[groupIndex] : domain.groups[0];
  if (!targetGroup) {
    return nextTree;
  }

  targetGroup.links = [
    { code: "", text: pageLabel, tEn: pageLabel, u: currentFull, icon: "radio_button_checked" },
    ...visibleLinks(targetGroup.links)
  ];
  return nextTree;
}

function resolveFirstDomainPath(domain: AdminMenuDomain | undefined) {
  if (!domain) {
    return "#";
  }
  for (const group of domain.groups || []) {
    for (const link of visibleLinks(group.links)) {
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
      for (const link of visibleLinks(group.links)) {
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

function resolveActiveLinkIndex(links: AdminMenuLink[], currentPath: string) {
  const currentFull = resolveMenuComparablePath(currentPath, false);
  const currentBase = pathOnly(currentFull);
  const sidebarLinks = visibleLinks(links);
  const exactIndex = sidebarLinks.findIndex((link) => resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true) === currentFull);
  if (exactIndex >= 0) {
    return exactIndex;
  }
  return sidebarLinks.findIndex((link) => pathOnly(resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true)) === currentBase);
}

function normalizeMenuSearchText(value: string | undefined) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
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
  const sourceGroups = (groups || []).map((group) => ({ ...group, links: visibleLinks(group.links) }));

  if (!normalizedQuery) {
    return {
      groups: sourceGroups.filter((group) => (group.links || []).length > 0),
      visibleLinkCount: sourceGroups.reduce((count, group) => count + (group.links || []).length, 0)
    };
  }

  const evaluatedGroups = sourceGroups.map((group) => {
    const linkEntries = (group.links || []).map((link) => ({
      link,
      score: scoreMenuSearchMatch(normalizedQuery, link.text, link.tEn, en ? link.tEn : link.text)
    }));

    return {
      group,
      groupScore: scoreMenuSearchMatch(normalizedQuery, group.title, group.titleEn, en ? group.titleEn : group.title),
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
    groups: filteredGroups.filter((group) => (group.links || []).length > 0),
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
  const [initialMenuTree] = useState(() => readAdminMenuTreeSnapshot());
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
  const menuState = useAsyncValue(fetchAdminMenuTree, [], {
    initialValue: initialMenuTree,
    skipInitialLoad: initialMenuTree !== null
  });
  const fallbackMenuTree = useMemo(
    () => ensureCurrentPageInMenuTree(getFallbackMenuTree(), currentPath, title, breadcrumbs, en),
    [breadcrumbs, currentPath, en, title]
  );
  const menuTree = Object.keys(menuState.value || {}).length ? (menuState.value || {}) : fallbackMenuTree;
  const fallbackGnbItems = getFallbackGnbItems(en);
  const activeDomainKey = useMemo(() => resolveActiveDomainKey(menuTree, currentPath), [menuTree, currentPath]);
  const [selectedDomainKey, setSelectedDomainKey] = useState(activeDomainKey);
  const [menuFilter, setMenuFilter] = useState("");
  const deferredMenuFilter = useDeferredValue(menuFilter);
  const selectedDomain = menuTree[selectedDomainKey] || menuTree[activeDomainKey];
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [sessionRemainingMs, setSessionRemainingMs] = useState(() => Math.max(0, ensureAdminSessionExpireAt() - Date.now()));
  const [sessionRefreshPending, setSessionRefreshPending] = useState(false);
  const filteredSelectedDomain = useMemo(
    () => filterMenuGroups(selectedDomain?.groups, deferredMenuFilter, en),
    [selectedDomain?.groups, deferredMenuFilter, en]
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
    const currentComparable = resolveMenuComparablePath(currentPath, false);
    const currentBase = pathOnly(currentComparable);
    const nextState: Record<string, boolean> = {};
    (selectedDomain.groups || []).forEach((group, index) => {
      const hasActiveLink = visibleLinks(group.links).some((link) => {
        const targetFull = resolveMenuComparablePath(resolveMenuLinkRuntimeUrl(link), true);
        const targetBase = pathOnly(targetFull);
        return targetFull === currentComparable || targetBase === currentBase;
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
                  <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Preparing screen" : "화면 준비 중"}</p>
                  <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{resolvedLoadingLabel}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#f8f9fa] text-[var(--kr-gov-text-primary)]">
      <a className="skip-link" href="#main-content">{en ? "Skip to content" : "본문 바로가기"}</a>

      <div className="z-50 shrink-0 border-b border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-bg-gray)]">
        <div className="mx-auto flex max-w-full items-center justify-between px-6 py-1.5">
          <div className="flex items-center gap-2">
            <img alt={en ? "Government Symbol of the Republic of Korea" : "대한민국정부 상징"} className="h-3.5" data-fallback-applied="0" onError={handleGovSymbolError} src={GOV_SYMBOL} />
            <span className="text-[12px] font-medium text-[var(--kr-gov-text-secondary)]">
              {en ? "Official Government Service of the Republic of Korea" : "대한민국정부 공식 누리집"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium text-[var(--kr-gov-text-secondary)]">
            <span><span id="admin-login-label">{en ? "Admin Login:" : "관리자 로그인:"}</span> <span>관리자</span></span>
            <button className="hover:underline" onClick={() => void handleAdminLogout()} type="button">{en ? "Logout" : "로그아웃"}</button>
          </div>
        </div>
      </div>

      <header className="z-40 shrink-0 border-b border-[var(--kr-gov-border-light)] bg-white">
        <div className="mx-auto max-w-full px-6">
          <div className="flex h-20 items-center justify-between">
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
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--kr-gov-blue)]">Admin Dashboard</p>
              </div>
            </a>

            <nav aria-label={en ? "Admin Main Menu" : "관리자 주 메뉴"} className="hidden self-stretch items-start space-x-2 pt-2 xl:flex" id="adminGnbMenu">
              {gnbItems.map((item) => {
                const active = item.domain === (selectedDomainKey || activeDomainKey);
                return (
                  <a
                    className={`js-gnb-menu px-5 py-1.5 text-[16px] font-bold hover:text-[var(--kr-gov-blue)] ${active ? "text-[var(--kr-gov-blue)]" : "text-[var(--kr-gov-text-secondary)]"}`}
                    data-domain={item.domain}
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
                  className="rounded border border-[var(--kr-gov-border-light)] px-2 py-1 text-[11px] font-bold hover:bg-gray-100 disabled:opacity-60"
                  disabled={sessionRefreshPending}
                  id="admin-session-refresh"
                  onClick={() => void handleSessionExtend()}
                  type="button"
                >
                  {sessionRefreshPending ? "..." : (en ? "Extend" : "연장")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="js-admin-layout-shell flex min-h-0 flex-1">
        <aside aria-label={en ? "Admin Side Menu" : "관리자 사이드 메뉴"} className="js-admin-lnb flex w-72 flex-col bg-white p-5">
          <div className="mb-6">
            <div className="relative">
              <input
                className="w-full rounded-[var(--kr-gov-radius)] border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--kr-gov-blue)] focus:ring-2 focus:ring-[var(--kr-gov-blue)]"
                id="gnbMenuFilter"
                onChange={(event) => setMenuFilter(event.target.value)}
                placeholder={en ? "Search menu (e.g. log, approval)" : "메뉴 검색 (예: 로그, 승인)"}
                type="text"
                value={menuFilter}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-gray-400">search</span>
            </div>
          </div>

          <div className="js-admin-lnb-body space-y-5" id="gnbTreeWrap">
            {filteredSelectedDomain.groups.map((group: AdminMenuGroup, index) => {
              const groupLinks = visibleLinks(group.links);
              const groupKey = group.title || `group-${index}`;
              const activeLinkIndex = resolveActiveLinkIndex(groupLinks, currentPath);
              const groupHasActive = activeLinkIndex >= 0;
              const expanded = deferredMenuFilter.trim() ? true : (openGroups[groupKey] ?? groupHasActive ?? index === 0);
              return (
                <div className="gnb-tree-group" key={groupKey}>
                  <button
                    aria-controls={`${groupKey}-links`}
                    aria-expanded={expanded ? "true" : "false"}
                    className={`gnb-tree-title ${groupHasActive || index === 0 ? "active" : "inactive"}`}
                    onClick={() => toggleGroup(groupKey)}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">{group.icon || "folder_open"}</span>
                      {en ? (group.titleEn || group.title) : group.title}
                    </span>
                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? "" : "-rotate-90"}`}>expand_more</span>
                  </button>
                  <div className={`gnb-tree-links space-y-1 ${expanded ? "" : "hidden"}`} id={`${groupKey}-links`}>
                    {groupLinks.map((link, linkIndex) => {
                      const active = linkIndex === activeLinkIndex;
                      const runtimeUrl = resolveMenuLinkRuntimeUrl(link);
                      return (
                        <a
                          className={`admin-sidebar-link ${active ? "active" : ""}`}
                          href={runtimeUrl || "#"}
                          key={`${groupKey}-${link.code || runtimeUrl}-${linkIndex}`}
                          onClick={(e) => {
                            e.preventDefault();
                            if (runtimeUrl) {
                              navigate(runtimeUrl);
                            }
                          }}
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

          <div className="mt-auto border-t border-[var(--kr-gov-border-light)] pt-4">
            <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 p-4 text-[13px]">
              <p className="mb-1 font-bold text-[var(--kr-gov-blue)]">
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
            <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-sm text-[var(--kr-gov-text-secondary)]">
              <span className="material-symbols-outlined text-[18px]">home</span>
              {breadcrumbs.map((item, index) => (
                <div className="flex items-center gap-2" key={`${item.label}-${index}`}>
                  {index > 0 ? <span className="material-symbols-outlined text-[16px]">chevron_right</span> : null}
                  {item.href ? <a className="hover:underline" href={item.href}>{item.label}</a> : <span className="font-bold text-[var(--kr-gov-blue)]">{item.label}</span>}
                </div>
              ))}
            </nav>
          ) : null}

          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-[var(--kr-gov-text-primary)]">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex gap-2">{actions}</div> : null}
          </div>

          {contextStrip}
          {children}
        </main>
      </div>

      <footer className="relative z-40 border-t border-[var(--kr-gov-border-light)] bg-white">
        <div className="mx-auto flex max-w-full flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row">
          <div className="flex items-center gap-4">
            <img alt={en ? "Government Symbol of the Republic of Korea" : "대한민국정부 상징"} className="h-8 grayscale opacity-70" data-fallback-applied="0" onError={handleGovSymbolError} src={GOV_FOOTER_SYMBOL} />
            <div className="border-l border-gray-200 pl-4 text-[12px] leading-tight text-[var(--kr-gov-text-secondary)]">
              <p className="mb-0.5 text-[13px] font-bold">{en ? "Net Zero CCUS Integrated Management HQ (Admin Console)" : "탄소중립 CCUS 통합관리본부 (Admin Console)"}</p>
              <p>© 2025 CCUS Integration Management Portal. All rights reserved.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-medium text-[var(--kr-gov-text-secondary)]">
            <a className="hover:underline" href="#">{en ? "Terms of Service" : "서비스 이용약관"}</a>
            <span className="text-gray-300">|</span>
            <a className="hover:underline" href="#">{en ? "Privacy Policy" : "개인정보처리방침"}</a>
            <span className="text-gray-300">|</span>
            <div className="rounded-[5px] border border-gray-200 bg-[var(--kr-gov-bg-gray)] px-3 py-1 text-[11px] font-bold">
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
                <p className="text-sm font-black text-[var(--kr-gov-text-primary)]">{en ? "Preparing screen" : "화면 준비 중"}</p>
                <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{resolvedLoadingLabel}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
