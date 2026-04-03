import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchMenuManagementPage, refreshAdminMenuTree, type MenuManagementPagePayload } from "../../lib/api/client";
import { postFormUrlEncoded } from "../../lib/api/core";
import { buildLocalizedPath, getNavigationEventName, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { numberOf, stringOf } from "../admin-system/adminSystemShared";
import { CollectionResultPanel, GridToolbar, PageStatusNotice, SummaryMetricCard, WarningPanel } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { toDisplayMenuUrl } from "./menuUrlDisplay";

type MenuNode = {
  code: string;
  label: string;
  url: string;
  icon: string;
  useAt: string;
  expsrAt: string;
  sortOrdr: number;
  children: MenuNode[];
};

type MenuSnapshot = {
  sortOrdr: number;
  expsrAt: string;
};

function readMenuTypeFromLocation() {
  return new URLSearchParams(window.location.search).get("menuType") || "ADMIN";
}

function parentCode(code: string) {
  if (code.length === 8) return code.slice(0, 6);
  if (code.length === 6) return code.slice(0, 4);
  return "";
}

function buildTree(rows: Array<Record<string, unknown>>) {
  const nodes = new Map<string, MenuNode>();
  rows.forEach((row) => {
    const code = stringOf(row, "code").toUpperCase();
    if (!code) {
      return;
    }
    nodes.set(code, {
      code,
      label: stringOf(row, "codeNm", "codeDc", "code"),
      url: toDisplayMenuUrl(stringOf(row, "menuUrl")),
      icon: stringOf(row, "menuIcon") || "menu",
      useAt: stringOf(row, "useAt") || "Y",
      expsrAt: stringOf(row, "expsrAt") || "Y",
      sortOrdr: numberOf(row, "sortOrdr"),
      children: []
    });
  });

  const roots: MenuNode[] = [];
  nodes.forEach((node) => {
    const parent = nodes.get(parentCode(node.code));
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items: MenuNode[]) => {
    items.sort((a, b) => {
      const orderA = a.sortOrdr > 0 ? a.sortOrdr : Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrdr > 0 ? b.sortOrdr : Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.code.localeCompare(b.code);
    });
    items.forEach((item) => sortNodes(item.children));
  };

  sortNodes(roots);
  return roots;
}

function updateSortOrders(items: MenuNode[]) {
  items.forEach((item, index) => {
    item.sortOrdr = index + 1;
    updateSortOrders(item.children);
  });
}

function flattenPayload(items: MenuNode[], output: string[] = []) {
  items.forEach((item, index) => {
    output.push(`${item.code}:${index + 1}`);
    flattenPayload(item.children, output);
  });
  return output;
}

function flattenNodes(items: MenuNode[], output: MenuNode[] = []) {
  items.forEach((item) => {
    output.push(item);
    flattenNodes(item.children, output);
  });
  return output;
}

function filterTree(nodes: MenuNode[], keyword: string): MenuNode[] {
  if (!keyword) {
    return nodes;
  }
  const normalizedKeyword = keyword.trim().toLowerCase();
  return nodes.flatMap((node): MenuNode[] => {
    const filteredChildren: MenuNode[] = filterTree(node.children, keyword);
    const matches = [
      node.code,
      node.label,
      node.url,
      node.icon,
      node.useAt,
      node.expsrAt
    ].join(" ").toLowerCase().includes(normalizedKeyword);
    if (!matches && filteredChildren.length === 0) {
      return [];
    }
    return [{ ...node, children: filteredChildren }];
  });
}

function buildSnapshot(rows: Array<Record<string, unknown>>) {
  return rows.reduce<Record<string, MenuSnapshot>>((result, row) => {
    const code = stringOf(row, "code").toUpperCase();
    if (!code) {
      return result;
    }
    result[code] = {
      sortOrdr: numberOf(row, "sortOrdr"),
      expsrAt: stringOf(row, "expsrAt") || "Y"
    };
    return result;
  }, {});
}

function validateCreateForm(params: {
  en: boolean;
  parentCodeValue: string;
  codeNm: string;
  menuUrl: string;
  menuType: string;
}) {
  const { en, parentCodeValue, codeNm, menuUrl, menuType } = params;
  if (!parentCodeValue) {
    return en ? "Select a group menu first." : "그룹 메뉴를 먼저 선택하세요.";
  }
  if (!codeNm.trim()) {
    return en ? "Enter a page name." : "페이지명을 입력하세요.";
  }
  if (!menuUrl.trim()) {
    return en ? "Enter a page URL." : "페이지 URL을 입력하세요.";
  }
  if (!menuUrl.startsWith("/")) {
    return en ? "Page URL must start with /." : "페이지 URL은 / 로 시작해야 합니다.";
  }
  if (menuType === "ADMIN" && !menuUrl.startsWith("/admin/")) {
    return en ? "Admin menu URL must start with /admin/." : "관리자 메뉴 URL은 /admin/으로 시작해야 합니다.";
  }
  if (menuType === "USER" && !menuUrl.startsWith("/home/")) {
    return en ? "Home menu URL must start with /home/." : "홈 메뉴 URL은 /home/으로 시작해야 합니다.";
  }
  return "";
}

export function MenuManagementMigrationPage() {
  const en = isEnglish();
  const [menuType, setMenuType] = useState(readMenuTypeFromLocation());
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [parentCodeValue, setParentCodeValue] = useState("");
  const [codeNm, setCodeNm] = useState("");
  const [codeDc, setCodeDc] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [menuIcon, setMenuIcon] = useState("web");
  const [useAt, setUseAt] = useState("Y");
  const [treeData, setTreeData] = useState<MenuNode[]>([]);

  const deferredSearchKeyword = useDeferredValue(searchKeyword);
  const pageState = useAsyncValue<MenuManagementPagePayload>(() => fetchMenuManagementPage(menuType), [menuType]);
  const page = pageState.value;

  const rows = useMemo(() => (page?.menuRows || []) as Array<Record<string, unknown>>, [page?.menuRows]);
  const menuTypes = ((page?.menuTypes || []) as Array<Record<string, unknown>>);
  const groupMenuOptions = ((page?.groupMenuOptions || []) as Array<Record<string, string>>);
  const iconOptions = ((page?.iconOptions || []) as string[]);
  const useAtOptions = ((page?.useAtOptions || []) as string[]);

  const originalSnapshot = useMemo(() => buildSnapshot(rows), [rows]);
  const filteredTreeData = useMemo(() => filterTree(treeData, deferredSearchKeyword), [deferredSearchKeyword, treeData]);
  const visibleNodes = useMemo(() => flattenNodes(filteredTreeData), [filteredTreeData]);
  const allNodes = useMemo(() => flattenNodes(treeData), [treeData]);

  const dirtyOrderRows = useMemo(() => (
    allNodes.filter((node) => {
      const snapshot = originalSnapshot[node.code];
      return snapshot && snapshot.sortOrdr !== node.sortOrdr;
    })
  ), [allNodes, originalSnapshot]);

  useEffect(() => {
    function syncMenuTypeFromLocation() {
      setMenuType(readMenuTypeFromLocation());
    }
    const navigationEventName = getNavigationEventName();
    window.addEventListener("popstate", syncMenuTypeFromLocation);
    window.addEventListener(navigationEventName, syncMenuTypeFromLocation);
    return () => {
      window.removeEventListener("popstate", syncMenuTypeFromLocation);
      window.removeEventListener(navigationEventName, syncMenuTypeFromLocation);
    };
  }, []);

  useEffect(() => {
    const nextSearch = new URLSearchParams(window.location.search);
    if (menuType) {
      nextSearch.set("menuType", menuType);
    } else {
      nextSearch.delete("menuType");
    }
    const nextQuery = nextSearch.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash || ""}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash || ""}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [menuType]);

  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "menu-management", {
      route: window.location.pathname,
      menuType,
      rowCount: rows.length,
      rootNodeCount: treeData.length,
      visibleNodeCount: visibleNodes.length,
      groupMenuOptionCount: groupMenuOptions.length,
      searchKeyword: deferredSearchKeyword,
      dirtyOrderCount: dirtyOrderRows.length
    });
    logGovernanceScope("COMPONENT", "menu-management-tree", {
      component: "menu-management-tree",
      rootNodeCount: treeData.length,
      visibleNodeCount: visibleNodes.length,
      menuType
    });
  }, [
    deferredSearchKeyword,
    dirtyOrderRows.length,
    groupMenuOptions.length,
    menuType,
    page,
    rows.length,
    treeData.length,
    visibleNodes.length
  ]);

  useEffect(() => {
    setTreeData(buildTree(rows));
  }, [rows]);

  useEffect(() => {
    if (!parentCodeValue && groupMenuOptions.length > 0) {
      setParentCodeValue(stringOf(groupMenuOptions[0], "value"));
    }
  }, [groupMenuOptions, parentCodeValue]);

  useEffect(() => {
    setActionError("");
    setActionMessage("");
    setSearchKeyword("");
    setCodeNm("");
    setCodeDc("");
    setMenuUrl("");
    setMenuIcon(iconOptions[0] || "web");
    setUseAt(useAtOptions[0] || "Y");
    setParentCodeValue(stringOf(groupMenuOptions[0], "value"));
  }, [menuType]);

  function moveNode(nodes: MenuNode[], index: number, direction: number) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= nodes.length) {
      return;
    }
    const nextNodes = [...nodes];
    const moved = nextNodes[index];
    nextNodes[index] = nextNodes[nextIndex];
    nextNodes[nextIndex] = moved;
    updateSortOrders(nextNodes);
    return nextNodes;
  }

  function updateLevel(path: number[], direction: number) {
    setTreeData((current) => {
      const clone = JSON.parse(JSON.stringify(current)) as MenuNode[];
      let level = clone;
      for (let i = 0; i < path.length - 1; i += 1) {
        level = level[path[i]].children;
      }
      const next = moveNode(level, path[path.length - 1], direction);
      if (next) {
        if (path.length === 1) {
          return next;
        }
        let target = clone;
        for (let i = 0; i < path.length - 2; i += 1) {
          target = target[path[i]].children;
        }
        target[path[path.length - 2]].children = next;
      }
      return clone;
    });
  }

  async function saveOrder() {
    logGovernanceScope("ACTION", "menu-management-save-order", {
      menuType,
      payloadCount: flattenPayload(treeData).length,
      dirtyOrderCount: dirtyOrderRows.length
    });
    setActionError("");
    setActionMessage("");
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    body.set("orderPayload", flattenPayload(treeData).join(","));
    await postFormUrlEncoded(
      buildLocalizedPath("/admin/system/menu/order", "/en/admin/system/menu/order"),
      body
    );
    refreshAdminMenuTree();
    await pageState.reload();
    setActionMessage(en ? "Menu order has been saved." : "메뉴 순서를 저장했습니다.");
  }

  function findSuggestedPageCode() {
    if (!parentCodeValue || parentCodeValue.length !== 6) {
      return "";
    }
    let maxSuffix = 0;
    rows.forEach((row) => {
      const code = stringOf(row, "code").toUpperCase();
      if (!code.startsWith(parentCodeValue) || code.length !== 8) {
        return;
      }
      const suffix = Number(code.slice(6));
      if (Number.isFinite(suffix) && suffix > maxSuffix) {
        maxSuffix = suffix;
      }
    });
    if (maxSuffix >= 99) {
      return "";
    }
    return `${parentCodeValue}${String(maxSuffix + 1).padStart(2, "0")}`;
  }

  async function createPageMenu() {
    setActionError("");
    setActionMessage("");
    const validationError = validateCreateForm({ en, parentCodeValue, codeNm, menuUrl, menuType });
    if (validationError) {
      setActionError(validationError);
      return;
    }
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    body.set("parentCode", parentCodeValue);
    body.set("codeNm", codeNm.trim());
    body.set("codeDc", codeDc.trim());
    body.set("menuUrl", menuUrl.trim());
    body.set("menuIcon", menuIcon);
    body.set("useAt", useAt);
    const responseBody = await postFormUrlEncoded<{ success?: boolean; message?: string; createdCode?: string }>(
      buildLocalizedPath("/admin/system/menu/create-page", "/en/admin/system/menu/create-page"),
      body
    );
    if (!responseBody.success) {
      throw new Error(responseBody.message || "Failed to create page menu.");
    }
    refreshAdminMenuTree();
    await pageState.reload();
    setActionMessage(responseBody.message || (en ? "The page has been created." : "페이지를 생성했습니다."));
    setCodeNm("");
    setCodeDc("");
    setMenuUrl("");
  }

  function renderNodes(nodes: MenuNode[], path: number[] = []) {
    return (
      <ol className="gov-tree-list">
        {nodes.map((node, index) => {
          const depth = node.code.length;
          const chipClass = depth === 4 ? "bg-blue-50 text-[var(--kr-gov-blue)]" : depth === 6 ? "bg-amber-50 text-[#8a5a00]" : "bg-green-50 text-[#196c2e]";
          const currentPath = [...path, index];
          const snapshot = originalSnapshot[node.code];
          const orderChanged = Boolean(snapshot && snapshot.sortOrdr !== node.sortOrdr);
          return (
            <li key={node.code}>
              <div className={`gov-tree-node ${orderChanged ? "ring-1 ring-[var(--kr-gov-blue)] ring-offset-1" : ""}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-[20px] text-[var(--kr-gov-blue)]">{node.icon}</span>
                      <strong className="text-base">{node.label}</strong>
                      <span className={`gov-chip ${chipClass}`}>{node.code}</span>
                      <span className={`gov-chip ${node.useAt === "Y" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{node.useAt === "Y" ? (en ? "Use" : "사용") : (en ? "Unused" : "미사용")}</span>
                      {orderChanged ? <span className="gov-chip bg-indigo-100 text-indigo-700">{en ? "Order changed" : "순서 변경"}</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)] break-all">{node.url || (en ? "No linked URL" : "연결 URL 없음")}</p>
                    <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">
                      {en ? "Sort order" : "정렬순서"}: {node.sortOrdr || "-"}
                      {snapshot ? ` / ${en ? "Original" : "기준"}: ${snapshot.sortOrdr || "-"}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="gov-btn gov-btn-outline" disabled={index === 0 || Boolean(deferredSearchKeyword)} onClick={() => updateLevel(currentPath, -1)} type="button">{en ? "Up" : "위로"}</button>
                    <button className="gov-btn gov-btn-outline" disabled={index === nodes.length - 1 || Boolean(deferredSearchKeyword)} onClick={() => updateLevel(currentPath, 1)} type="button">{en ? "Down" : "아래로"}</button>
                  </div>
                </div>
              </div>
              {node.children.length > 0 ? <div className="gov-tree-children">{renderNodes(node.children, currentPath)}</div> : null}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Environment" : "환경설정" },
        { label: en ? "Menu Management" : "메뉴 관리" }
      ]}
      title={en ? "Menu Management" : "메뉴 관리"}
      subtitle={en ? "Manage the system environment menu hierarchy, register page menus quickly, and keep sibling order aligned." : "시스템 환경설정 메뉴 계층을 정리하고, 페이지 메뉴를 빠르게 등록하며, 같은 부모 아래 정렬 순서를 맞춥니다."}
    >
      <AdminWorkspacePageFrame>
        {page?.menuMgmtMessage || actionMessage ? <PageStatusNotice tone="success">{actionMessage || String(page?.menuMgmtMessage)}</PageStatusNotice> : null}
        {pageState.error || actionError || page?.menuMgmtError ? <PageStatusNotice tone="error">{actionError || page?.menuMgmtError || pageState.error}</PageStatusNotice> : null}

        <section className="grid grid-cols-1 gap-3 xl:grid-cols-4">
          <SummaryMetricCard title={en ? "Visible Nodes" : "표시 노드"} value={`${visibleNodes.length} / ${allNodes.length}`} description={en ? "Search results / total" : "검색 결과 / 전체"} />
          <SummaryMetricCard title={en ? "Order Changes" : "순서 변경"} value={String(dirtyOrderRows.length)} description={en ? "Pending before save" : "저장 전 변경 건"} />
          <SummaryMetricCard title={en ? "Group Menus" : "그룹 메뉴"} value={String(groupMenuOptions.length)} description={en ? "Available parents" : "등록 가능 부모 메뉴"} />
          <SummaryMetricCard title={en ? "Current Scope" : "현재 구분"} value={menuType} description={en ? "Synced to URL query" : "URL 쿼리와 동기화"} />
        </section>

        <CollectionResultPanel
          data-help-id="menu-management-scope"
          description={en ? "Reordering is limited to siblings under the same parent. Search disables movement to avoid mismatching filtered positions." : "같은 부모 메뉴 아래에서만 순서를 바꿀 수 있고, 검색 중에는 필터 결과와 실제 순서가 어긋나지 않도록 이동을 막습니다."}
          icon="tune"
          title={en ? "Menu Scope and Search" : "메뉴 범위와 검색"}
        >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[16rem_1fr] xl:grid-cols-[16rem_1fr_1.2fr] items-end">
          <div>
            <label className="gov-label" htmlFor="menuType">{en ? "Page Scope" : "화면 구분"}</label>
            <select className="gov-select" id="menuType" value={menuType} onChange={(event) => setMenuType(event.target.value)}>
              {menuTypes.map((type) => (
                <option key={stringOf(type, "value")} value={stringOf(type, "value")}>{stringOf(type, "label")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gov-label" htmlFor="menuSearchKeyword">{en ? "Search menu tree" : "메뉴 트리 검색"}</label>
            <input className="gov-input" id="menuSearchKeyword" onChange={(event) => setSearchKeyword(event.target.value)} placeholder={en ? "Menu code, name, URL" : "메뉴 코드, 메뉴명, URL"} value={searchKeyword} />
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
            {en ? "Only sibling menus under the same parent can move up or down. Reordering is disabled while search is active to avoid mismatching filtered positions." : "같은 부모 메뉴 아래에서만 위/아래 이동이 가능합니다. 검색 중에는 필터 결과와 실제 순서가 엇갈리지 않도록 순서 이동을 잠시 막습니다."}
          </div>
        </div>
        </CollectionResultPanel>

        <section className="gov-card overflow-hidden p-0" data-help-id="menu-management-register">
          <GridToolbar
            meta={String(page?.menuMgmtGuide || "")}
            title={en ? "Quick Page Registration" : "빠른 페이지 등록"}
          />
          <div className="p-6">
            <WarningPanel className="mb-4" title={en ? "Sitemap linkage" : "사이트맵 연동"}>
              {String(page?.siteMapMgmtGuide || "")}
            </WarningPanel>

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="gov-label" htmlFor="parentCode">{en ? "Group Menu" : "그룹 메뉴"}</label>
              <select className="gov-select" id="parentCode" value={parentCodeValue} onChange={(event) => setParentCodeValue(event.target.value)}>
                {groupMenuOptions.map((option) => (
                  <option key={stringOf(option, "value")} value={stringOf(option, "value")}>{stringOf(option, "label")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="gov-label" htmlFor="suggestedCode">{en ? "Generated Page Code" : "생성 예정 페이지 코드"}</label>
              <input className="gov-input bg-gray-50" id="suggestedCode" readOnly value={findSuggestedPageCode()} />
            </div>
            <div>
              <label className="gov-label" htmlFor="codeNm">{en ? "Page Name" : "페이지명"}</label>
              <input className="gov-input" id="codeNm" value={codeNm} onChange={(event) => setCodeNm(event.target.value)} />
            </div>
            <div>
              <label className="gov-label" htmlFor="codeDc">{en ? "English Page Name" : "영문 페이지명"}</label>
              <input className="gov-input" id="codeDc" value={codeDc} onChange={(event) => setCodeDc(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="gov-label" htmlFor="menuUrl">{en ? "Page URL" : "페이지 URL"}</label>
              <input className="gov-input" id="menuUrl" placeholder={menuType === "USER" ? "/home/..." : "/admin/..."} value={menuUrl} onChange={(event) => setMenuUrl(event.target.value)} />
            </div>
            <div>
              <label className="gov-label" htmlFor="menuIcon">{en ? "Icon" : "아이콘"}</label>
              <select className="gov-select" id="menuIcon" value={menuIcon} onChange={(event) => setMenuIcon(event.target.value)}>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="gov-label" htmlFor="quickUseAt">{en ? "Use" : "사용 여부"}</label>
              <select className="gov-select" id="quickUseAt" value={useAt} onChange={(event) => setUseAt(event.target.value)}>
                {useAtOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[#f8fbff] px-5 py-4">
            <h4 className="font-bold text-[var(--kr-gov-blue)]">{en ? "What gets created" : "함께 생성되는 항목"}</h4>
            <ul className="mt-3 space-y-2 text-sm text-[var(--kr-gov-text-secondary)] list-disc pl-5">
              <li>{en ? "Common detail code and menu URL metadata" : "공통 상세코드와 메뉴 URL 메타데이터"}</li>
              <li>{en ? "Default PAGE_CODE_VIEW feature" : "기본 PAGE_CODE_VIEW 기능"}</li>
              <li>{en ? "Initial sibling sort order under the selected group" : "선택 그룹 하위의 초기 정렬 순서"}</li>
              <li>{en ? "Legacy screens stay intact and can be hidden later" : "기존 화면은 유지되고 나중에 숨김 처리 가능"}</li>
            </ul>
            <div className="mt-4">
              <button className="gov-btn gov-btn-primary w-full" onClick={() => { void createPageMenu().catch((error: Error) => setActionError(error.message)); }} type="button">
                {en ? "Create Page Menu" : "페이지 메뉴 생성"}
              </button>
            </div>
          </div>
        </div>
          </div>
        </section>

        <section className="gov-card overflow-hidden p-0" data-help-id="menu-management-tree">
          <GridToolbar
            actions={<div className="flex flex-wrap items-center gap-2"><button className="gov-btn gov-btn-primary" onClick={() => { void saveOrder().catch((error: Error) => setActionError(error.message)); }} type="button">{en ? "Save Order" : "순서 저장"}</button></div>}
            meta={en ? "Review node depth and pending sibling order changes before saving." : "노드 깊이와 같은 부모 기준의 정렬 변경을 확인한 뒤 저장합니다."}
            title={en ? "Menu Tree" : "메뉴 트리"}
          />
          <div className="p-6">

        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[#f8fbff] px-4 py-3">
            <p className="font-bold text-[var(--kr-gov-blue)]">{en ? "Top Menu" : "상위 메뉴"}</p>
            <p className="text-[var(--kr-gov-text-secondary)]">{en ? "4-digit code" : "4자리 코드"}</p>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[#fcfbf7] px-4 py-3">
            <p className="font-bold text-[#8a5a00]">{en ? "Group Menu" : "그룹 메뉴"}</p>
            <p className="text-[var(--kr-gov-text-secondary)]">{en ? "6-digit code" : "6자리 코드"}</p>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-[#f7fbf8] px-4 py-3">
            <p className="font-bold text-[#196c2e]">{en ? "Page Menu" : "페이지 메뉴"}</p>
            <p className="text-[var(--kr-gov-text-secondary)]">{en ? "8-digit code" : "8자리 코드"}</p>
          </div>
        </div>

        {dirtyOrderRows.length > 0 ? (
          <CollectionResultPanel className="mb-4" description={en ? "Rows below still have unsaved sibling order changes." : "아래 행에는 아직 저장되지 않은 같은 부모 기준 정렬 변경이 남아 있습니다."} icon="pending_actions" title={en ? "Pending changes" : "저장 대기 변경"}>
            <div className="mt-2 flex flex-wrap gap-2">
              {dirtyOrderRows.slice(0, 8).map((node) => <span className="gov-chip bg-indigo-100 text-indigo-700" key={`order-${node.code}`}>{`${node.code} ${en ? "order" : "순서"}`}</span>)}
              {dirtyOrderRows.length > 8 ? <span className="gov-chip bg-slate-100 text-slate-700">+{dirtyOrderRows.length - 8}</span> : null}
            </div>
          </CollectionResultPanel>
        ) : null}

        <WarningPanel className="mb-4" title={en ? "Visibility rule" : "노출 규칙"}>
          {en
            ? "Sidebar or sitemap exposure is governed separately. This screen focuses on menu registration and sibling ordering."
            : "사이드바나 사이트맵 노출 정책은 별도 관리 대상으로 분리합니다. 이 화면은 메뉴 등록과 같은 부모 기준 정렬에 집중합니다."}
        </WarningPanel>

        {visibleNodes.length === 0 ? (
          <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] px-4 py-8 text-center text-sm text-[var(--kr-gov-text-secondary)]">
            {en ? "No menus matched the current search." : "현재 검색 조건에 맞는 메뉴가 없습니다."}
          </div>
        ) : renderNodes(filteredTreeData)}
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
// agent note: updated by FreeAgent Ultra
