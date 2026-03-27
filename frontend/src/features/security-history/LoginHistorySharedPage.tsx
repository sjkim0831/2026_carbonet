import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { type LoginHistoryPagePayload } from "../../lib/api/client";
import { stringOf } from "../admin-system/adminSystemShared";
import { MemberPagination } from "../member/common";

type Filters = {
  pageIndex: number;
  searchKeyword: string;
  userSe: string;
  loginResult: string;
  insttId: string;
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
  variant?: "login" | "blocked";
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

function syncLoginHistoryQuery(filters: Filters, fixedLoginResult?: string) {
  const search = new URLSearchParams();
  if (filters.pageIndex > 1) search.set("pageIndex", String(filters.pageIndex));
  if (filters.searchKeyword) search.set("searchKeyword", filters.searchKeyword);
  if (filters.userSe) search.set("userSe", filters.userSe);
  if (!fixedLoginResult && filters.loginResult) search.set("loginResult", filters.loginResult);
  if (filters.insttId) search.set("insttId", filters.insttId);
  const nextUrl = `${window.location.pathname}${search.toString() ? `?${search.toString()}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
}

export function LoginHistorySharedPage(props: Props) {
  const en = isEnglish();
  const blockedMode = props.variant === "blocked";
  const initial = useMemo<Filters>(() => {
    const search = new URLSearchParams(window.location.search);
    return {
      pageIndex: Number(search.get("pageIndex") || "1") || 1,
      searchKeyword: search.get("searchKeyword") || "",
      userSe: search.get("userSe") || "",
      loginResult: props.fixedLoginResult || search.get("loginResult") || "",
      insttId: search.get("insttId") || ""
    };
  }, [props.fixedLoginResult]);
  const [filters, setFilters] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [selectedRowKey, setSelectedRowKey] = useState<string>("");
  const pageState = useAsyncValue<LoginHistoryPagePayload>(() => props.fetchPage(filters), [filters.pageIndex, filters.searchKeyword, filters.userSe, filters.loginResult, filters.insttId], {
    onSuccess(payload) {
      const next = {
        pageIndex: Number(payload.pageIndex || 1),
        searchKeyword: String(payload.searchKeyword || ""),
        userSe: String(payload.userSe || ""),
        loginResult: props.fixedLoginResult || String(payload.loginResult || ""),
        insttId: String(payload.selectedInsttId || "")
      };
      setDraft(next);
      syncLoginHistoryQuery(next, props.fixedLoginResult);
    }
  });
  const page = pageState.value;
  const rows = (page?.loginHistoryList || []) as Array<Record<string, unknown>>;
  const companyOptions = (page?.companyOptions || []) as Array<Record<string, string>>;
  const totalPages = Number(page?.totalPages || 1);
  const currentPage = Number(page?.pageIndex || 1);
  const totalCount = Number(page?.totalCount || 0);
  const successCount = rows.filter((item) => stringOf(item, "loginResult") === "SUCCESS").length;
  const failCount = rows.filter((item) => stringOf(item, "loginResult") === "FAIL").length;
  const uniqueIpCount = new Set(rows.map((item) => stringOf(item, "loginIp")).filter(Boolean)).size;
  const uniqueUserCount = new Set(rows.map((item) => stringOf(item, "userId")).filter(Boolean)).size;
  const userSeSummary = rows.reduce<Record<string, number>>((summary, item) => {
    const key = stringOf(item, "userSe");
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});
  const selectedRow = rows.find((item, index) => `${stringOf(item, "histId", "userId")}-${index}` === selectedRowKey) || null;
  const selectedRowCompany = selectedRow ? stringOf(selectedRow, "companyName") : "";

  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "login-history-shared", {
      route: window.location.pathname,
      title: en ? props.titleEn : props.titleKo,
      rowCount: rows.length,
      currentPage,
      totalPages,
      userSe: filters.userSe,
      loginResult: filters.loginResult,
      insttId: filters.insttId
    });
    logGovernanceScope("COMPONENT", "login-history-table", {
      component: "login-history-table",
      rowCount: rows.length,
      fixedLoginResult: props.fixedLoginResult || ""
    });
  }, [currentPage, en, filters.insttId, filters.loginResult, filters.userSe, page, props.fixedLoginResult, props.titleEn, props.titleKo, rows.length, totalPages]);

  useEffect(() => {
    setSelectedRowKey("");
  }, [currentPage, filters.insttId, filters.loginResult, filters.searchKeyword, filters.userSe]);

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
      {blockedMode ? (
        <section className="gov-card mb-6 border border-amber-200 bg-[linear-gradient(135deg,rgba(255,251,235,0.95),rgba(255,255,255,0.98))]" data-help-id="member-security-guidance">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h3 className="text-lg font-bold">{en ? "Blocked Access Review" : "차단 접근 검토"}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">
                {en
                  ? "Use this page to review blocked member access, repeated fail messages, and company scope together before unblocking or resetting credentials."
                  : "회원 차단 이력, 반복 실패 메시지, 회원사 범위를 함께 확인한 뒤 차단 해제나 비밀번호 초기화를 판단하는 화면입니다."}
              </p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-white px-4 py-3 text-sm text-amber-800">
              {en ? "Review order: member -> company -> IP -> message -> follow-up action" : "검토 순서: 사용자 -> 회원사 -> IP -> 메시지 -> 후속 조치"}
            </div>
          </div>
        </section>
      ) : null}
      <section className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="gov-card">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Blocked Logs" : "차단 이력") : (en ? "Visible Logs" : "조회 건수")}</p>
          <p className="mt-3 text-3xl font-black text-[var(--kr-gov-blue)]">{totalCount.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Current blocked result count" : "현재 차단 결과 건수") : (en ? "Current filter result count" : "현재 필터 기준 결과 건수")}</p>
        </article>
        <article className="gov-card">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Blocked Users" : "차단 사용자") : (en ? "Success / Fail" : "성공 / 실패")}</p>
          <p className={`mt-3 text-3xl font-black ${blockedMode ? "text-red-600" : "text-emerald-600"}`}>{blockedMode ? uniqueUserCount.toLocaleString() : <>{successCount}<span className="mx-2 text-gray-300">/</span><span className="text-red-600">{failCount}</span></>}</p>
          <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Distinct blocked user IDs on this page" : "현재 페이지의 고유 차단 사용자 수") : (en ? "Counts on this page" : "현재 페이지 기준 집계")}</p>
        </article>
        <article className="gov-card">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Blocked IPs" : "차단 IP") : (en ? "Unique IPs" : "고유 IP")}</p>
          <p className="mt-3 text-3xl font-black text-amber-600">{uniqueIpCount.toLocaleString()}</p>
          <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Distinct source IPs behind blocked rows" : "차단 이력에 포함된 고유 IP 수") : (en ? "Distinct client IPs on this page" : "현재 페이지의 중복 제거 IP 수")}</p>
        </article>
        <article className="gov-card">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Blocked Scope" : "차단 범위") : (en ? "User Scope" : "사용자 구분")}</p>
          <p className="mt-3 text-xl font-black text-slate-800">
            {`${en ? "Admin" : "관리자"} ${userSeSummary.USR || 0} · ${en ? "Enterprise" : "기업"} ${userSeSummary.ENT || 0} · ${en ? "General" : "일반"} ${userSeSummary.GNR || 0}`}
          </p>
          <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Blocked row distribution on this page" : "현재 페이지의 차단 사용자 분포") : (en ? "Distribution on this page" : "현재 페이지 분포")}</p>
        </article>
      </section>
      <section className="gov-card mb-6" data-help-id="login-history-search">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(event) => {
          event.preventDefault();
          logGovernanceScope("ACTION", "login-history-search", {
            searchKeyword: draft.searchKeyword,
            userSe: draft.userSe,
            loginResult: draft.loginResult || props.fixedLoginResult || "",
            insttId: draft.insttId
          });
          setFilters({ ...draft, pageIndex: 1 });
        }}>
          {Boolean(page?.canManageAllCompanies) ? (
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2" htmlFor="insttId">회원사</label>
              <select className="gov-select" id="insttId" value={draft.insttId} onChange={(event) => setDraft((current) => ({ ...current, insttId: event.target.value }))}>
                <option value="">전체 회원사</option>
                {companyOptions.map((option, index) => {
                  const value = stringOf(option, "value", "insttId");
                  const label = stringOf(option, "cmpnyNm", "label", "insttNm", "insttName", "value", "insttId");
                  return <option key={`${value}-${index}`} value={value}>{label || value}</option>;
                })}
              </select>
            </div>
          ) : <div />}
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
              <button className="gov-btn gov-btn-secondary" onClick={() => {
                const reset = { pageIndex: 1, searchKeyword: "", userSe: "", loginResult: props.fixedLoginResult || "", insttId: "" };
                setDraft(reset);
                setFilters(reset);
              }} type="button">{en ? "Reset" : "초기화"}</button>
            </div>
          </div>
        </form>
      </section>
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.8fr)_380px]">
      <section className="gov-card p-0 overflow-hidden" data-help-id="login-history-table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-6 py-4 text-center w-16">{en ? "No." : "번호"}</th>
                <th className="px-6 py-4">{en ? "Logged In At" : props.fixedLoginResult ? "차단 일시" : "로그인 일시"}</th>
                {!props.fixedLoginResult ? <th className="px-6 py-4">{en ? "Result" : "결과"}</th> : null}
                <th className="px-6 py-4">{en ? "User Type" : "사용자 구분"}</th>
                <th className="px-6 py-4">{en ? "Company" : "회원사"}</th>
                <th className="px-6 py-4">{en ? "Name (ID)" : "이름 (아이디)"}</th>
                <th className="px-6 py-4">IP</th>
                <th className="px-6 py-4">{en ? "Note" : props.fixedLoginResult ? "차단 사유" : "비고"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td className="px-6 py-8 text-center text-gray-500" colSpan={props.fixedLoginResult ? 7 : 8}>{en ? "No history found." : "조회된 이력이 없습니다."}</td></tr>
              ) : rows.map((item, index) => {
                const rowNo = Number(page?.totalCount || 0) - ((currentPage - 1) * Number(page?.pageSize || 10) + index);
                const result = stringOf(item, "loginResult");
                const rowKey = `${stringOf(item, "histId", "userId")}-${index}`;
                const highlighted = result === "FAIL" && !props.fixedLoginResult;
                return (
                  <tr className={`cursor-pointer transition-colors ${selectedRowKey === rowKey ? "bg-blue-50" : highlighted ? "bg-red-50/40 hover:bg-red-50/60" : "hover:bg-gray-50/50"}`} key={rowKey} onClick={() => setSelectedRowKey(rowKey)}>
                    <td className="px-6 py-4 text-center text-gray-500">{rowNo}</td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "loginPnttm")}</td>
                    {!props.fixedLoginResult ? <td className="px-6 py-4"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${resultBadge(result)}`}>{result === "SUCCESS" ? (en ? "Success" : "성공") : (en ? "Fail" : "실패")}</span></td> : null}
                    <td className="px-6 py-4">{userSeLabel(stringOf(item, "userSe"), en)}</td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "companyName") || "-"}</td>
                    <td className="px-6 py-4"><div className="font-semibold">{stringOf(item, "userNm") || "-"}</div><div className="text-xs text-gray-400">{stringOf(item, "userId") || "-"}</div></td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "loginIp")}</td>
                    <td className="px-6 py-4 text-gray-600">{stringOf(item, "loginMessage") || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <MemberPagination currentPage={currentPage} onPageChange={(pageNumber) => setFilters((current) => ({ ...current, pageIndex: pageNumber }))} totalPages={totalPages} />
      </section>
      <aside className="gov-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">{blockedMode ? (en ? "Block Detail" : "차단 상세") : (en ? "Detail" : "상세 정보")}</h3>
            <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{blockedMode ? (en ? "Select a blocked row to review company, source IP, and lock message before follow-up action." : "차단 행을 선택해 회원사, 원본 IP, 잠금 메시지를 확인한 뒤 후속 조치를 판단합니다.") : (en ? "Select a row to inspect user, company, IP, and message together." : "행을 선택하면 사용자, 회원사, IP, 메시지를 함께 확인합니다.")}</p>
          </div>
          {selectedRow ? <button className="text-sm font-bold text-[var(--kr-gov-blue)]" onClick={() => setSelectedRowKey("")} type="button">{en ? "Clear" : "해제"}</button> : null}
        </div>
        {selectedRow ? (
          <div className="mt-5 space-y-4 text-sm">
            <div className="rounded-lg border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Result" : "결과"}</p>
              <div className="mt-2 flex items-center gap-2">
                {!props.fixedLoginResult ? <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${resultBadge(stringOf(selectedRow, "loginResult"))}`}>{stringOf(selectedRow, "loginResult") === "SUCCESS" ? (en ? "Success" : "성공") : (en ? "Fail" : "실패")}</span> : null}
                <span className="text-[var(--kr-gov-text-secondary)]">{stringOf(selectedRow, "loginPnttm") || "-"}</span>
              </div>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "User" : "사용자"}</dt>
                <dd className="mt-1 font-semibold">{stringOf(selectedRow, "userNm") || "-"}</dd>
                <dd className="text-xs text-gray-500">{stringOf(selectedRow, "userId") || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "User Type" : "사용자 구분"}</dt>
                <dd className="mt-1">{userSeLabel(stringOf(selectedRow, "userSe"), en)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Company" : "회원사"}</dt>
                <dd className="mt-1">{selectedRowCompany || "-"}</dd>
                <dd className="text-xs text-gray-500">{stringOf(selectedRow, "insttId") || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">IP</dt>
                <dd className="mt-1 font-mono">{stringOf(selectedRow, "loginIp") || "-"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Note" : props.fixedLoginResult ? "차단 사유" : "비고"}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words leading-6">{stringOf(selectedRow, "loginMessage") || "-"}</dd>
              </div>
            </dl>
            {stringOf(selectedRow, "loginResult") === "FAIL" ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {en ? "Repeated fail rows should be reviewed with the source IP and member company together." : "실패 이력은 원본 IP와 회원사 범위를 함께 확인한 뒤 추가 차단 여부를 검토해야 합니다."}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-[var(--kr-gov-border-light)] px-4 py-10 text-center text-sm text-[var(--kr-gov-text-secondary)]">
            {en ? "No row selected yet." : "아직 선택된 이력이 없습니다."}
          </div>
        )}
      </aside>
      </section>
    </AdminPageShell>
  );
}
