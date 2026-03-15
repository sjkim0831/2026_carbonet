import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { PermissionButton } from "../../components/access/CanUse";
import { fetchMemberEditPage, MemberEditPagePayload, saveMemberEdit } from "../../lib/api/client";
import { buildLocalizedPath } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";

function text(page: MemberEditPagePayload | null, ko: string, en: string) {
  return page?.isEn ? en : ko;
}

function resolveInitialMemberId() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("memberId") || "";
}

function resolvePermissionChipType(
  featureCode: string,
  page: MemberEditPagePayload | null
): "add" | "remove" | "base" | null {
  const payload = (page || {}) as Record<string, unknown>;
  const added = (payload.permissionAddedFeatureCodes as string[] | undefined) || [];
  const removed = (payload.permissionRemovedFeatureCodes as string[] | undefined) || [];
  const base = (payload.permissionBaseFeatureCodes as string[] | undefined) || [];

  if (added.includes(featureCode)) return "add";
  if (removed.includes(featureCode)) return "remove";
  if (base.includes(featureCode) && !removed.includes(featureCode)) return "base";
  return null;
}

function renderPermissionChip(type: "add" | "remove" | "base" | null) {
  if (type === "add") {
    return <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700">추가</span>;
  }
  if (type === "remove") {
    return <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-red-100 text-red-700">제외</span>;
  }
  if (type === "base") {
    return <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-slate-100 text-slate-700">기본</span>;
  }
  return null;
}

export function MemberEditMigrationPage() {
  const initialMemberId = resolveInitialMemberId();
  const memberIdInput = initialMemberId;
  const [featureCodes, setFeatureCodes] = useState<string[]>([]);
  const [form, setForm] = useState({
    memberId: initialMemberId,
    applcntNm: "",
    applcntEmailAdres: "",
    phoneNumber: "",
    entrprsSeCode: "",
    entrprsMberSttus: "",
    authorCode: "",
    zip: "",
    adres: "",
    detailAdres: "",
    marketingYn: "N",
    deptNm: ""
  });
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<MemberEditPagePayload>(
    () => fetchMemberEditPage(memberIdInput),
    [],
    {
      enabled: Boolean(memberIdInput.trim()),
      initialValue: null,
      onSuccess(pagePayload) {
        const member = pagePayload.member;
        setForm({
          memberId: memberIdInput,
          applcntNm: String(member?.applcntNm || ""),
          applcntEmailAdres: String(member?.applcntEmailAdres || ""),
          phoneNumber: String(pagePayload.phoneNumber || ""),
          entrprsSeCode: String((pagePayload as Record<string, unknown>).memberTypeCode || ""),
          entrprsMberSttus: String((pagePayload as Record<string, unknown>).memberStatusCode || ""),
          authorCode: String(pagePayload.permissionSelectedAuthorCode || ""),
          zip: String(member?.zip || ""),
          adres: String(member?.adres || ""),
          detailAdres: String(member?.detailAdres || ""),
          marketingYn: String(member?.marketingYn || "N"),
          deptNm: String(member?.deptNm || "")
        });
        setFeatureCodes((pagePayload.permissionEffectiveFeatureCodes as string[]) || []);
      }
    }
  );
  const page = pageState.value;
  const error = actionError || sessionState.error || pageState.error;
  const payload = (page || {}) as Record<string, unknown>;
  const accessScopes = (payload.accessScopes as string[] | undefined) || [];
  const memberEvidenceFiles = (payload.memberEvidenceFiles as Array<Record<string, unknown>> | undefined) || [];
  const businessRoleLabel = String(payload.businessRoleLabel || "-");
  const membershipTypeLabel = String(payload.membershipTypeLabel || "-");
  const statusLabel = String(payload.statusLabel || "-");
  const memberDocumentStatusLabel = String(payload.memberDocumentStatusLabel || "-");
  const institutionStatusLabel = String(payload.institutionStatusLabel || "-");
  const documentStatusLabel = String(payload.documentStatusLabel || "-");
  const institutionInsttId = String(payload.institutionInsttId || "");
  const permissionFeatureCount = Number(payload.permissionFeatureCount || featureCodes.length || 0);
  const permissionPageCount = Number(payload.permissionPageCount || (page?.permissionFeatureSections || []).length || 0);
  const permissionSelectedAuthorName = String(payload.permissionSelectedAuthorName || "-");
  const validationErrors = (payload.member_editErrors as string[] | undefined) || [];

  const canView = !!page?.canViewMemberEdit;
  const canUse = !!page?.canUseMemberSave;
  const hasMember = !!page?.member;

  function toggleFeature(code: string) {
    setFeatureCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function handleSave() {
    const session = sessionState.value;
    if (!session) {
      setActionError("세션 정보가 없습니다.");
      return;
    }
    setActionError("");
    setMessage("");
    try {
      const result = await saveMemberEdit(session, { ...form, featureCodes });
      setMessage(`${result.memberId} 회원 정보를 저장했습니다.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: text(page, "홈", "Home"), href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: text(page, "회원 관리", "Member Management"), href: buildLocalizedPath("/admin/member/list", "/en/admin/member/list") },
        { label: text(page, "회원 정보 수정", "Edit Member Information") }
      ]}
      subtitle={text(
        page,
        "회원 계정의 신청자 정보, 연락처, 상태를 수정합니다. 회원사 정보는 하단에서 참조용으로만 확인합니다.",
        "Edit applicant information, contact details, and status for the member account. Company data below is reference-only."
      )}
      title={text(page, "회원 정보 수정", "Edit Member Information")}
    >
      {page?.member_editError || error ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {String(page?.member_editError || error)}
        </section>
      ) : null}
      {validationErrors.length > 0 ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-bold mb-1">{text(page, "입력값을 확인해 주세요.", "Please check the input values.")}</p>
          <ul className="list-disc pl-5 space-y-1">
            {validationErrors.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {page?.member_editUpdated ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {text(page, "회원 정보가 저장되었습니다.", "Member information has been saved.")}
        </section>
      ) : null}
      {message ? <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</section> : null}
      {!memberIdInput.trim() ? (
        <section className="gov-card">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">info</span>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{text(page, "회원 정보를 표시할 수 없습니다.", "Member information is unavailable.")}</h3>
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{text(page, "전달된 회원 ID 또는 조회 결과를 확인해 주세요.", "Check the supplied member ID or lookup result.")}</p>
              <div className="pt-2">
                <a
                  className="inline-flex items-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-2 text-sm font-bold text-[var(--kr-gov-text-secondary)] hover:bg-gray-50"
                  href={buildLocalizedPath("/admin/member/list", "/en/admin/member/list")}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  {text(page, "회원 목록으로 이동", "Go to member list")}
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      {memberIdInput.trim() && !pageState.loading && !hasMember ? (
        <section className="gov-card">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">info</span>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{text(page, "회원 정보를 표시할 수 없습니다.", "Member information is unavailable.")}</h3>
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">{text(page, "전달된 회원 ID 또는 조회 결과를 확인해 주세요.", "Check the supplied member ID or lookup result.")}</p>
              <p className="text-sm text-[var(--kr-gov-text-secondary)]">
                {text(page, "요청한 회원 ID:", "Requested member ID:")} <span className="font-bold text-[var(--kr-gov-text-primary)]">{memberIdInput}</span>
              </p>
              <div className="pt-2">
                <a
                  className="inline-flex items-center gap-2 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-2 text-sm font-bold text-[var(--kr-gov-text-secondary)] hover:bg-gray-50"
                  href={buildLocalizedPath("/admin/member/list", "/en/admin/member/list")}
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  {text(page, "회원 목록으로 이동", "Go to member list")}
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <CanView
        allowed={canView && hasMember}
        fallback={memberIdInput.trim() && hasMember && !pageState.loading ? (
          <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm">
            <p className="text-sm text-[var(--kr-gov-text-secondary)]">{String(page?.member_editError || "회원 수정 화면을 볼 수 없습니다.")}</p>
          </section>
        ) : null}
      >
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start" data-help-id="member-edit-page">
          <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm xl:col-span-1 space-y-5" data-help-id="member-edit-summary">
            <div className="flex items-center gap-2 border-b pb-4">
              <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">assignment_ind</span>
              <h3 className="text-lg font-bold">계정 요약</h3>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">회원 ID</label>
              <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50 text-gray-600" readOnly type="text" value={form.memberId} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">가입일</label>
              <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50 text-gray-600" readOnly type="text" value={String((page?.member as Record<string, unknown> | undefined)?.sbscrbDe || "-")} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">업무 역할</label>
              <div className="rounded-[var(--kr-gov-radius)] bg-blue-50 border border-blue-100 px-4 py-3">
                <p className="text-sm font-bold text-[var(--kr-gov-blue)]">{businessRoleLabel}</p>
                <p className="mt-1 text-xs text-slate-600">{text(page, "회원 유형에 따라 연결되는 핵심 업무를 요약합니다.", "Summarizes the core work linked to the selected member type.")}</p>
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">계정 상태</label>
              <div className="rounded-[var(--kr-gov-radius)] bg-slate-50 px-4 py-3 text-sm">
                <p><span className="font-bold">회원 유형:</span> {membershipTypeLabel}</p>
                <p className="mt-1"><span className="font-bold">회원 상태:</span> {statusLabel}</p>
                <p className="mt-1"><span className="font-bold">회원 제출 문서:</span> {memberDocumentStatusLabel}</p>
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">우선 제공 업무</label>
              <div className="flex flex-wrap gap-2">
                {accessScopes.length === 0 ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">-</span> : accessScopes.map((scope) => (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700" key={scope}>{scope}</span>
                ))}
              </div>
            </div>
            {institutionInsttId ? (
              <div>
                <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">회원사 참조 정보</label>
                <div className="rounded-[var(--kr-gov-radius)] bg-gray-50 px-4 py-3 text-sm text-[var(--kr-gov-text-secondary)]">
                  <p><span className="font-bold text-[var(--kr-gov-text-primary)]">기관 승인 상태:</span> {institutionStatusLabel}</p>
                  <p className="mt-1"><span className="font-bold text-[var(--kr-gov-text-primary)]">증빙 문서 상태:</span> {documentStatusLabel}</p>
                  <p className="mt-1"><span className="font-bold text-[var(--kr-gov-text-primary)]">기관 ID:</span> {institutionInsttId}</p>
                </div>
              </div>
            ) : null}
          </section>

          <div className="xl:col-span-2 space-y-6">
            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-edit-form">
              <div className="flex items-center gap-2 border-b pb-4 mb-5">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">person</span>
                <h3 className="text-lg font-bold">회원 기본 정보</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">회원명</span>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.applcntNm} onChange={(e) => setForm({ ...form, applcntNm: e.target.value })} />
                </label>
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">이메일</span>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.applcntEmailAdres} onChange={(e) => setForm({ ...form, applcntEmailAdres: e.target.value })} />
                </label>
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">연락처</span>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                </label>
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">부서명</span>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.deptNm} onChange={(e) => setForm({ ...form, deptNm: e.target.value })} />
                </label>
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">회원 유형</span>
                  <select className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.entrprsSeCode} onChange={(e) => setForm({ ...form, entrprsSeCode: e.target.value })}>
                    {((page?.memberTypeOptions as Array<{ code: string; label: string }>) || []).map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                  </select>
                </label>
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">회원 상태</span>
                  <select className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.entrprsMberSttus} onChange={(e) => setForm({ ...form, entrprsMberSttus: e.target.value })}>
                    {((page?.memberStatusOptions as Array<{ code: string; label: string }>) || []).map((opt) => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
                  </select>
                </label>
                <label className="md:col-span-2 inline-flex items-center gap-3 text-sm font-medium cursor-pointer">
                  <input checked={form.marketingYn === "Y"} className="h-4 w-4 rounded border-gray-300 text-[var(--kr-gov-blue)]" disabled={!canUse} onChange={(e) => setForm({ ...form, marketingYn: e.target.checked ? "Y" : "N" })} type="checkbox" />
                  마케팅 정보 수신 동의
                </label>
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-edit-permissions">
              <div className="flex items-center gap-2 border-b pb-4 mb-5">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">shield</span>
                <h3 className="text-lg font-bold">권한 롤 및 개별 권한</h3>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label>
                      <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">기준 권한 롤</span>
                      <select className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.authorCode} onChange={(e) => setForm({ ...form, authorCode: e.target.value })}>
                        <option value="">권한 롤 선택</option>
                        {(page?.permissionAuthorGroups || []).map((group) => (
                          <option key={group.authorCode} value={group.authorCode}>{group.authorNm} ({group.authorCode})</option>
                        ))}
                      </select>
                    </label>
                    <p className="mt-2 text-xs text-slate-500">{text(page, "롤 기본 권한을 기준으로 체크가 구성되며, 아래에서 회원별 추가/제외 권한을 직접 조정할 수 있습니다.", "Checkboxes start from the role baseline, and member-specific additions or removals can be adjusted below.")}</p>
                  </div>
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                    <p><span className="font-bold">선택 롤:</span> {permissionSelectedAuthorName}</p>
                    <p className="mt-1"><span className="font-bold">최종 권한 수:</span> {permissionFeatureCount}</p>
                    <p className="mt-1"><span className="font-bold">대상 메뉴 수:</span> {permissionPageCount}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full px-3 py-1 font-bold bg-slate-100 text-slate-700">기본 롤 권한</span>
                  <span className="inline-flex items-center rounded-full px-3 py-1 font-bold bg-emerald-100 text-emerald-700">회원별 추가 권한</span>
                  <span className="inline-flex items-center rounded-full px-3 py-1 font-bold bg-red-100 text-red-700">회원별 제외 권한</span>
                </div>

                <div className="space-y-4">
                  {(page?.permissionFeatureSections || []).map((section) => (
                    <section className="rounded-[var(--kr-gov-radius)] border border-slate-200" key={section.menuCode}>
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{section.menuNm || section.menuNmEn || section.menuCode}</h4>
                          <p className="mt-1 text-xs text-slate-500">{section.menuUrl || "연결 URL 없음"}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{section.features.length}개 기능</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                        {section.features.map((feature) => {
                          const chipType = resolvePermissionChipType(feature.featureCode, page);
                          return (
                            <label className="flex items-start gap-3 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-white px-4 py-3" key={feature.featureCode}>
                              <input checked={featureCodes.includes(feature.featureCode)} className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--kr-gov-blue)]" disabled={!canUse} onChange={() => toggleFeature(feature.featureCode)} type="checkbox" />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{feature.featureNm || feature.featureCode}</span>
                                  {renderPermissionChip(chipType)}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{feature.featureCode}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-edit-address">
              <div className="flex items-center gap-2 border-b pb-4 mb-5">
                <span className="material-symbols-outlined text-[var(--kr-gov-green)]">location_on</span>
                <h3 className="text-lg font-bold">연락 및 제출 주소</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">우편번호</span>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                </label>
                <label>
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">상세주소</span>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.detailAdres} onChange={(e) => setForm({ ...form, detailAdres: e.target.value })} />
                </label>
                <label className="md:col-span-2">
                  <span className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">기본주소</span>
                  <textarea className="w-full min-h-[96px] px-4 py-3 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)]" disabled={!canUse} value={form.adres} onChange={(e) => setForm({ ...form, adres: e.target.value })} />
                </label>
                <div className="md:col-span-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{text(page, "이 영역은 회원 테이블의 연락/제출 주소입니다. 회원사 주소와 별도로 관리됩니다.", "This area stores contact and submission addresses on the member record, separate from company addresses.")}</div>
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-edit-evidence">
              <div className="flex items-center gap-2 border-b pb-4 mb-5">
                <span className="material-symbols-outlined text-[var(--kr-gov-blue)]">description</span>
                <h3 className="text-lg font-bold">회원 제출 증빙 문서</h3>
              </div>
              <div className="space-y-3">
                {memberEvidenceFiles.length === 0 ? (
                  <div className="rounded-[var(--kr-gov-radius)] border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">{text(page, "회원 테이블에 등록된 증빙 문서가 없습니다.", "No evidence files are registered on the member record.")}</div>
                ) : memberEvidenceFiles.map((file, index) => (
                  <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3" key={`${String(file.fileId || file.fileName || "file")}-${index}`}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{String(file.fileName || "-")}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          <span>DB 파일명: {String(file.storedFileName || "-")}</span>
                          <span className="mx-2">|</span>
                          <span>파일 ID: {String(file.fileId || "-")}</span>
                          <span className="mx-2">|</span>
                          <span>등록일: {String(file.regDate || "-")}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {file.previewUrl ? <a className="px-3 py-1.5 text-[12px] font-bold border border-[var(--kr-gov-border-light)] bg-white rounded hover:bg-gray-50" href={String(file.previewUrl)} target="_blank">미리보기</a> : null}
                        {file.downloadUrl ? <a className="px-3 py-1.5 text-[12px] font-bold border border-[var(--kr-gov-border-light)] bg-white rounded hover:bg-gray-50" href={String(file.downloadUrl)}>다운로드</a> : null}
                        {!file.previewUrl && !file.downloadUrl ? <span className="px-3 py-1.5 text-[12px] font-bold border border-dashed border-slate-300 bg-slate-100 rounded text-slate-500">파일 ID 미등록</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-white p-6 shadow-sm" data-help-id="member-edit-company-ref">
              <div className="flex items-center gap-2 border-b pb-4 mb-5">
                <span className="material-symbols-outlined text-[var(--kr-gov-green)]">business_center</span>
                <h3 className="text-lg font-bold">회원사 정보</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">기관명</label>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50 text-gray-600" readOnly type="text" value={String((page?.member as Record<string, unknown> | undefined)?.cmpnyNm || "-")} />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">대표자명</label>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50 text-gray-600" readOnly type="text" value={String((page?.member as Record<string, unknown> | undefined)?.cxfc || "-")} />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[var(--kr-gov-text-primary)] mb-2">사업자등록번호</label>
                  <input className="w-full h-11 px-4 border border-[var(--kr-gov-border-light)] rounded-[var(--kr-gov-radius)] bg-gray-50 text-gray-600" readOnly type="text" value={String((page?.member as Record<string, unknown> | undefined)?.bizrno || "-")} />
                </div>
                <div className="md:col-span-2 rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{text(page, "이 영역은 회원사 기준 참조 정보입니다. 수정은 기관 관리 또는 승인 화면에서 진행해 주세요.", "This area is company reference data only. Edit it from company management or approval screens.")}</div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3 border-t pt-6" data-help-id="member-edit-actions">
          <button className="min-w-[140px] rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-8 py-3 font-bold text-[var(--kr-gov-text-secondary)] hover:bg-gray-50" data-action="detail" onClick={() => { window.location.href = buildLocalizedPath(`/admin/member/detail?memberId=${encodeURIComponent(form.memberId)}`, `/en/admin/member/detail?memberId=${encodeURIComponent(form.memberId)}`); }} type="button">
            {text(page, "상세로 이동", "Go to detail")}
          </button>
          <PermissionButton allowed={canUse} className="min-w-[140px] rounded-[var(--kr-gov-radius)] bg-[var(--kr-gov-blue)] px-8 py-3 font-bold text-white hover:bg-[var(--kr-gov-blue-hover)]" data-action="save" onClick={handleSave} reason={text(page, "현재 관리자 권한으로 수정 가능한 회원만 저장할 수 있습니다.", "Only members editable by the current administrator can be saved.")} type="button">
            {text(page, "저장", "Save")}
          </PermissionButton>
        </div>
      </CanView>
    </AdminPageShell>
  );
}
