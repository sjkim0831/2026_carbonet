import { FormEvent, useEffect, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { buildLocalizedPath, getSearchParam, isEnglish } from "../../lib/navigation/runtime";
import { fetchSystemCodePage, type SystemCodePagePayload } from "../../lib/api/client";
import { stringOf, submitFormRequest } from "../admin-system/adminSystemShared";
import { ADMIN_BUTTON_LABELS } from "../admin-ui/labels";
import { GridToolbar, MemberButton } from "../admin-ui/common";
import { AdminEditPageFrame } from "../admin-ui/pageFrames";

function useSystemCodePage() {
  const [detailCodeId, setDetailCodeId] = useState(getSearchParam("detailCodeId"));
  const state = useAsyncValue<SystemCodePagePayload>(() => fetchSystemCodePage(detailCodeId || undefined), [detailCodeId], {
    onSuccess(payload) {
      setDetailCodeId(String(payload.detailCodeId || ""));
    }
  });
  return { ...state, detailCodeId, setDetailCodeId };
}

export function SystemCodeMigrationPage() {
  const en = isEnglish();
  const { value: page, error, reload, detailCodeId, setDetailCodeId } = useSystemCodePage();
  const [actionError, setActionError] = useState("");
  const clCodeList = (page?.clCodeList || []) as Array<Record<string, unknown>>;
  const codeList = (page?.codeList || []) as Array<Record<string, unknown>>;
  const detailCodeList = (page?.detailCodeList || []) as Array<Record<string, unknown>>;

  useEffect(() => {
    if (!detailCodeId && codeList.length > 0) {
      setDetailCodeId(stringOf(codeList[0], "codeId", "CODE_ID"));
    }
  }, [codeList, detailCodeId, setDetailCodeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError("");
    try {
      await submitFormRequest(event.currentTarget);
      event.currentTarget.reset();
      await reload();
    } catch (nextError) {
      setActionError(nextError instanceof Error ? nextError.message : (en ? "Request failed." : "요청 처리에 실패했습니다."));
    }
  }

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Code Management" : "코드 관리" }
      ]}
      title={en ? "Code Management" : "코드 관리"}
      subtitle={en ? "Manage class codes, code IDs, and detail codes." : "공통 분류 코드, 코드 ID, 상세 코드를 등록/수정/삭제합니다."}
    >
      {error || actionError || page?.codeMgmtError ? (
        <section className="mb-4 rounded-[var(--kr-gov-radius)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError || page?.codeMgmtError || error}
        </section>
      ) : null}

      <AdminEditPageFrame>
      <section className="gov-card" data-help-id="system-code-class">
        <GridToolbar
          actions={<span className="material-symbols-outlined text-[var(--kr-gov-blue)]">category</span>}
          className="mb-4"
          title={en ? "Class Codes" : "분류 코드"}
        />
        <form action={buildLocalizedPath("/admin/system/code/class/create", "/en/admin/system/code/class/create")} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4" method="post" onSubmit={handleSubmit}>
          <div>
            <label className="gov-label" htmlFor="clCode">{en ? "Class Code" : "분류 코드"}</label>
            <input className="gov-input" id="clCode" name="clCode" placeholder={en ? "e.g., HME" : "예: HME"} />
          </div>
          <div className="md:col-span-2">
            <label className="gov-label" htmlFor="clCodeNm">{en ? "Class Name" : "분류명"}</label>
            <input className="gov-input" id="clCodeNm" name="clCodeNm" placeholder={en ? "e.g., Home Menu" : "예: 홈 메뉴"} />
          </div>
          <div>
            <label className="gov-label" htmlFor="clCodeDc">{en ? "Description (EN)" : "설명"}</label>
            <input className="gov-input" id="clCodeDc" name="clCodeDc" placeholder={en ? "Description" : "분류 설명"} />
          </div>
          <div>
            <label className="gov-label" htmlFor="clUseAt">{en ? "Use" : "사용여부"}</label>
            <select className="gov-select" id="clUseAt" name="useAt" defaultValue="Y">
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
          <div className="md:col-span-5 flex justify-end gap-2">
            <MemberButton type="submit" variant="primary">{en ? "Add Class Code" : ADMIN_BUTTON_LABELS.create}</MemberButton>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3">{en ? "Class Code" : "분류 코드"}</th>
                <th className="px-4 py-3">{en ? "Class Name" : "분류명"}</th>
                <th className="px-4 py-3">{en ? "Description (EN)" : "설명(영문)"}</th>
                <th className="px-4 py-3 text-center">{en ? "Use" : "사용"}</th>
                <th className="px-4 py-3 text-center">{en ? "Actions" : "관리"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clCodeList.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>{en ? "No class codes found." : "분류 코드가 없습니다."}</td></tr>
              ) : clCodeList.map((row) => {
                const clCode = stringOf(row, "clCode", "CL_CODE");
                return (
                  <tr key={clCode}>
                    <td className="px-4 py-3 font-bold">{clCode}</td>
                    <td className="px-4 py-3">
                      <form action={buildLocalizedPath("/admin/system/code/class/update", "/en/admin/system/code/class/update")} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center" method="post" onSubmit={handleSubmit}>
                        <input name="clCode" type="hidden" value={clCode} />
                        <input className="gov-input" defaultValue={stringOf(row, "clCodeNm", "CL_CODE_NM")} name="clCodeNm" />
                        <input className="gov-input" defaultValue={stringOf(row, "clCodeDc", "CL_CODE_DC")} name="clCodeDc" />
                        <select className="gov-select" defaultValue={stringOf(row, "useAt", "USE_AT") || "Y"} name="useAt">
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                          <MemberButton type="submit">{en ? "Update" : ADMIN_BUTTON_LABELS.save}</MemberButton>
                        </div>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{stringOf(row, "clCodeDc", "CL_CODE_DC") || "-"}</td>
                    <td className="px-4 py-3 text-center">{stringOf(row, "useAt", "USE_AT") || "Y"}</td>
                    <td className="px-4 py-3 text-center">
                      <form action={buildLocalizedPath("/admin/system/code/class/delete", "/en/admin/system/code/class/delete")} method="post" onSubmit={handleSubmit}>
                        <input name="clCode" type="hidden" value={clCode} />
                        <MemberButton type="submit" variant="danger">{en ? "Delete" : "삭제"}</MemberButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gov-card" data-help-id="system-code-group">
        <GridToolbar
          actions={<span className="material-symbols-outlined text-[var(--kr-gov-blue)]">list_alt</span>}
          className="mb-4"
          title={en ? "Code IDs" : "코드 ID"}
        />
        <form action={buildLocalizedPath("/admin/system/code/group/create", "/en/admin/system/code/group/create")} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4" method="post" onSubmit={handleSubmit}>
          <div>
            <label className="gov-label" htmlFor="codeId">{en ? "Code ID" : "코드 ID"}</label>
            <input className="gov-input" id="codeId" name="codeId" placeholder="HMENU1" />
          </div>
          <div className="md:col-span-2">
            <label className="gov-label" htmlFor="codeIdNm">{en ? "Code Name" : "코드명"}</label>
            <input className="gov-input" id="codeIdNm" name="codeIdNm" placeholder={en ? "Home Menu" : "예: 홈 메뉴"} />
          </div>
          <div>
            <label className="gov-label" htmlFor="codeIdDc">{en ? "Description (EN)" : "설명(영문)"}</label>
            <input className="gov-input" id="codeIdDc" name="codeIdDc" />
          </div>
          <div>
            <label className="gov-label" htmlFor="clCode">{en ? "Class Code" : "분류 코드"}</label>
            <select className="gov-select" id="clCode" name="clCode">
              {clCodeList.map((row) => (
                <option key={stringOf(row, "clCode", "CL_CODE")} value={stringOf(row, "clCode", "CL_CODE")}>
                  {`${stringOf(row, "clCode", "CL_CODE")} - ${stringOf(row, "clCodeNm", "CL_CODE_NM")}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="gov-label" htmlFor="codeUseAt">{en ? "Use" : "사용여부"}</label>
            <select className="gov-select" id="codeUseAt" name="useAt" defaultValue="Y">
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
          <div className="md:col-span-6 flex justify-end gap-2">
            <MemberButton type="submit" variant="primary">{en ? "Add Code ID" : ADMIN_BUTTON_LABELS.create}</MemberButton>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3">{en ? "Code ID" : "코드 ID"}</th>
                <th className="px-4 py-3">{en ? "Code Name" : "코드명"}</th>
                <th className="px-4 py-3">{en ? "Description (EN)" : "설명(영문)"}</th>
                <th className="px-4 py-3">{en ? "Class" : "분류"}</th>
                <th className="px-4 py-3 text-center">{en ? "Use" : "사용"}</th>
                <th className="px-4 py-3 text-center">{en ? "Actions" : "관리"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codeList.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>{en ? "No code IDs found." : "코드 ID가 없습니다."}</td></tr>
              ) : codeList.map((row) => {
                const codeId = stringOf(row, "codeId", "CODE_ID");
                return (
                  <tr key={codeId}>
                    <td className="px-4 py-3 font-bold">{codeId}</td>
                    <td className="px-4 py-3">
                      <form action={buildLocalizedPath("/admin/system/code/group/update", "/en/admin/system/code/group/update")} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center" method="post" onSubmit={handleSubmit}>
                        <input name="codeId" type="hidden" value={codeId} />
                        <input className="gov-input" defaultValue={stringOf(row, "codeIdNm", "CODE_ID_NM")} name="codeIdNm" />
                        <input className="gov-input" defaultValue={stringOf(row, "codeIdDc", "CODE_ID_DC")} name="codeIdDc" />
                        <select className="gov-select" defaultValue={stringOf(row, "clCode", "CL_CODE")} name="clCode">
                          {clCodeList.map((classRow) => (
                            <option key={stringOf(classRow, "clCode", "CL_CODE")} value={stringOf(classRow, "clCode", "CL_CODE")}>
                              {`${stringOf(classRow, "clCode", "CL_CODE")} - ${stringOf(classRow, "clCodeNm", "CL_CODE_NM")}`}
                            </option>
                          ))}
                        </select>
                        <select className="gov-select" defaultValue={stringOf(row, "useAt", "USE_AT") || "Y"} name="useAt">
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                          <MemberButton type="submit">{en ? "Update" : ADMIN_BUTTON_LABELS.save}</MemberButton>
                        </div>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{stringOf(row, "codeIdDc", "CODE_ID_DC") || "-"}</td>
                    <td className="px-4 py-3 text-gray-500">{stringOf(row, "clCodeNm", "CL_CODE_NM") || "-"}</td>
                    <td className="px-4 py-3 text-center">{stringOf(row, "useAt", "USE_AT") || "Y"}</td>
                    <td className="px-4 py-3 text-center">
                      <form action={buildLocalizedPath("/admin/system/code/group/delete", "/en/admin/system/code/group/delete")} method="post" onSubmit={handleSubmit}>
                        <input name="codeId" type="hidden" value={codeId} />
                        <MemberButton type="submit" variant="danger">{en ? "Delete" : "삭제"}</MemberButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="gov-card" data-help-id="system-code-detail">
        <GridToolbar
          actions={<span className="material-symbols-outlined text-[var(--kr-gov-blue)]">fact_check</span>}
          className="mb-4"
          title={en ? "Detail Codes" : "상세 코드"}
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="gov-label" htmlFor="detailCodeId">{en ? "Select Code ID" : "코드 ID 선택"}</label>
            <select className="gov-select" id="detailCodeId" value={detailCodeId} onChange={(event) => setDetailCodeId(event.target.value)}>
              {codeList.map((row) => (
                <option key={stringOf(row, "codeId", "CODE_ID")} value={stringOf(row, "codeId", "CODE_ID")}>
                  {`${stringOf(row, "codeId", "CODE_ID")} - ${stringOf(row, "codeIdNm", "CODE_ID_NM")}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <form action={buildLocalizedPath("/admin/system/code/detail/create", "/en/admin/system/code/detail/create")} className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4" method="post" onSubmit={handleSubmit}>
          <div>
            <label className="gov-label" htmlFor="detailCodeIdInput">{en ? "Code ID" : "코드 ID"}</label>
            <select className="gov-select" id="detailCodeIdInput" name="codeId" value={detailCodeId} onChange={(event) => setDetailCodeId(event.target.value)}>
              {codeList.map((row) => (
                <option key={stringOf(row, "codeId", "CODE_ID")} value={stringOf(row, "codeId", "CODE_ID")}>
                  {stringOf(row, "codeId", "CODE_ID")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="gov-label" htmlFor="detailCode">{en ? "Code Value" : "코드값"}</label>
            <input className="gov-input" id="detailCode" name="code" placeholder={en ? "e.g., H001" : "예: H001"} />
          </div>
          <div className="md:col-span-2">
            <label className="gov-label" htmlFor="detailCodeNm">{en ? "Code Name" : "코드명"}</label>
            <input className="gov-input" id="detailCodeNm" name="codeNm" placeholder={en ? "Menu Name" : "메뉴명"} />
          </div>
          <div>
            <label className="gov-label" htmlFor="detailCodeDc">{en ? "Description (EN)" : "설명(영문)"}</label>
            <input className="gov-input" id="detailCodeDc" name="codeDc" />
          </div>
          <div>
            <label className="gov-label" htmlFor="detailUseAt">{en ? "Use" : "사용여부"}</label>
            <select className="gov-select" defaultValue="Y" id="detailUseAt" name="useAt">
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>
          <div className="md:col-span-6 flex justify-end gap-2">
            <MemberButton type="submit" variant="primary">{en ? "Add Detail Code" : ADMIN_BUTTON_LABELS.create}</MemberButton>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="gov-table-header">
                <th className="px-4 py-3">{en ? "Code ID" : "코드 ID"}</th>
                <th className="px-4 py-3">{en ? "Code Value" : "코드값"}</th>
                <th className="px-4 py-3">{en ? "Code Name" : "코드명"}</th>
                <th className="px-4 py-3">{en ? "Description (EN)" : "설명(영문)"}</th>
                <th className="px-4 py-3 text-center">{en ? "Use" : "사용"}</th>
                <th className="px-4 py-3 text-center">{en ? "Actions" : "관리"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {detailCodeList.length === 0 ? (
                <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={6}>{en ? "No detail codes found." : "상세 코드가 없습니다."}</td></tr>
              ) : detailCodeList.map((row) => {
                const codeId = stringOf(row, "codeId", "CODE_ID");
                const code = stringOf(row, "code", "CODE");
                return (
                  <tr key={`${codeId}-${code}`}>
                    <td className="px-4 py-3 font-bold">{codeId}</td>
                    <td className="px-4 py-3">{code}</td>
                    <td className="px-4 py-3">
                      <form action={buildLocalizedPath("/admin/system/code/detail/update", "/en/admin/system/code/detail/update")} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center" method="post" onSubmit={handleSubmit}>
                        <input name="codeId" type="hidden" value={codeId} />
                        <input name="code" type="hidden" value={code} />
                        <input className="gov-input" defaultValue={stringOf(row, "codeNm", "CODE_NM")} name="codeNm" />
                        <input className="gov-input" defaultValue={stringOf(row, "codeDc", "CODE_DC")} name="codeDc" />
                        <select className="gov-select" defaultValue={stringOf(row, "useAt", "USE_AT") || "Y"} name="useAt">
                          <option value="Y">Y</option>
                          <option value="N">N</option>
                        </select>
                        <div className="flex gap-2 justify-end">
                          <MemberButton type="submit">{en ? "Update" : ADMIN_BUTTON_LABELS.save}</MemberButton>
                        </div>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{stringOf(row, "codeDc", "CODE_DC") || "-"}</td>
                    <td className="px-4 py-3 text-center">{stringOf(row, "useAt", "USE_AT") || "Y"}</td>
                    <td className="px-4 py-3 text-center">
                      <form action={buildLocalizedPath("/admin/system/code/detail/delete", "/en/admin/system/code/detail/delete")} method="post" onSubmit={handleSubmit}>
                        <input name="codeId" type="hidden" value={codeId} />
                        <input name="code" type="hidden" value={code} />
                        <MemberButton type="submit" variant="danger">{en ? "Delete" : "삭제"}</MemberButton>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      </AdminEditPageFrame>
    </AdminPageShell>
  );
}
