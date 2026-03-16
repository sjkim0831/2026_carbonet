import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchMenuManagementPage, type MenuManagementPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, getCsrfMeta, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { numberOf, stringOf } from "../admin-system/adminSystemShared";
import { toDisplayMenuUrl } from "./menuUrlDisplay";

type MenuNode = {
  code: string;
  label: string;
  url: string;
  icon: string;
  useAt: string;
  sortOrdr: number;
  children: MenuNode[];
};

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

export function MenuManagementMigrationPage() {
  const en = isEnglish();
  const [menuType, setMenuType] = useState(new URLSearchParams(window.location.search).get("menuType") || "ADMIN");
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const pageState = useAsyncValue<MenuManagementPagePayload>(() => fetchMenuManagementPage(menuType), [menuType]);
  const page = pageState.value;
  const [treeData, setTreeData] = useState<MenuNode[]>([]);
  const [parentCodeValue, setParentCodeValue] = useState("");
  const [codeNm, setCodeNm] = useState("");
  const [codeDc, setCodeDc] = useState("");
  const [menuUrl, setMenuUrl] = useState("");
  const [menuIcon, setMenuIcon] = useState("web");
  const [useAt, setUseAt] = useState("Y");

  const rows = useMemo(() => (page?.menuRows || []) as Array<Record<string, unknown>>, [page?.menuRows]);
  const menuTypes = ((page?.menuTypes || []) as Array<Record<string, unknown>>);
  const groupMenuOptions = ((page?.groupMenuOptions || []) as Array<Record<string, string>>);
  const iconOptions = ((page?.iconOptions || []) as string[]);
  const useAtOptions = ((page?.useAtOptions || []) as string[]);

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
    setCodeNm("");
    setCodeDc("");
    setMenuUrl("");
    setMenuIcon(iconOptions[0] || "web");
    setUseAt(useAtOptions[0] || "Y");
    setParentCodeValue(stringOf(groupMenuOptions[0], "value"));
  }, [menuType]); // reset form when switching scope

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
    setActionError("");
    setActionMessage("");
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    body.set("orderPayload", flattenPayload(treeData).join(","));
    const { token, headerName } = getCsrfMeta();
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
    if (token) {
      headers[headerName] = token;
    }
    const response = await fetch(buildLocalizedPath("/admin/system/menu-management/order", "/en/admin/system/menu-management/order"), {
      method: "POST",
      credentials: "include",
      headers,
      body: body.toString()
    });
    if (!response.ok) {
      throw new Error(`Failed to save menu order: ${response.status}`);
    }
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
    const body = new URLSearchParams();
    body.set("menuType", menuType);
    body.set("parentCode", parentCodeValue);
    body.set("codeNm", codeNm);
    body.set("codeDc", codeDc);
    body.set("menuUrl", menuUrl);
    body.set("menuIcon", menuIcon);
    body.set("useAt", useAt);
    const { token, headerName } = getCsrfMeta();
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" };
    if (token) {
      headers[headerName] = token;
    }
    const response = await fetch(buildLocalizedPath("/admin/system/menu-management/create-page", "/en/admin/system/menu-management/create-page"), {
      method: "POST",
      credentials: "include",
      headers,
      body: body.toString()
    });
    const responseBody = await response.json() as { success?: boolean; message?: string; createdCode?: string; };
    if (!response.ok || !responseBody.success) {
      throw new Error(responseBody.message || `Failed to create page menu: ${response.status}`);
    }
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
          return (
            <li key={node.code}>
              <div className="gov-tree-node">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="material-symbols-outlined text-[20px] text-[var(--kr-gov-blue)]">{node.icon}</span>
                      <strong className="text-base">{node.label}</strong>
                      <span className={`gov-chip ${chipClass}`}>{node.code}</span>
                      <span className={`gov-chip ${node.useAt === "Y" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{node.useAt === "Y" ? (en ? "Use" : "사용") : (en ? "Unused" : "미사용")}</span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)] break-all">{node.url || (en ? "No linked URL" : "연결 URL 없음")}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="gov-btn gov-btn-outline" disabled={index === 0} onClick={() => updateLevel(currentPath, -1)} type="button">{en ? "Up" : "위로"}</button>
                    <button className="gov-btn gov-btn-outline" disabled={index === nodes.length - 1} onClick={() => updateLevel(currentPath, 1)} type="button">{en ? "Down" : "아래로"}</button>
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
        { label: en ? "Environment" : "환경" },
        { label: en ? "Menu Management" : "메뉴 관리" }
      ]}
      title={en ? "Menu Management" : "메뉴 관리"}
      subtitle={en ? "Review menu hierarchy for home and admin screens and reorder within the same parent." : "홈과 관리자 메뉴 계층을 같은 기준으로 확인하고, 같은 레벨 안에서 순서를 조정합니다."}
    >
      {page?.menuMgmtMessage || actionMessage ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{actionMessage || String(page?.menuMgmtMessage)}</div> : null}
      {pageState.error || actionError || page?.menuMgmtError ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError || page?.menuMgmtError || pageState.error}</div> : null}

      <section className="gov-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] gap-4 items-end">
          <div>
            <label className="gov-label" htmlFor="menuType">{en ? "Page Scope" : "화면 구분"}</label>
            <select className="gov-select" id="menuType" value={menuType} onChange={(event) => setMenuType(event.target.value)}>
              {menuTypes.map((type) => (
                <option key={stringOf(type, "value")} value={stringOf(type, "value")}>{stringOf(type, "label")}</option>
              ))}
            </select>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
            {en ? "Only sibling menus under the same parent can move up or down. Saving updates the home menu and the admin sidebar in the same order." : "같은 부모 메뉴 아래에서만 위/아래 이동이 가능합니다. 저장 후 홈 메뉴와 관리자 좌측 메뉴에도 같은 순서가 반영됩니다."}
          </div>
        </div>
      </section>

      <section className="gov-card mb-6">
        <div className="flex items-center justify-between gap-4 border-b pb-4 mb-4 flex-wrap">
          <div>
            <h3 className="text-lg font-bold">{en ? "Quick Page Registration" : "빠른 페이지 등록"}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{String(page?.menuMgmtGuide || "")}</p>
          </div>
          <div className="rounded-[var(--kr-gov-radius)] border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
            {String(page?.siteMapMgmtGuide || "")}
          </div>
        </div>

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
      </section>

      <section className="gov-card">
        <div className="flex items-center justify-between gap-4 border-b pb-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">account_tree</span>
            <h3 className="text-lg font-bold">{en ? "Menu Tree" : "메뉴 트리"}</h3>
          </div>
          <button className="gov-btn gov-btn-primary" onClick={() => { void saveOrder().catch((error: Error) => setActionError(error.message)); }} type="button">{en ? "Save Order" : "순서 저장"}</button>
        </div>

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

        {renderNodes(treeData)}
      </section>
    </AdminPageShell>
  );
}
