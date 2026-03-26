import { useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { type IpWhitelistPagePayload, fetchIpWhitelistPage } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

type Filters = {
  searchIp: string;
  accessScope: string;
  status: string;
};

function statusBadgeClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

export function IpWhitelistMigrationPage() {
  const en = isEnglish();
  const query = new URLSearchParams(window.location.search);
  const [filters, setFilters] = useState<Filters>({
    searchIp: query.get("searchIp") || "",
    accessScope: query.get("accessScope") || "",
    status: query.get("status") || ""
  });
  const [draft, setDraft] = useState(filters);
  const pageState = useAsyncValue<IpWhitelistPagePayload>(() => fetchIpWhitelistPage(filters), [filters.searchIp, filters.accessScope, filters.status], {
    onSuccess(payload) {
      setDraft({
        searchIp: String(payload.searchIp || ""),
        accessScope: String(payload.accessScope || ""),
        status: String(payload.status || "")
      });
    }
  });
  const page = pageState.value;
  const summary = (page?.ipWhitelistSummary || []) as Array<Record<string, string>>;
  const rows = (page?.ipWhitelistRows || []) as Array<Record<string, string>>;
  const requests = (page?.ipWhitelistRequestRows || []) as Array<Record<string, string>>;

  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "ip-whitelist", {
      route: window.location.pathname,
      summaryCount: summary.length,
      rowCount: rows.length,
      requestCount: requests.length,
      accessScope: filters.accessScope,
      status: filters.status
    });
    logGovernanceScope("COMPONENT", "ip-whitelist-table", {
      component: "ip-whitelist-table",
      rowCount: rows.length,
      requestCount: requests.length
    });
  }, [filters.accessScope, filters.status, page, requests.length, rows.length, summary.length]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Environment" : "환경" },
        { label: en ? "IP Whitelist" : "IP 화이트리스트" }
      ]}
      title={en ? "IP Whitelist" : "IP 화이트리스트"}
      subtitle={en ? "Manage allowlist policies and approval requests for admin, batch, and integration access." : "관리자, 배치, 연계 API 접근에 허용된 IP 정책과 승인 요청을 함께 관리합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6" data-help-id="ip-whitelist-summary">
        {summary.map((card, index) => (
          <article className="gov-card" key={`${card.title || card.value}-${index}`}>
            <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p>
            <p className="text-2xl font-black mt-3">{card.value}</p>
            <p className="text-sm text-[var(--kr-gov-text-secondary)] mt-2">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="gov-card mb-6" data-help-id="ip-whitelist-search">
        <div className="flex items-center gap-2 border-b pb-4 mb-4">
          <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">shield_with_house</span>
          <h3 className="text-lg font-bold">{en ? "Allowlist Search" : "허용 정책 조회"}</h3>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(event) => {
          event.preventDefault();
          logGovernanceScope("ACTION", "ip-whitelist-search", {
            searchIp: draft.searchIp,
            accessScope: draft.accessScope,
            status: draft.status
          });
          setFilters(draft);
        }}>
          <div>
            <label className="gov-label" htmlFor="searchIp">{en ? "IP or Description" : "IP 또는 설명"}</label>
            <input className="gov-input" id="searchIp" placeholder={en ? "e.g., 203.248 or operations center" : "예: 203.248 또는 운영센터"} value={draft.searchIp} onChange={(event) => setDraft((current) => ({ ...current, searchIp: event.target.value }))} />
          </div>
          <div>
            <label className="gov-label" htmlFor="accessScope">{en ? "Access Scope" : "접근 범위"}</label>
            <select className="gov-select" id="accessScope" value={draft.accessScope} onChange={(event) => setDraft((current) => ({ ...current, accessScope: event.target.value }))}>
              <option value="">{en ? "All" : "전체"}</option>
              <option value="ADMIN">ADMIN</option>
              <option value="BATCH">BATCH</option>
              <option value="INTERNAL">INTERNAL</option>
              <option value="API">API</option>
            </select>
          </div>
          <div>
            <label className="gov-label" htmlFor="status">{en ? "Status" : "상태"}</label>
            <select className="gov-select" id="status" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
              <option value="">{en ? "All" : "전체"}</option>
              <option value="ACTIVE">{en ? "Active" : "활성"}</option>
              <option value="PENDING">{en ? "Pending" : "검토중"}</option>
              <option value="INACTIVE">{en ? "Inactive" : "비활성"}</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="gov-btn gov-btn-primary w-full" type="submit">{en ? "Search" : "조회"}</button>
            <button className="gov-btn gov-btn-outline w-full" onClick={() => {
              const reset = { searchIp: "", accessScope: "", status: "" };
              logGovernanceScope("ACTION", "ip-whitelist-reset", reset);
              setDraft(reset);
              setFilters(reset);
            }} type="button">{en ? "Reset" : "초기화"}</button>
          </div>
        </form>
      </section>

      <section className="gov-card mb-6" data-help-id="ip-whitelist-table">
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">vpn_lock</span>
            <h3 className="text-lg font-bold">{en ? "Applied Whitelist" : "적용 중인 화이트리스트"}</h3>
          </div>
          <span className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Results" : "검색 결과"} <strong>{rows.length}</strong>{en ? "" : "건"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3">{en ? "Rule ID" : "규칙 ID"}</th>
                <th className="px-4 py-3">{en ? "IP / Range" : "IP / 대역"}</th>
                <th className="px-4 py-3">{en ? "Access Scope" : "접근 범위"}</th>
                <th className="px-4 py-3">{en ? "Description" : "설명"}</th>
                <th className="px-4 py-3">{en ? "Owner" : "담당 조직"}</th>
                <th className="px-4 py-3">{en ? "Status" : "상태"}</th>
                <th className="px-4 py-3">{en ? "Last Applied" : "최근 반영"}</th>
                <th className="px-4 py-3">{en ? "Memo" : "비고"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={8}>{en ? "No matching policies." : "조건에 맞는 허용 정책이 없습니다."}</td></tr>
              ) : rows.map((row) => {
                const status = stringOf(row, "status");
                return (
                  <tr key={stringOf(row, "ruleId")}>
                    <td className="px-4 py-3 font-bold">{stringOf(row, "ruleId")}</td>
                    <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "ipAddress")}</td>
                    <td className="px-4 py-3">{stringOf(row, "accessScope")}</td>
                    <td className="px-4 py-3">{stringOf(row, en ? "descriptionEn" : "description")}</td>
                    <td className="px-4 py-3">{stringOf(row, en ? "ownerEn" : "owner")}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${statusBadgeClass(status)}`}>{status}</span></td>
                    <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "updatedAt")}</td>
                    <td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, en ? "memoEn" : "memo")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.9fr] gap-6">
        <article className="gov-card" data-help-id="ip-whitelist-requests">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">approval</span>
            <h3 className="text-lg font-bold">{en ? "Approval Requests" : "승인 요청 현황"}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="gov-table-header">
                  <th className="px-4 py-3">{en ? "Request ID" : "요청번호"}</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">{en ? "Scope" : "범위"}</th>
                  <th className="px-4 py-3">{en ? "Reason" : "사유"}</th>
                  <th className="px-4 py-3">{en ? "Status" : "상태"}</th>
                  <th className="px-4 py-3">{en ? "Requested At" : "요청일시"}</th>
                  <th className="px-4 py-3">{en ? "Requester" : "요청자"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((row) => (
                  <tr key={stringOf(row, "requestId")}>
                    <td className="px-4 py-3 font-bold">{stringOf(row, "requestId")}</td>
                    <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "ipAddress")}</td>
                    <td className="px-4 py-3">{stringOf(row, "accessScope")}</td>
                    <td className="px-4 py-3">{stringOf(row, en ? "reasonEn" : "reason")}</td>
                    <td className="px-4 py-3">{stringOf(row, en ? "approvalStatusEn" : "approvalStatus")}</td>
                    <td className="px-4 py-3">{stringOf(row, "requestedAt")}</td>
                    <td className="px-4 py-3">{stringOf(row, en ? "requesterEn" : "requester")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="gov-card">
          <div className="flex items-center gap-2 border-b pb-4 mb-4">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">task_alt</span>
            <h3 className="text-lg font-bold">{en ? "Operational Checkpoints" : "운영 체크포인트"}</h3>
          </div>
          <ul className="space-y-3 text-sm text-[var(--kr-gov-text-secondary)]">
            <li className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">{en ? "Review automatic revoke scheduling for temporary external access." : "외부 협력사 임시 허용은 종료일 기준 자동 회수 여부를 함께 검토합니다."}</li>
            <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">{en ? "Check duplicate ranges before propagating gateway rules." : "게이트웨이 정책 반영 전 동일 대역 중복 등록 여부를 확인합니다."}</li>
            <li className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">{en ? "Validate firewall and certificate impacts when batch IPs change." : "배치 서버 고정 IP 변경 시 API 인증서와 방화벽 정책도 같이 점검합니다."}</li>
          </ul>
        </article>
      </section>
    </AdminPageShell>
  );
}
