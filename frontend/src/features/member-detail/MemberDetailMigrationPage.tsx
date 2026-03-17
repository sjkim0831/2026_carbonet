import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import { fetchMemberDetailPage, MemberDetailPagePayload, resetMemberPasswordAction } from "../../lib/api/client";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function resolveInitialMemberId() {
  if (typeof window === "undefined") return "TEST1";
  return getSearchParam("memberId") || "TEST1";
}

export function MemberDetailMigrationPage() {
  const initialMemberId = resolveInitialMemberId();
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<MemberDetailPagePayload>(
    () => fetchMemberDetailPage(initialMemberId),
    [],
    {
      initialValue: null
    }
  );
  const page = pageState.value;
  const error = actionError || sessionState.error || pageState.error;
  const member = (page?.member || {}) as Record<string, unknown>;
  const historyRows = (page?.passwordResetHistoryRows || []) as Array<Record<string, unknown>>;
  const authorGroups = (page?.permissionAuthorGroups || []) as Array<{ authorCode: string; authorNm: string }>;
  const effectiveFeatureCodes = (page?.permissionEffectiveFeatureCodes || []) as string[];
  const memberEvidenceFiles = (page?.memberEvidenceFiles || []) as Array<Record<string, unknown>>;

  async function handleResetPassword() {
    const session = sessionState.value;
    if (!session) {
      setActionError("세션 정보가 없습니다.");
      return;
    }
    setActionError("");
    setMessage("");
    try {
      const result = await resetMemberPasswordAction(session, initialMemberId);
      setMessage(`임시 비밀번호가 발급되었습니다: ${String(result.temporaryPassword || "-")}`);
      await pageState.reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "비밀번호 초기화 중 오류가 발생했습니다.");
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: "회원·권한 관리" },
        { label: "회원 목록", href: buildLocalizedPath("/admin/member/list", "/en/admin/member/list") },
        { label: "상세 정보" }
      ]}
      subtitle=""
      title="회원 상세 정보"
      loading={pageState.loading && !page && !error}
      loadingLabel="회원 상세 정보를 불러오는 중입니다."
    >
      {error ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</section> : null}
      {message ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</section> : null}
      <CanView allowed={!!page?.canViewMemberDetail} fallback={<section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm"><p className="text-sm text-[var(--kr-gov-text-secondary)]">회원 상세를 볼 권한이 없거나 대상이 없습니다.</p></section>}>
        <section className="mb-6 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-5 py-4 shadow-sm" data-help-id="member-detail-lookup">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--kr-gov-text-secondary)]">Lookup Context</p>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-primary)]">memberId: {initialMemberId}</p>
            </div>
            <a
              className="inline-flex items-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-2 text-sm font-bold hover:bg-gray-50"
              href={buildLocalizedPath(`/admin/member/edit?memberId=${encodeURIComponent(initialMemberId)}`, `/en/admin/member/edit?memberId=${encodeURIComponent(initialMemberId)}`)}
            >
              수정 화면 이동
            </a>
          </div>
        </section>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 flex flex-col gap-8">
            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-detail-summary">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[48px] text-gray-400">account_circle</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{`${String(member.applcntNm || "-")} (${String(member.entrprsmberId || "-")})`}</h3>
                <div className="flex gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-blue-50 text-[var(--kr-gov-blue)] text-[12px] font-bold rounded border border-blue-100">{String(page?.membershipTypeLabel || "-")}</span>
                  <span className={`px-2.5 py-1 text-[12px] font-bold rounded border ${String(page?.statusBadgeClass || "bg-gray-100 text-gray-700 border-gray-200")}`}>{String(page?.statusLabel || "-")}</span>
                </div>
                <div className="w-full grid grid-cols-2 gap-2">
                  <PermissionButton
                    allowed={true}
                    className="py-2.5 bg-white border border-[var(--kr-gov-border-light)] text-[13px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50"
                    onClick={handleResetPassword}
                    reason=""
                    type="button"
                  >
                    비밀번호 초기화
                  </PermissionButton>
                  <a
                    className="inline-flex items-center justify-center py-2.5 bg-white border border-[var(--kr-gov-border-light)] text-[13px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50"
                    href={buildLocalizedPath(`/admin/member/edit?memberId=${encodeURIComponent(initialMemberId)}`, `/en/admin/member/edit?memberId=${encodeURIComponent(initialMemberId)}`)}
                  >
                    상태/정보 수정
                  </a>
                </div>
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-profile-card">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">shield_person</span>
                <h3 className="font-bold text-lg">권한 및 접근 정책</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">배정 권한 그룹</p>
                  <div className="flex flex-wrap gap-2">
                    {authorGroups.length === 0 ? <span className="px-3 py-1 bg-gray-100 text-[13px] rounded-full font-medium">-</span> : authorGroups.map((group) => (
                      <span className="px-3 py-1 bg-gray-100 text-[13px] rounded-full font-medium" key={group.authorCode}>{group.authorNm}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">메뉴 접근 권한 요약</p>
                  <div className="p-3 bg-gray-50 rounded text-[13px] text-[var(--kr-gov-text-secondary)] space-y-1">
                    {effectiveFeatureCodes.length === 0 ? <p className="flex items-center gap-2"><span className="text-red-600 font-black">✕</span> 부여된 기능이 없습니다.</p> : effectiveFeatureCodes.slice(0, 5).map((featureCode) => (
                      <p className="flex items-center gap-2" key={featureCode}><span className="text-green-600 font-black">✓</span> {featureCode}</p>
                    ))}
                    {effectiveFeatureCodes.length > 5 ? <p className="flex items-center gap-2"><span className="text-gray-400 font-black">•</span> 외 {effectiveFeatureCodes.length - 5}건</p> : null}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="xl:col-span-2 flex flex-col gap-8">
            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-detail-history">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person</span>
                <h3 className="font-bold text-lg">기본 정보</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  ["성명", String(member.applcntNm || "-")],
                  ["아이디", String(member.entrprsmberId || "-")],
                  ["이메일 주소", String(member.applcntEmailAdres || "-")],
                  ["연락처", String(page?.phoneNumber || "-")]
                ].map(([label, value]) => (
                  <div key={label}>
                    <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">{label}</label>
                    <input className="gov-input-readonly" readOnly type="text" value={value} />
                  </div>
                ))}
                <div>
                  <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">최초 가입일</label>
                  <div className="gov-input-readonly flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    <span>{String(member.sbscrbDe || "-")}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">최종 로그인 일시</label>
                  <div className="gov-input-readonly flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">history</span>
                    <span>-</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <span className="material-symbols-outlined text-[var(--kr-gov-green)]">business</span>
                <h3 className="font-bold text-lg">소속 및 사업자 정보</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "기업명", value: String(member.cmpnyNm || "-"), wide: true },
                  { label: "사업자 등록번호", value: String(member.bizrno || "-"), wide: false },
                  { label: "대표자명", value: String(member.cxfc || "-"), wide: false },
                  { label: "주소", value: String(member.adres || "-"), wide: false },
                  { label: "상세 주소", value: String(member.detailAdres || "-"), wide: false }
                ].map((item) => (
                  <div className={item.wide ? "md:col-span-2" : ""} key={item.label}>
                    <label className="block text-[14px] font-bold text-[var(--kr-gov-text-secondary)] mb-2">{item.label}</label>
                    <input className="gov-input-readonly" readOnly type="text" value={item.value} />
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <span className="material-symbols-outlined text-orange-500">description</span>
                <h3 className="font-bold text-lg">제출 증빙 서류</h3>
              </div>
              <div className="space-y-4">
                {memberEvidenceFiles.length === 0 ? (
                  <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">등록된 파일이 없습니다.</div>
                ) : memberEvidenceFiles.map((file, index) => (
                  <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 border border-gray-100 rounded-[var(--kr-gov-radius)]" key={`${String(file.fileId || file.fileName || "file")}-${index}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-gray-400">picture_as_pdf</span>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold truncate">{String(file.fileName || "-")}</p>
                        <p className="text-[12px] text-gray-500">등록일 {String(file.regDate || "-")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {file.previewUrl ? <a className="px-3 py-1.5 text-[12px] font-bold border border-[var(--kr-gov-border-light)] bg-white rounded hover:bg-gray-50" href={String(file.previewUrl)} target="_blank">미리보기</a> : null}
                      {file.downloadUrl ? <a className="px-3 py-1.5 text-[12px] font-bold border border-[var(--kr-gov-border-light)] bg-white rounded hover:bg-gray-50" href={String(file.downloadUrl)}>다운로드</a> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">lock_reset</span>
                <h3 className="font-bold text-lg">비밀번호 초기화 이력</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-y border-[var(--kr-gov-border-light)] text-[14px] font-bold text-[var(--kr-gov-text-secondary)]">
                      <th className="px-4 py-3 text-left">초기화 시각</th>
                      <th className="px-4 py-3 text-left">처리자</th>
                      <th className="px-4 py-3 text-left">사유</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyRows.length === 0 ? (
                      <tr><td className="px-4 py-8 text-center text-gray-500" colSpan={3}>이력이 없습니다.</td></tr>
                    ) : historyRows.map((row, index) => (
                      <tr key={`${String(row.resetAt || "reset")}-${index}`}>
                        <td className="px-4 py-3">{String(row.resetAt || "-")}</td>
                        <td className="px-4 py-3">{String(row.resetBy || "-")}</td>
                        <td className="px-4 py-3">{String(row.resetSource || row.resetIp || "-")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--kr-gov-border-light)] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50" data-help-id="member-action-bar">
          <div className="max-w-full mx-auto px-10 py-5 flex justify-between items-center">
            <button className="px-8 py-3 bg-white border border-[var(--kr-gov-border-light)] text-[var(--kr-gov-text-primary)] font-bold rounded-[var(--kr-gov-radius)] hover:bg-gray-50 transition-all flex items-center gap-2" onClick={() => { window.location.href = buildLocalizedPath("/admin/member/list", "/en/admin/member/list"); }} type="button">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              목록으로
            </button>
            <div className="flex gap-2">
              <button className="px-5 py-2.5 border border-red-200 bg-red-50 text-red-700 text-[13px] font-bold rounded-[var(--kr-gov-radius)] hover:bg-red-100" type="button">반려</button>
              <button className="px-5 py-2.5 bg-[var(--kr-gov-green)] text-white text-[13px] font-bold rounded-[var(--kr-gov-radius)] hover:opacity-90" type="button">승인</button>
            </div>
          </div>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
