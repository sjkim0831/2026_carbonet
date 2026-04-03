import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchExternalSchemaPage, type ExternalSchemaPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { stringOf } from "../admin-system/adminSystemShared";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, CopyableCodeBlock, GridToolbar, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";
import { AdminInput, AdminSelect } from "../member/common";

function badgeClass(value: string) {
  const upper = value.toUpperCase();
  if (upper.includes("REVIEW") || upper.includes("DISABLED")) {
    return "bg-red-100 text-red-700";
  }
  if (upper.includes("WATCH") || upper.includes("MODERATE")) {
    return "bg-amber-100 text-amber-700";
  }
  if (upper.includes("HIGH")) {
    return "bg-violet-100 text-violet-700";
  }
  if (upper.includes("ACTIVE") || upper.includes("LOW")) {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-slate-100 text-slate-700";
}

export function ExternalSchemaMigrationPage() {
  const en = isEnglish();
  const pageState = useAsyncValue<ExternalSchemaPagePayload>(fetchExternalSchemaPage, [], {});
  const page = pageState.value;
  const summary = useMemo(() => ((page?.externalSchemaSummary || []) as Array<Record<string, string>>), [page]);
  const rows = useMemo(() => ((page?.externalSchemaRows || []) as Array<Record<string, string>>), [page]);
  const reviewRows = useMemo(() => ((page?.externalSchemaReviewRows || []) as Array<Record<string, string>>), [page]);
  const quickLinks = useMemo(() => ((page?.externalSchemaQuickLinks || []) as Array<Record<string, string>>), [page]);
  const guidance = useMemo(() => ((page?.externalSchemaGuidance || []) as Array<Record<string, string>>), [page]);
  const [keyword, setKeyword] = useState("");
  const [domain, setDomain] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [selectedSchemaId, setSelectedSchemaId] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return rows.filter((row) => {
      const haystack = [
        stringOf(row, "schemaId"),
        stringOf(row, "connectionName"),
        stringOf(row, "partnerName"),
        stringOf(row, "tableName"),
        stringOf(row, "columns")
      ].join(" ").toLowerCase();
      const matchesKeyword = !normalizedKeyword || haystack.includes(normalizedKeyword);
      const matchesDomain = domain === "ALL" || stringOf(row, "domain").toUpperCase() === domain;
      const matchesStatus = status === "ALL" || stringOf(row, "validationStatus").toUpperCase() === status;
      return matchesKeyword && matchesDomain && matchesStatus;
    });
  }, [domain, keyword, rows, status]);

  const activeRow = useMemo(() => {
    if (filteredRows.length === 0) {
      return null;
    }
    return filteredRows.find((row) => stringOf(row, "schemaId") === selectedSchemaId) || filteredRows[0];
  }, [filteredRows, selectedSchemaId]);

  const activeColumns = useMemo(
    () => stringOf(activeRow, "columns").split(",").map((item) => item.trim()).filter(Boolean),
    [activeRow]
  );

  const contractPreview = useMemo(() => JSON.stringify({
    schemaId: stringOf(activeRow, "schemaId"),
    connectionId: stringOf(activeRow, "connectionId"),
    connectionName: stringOf(activeRow, "connectionName"),
    domain: stringOf(activeRow, "domain"),
    direction: stringOf(activeRow, "direction"),
    schemaVersion: stringOf(activeRow, "schemaVersion"),
    protocol: stringOf(activeRow, "protocol"),
    tableName: stringOf(activeRow, "tableName"),
    validationStatus: stringOf(activeRow, "validationStatus"),
    piiLevel: stringOf(activeRow, "piiLevel"),
    ownerName: stringOf(activeRow, "ownerName"),
    lastSeenAt: stringOf(activeRow, "lastSeenAt"),
    columns: activeColumns
  }, null, 2), [activeColumns, activeRow]);

  const reviewChecklist = useMemo(() => {
    if (!activeRow) {
      return [];
    }
    const items = [
      {
        title: en ? "Version alignment" : "버전 정합성",
        body: en
          ? `Validate downstream parsing against ${stringOf(activeRow, "schemaVersion")}.`
          : `${stringOf(activeRow, "schemaVersion")} 기준으로 하위 파서 정합성을 확인합니다.`,
        tone: stringOf(activeRow, "validationStatus").toUpperCase() === "ACTIVE" ? "ACTIVE" : "REVIEW"
      },
      {
        title: en ? "Field ownership" : "필드 소유권",
        body: en
          ? `${stringOf(activeRow, "ownerName")} owns required-field changes and partner notices.`
          : `${stringOf(activeRow, "ownerName")} 담당으로 필수 필드 변경과 기관 공지를 관리합니다.`,
        tone: "WATCH"
      },
      {
        title: en ? "Masking and retention" : "마스킹 및 보존기간",
        body: stringOf(activeRow, "piiLevel").toUpperCase() === "LOW"
          ? (en ? "No identity-bearing fields were inferred, but audit retention should still match policy." : "식별 필드는 낮게 추정되지만 감사 보존기간은 정책과 맞춰야 합니다.")
          : (en ? "Identity or authorization semantics were inferred. Confirm masking, retention, and audit scope." : "식별 또는 권한 필드가 추정됩니다. 마스킹, 보존기간, 감사 범위를 확인해야 합니다."),
        tone: stringOf(activeRow, "piiLevel")
      }
    ];
    return items;
  }, [activeRow, en]);

  useEffect(() => {
    if (!activeRow) {
      if (selectedSchemaId) {
        setSelectedSchemaId("");
      }
      return;
    }
    const activeSchemaId = stringOf(activeRow, "schemaId");
    if (activeSchemaId && activeSchemaId !== selectedSchemaId) {
      setSelectedSchemaId(activeSchemaId);
    }
  }, [activeRow, selectedSchemaId]);

  useEffect(() => {
    logGovernanceScope("PAGE", "external-schema", {
      language: en ? "en" : "ko",
      totalCount: rows.length,
      filteredCount: filteredRows.length,
      domain,
      status,
      selectedSchemaId
    });
  }, [domain, en, filteredRows.length, rows.length, selectedSchemaId, status]);

  async function handleCopyContract() {
    try {
      await navigator.clipboard.writeText(contractPreview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "External Integration" : "외부 연계" },
        { label: en ? "Schema Registry" : "외부 스키마" }
      ]}
      title={en ? "Schema Registry" : "외부 스키마"}
      subtitle={en ? "Review external payload contracts by integration, domain, and validation state before downstream rollout." : "하위 시스템 반영 전에 외부 payload 계약을 연계, 도메인, 검증 상태 기준으로 점검합니다."}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <a className="gov-btn gov-btn-outline" href={buildLocalizedPath("/admin/external/connection_list", "/en/admin/external/connection_list")}>
            {en ? "Connection Registry" : "외부 연계 목록"}
          </a>
          <a className="gov-btn" href={buildLocalizedPath("/admin/external/sync", "/en/admin/external/sync")}>
            {en ? "Sync Execution" : "동기화 실행"}
          </a>
        </div>
      }
      loading={pageState.loading && !page}
      loadingLabel={en ? "Loading external schema registry..." : "외부 스키마 현황을 불러오는 중입니다."}
    >
      <AdminWorkspacePageFrame>
        {pageState.error ? <PageStatusNotice tone="error">{pageState.error}</PageStatusNotice> : null}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-help-id="external-schema-summary">
          {summary.map((item, index) => (
            <SummaryMetricCard
              key={`${stringOf(item, "title")}-${index}`}
              title={stringOf(item, "title")}
              value={stringOf(item, "value")}
              description={stringOf(item, "description")}
            />
          ))}
        </section>

        <CollectionResultPanel
          data-help-id="external-schema-filters"
          title={en ? "Schema Filters" : "스키마 조회 조건"}
          description={en ? "Narrow by schema, integration, domain, or validation state before opening the review queue." : "검토 대기열을 보기 전에 스키마, 연계, 도메인, 검증 상태 기준으로 범위를 좁힙니다."}
          icon="schema"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4 xl:w-[68rem]">
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="externalSchemaKeyword">{en ? "Keyword" : "검색어"}</label>
              <AdminInput id="externalSchemaKeyword" placeholder={en ? "Schema, table, field, connection" : "스키마, 테이블, 필드, 연계"} value={keyword} onChange={(event) => setKeyword(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="externalSchemaDomain">{en ? "Domain" : "도메인"}</label>
              <AdminSelect id="externalSchemaDomain" value={domain} onChange={(event) => setDomain(event.target.value)}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                <option value="COMMON">COMMON</option>
                <option value="MEMBER">MEMBER</option>
                <option value="EMISSION">EMISSION</option>
                <option value="SECURITY">SECURITY</option>
                <option value="OPERATIONS">OPERATIONS</option>
              </AdminSelect>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="externalSchemaStatus">{en ? "Validation" : "검증 상태"}</label>
              <AdminSelect id="externalSchemaStatus" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="ALL">{en ? "All" : "전체"}</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="WATCH">WATCH</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DISABLED">DISABLED</option>
              </AdminSelect>
            </div>
            <div className="flex items-end">
              <button className="gov-btn gov-btn-outline w-full" type="button" onClick={() => { setKeyword(""); setDomain("ALL"); setStatus("ALL"); }}>
                {en ? "Reset Filters" : "검색 조건 초기화"}
              </button>
            </div>
          </div>
        </CollectionResultPanel>

        <section className="gov-card overflow-hidden p-0" data-help-id="external-schema-registry">
          <GridToolbar
            title={en ? "External Contract Schemas" : "외부 계약 스키마"}
            meta={(en ? "Refreshed at " : "갱신 시각 ") + stringOf(page as Record<string, unknown>, "refreshedAt")}
            actions={<p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? `Visible ${filteredRows.length} of ${rows.length}` : `전체 ${rows.length}건 중 ${filteredRows.length}건 표시`}</p>}
          />
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">
                <tr>
                  <th className="px-4 py-3">{en ? "Schema" : "스키마"}</th>
                  <th className="px-4 py-3">{en ? "Domain" : "도메인"}</th>
                  <th className="px-4 py-3">{en ? "Direction" : "송수신"}</th>
                  <th className="px-4 py-3">{en ? "Version" : "버전"}</th>
                  <th className="px-4 py-3">{en ? "Fields" : "필드"}</th>
                  <th className="px-4 py-3">{en ? "Owner" : "담당"}</th>
                  <th className="px-4 py-3">{en ? "PII" : "민감도"}</th>
                  <th className="px-4 py-3">{en ? "Validation" : "검증 상태"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr
                    key={`${stringOf(row, "schemaId")}-${index}`}
                    className={`border-t border-[var(--kr-gov-border-light)] ${stringOf(row, "schemaId") === stringOf(activeRow, "schemaId") ? "bg-blue-50/70" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <button
                        className="text-left font-bold text-[var(--kr-gov-blue)] underline-offset-2 hover:underline"
                        onClick={() => setSelectedSchemaId(stringOf(row, "schemaId"))}
                        type="button"
                      >
                        {stringOf(row, "schemaId")}
                      </button>
                      <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "tableName")}</p>
                      <p className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "connectionName")}</p>
                    </td>
                    <td className="px-4 py-3">{stringOf(row, "domain")}</td>
                    <td className="px-4 py-3">{stringOf(row, "direction")}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{stringOf(row, "schemaVersion")}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold">{stringOf(row, "columnCount")} / {stringOf(row, "requiredFieldCount")}</div>
                      <p className="mt-1 max-w-[24rem] text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "columns")}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>{stringOf(row, "ownerName")}</div>
                      <div className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "partnerName") || "-"}</div>
                    </td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(row, "piiLevel"))}`}>{stringOf(row, "piiLevel")}</span></td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(row, "validationStatus"))}`}>{stringOf(row, "validationStatus")}</span></td>
                  </tr>
                ))}
                {filteredRows.length === 0 ? (
                  <tr className="border-t border-[var(--kr-gov-border-light)]">
                    <td className="px-4 py-8 text-center text-[var(--kr-gov-text-secondary)]" colSpan={8}>
                      {en ? "No external schemas match the current filters." : "현재 조건에 맞는 외부 스키마가 없습니다."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <article className="gov-card space-y-5" data-help-id="external-schema-review">
            <div className="flex flex-col gap-3 border-b border-[var(--kr-gov-border-light)] pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--kr-gov-blue)]">{en ? "Selected Contract" : "선택된 계약"}</p>
                <h2 className="mt-2 text-xl font-black text-[var(--kr-gov-text-primary)]">{stringOf(activeRow, "schemaId") || (en ? "No schema selected" : "선택된 스키마 없음")}</h2>
                <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">
                  {stringOf(activeRow, "connectionName")}
                  {stringOf(activeRow, "partnerName") ? ` · ${stringOf(activeRow, "partnerName")}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(activeRow, "validationStatus"))}`}>{stringOf(activeRow, "validationStatus") || "-"}</span>
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(activeRow, "piiLevel"))}`}>{stringOf(activeRow, "piiLevel") || "-"}</span>
                <a className="gov-btn gov-btn-outline" href={stringOf(activeRow, "targetRoute") || buildLocalizedPath("/admin/external/connection_list", "/en/admin/external/connection_list")}>
                  {en ? "Open Connection" : "연계 열기"}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Contract Facts" : "계약 요약"}</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4"><dt className="font-bold">{en ? "Table" : "테이블"}</dt><dd className="text-right text-[var(--kr-gov-text-secondary)]">{stringOf(activeRow, "tableName") || "-"}</dd></div>
                  <div className="flex items-start justify-between gap-4"><dt className="font-bold">{en ? "Direction" : "송수신"}</dt><dd className="text-right text-[var(--kr-gov-text-secondary)]">{stringOf(activeRow, "direction") || "-"}</dd></div>
                  <div className="flex items-start justify-between gap-4"><dt className="font-bold">{en ? "Version" : "버전"}</dt><dd className="text-right text-[var(--kr-gov-text-secondary)]">{stringOf(activeRow, "schemaVersion") || "-"}</dd></div>
                  <div className="flex items-start justify-between gap-4"><dt className="font-bold">{en ? "Fields" : "필드 수"}</dt><dd className="text-right text-[var(--kr-gov-text-secondary)]">{`${stringOf(activeRow, "columnCount") || "0"} / ${stringOf(activeRow, "requiredFieldCount") || "0"}`}</dd></div>
                  <div className="flex items-start justify-between gap-4"><dt className="font-bold">{en ? "Owner" : "담당"}</dt><dd className="text-right text-[var(--kr-gov-text-secondary)]">{stringOf(activeRow, "ownerName") || "-"}</dd></div>
                  <div className="flex items-start justify-between gap-4"><dt className="font-bold">{en ? "Last Seen" : "최종 감지"}</dt><dd className="text-right text-[var(--kr-gov-text-secondary)]">{stringOf(activeRow, "lastSeenAt") || "-"}</dd></div>
                </dl>
              </article>

              <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-[var(--kr-gov-text-secondary)]">{en ? "Canonical Fields" : "대표 필드"}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeColumns.length > 0 ? activeColumns.map((column) => (
                    <span key={column} className="inline-flex rounded-full border border-[var(--kr-gov-border-light)] bg-slate-50 px-3 py-1 text-xs font-bold text-[var(--kr-gov-text-secondary)]">
                      {column}
                    </span>
                  )) : (
                    <span className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "No field metadata available." : "필드 메타데이터가 없습니다."}</span>
                  )}
                </div>
              </article>
            </div>

            <CopyableCodeBlock
              copied={copied}
              copiedLabel={en ? "Copied" : "복사됨"}
              copyLabel={en ? "Copy Contract" : "계약 복사"}
              onCopy={() => { void handleCopyContract(); }}
              title={en ? "Contract Snapshot" : "계약 스냅샷"}
              value={contractPreview}
            />
          </article>

          <div className="space-y-4">
            <CollectionResultPanel
              title={en ? "Review Checklist" : "검토 체크리스트"}
              description={en ? "Use the same review baseline before promoting this schema downstream." : "이 스키마를 하위 시스템에 반영하기 전에 동일한 기준으로 점검합니다."}
              icon="rule"
            >
              <div className="space-y-3">
                {reviewChecklist.map((item, index) => (
                  <article key={`${item.title}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${badgeClass(item.tone)}`}>{item.tone}</span>
                      <h3 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{item.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{item.body}</p>
                  </article>
                ))}
              </div>
            </CollectionResultPanel>

            <CollectionResultPanel
              title={en ? "Review Queue Linkage" : "검토 대기열 연계"}
              description={en ? "Focus the queue on the selected schema before moving into remediation." : "조치 화면으로 이동하기 전에 선택된 스키마 기준으로 대기열을 확인합니다."}
              icon="assignment"
            >
              <div className="space-y-3">
                {reviewRows
                  .filter((row) => stringOf(row, "schemaId") === stringOf(activeRow, "schemaId"))
                  .slice(0, 2)
                  .map((row, index) => (
                    <article key={`${stringOf(row, "schemaId")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm text-[var(--kr-gov-text-primary)]">{stringOf(row, "reviewType")}</strong>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(row, "status"))}`}>{stringOf(row, "status")}</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(row, "reason")}</p>
                    </article>
                  ))}
                {reviewRows.filter((row) => stringOf(row, "schemaId") === stringOf(activeRow, "schemaId")).length === 0 ? (
                  <p className="text-sm text-[var(--kr-gov-text-secondary)]">{en ? "This schema is not currently in the focused review queue." : "현재 선택한 스키마는 별도 집중 검토 대기열에 없습니다."}</p>
                ) : null}
              </div>
            </CollectionResultPanel>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr,1fr]">
          <article className="gov-card overflow-hidden p-0">
            <GridToolbar title={en ? "Schema Review Queue" : "스키마 검토 대기열"} meta={en ? "Rows needing follow-up for compatibility, masking, or governance ownership." : "호환성, 마스킹, 거버넌스 담당 확인이 필요한 항목입니다."} />
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead><tr className="gov-table-header"><th className="px-4 py-3">{en ? "Schema" : "스키마"}</th><th className="px-4 py-3">{en ? "Review Type" : "검토 유형"}</th><th className="px-4 py-3">{en ? "Reason" : "사유"}</th><th className="px-4 py-3">{en ? "Owner" : "담당"}</th><th className="px-4 py-3">{en ? "Status" : "상태"}</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {reviewRows.map((row, index) => (
                    <tr key={`${stringOf(row, "schemaId")}-${index}`}>
                      <td className="px-4 py-3"><a className="font-bold text-[var(--kr-gov-blue)] hover:underline" href={stringOf(row, "targetRoute")}>{stringOf(row, "schemaId")}</a><div className="mt-1 text-xs text-[var(--kr-gov-text-secondary)]">{stringOf(row, "connectionName")}</div></td>
                      <td className="px-4 py-3">{stringOf(row, "reviewType")}</td>
                      <td className="px-4 py-3">{stringOf(row, "reason")}</td>
                      <td className="px-4 py-3">{stringOf(row, "ownerName")}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${badgeClass(stringOf(row, "status"))}`}>{stringOf(row, "status")}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <div className="space-y-4">
            <CollectionResultPanel data-help-id="external-schema-links" title={en ? "Quick Links" : "바로가기"} description={en ? "Move into registry, sync, or governance screens without leaving this review context." : "현재 검토 맥락을 유지한 채 레지스트리, 동기화, 거버넌스 화면으로 이동합니다."} icon="link">
              <div className="grid grid-cols-1 gap-3">
                {quickLinks.map((item, index) => (
                  <a key={`${stringOf(item, "label")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] px-4 py-3 text-sm font-bold text-[var(--kr-gov-blue)] hover:border-[var(--kr-gov-blue)]" href={stringOf(item, "targetRoute", "href")}>
                    {stringOf(item, "label", "title")}
                  </a>
                ))}
              </div>
            </CollectionResultPanel>

            <CollectionResultPanel data-help-id="external-schema-guidance" title={en ? "Operating Guidance" : "운영 가이드"} description={en ? "Keep the same baseline before accepting version drift or exposing schema fields downstream." : "버전 차이를 수용하거나 하위 시스템에 필드를 노출하기 전에는 같은 기준으로 판단합니다."} icon="fact_check">
              <div className="space-y-3">
                {guidance.map((item, index) => (
                  <article key={`${stringOf(item, "title")}-${index}`} className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${badgeClass(stringOf(item, "tone"))}`}>{stringOf(item, "tone") || "INFO"}</span>
                      <h3 className="text-sm font-black text-[var(--kr-gov-text-primary)]">{stringOf(item, "title")}</h3>
                    </div>
                    <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body", "description")}</p>
                  </article>
                ))}
              </div>
            </CollectionResultPanel>
          </div>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
