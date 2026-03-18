import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchSecurityAuditPage, readBootstrappedSecurityAuditPageData, type SecurityAuditPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";
import { useMemo } from "react";

export function SecurityAuditMigrationPage() {
  const en = isEnglish();
  const initialPayload = useMemo(() => readBootstrappedSecurityAuditPageData(), []);
  const pageState = useAsyncValue<SecurityAuditPagePayload>(fetchSecurityAuditPage, [], {
    initialValue: initialPayload,
    skipInitialLoad: Boolean(initialPayload)
  });
  const page = pageState.value;
  const summary = (page?.securityAuditSummary || []) as Array<Record<string, string>>;
  const rows = (page?.securityAuditRows || []) as Array<Record<string, string>>;
  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Security Audit" : "보안 감사 로그" }
      ]}
      title={en ? "Security Audit Log" : "보안 감사 로그"}
      subtitle={en ? "Track policy changes, exception approvals, and manual release actions." : "보안 정책 변경, 예외 승인, 수동 차단 해제 같은 운영 행위를 추적합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6" data-help-id="security-audit-summary">{summary.map((card, idx) => <article className="gov-card" key={idx}><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p><p className="mt-3 text-2xl font-black">{card.value}</p><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{card.description}</p></article>)}</section>
      <section className="gov-card p-0 overflow-hidden" data-help-id="security-audit-table"><div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]"><h3 className="text-lg font-bold">{en ? "Recent Audit Logs" : "최근 감사 로그"}</h3></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Time" : "시각"}</th><th className="px-4 py-3">{en ? "Actor" : "수행자"}</th><th className="px-4 py-3">{en ? "Action" : "행위"}</th><th className="px-4 py-3">{en ? "Target" : "대상"}</th><th className="px-4 py-3">{en ? "Detail" : "상세"}</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((row, idx) => <tr key={idx}><td className="px-4 py-3">{stringOf(row, "auditAt")}</td><td className="px-4 py-3 font-bold">{stringOf(row, "actor")}</td><td className="px-4 py-3">{stringOf(row, "action")}</td><td className="px-4 py-3 font-mono">{stringOf(row, "target")}</td><td className="px-4 py-3">{stringOf(row, "detail")}</td></tr>)}</tbody></table></div></section>
    </AdminPageShell>
  );
}
