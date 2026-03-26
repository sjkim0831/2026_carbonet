import { useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchBlocklistPage, type BlocklistPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

export function BlocklistMigrationPage() {
  const en = isEnglish();
  const search = new URLSearchParams(window.location.search);
  const [filters, setFilters] = useState({
    searchKeyword: search.get("searchKeyword") || "",
    blockType: search.get("blockType") || "",
    status: search.get("status") || ""
  });
  const [draft, setDraft] = useState(filters);
  const pageState = useAsyncValue<BlocklistPagePayload>(() => fetchBlocklistPage(filters), [filters.searchKeyword, filters.blockType, filters.status], {
    onSuccess(payload) {
      setDraft({
        searchKeyword: String(payload.searchKeyword || ""),
        blockType: String(payload.blockType || ""),
        status: String(payload.status || "")
      });
    }
  });
  const page = pageState.value;
  const summary = (page?.blocklistSummary || []) as Array<Record<string, string>>;
  const rows = (page?.blocklistRows || []) as Array<Record<string, string>>;
  const releaseQueue = (page?.blocklistReleaseQueue || []) as Array<Record<string, string>>;

  useEffect(() => {
    if (!page) {
      return;
    }
    logGovernanceScope("PAGE", "blocklist", {
      route: window.location.pathname,
      summaryCount: summary.length,
      rowCount: rows.length,
      releaseQueueCount: releaseQueue.length,
      blockType: filters.blockType,
      status: filters.status
    });
    logGovernanceScope("COMPONENT", "blocklist-table", {
      component: "blocklist-table",
      rowCount: rows.length,
      releaseQueueCount: releaseQueue.length
    });
  }, [filters.blockType, filters.status, page, releaseQueue.length, rows.length, summary.length]);

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Blocklist" : "차단 대상 관리" }
      ]}
      title={en ? "Blocklist Management" : "차단 대상 관리"}
      subtitle={en ? "Operate blocked IP, CIDR, account, and user-agent targets and review release queue." : "IP, CIDR, 계정, User-Agent 단위 차단 대상을 운영하고 해제 대기열을 점검합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}
      <section className="gov-card mb-6" data-help-id="blocklist-search">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={(event) => {
          event.preventDefault();
          logGovernanceScope("ACTION", "blocklist-search", {
            searchKeyword: draft.searchKeyword,
            blockType: draft.blockType,
            status: draft.status
          });
          setFilters(draft);
        }}>
          <input className="gov-input" placeholder={en ? "Keyword" : "검색어"} value={draft.searchKeyword} onChange={(event) => setDraft((current) => ({ ...current, searchKeyword: event.target.value }))} />
          <select className="gov-select" value={draft.blockType} onChange={(event) => setDraft((current) => ({ ...current, blockType: event.target.value }))}><option value="">{en ? "All Types" : "전체 유형"}</option><option value="IP">IP</option><option value="CIDR">CIDR</option><option value="ACCOUNT">{en ? "Account" : "계정"}</option><option value="UA">User-Agent</option></select>
          <div className="flex gap-2"><select className="gov-select" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}><option value="">{en ? "All Status" : "전체 상태"}</option><option value="ACTIVE">ACTIVE</option><option value="PENDING">PENDING</option><option value="RELEASED">RELEASED</option></select><button className="gov-btn gov-btn-primary" type="submit">{en ? "Search" : "조회"}</button></div>
        </form>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">{summary.map((card, idx) => <article className="gov-card" key={idx}><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p><p className="mt-3 text-2xl font-black">{card.value}</p><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{card.description}</p></article>)}</section>
      <section className="gov-card mb-6 p-0 overflow-hidden" data-help-id="blocklist-table"><div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]"><h3 className="text-lg font-bold">{en ? "Blocked Targets" : "차단 정책 적용 대상"}</h3></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Block ID" : "차단 ID"}</th><th className="px-4 py-3">{en ? "Target" : "대상"}</th><th className="px-4 py-3">{en ? "Type" : "유형"}</th><th className="px-4 py-3">{en ? "Reason" : "사유"}</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th><th className="px-4 py-3">{en ? "Expires" : "만료"}</th><th className="px-4 py-3">{en ? "Owner" : "등록 주체"}</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row, idx) => <tr key={idx}><td className="px-4 py-3 font-bold">{stringOf(row, "blockId")}</td><td className="px-4 py-3 font-mono">{stringOf(row, "target")}</td><td className="px-4 py-3">{stringOf(row, "blockType")}</td><td className="px-4 py-3">{stringOf(row, "reason")}</td><td className="px-4 py-3">{stringOf(row, "status")}</td><td className="px-4 py-3">{stringOf(row, "expiresAt")}</td><td className="px-4 py-3">{stringOf(row, "owner")}</td></tr>)}</tbody></table></div></section>
      <section className="gov-card" data-help-id="blocklist-release-queue"><h3 className="text-lg font-bold mb-4">{en ? "Release Queue" : "해제 대기열"}</h3><div className="space-y-3">{releaseQueue.map((row, idx) => <div className="rounded-lg border border-[var(--kr-gov-border-light)] p-4" key={idx}><div className="flex items-center justify-between gap-3"><strong className="font-mono">{stringOf(row, "target")}</strong><span className="text-sm">{stringOf(row, "releaseAt")}</span></div><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(row, "condition")}</p></div>)}</div></section>
    </AdminPageShell>
  );
}
