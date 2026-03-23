import { useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { useFrontendSession } from "../../app/hooks/useFrontendSession";
import { CanView } from "../../components/access/CanView";
import { fetchMemberEditPage, MemberEditPagePayload, readBootstrappedMemberEditPageData, saveMemberEdit } from "../../lib/api/client";
import { buildLocalizedPath, getSearchParam } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { MemberActionBar, MemberLinkButton, MemberPermissionButton, MEMBER_BUTTON_LABELS } from "../member/common";
import { MemberEditMainSections, MemberEditSummarySection, MemberEditFormState } from "./memberEditSections";

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

export function MemberEditMigrationPage() {
  const initialMemberId = resolveInitialMemberId();
  const initialUpdated = getSearchParam("updated");
  const bootstrappedPage = readBootstrappedMemberEditPageData();
  const memberIdInput = initialMemberId;
  const [featureCodes, setFeatureCodes] = useState<string[]>((bootstrappedPage?.permissionEffectiveFeatureCodes as string[] | undefined) || []);
  const [form, setForm] = useState<MemberEditFormState>({
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
  const [actionError, setActionError] = useState(() => getSearchParam("errorMessage"));
  const [message, setMessage] = useState("");
  const sessionState = useFrontendSession();
  const pageState = useAsyncValue<MemberEditPagePayload>(
    () => fetchMemberEditPage(memberIdInput, { updated: initialUpdated }),
    [],
    {
      enabled: Boolean(memberIdInput.trim()),
      initialValue: bootstrappedPage,
      skipInitialLoad: Boolean(bootstrappedPage),
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
  const assignedRoleProfile = (payload.assignedRoleProfile as Record<string, unknown> | undefined) || {};
  const roleProfileVisible = String(assignedRoleProfile.memberEditVisibleYn || "Y") !== "N";
  const profilePriorityWorks = roleProfileVisible ? ((assignedRoleProfile.priorityWorks as string[] | undefined) || []) : [];
  const accessScopes = profilePriorityWorks.length > 0 ? profilePriorityWorks : ((payload.accessScopes as string[] | undefined) || []);
  const memberEvidenceFiles = (payload.memberEvidenceFiles as Array<Record<string, unknown>> | undefined) || [];
  const businessRoleLabel = String((roleProfileVisible ? assignedRoleProfile.displayTitle : "") || payload.businessRoleLabel || "-");
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
  const businessRoleDescription = String(
    (roleProfileVisible ? assignedRoleProfile.description : "")
      || text(page, "회원 유형에 따라 연결되는 핵심 업무를 요약합니다.", "Summarizes the core work linked to the selected member type.")
  );

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
                <MemberLinkButton href={buildLocalizedPath("/admin/member/list", "/en/admin/member/list")} icon="arrow_back" variant="secondary">
                  {text(page, MEMBER_BUTTON_LABELS.list, "List")}
                </MemberLinkButton>
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
                <MemberLinkButton href={buildLocalizedPath("/admin/member/list", "/en/admin/member/list")} icon="arrow_back" variant="secondary">
                  {text(page, MEMBER_BUTTON_LABELS.list, "List")}
                </MemberLinkButton>
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
          <MemberEditSummarySection
            accessScopes={accessScopes}
            businessRoleDescription={businessRoleDescription}
            businessRoleLabel={businessRoleLabel}
            documentStatusLabel={documentStatusLabel}
            form={form}
            institutionInsttId={institutionInsttId}
            institutionStatusLabel={institutionStatusLabel}
            memberDocumentStatusLabel={memberDocumentStatusLabel}
            membershipTypeLabel={membershipTypeLabel}
            page={page}
            statusLabel={statusLabel}
          />

          <MemberEditMainSections
            canUse={canUse}
            featureCodes={featureCodes}
            form={form}
            memberEvidenceFiles={memberEvidenceFiles}
            page={page}
            permissionFeatureCount={permissionFeatureCount}
            permissionPageCount={permissionPageCount}
            permissionSelectedAuthorName={permissionSelectedAuthorName}
            resolvePermissionChipType={resolvePermissionChipType}
            setForm={setForm}
            text={text}
            toggleFeature={toggleFeature}
          />
        </div>

        <MemberActionBar
          dataHelpId="member-edit-actions"
          description={text(
            page,
            "목록으로 돌아가거나 현재 회원의 상세 화면을 다시 확인한 뒤 저장할 수 있습니다.",
            "Return to the list, review the member detail page again, or save the current edits."
          )}
          eyebrow={text(page, "작업 흐름", "Action Flow")}
          primary={(
            <MemberPermissionButton
              allowed={canUse}
              className="w-full max-w-[320px] shadow-lg shadow-blue-900/10"
              data-action="save"
              icon="save"
              onClick={handleSave}
              reason={text(page, "현재 관리자 권한으로 수정 가능한 회원만 저장할 수 있습니다.", "Only members editable by the current administrator can be saved.")}
              size="lg"
              type="button"
              variant="primary"
            >
              {text(page, MEMBER_BUTTON_LABELS.save, "Save")}
            </MemberPermissionButton>
          )}
          secondary={{
            href: buildLocalizedPath("/admin/member/list", "/en/admin/member/list"),
            icon: "list",
            label: text(page, MEMBER_BUTTON_LABELS.list, "List")
          }}
          tertiary={{
            href: buildLocalizedPath(`/admin/member/detail?memberId=${encodeURIComponent(form.memberId)}`, `/en/admin/member/detail?memberId=${encodeURIComponent(form.memberId)}`),
            icon: "preview",
            label: text(page, MEMBER_BUTTON_LABELS.detail, "Detail"),
          }}
          title={text(
            page,
            "수정 내용을 검토한 뒤 저장하세요.",
            "Review the changes, then save them."
          )}
        />
      </CanView>
    </AdminPageShell>
  );
}
