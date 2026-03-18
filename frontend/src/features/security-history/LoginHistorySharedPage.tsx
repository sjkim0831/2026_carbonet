import { useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { type LoginHistoryPagePayload } from "../../lib/api/client";
import { stringOf } from "../admin-system/adminSystemShared";

type Filters = {
  pageIndex: number;
  searchKeyword: string;
  userSe: string;
  loginResult: string;
};

type Props = {
  titleKo: string;
  titleEn: string;
  subtitleKo: string;
  subtitleEn: string;
  breadcrumbsKo: string[];
  breadcrumbsEn: string[];
  fetchPage: (params: Filters) => Promise<LoginHistoryPagePayload>;
  fixedLoginResult?: string;
};

function resultBadge(result: string) {
  return result === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700";
}

function userSeLabel(value: string, en: boolean) {
  switch (value) {
    case "USR":
      return en ? "Admin" : "관리자";
    case "ENT":
      return en ? "Enterprise" : "기업회원";
    case "GNR":
      return en ? "General" : "일반회원";
    default:
      return value || (en ? "Other" : "기타");
  }
}

export function LoginHistorySharedPage(props: Props) {
  const en = isEnglish();
  const initial = useMemo<Filters>(() => {
    const search = new URLSearchParams(window.location.search);
    return {
      pageIndex: Number(search.get("pageIndex") || "1") || 1,
      searchKeyword: search.get("searchKeyword") || "",
      userSe: search.get("userSe") || "",
      loginResult: props.fixedLoginResult || search.get("loginResult") || ""
    };
  }, [props.fixedLoginResult]);
  const [filters, setFilters] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const pageState = useAsyncValue<LoginHistoryPagePayload>(() => props.fetchPage(filters), [filters.pageIndex, filters.searchKeyword, filters.userSe, filters.loginResult], {
    onSuccess(payload) {
      const next = {
        pageIndex: Number(payload.pageIndex || 1),
        searchKeyword: String(payload.searchKeyword || ""),
        userSe: String(payload.userSe || ""),
        loginResult: props.fixedLoginResult || String(payload.loginResult || "")
      };
      setDraft(next);
    }
  });
  const page = pageState.value;
  const rows = (page?.loginHistoryList || []) as Array<Record<string, unknown>>;
  const totalPages = Number(page?.totalPages || 1);
  const currentPage = Number(page?.pageIndex || 1);
  const startPage = Number(page?.startPage || 1);
  const endPage = Number(page?.endPage || totalPages);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? props.breadcrumbsEn[0] : props.breadcrumbsKo[0], href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? props.breadcrumbsEn[1] : props.breadcrumbsKo[1] },
        { label: en ? props.breadcrumbsEn[2] : props.breadcrumbsKo[2] }
      ]}
      title={en ? props.titleEn : props.titleKo}
      subtitle={en ? props.subtitleEn : props.subtitleKo}
    >
      {page?.loginHistoryError || pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{page?.loginHistoryError || pageState.error}</div> : null}
      <div className="flex items-end justify-between mb-6">
        <div />
        <div className="text-sm">{en ? "Total" : "전체"} <span className="font-bold text-[var(--kr-gov-blue)]">{Number(page?.totalCount || 0).toLocaleString()}</span>{en ? "" : "건"}</div>
      </div>
      <section className="gov-card mb-6" data-help-id="login-history-search">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...draft, pageIndex: 1 });
        }}>
          <div>
            <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="userSe">{en ? "User Type" : "사용자 구분"}</label>
            <select className="gov-select" id="userSe" value={draft.userSe} onChange={(event) => setDraft((current) => ({ ...current, userSe: event.target.value }))}>
              <option value="">{en ? "All" : "전체"}</option>
              <option value="USR">{en ? "Admin" : "관리자"}</option>
              <option value="ENT">{en ? "Enterprise" : "기업회원"}</option>
              <option value="GNR">{en ? "General" : "일반회원"}</option>
            </select>
          </div>
          {!props.fixedLoginResult ? (
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="loginResult">{en ? "Result" : "결과"}</label>
              <select className="gov-select" id="loginResult" value={draft.loginResult} onChange={(event) => setDraft((current) => ({ ...current, loginResult: event.target.value }))}>
                <option value="">{en ? "All" : "전체"}</option>
                <option value="SUCCESS">{en ? "Success" : "성공"}</option>
                <option value="FAIL">{en ? "Fail" : "실패"}</option>
              </select>
            </div>
          ) : <div />}
          <div className="md:col-span-2">
            <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="searchKeyword">{en ? "Keyword" : "검색어"}</label>
            <div className="flex gap-2">
              <input className="gov-input flex-1" id="searchKeyword" placeholder={en ? "Search by ID, name, or IP" : "아이디, 이름, IP 검색"} value={draft.searchKeyword} onChange={(event) => setDraft((current) => ({ ...current, searchKeyword: event.target.value }))} />
              <button className="gov-btn gov-btn-primary" type="submit">{en ? "Search" : "검색"}</button>
            </div>
          </div>
        </form>
      </section>
      <section className="gov-card p-0 overflow-hidden" data-help-id="login-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-6 py-4 text-center w-16">{en ? "No." : "번호"}</th>
                <th className="px-6 py-4">{en ? "Logged In At" : props.fixedLoginResult ? "차단 일시" : "로그인 일시"}</th>
                {!props.fixedLoginResult ? <th className="px-6 py-4">{en ? "Result" : "결과"}</th> : null}
                <th className="px-6 py-4">{en ? "User Type" : "사용자 구분"}</th>
                <th className="px-6 py-4">{en ? "Name (ID)" : "이름 (아이디)"}</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">{en ? "Note" : props.fixedLoginResult ? "차단 사유" : "비고"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={props.fixedLoginResult ? 6 : 7}>{en ? "No history found." : "조회된 이력이 없습니다."}</td></tr>
              ) : rows.map((item, index) => {
                const rowNo = Number(page?.totalCount || 0) - ((currentPage - 1) * Number(page?.pageSize || 10) + index);
                const result = stringOf(item, "loginResult");
                return (
                  <tr className="hover:bg-gray-50/50 transition-colors" key={`${stringOf(item, "histId", "userId")}-${index}`}>
                    <td className="px-6 py-4 text-center text-gray-500">{rowNo}</td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "loginPnttm")}</td>
                    {!props.fixedLoginResult ? <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${resultBadge(result)}`}>{result === "SUCCESS" ? (en ? "Success" : "성공") : (en ? "Fail" : "실패")}</span></td> : null}
                    <td className="px-6 py-4">{userSeLabel(stringOf(item, "userSe"), en)}</td>
                    <td className="px-6 py-4"><div className="font-semibold">{stringOf(item, "userNm") || "-"}</div><div className="text-xs text-gray-400">{stringOf(item, "userId") || "-"}</div></td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "loginIp")}</td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "loginMessage") || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[var(--kr-gov-border-light)] bg-gray-50 flex justify-center">
          <nav className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage <= 1} onClick={() => setFilters((current) => ({ ...current, pageIndex: 1 }))} type="button"><span className="material-symbols-outlined">first_page</span></button>
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage <= 1} onClick={() => setFilters((current) => ({ ...current, pageIndex: Math.max(1, currentPage - 1) }))} type="button"><span className="material-symbols-outlined">chevron_left</span></button>
            <div className="flex items-center gap-1 mx-4">
              {Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, idx) => startPage + idx).map((pageNum) => (
                <button className={`w-8 h-8 rounded border border-transparent text-sm flex items-center justify-center ${pageNum === currentPage ? "bg-[var(--kr-gov-blue)] text-white font-bold" : "hover:bg-white hover:border-gray-200"}`} key={pageNum} onClick={() => setFilters((current) => ({ ...current, pageIndex: pageNum }))} type="button">{pageNum}</button>
              ))}
            </div>
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage >= totalPages} onClick={() => setFilters((current) => ({ ...current, pageIndex: Math.min(totalPages, currentPage + 1) }))} type="button"><span className="material-symbols-outlined">chevron_right</span></button>
            <button className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200" disabled={currentPage >= totalPages} onClick={() => setFilters((current) => ({ ...current, pageIndex: totalPages }))} type="button"><span className="material-symbols-outlined">last_page</span></button>
          </nav>
        </div>
      </section>
    </AdminPageShell>
  );
}
