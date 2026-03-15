import { useEffect, useState } from "react";
import { CanView } from "../../components/access/CanView";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { CompanyDetailPagePayload, fetchCompanyDetailPage } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function resolveInitialInsttId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("insttId") || "";
}

function formatBytes(value: unknown) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "-";
  }
  return `${numeric.toLocaleString("ko-KR")} bytes`;
}

export function CompanyDetailMigrationPage() {
  const initialInsttId = resolveInitialInsttId();
  const [insttId, setInsttId] = useState(initialInsttId);
  const [page, setPage] = useState<CompanyDetailPagePayload | null>(null);
  const [error, setError] = useState("");

  async function load(target: string) {
    if (!target.trim()) {
      setError("기관 ID가 없습니다.");
      return;
    }
    const payload = await fetchCompanyDetailPage(target.trim());
    setPage(payload);
    setInsttId(target.trim());
    setError("");
  }

  useEffect(() => {
    if (initialInsttId) {
      load(initialInsttId).catch((nextError: Error) => setError(nextError.message));
    }
  }, []);

  const company = (page?.company || {}) as Record<string, unknown>;
  const companyFiles = (page?.companyFiles || []) as Array<Record<string, unknown>>;

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: "회원관리" },
        { label: "회원사" },
        { label: "회원사 상세" }
      ]}
      subtitle="회원사 신청 정보와 첨부파일을 읽기 전용으로 확인합니다."
      title="회원사 상세"
      loading={!page && !error}
      loadingLabel="회원사 상세 정보를 불러오는 중입니다."
      actions={(
        <div className="flex items-center gap-2">
          <a
            className="inline-flex items-center gap-1.5 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50"
            href={buildLocalizedPath("/admin/member/company_list", "/en/admin/member/company_list")}
          >
            <span className="material-symbols-outlined text-[18px]">list</span>
            목록
          </a>
          <a
            className="inline-flex items-center gap-1.5 rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--kr-gov-blue-hover)]"
            href={buildLocalizedPath(`/admin/member/company_account?insttId=${encodeURIComponent(insttId)}`, `/en/admin/member/company_account?insttId=${encodeURIComponent(insttId)}`)}
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            수정
          </a>
        </div>
      )}
    >
      {error ? <section className="mb-4 text-sm font-medium text-red-600">{error}</section> : null}
      {page?.companyDetailError ? <section className="mb-4 text-sm font-medium text-red-600">{String(page.companyDetailError)}</section> : null}

      <CanView allowed={!!page?.canViewCompanyDetail} fallback={<section className="gov-card"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원사 상세를 볼 권한이 없거나 대상이 없습니다.</p></section>}>
        <section className="gov-card mb-6" data-help-id="company-detail-lookup">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">Lookup Context</p>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-primary)]">insttId: {insttId || "-"}</p>
            </div>
            <a
              className="inline-flex items-center gap-1.5 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50"
              href={buildLocalizedPath(`/admin/member/company_account?insttId=${encodeURIComponent(insttId)}`, `/en/admin/member/company_account?insttId=${encodeURIComponent(insttId)}`)}
            >
              수정 화면 이동
            </a>
          </div>
        </section>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          <section className="gov-card xl:col-span-1" data-help-id="company-detail-summary">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <span className="material-symbols-outlined text-[48px] text-gray-400">apartment</span>
              </div>
              <h3 className="mb-2 text-xl font-bold">{String(company.insttNm || "-")}</h3>
              <div className="mb-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[12px] font-bold text-[var(--kr-gov-blue)]">
                  {String(page?.companyTypeLabel || "-")}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${String(page?.companyStatusBadgeClass || "bg-gray-100 text-gray-700")}`}>
                  {String(page?.companyStatusLabel || "-")}
                </span>
              </div>
              <div className="w-full rounded-[var(--kr-gov-radius)] bg-gray-50 p-4 text-left text-sm">
                <div className="mb-2 flex justify-between gap-4">
                  <span className="text-[var(--kr-gov-text-secondary)]">신청번호</span>
                  <strong>{String(company.insttId || "-")}</strong>
                </div>
                <div className="mb-2 flex justify-between gap-4">
                  <span className="text-[var(--kr-gov-text-secondary)]">등록일시</span>
                  <strong>{String(company.frstRegistPnttm || "-")}</strong>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[var(--kr-gov-text-secondary)]">최종수정일시</span>
                  <strong>{String(company.lastUpdtPnttm || "-")}</strong>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-8 xl:col-span-2">
            <section className="gov-card">
              <div className="mb-6 flex items-center gap-2 border-b pb-4">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">business</span>
                <h3 className="text-lg font-bold">사업자 정보</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="gov-label">기관/기업명</label>
                  <div className="gov-readonly">{String(company.insttNm || "-")}</div>
                </div>
                <div>
                  <label className="gov-label">사업자등록번호</label>
                  <div className="gov-readonly">{String(company.bizrno || "-")}</div>
                </div>
                <div>
                  <label className="gov-label">대표자명</label>
                  <div className="gov-readonly">{String(company.reprsntNm || "-")}</div>
                </div>
                <div>
                  <label className="gov-label">우편번호</label>
                  <div className="gov-readonly">{String(company.zip || "-")}</div>
                </div>
                <div>
                  <label className="gov-label">회원유형</label>
                  <div className="gov-readonly">{String(page?.companyTypeLabel || "-")}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="gov-label">주소</label>
                  <div className="gov-readonly">{String(company.adres || "-")}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="gov-label">상세 주소</label>
                  <div className="gov-readonly">{String(company.detailAdres || "-")}</div>
                </div>
              </div>
            </section>

            <section className="gov-card">
              <div className="mb-6 flex items-center gap-2 border-b pb-4">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person</span>
                <h3 className="text-lg font-bold">담당자 정보</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="gov-label">담당자 성명</label>
                  <div className="gov-readonly">{String(company.chargerNm || "-")}</div>
                </div>
                <div>
                  <label className="gov-label">이메일</label>
                  <div className="gov-readonly">{String(company.chargerEmail || "-")}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="gov-label">연락처</label>
                  <div className="gov-readonly">{String(company.chargerTel || "-")}</div>
                </div>
              </div>
            </section>

            <section className="gov-card" data-help-id="company-detail-files">
              <div className="mb-6 flex items-center gap-2 border-b pb-4">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">upload_file</span>
                <h3 className="text-lg font-bold">첨부 파일</h3>
              </div>
              <div className="overflow-x-auto rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)]">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8f9fa] text-left">
                    <tr>
                      <th className="px-4 py-3">순번</th>
                      <th className="px-4 py-3">파일명</th>
                      <th className="px-4 py-3">확장자</th>
                      <th className="px-4 py-3">크기</th>
                      <th className="px-4 py-3">등록일시</th>
                      <th className="px-4 py-3 text-center">다운로드</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {companyFiles.length === 0 ? (
                      <tr>
                        <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>저장된 첨부 파일이 없습니다.</td>
                      </tr>
                    ) : companyFiles.map((file, index) => {
                      const fileId = String(file.fileId || "");
                      const downloadUrl = fileId
                        ? buildLocalizedPath(`/admin/member/company-file?fileId=${encodeURIComponent(fileId)}&download=true`, `/en/admin/member/company-file?fileId=${encodeURIComponent(fileId)}&download=true`)
                        : "#";
                      return (
                        <tr key={`${fileId || "file"}-${index}`}>
                          <td className="px-4 py-3">{String(file.fileSn || index + 1)}</td>
                          <td className="px-4 py-3 font-medium">{String(file.orignlFileNm || "-")}</td>
                          <td className="px-4 py-3">{String(file.fileExtsn || "-")}</td>
                          <td className="px-4 py-3">{formatBytes(file.fileMg)}</td>
                          <td className="px-4 py-3">{String(file.regDate || "-")}</td>
                          <td className="px-4 py-3 text-center">
                            <a className="inline-flex items-center gap-1 rounded border border-[var(--kr-gov-border-light)] px-3 py-1.5 font-bold hover:bg-gray-50" data-action="download" href={downloadUrl}>
                              <span className="material-symbols-outlined text-[18px]">download</span>
                              다운로드
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
