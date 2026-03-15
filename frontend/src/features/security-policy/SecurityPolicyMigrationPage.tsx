import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchSecurityPolicyPage, type SecurityPolicyPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";

export function SecurityPolicyMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<SecurityPolicyPagePayload>(fetchSecurityPolicyPage, []);
  const page = pageState.value;
  const cards = (page?.securityPolicySummary || []) as Array<Record<string, string>>;
  const rows = (page?.securityPolicyRows || []) as Array<Record<string, string>>;
  const playbooks = (page?.securityPolicyPlaybooks || []) as Array<Record<string, string>>;
  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Security Policy" : "보안 정책 관리" }
      ]}
      title={en ? "Security Policy Management" : "보안 정책 관리"}
      subtitle={en ? "Manage thresholds and automatic response rules for login, APIs, and admin access." : "로그인, 검색 API, 관리자 접근에 대한 임계치와 자동 대응 규칙을 관리합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {cards.map((card, idx) => <article className="gov-card" key={idx}><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p><p className="mt-3 text-2xl font-black">{card.value}</p><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{card.description}</p></article>)}
      </section>
      <section className="gov-card mb-6 p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)] flex items-center justify-between">
          <h3 className="text-lg font-bold">{en ? "Applied Policy List" : "적용 정책 목록"}</h3>
          <span className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Total" : "총"} <strong>{rows.length}</strong>{en ? "" : "건"}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Policy ID" : "정책 ID"}</th><th className="px-4 py-3">{en ? "Target URL" : "대상 URL"}</th><th className="px-4 py-3">{en ? "Policy Name" : "정책명"}</th><th className="px-4 py-3">{en ? "Threshold" : "기본 임계치"}</th><th className="px-4 py-3">Burst</th><th className="px-4 py-3">{en ? "Action" : "조치"}</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th><th className="px-4 py-3">{en ? "Updated At" : "수정일시"}</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => <tr key={idx}><td className="px-4 py-3 font-bold">{stringOf(row, "policyId")}</td><td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "targetUrl")}</td><td className="px-4 py-3">{stringOf(row, "policyName")}</td><td className="px-4 py-3">{stringOf(row, "threshold")}</td><td className="px-4 py-3">{stringOf(row, "burst")}</td><td className="px-4 py-3">{stringOf(row, "action")}</td><td className="px-4 py-3"><span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700">{stringOf(row, "status")}</span></td><td className="px-4 py-3 text-[var(--kr-gov-text-secondary)]">{stringOf(row, "updatedAt")}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {playbooks.map((item, idx) => <article className="gov-card" key={idx}><h3 className="text-lg font-bold">{stringOf(item, "title")}</h3><p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body")}</p></article>)}
      </section>
    </AdminPageShell>
  );
}
