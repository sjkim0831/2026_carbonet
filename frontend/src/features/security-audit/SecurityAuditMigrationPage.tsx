import { useMemo } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import {
  fetchSecurityAuditPage,
  readBootstrappedSecurityAuditPageData,
  type SecurityAuditPagePayload
} from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { AdminTable, MemberSectionToolbar } from "../member/common";

type SecurityAuditRow = Record<string, string>;
type SecurityAuditCard = Record<string, string>;

function stringOf(row: Record<string, unknown> | null | undefined, ...keys: string[]) {
  if (!row) {
    return "";
  }
  for (const key of keys) {
    const value = row[key];
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) {
        return text;
      }
    }
  }
  return "";
}

function classifyActionTone(action: string) {
  if (action.includes("차단") || action.toLowerCase().includes("blocked")) {
    return "bg-red-100 text-red-700";
  }
  if (action.includes("허용") || action.toLowerCase().includes("allowed")) {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}

function splitActor(actor: string) {
  const [identityPart = "", insttId = ""] = actor.split(" / ");
  const typeStart = identityPart.indexOf("(");
  const typeEnd = identityPart.lastIndexOf(")");
  if (typeStart >= 0 && typeEnd > typeStart) {
    return {
      actorId: identityPart.slice(0, typeStart).trim(),
      actorType: identityPart.slice(typeStart + 1, typeEnd).trim(),
      insttId: insttId.trim()
    };
  }
  return {
    actorId: identityPart.trim(),
    actorType: "",
    insttId: insttId.trim()
  };
}

function splitDetail(detail: string) {
  const tokens = detail.split(",").map((token) => token.trim()).filter(Boolean);
  return {
    actorScope: tokens[0] || "-",
    targetScope: tokens[1] || "-",
    contextMode: tokens[2] || "-",
    reason: tokens.slice(3).join(", ") || "-"
  };
}

export function SecurityAuditMigrationPage() {
  const en = isEnglish();
  const initialPayload = useMemo(() => readBootstrappedSecurityAuditPageData(), []);
  const pageState = useAsyncValue<SecurityAuditPagePayload>(fetchSecurityAuditPage, [], {
    initialValue: initialPayload,
    skipInitialLoad: Boolean(initialPayload)
  });
  const page = pageState.value;
  const error = pageState.error;
  const summary = (page?.securityAuditSummary || []) as SecurityAuditCard[];
  const rows = (page?.securityAuditRows || []) as SecurityAuditRow[];

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Security Audit" : "보안 감사" }
      ]}
      title={en ? "Security Audit Log" : "보안 감사 로그"}
      subtitle={en ? "Review company-scope control decisions and recent privileged operations." : "회사 스코프 통제 결과와 최근 권한성 운영 행위를 함께 점검합니다."}
      loading={pageState.loading && !page && !error}
      loadingLabel={en ? "Loading security audit logs." : "보안 감사 로그를 불러오는 중입니다."}
    >
      {error ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{en ? "Failed to load security audit logs: " : "조회 중 오류: "}{error}</p>
        </section>
      ) : null}

      <div className="gov-card mb-8" data-help-id="security-audit-summary">
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
          <MemberSectionToolbar
            actions={(
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                {en ? `Recent ${rows.length} events` : `최근 ${rows.length}건`}
              </span>
            )}
            meta={en ? "Monitor recent company-scope decisions and exception patterns from the latest audit snapshot." : "최근 감사 스냅샷 기준으로 회사 스코프 차단과 예외 허용 패턴을 확인합니다."}
            title={en ? "Audit Summary" : "감사 지표 요약"}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 px-6 py-6 md:grid-cols-2 xl:grid-cols-4">
          {summary.length === 0 ? (
            <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-[var(--kr-gov-border-light)] px-4 py-8 text-center text-sm text-[var(--kr-gov-text-secondary)] md:col-span-2 xl:col-span-4">
              {en ? "No audit summary is available." : "표시할 감사 요약이 없습니다."}
            </div>
          ) : summary.map((card, idx) => (
            <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-5 py-5 shadow-sm" key={`${stringOf(card, "title")}-${idx}`}>
              <p className="text-xs font-bold tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{stringOf(card, "title") || "-"}</p>
              <p className="mt-3 text-3xl font-black text-[var(--kr-gov-text-primary)]">{stringOf(card, "value") || "0"}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(card, "description") || "-"}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="gov-card p-0 overflow-hidden" data-help-id="security-audit-table">
        <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
          <MemberSectionToolbar
            meta={en ? "Recent audit events are sorted in reverse chronological order." : "최근 감사 이벤트를 시간 역순으로 확인합니다."}
            title={(
              <span className="text-[15px] font-semibold text-[var(--kr-gov-text-primary)]">
                {en ? "Recent Audit Events" : "최근 감사 이벤트"}
              </span>
            )}
          />
        </div>
        <div className="overflow-x-auto">
          <AdminTable>
            <thead>
              <tr className="border-y border-[var(--kr-gov-border-light)] bg-gray-50 text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                <th className="w-16 px-6 py-4 text-center">{en ? "No." : "번호"}</th>
                <th className="px-6 py-4">{en ? "Time" : "시각"}</th>
                <th className="px-6 py-4">{en ? "Actor" : "수행자"}</th>
                <th className="px-6 py-4">{en ? "Action" : "행위"}</th>
                <th className="px-6 py-4">{en ? "Target Route" : "대상 경로"}</th>
                <th className="px-6 py-4">{en ? "Scope Detail" : "스코프 상세"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                    {en ? "No recent security audit events were found." : "조회된 보안 감사 이벤트가 없습니다."}
                  </td>
                </tr>
              ) : rows.map((row, index) => {
                const actor = splitActor(stringOf(row, "actor"));
                const detail = splitDetail(stringOf(row, "detail"));
                const action = stringOf(row, "action");
                return (
                  <tr className="transition-colors hover:bg-gray-50/50" key={`${stringOf(row, "auditAt", "target", "actor")}-${index}`}>
                    <td className="px-6 py-4 text-center text-gray-500">{rows.length - index}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="font-medium text-[var(--kr-gov-text-primary)]">{stringOf(row, "auditAt") || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[var(--kr-gov-text-primary)]">{actor.actorId || "-"}</div>
                      <div className="text-xs text-gray-400">
                        {[actor.actorType || "-", actor.insttId || "-"].join(" / ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ${classifyActionTone(action)}`}>
                        {action || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[13px] text-[var(--kr-gov-text-primary)]">{stringOf(row, "target") || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div>{detail.actorScope}</div>
                      <div>{detail.targetScope}</div>
                      <div className="text-xs text-gray-400">{detail.contextMode}</div>
                      <div className="text-xs text-gray-400">{detail.reason}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </AdminTable>
        </div>
      </div>
    </AdminPageShell>
  );
}
