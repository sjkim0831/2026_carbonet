import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { fetchSecurityMonitoringPage, readBootstrappedSecurityMonitoringPageData, type SecurityMonitoringPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { stringOf } from "../admin-system/adminSystemShared";
import { useMemo } from "react";

export function SecurityMonitoringMigrationPage() {
  const en = isEnglish();
  const initialPayload = useMemo(() => readBootstrappedSecurityMonitoringPageData(), []);
  const pageState = useAsyncValue<SecurityMonitoringPagePayload>(fetchSecurityMonitoringPage, [], {
    initialValue: initialPayload,
    skipInitialLoad: Boolean(initialPayload)
  });
  const page = pageState.value;
  const cards = (page?.securityMonitoringCards || []) as Array<Record<string, string>>;
  const targets = (page?.securityMonitoringTargets || []) as Array<Record<string, string>>;
  const ips = (page?.securityMonitoringIps || []) as Array<Record<string, string>>;
  const events = (page?.securityMonitoringEvents || []) as Array<Record<string, string>>;
  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Security Monitoring" : "보안 모니터링" }
      ]}
      title={en ? "Real-time Attack Monitoring" : "실시간 공격 현황"}
      subtitle={en ? "Review blocked rules, target URLs, top IPs, and incidents on one screen." : "차단 룰, 공격 대상 URL, 상위 IP, 인시던트 이벤트를 한 화면에서 확인합니다."}
    >
      {pageState.error ? <div className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{pageState.error}</div> : null}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6" data-help-id="security-monitoring-summary">
        {cards.map((card, idx) => <article className="gov-card" key={idx}><p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{card.title}</p><p className="mt-3 text-2xl font-black">{card.value}</p><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{card.description}</p></article>)}
      </section>
      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6 mb-6" data-help-id="security-monitoring-targets">
        <article className="gov-card"><h3 className="text-lg font-bold mb-4">{en ? "Top Target URLs" : "상위 공격 대상 URL"}</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="gov-table-header"><th className="px-4 py-3">URL</th><th className="px-4 py-3">RPS</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th><th className="px-4 py-3">{en ? "Applied Rule" : "적용 룰"}</th></tr></thead><tbody className="divide-y divide-gray-100">{targets.map((row, idx) => <tr key={idx}><td className="px-4 py-3 font-mono">{stringOf(row, "url")}</td><td className="px-4 py-3">{stringOf(row, "rps")}</td><td className="px-4 py-3">{stringOf(row, "status")}</td><td className="px-4 py-3">{stringOf(row, "rule")}</td></tr>)}</tbody></table></div></article>
        <article className="gov-card"><h3 className="text-lg font-bold mb-4">{en ? "Top Attack IPs" : "상위 공격 IP"}</h3><div className="space-y-3">{ips.map((row, idx) => <div className="rounded-lg border border-[var(--kr-gov-border-light)] p-4" key={idx}><div className="flex items-center justify-between gap-3"><strong className="font-mono">{stringOf(row, "ip")}</strong><span className="text-xs font-bold text-[var(--kr-gov-blue)]">{stringOf(row, "action")}</span></div><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(row, "country")} · {en ? "Requests" : "요청"} {stringOf(row, "requestCount")}</p></div>)}</div></article>
      </section>
      <section className="gov-card" data-help-id="security-monitoring-events"><h3 className="text-lg font-bold mb-4">{en ? "Recent Detection Events" : "최근 탐지 이벤트"}</h3><div className="space-y-4">{events.map((row, idx) => <div className="rounded-lg border border-[var(--kr-gov-border-light)] p-4" key={idx}><div className="flex items-center justify-between gap-3"><strong>{stringOf(row, "title")}</strong><span className="text-xs font-bold text-red-700">{stringOf(row, "severity")}</span></div><p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(row, "detail")}</p><p className="mt-2 text-xs text-gray-400">{stringOf(row, "detectedAt")}</p></div>)}</div></section>
    </AdminPageShell>
  );
}
