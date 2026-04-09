import {
  buildAdminApiPath,
  buildJsonHeaders,
  buildResilientCsrfHeaders,
  invalidateAdminPageCaches,
  readJsonResponse
} from "./core";

type FrontendSessionLike = {
  csrfHeaderName: string;
  csrfToken: string;
};

type AuthorRoleProfile = {
  authorCode: string;
  displayTitle: string;
  priorityWorks: string[];
  description: string;
  memberEditVisibleYn: string;
  roleType?: string;
  baseRoleYn?: string;
  parentAuthorCode?: string;
  assignmentScope?: string;
  defaultMemberTypes?: string[];
  updatedAt?: string;
};

type CreateAuthGroupResponse = {
  success?: boolean;
  message?: string;
  authorCode: string;
};

type SaveCompanyAccountResponse = {
  success?: boolean;
  message?: string;
  errors?: string[];
  insttId: string;
};

export async function createAuthGroup(
  session: FrontendSessionLike,
  payload: {
    authorCode: string;
    authorNm: string;
    authorDc: string;
    roleCategory: string;
    insttId?: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/auth-groups"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<CreateAuthGroupResponse>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to create auth group: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveAuthGroupFeatures(
  session: FrontendSessionLike,
  payload: {
    authorCode: string;
    roleCategory: string;
    featureCodes: string[];
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/auth-groups/features"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to save auth-group features: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveAdminAuthChange(
  session: FrontendSessionLike,
  payload: {
    emplyrId: string;
    authorCode: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/auth-change/save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to save auth change: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveAuthorRoleProfile(
  session: FrontendSessionLike,
  payload: {
    authorCode: string;
    roleCategory: string;
    displayTitle: string;
    priorityWorks: string[];
    description: string;
    memberEditVisibleYn: string;
    roleType?: string;
    baseRoleYn?: string;
    parentAuthorCode?: string;
    assignmentScope?: string;
    defaultMemberTypes?: string[];
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/auth-groups/profile-save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{
    success?: boolean;
    message?: string;
    authorCode: string;
    profile: AuthorRoleProfile;
  }>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to save author role profile: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveDeptRoleMapping(
  session: FrontendSessionLike,
  payload: {
    insttId: string;
    cmpnyNm: string;
    deptNm: string;
    authorCode: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/dept-role-mapping/save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to save dept mapping: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveDeptRoleMember(
  session: FrontendSessionLike,
  payload: {
    insttId: string;
    entrprsMberId: string;
    authorCode: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/dept-role-mapping/member-save"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to save dept member role: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveMemberEdit(
  _session: FrontendSessionLike,
  payload: {
    memberId: string;
    applcntNm: string;
    applcntEmailAdres: string;
    phoneNumber: string;
    entrprsSeCode: string;
    entrprsMberSttus: string;
    authorCode: string;
    featureCodes: string[];
    zip: string;
    adres: string;
    detailAdres: string;
    marketingYn: string;
    deptNm: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/edit"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; errors?: string[] } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || (body.errors ? body.errors.join(", ") : `Failed to save member edit: ${response.status}`)));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveMemberRegister(
  _session: FrontendSessionLike,
  payload: {
    memberId: string;
    applcntNm: string;
    password: string;
    passwordConfirm: string;
    applcntEmailAdres: string;
    phoneNumber: string;
    entrprsSeCode: string;
    insttId: string;
    deptNm: string;
    authorCode: string;
    zip: string;
    adres: string;
    detailAdres: string;
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/register"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; errors?: string[] } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || (body.errors ? body.errors.join(", ") : `Failed to save member register: ${response.status}`)));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function resetMemberPasswordAction(session: FrontendSessionLike, memberId: string) {
  const form = new URLSearchParams();
  form.set("memberId", memberId);
  const headers = buildJsonHeaders(session);
  delete headers["Content-Type"];
  const response = await fetch("/admin/member/reset_password", {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  const body = await readJsonResponse<{ status?: string; errors?: string } & Record<string, unknown>>(response);
  if (!response.ok || body.status !== "success") {
    throw new Error(String(body.errors || `Failed to reset password: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveAdminPermission(
  _session: FrontendSessionLike,
  payload: { emplyrId: string; authorCode: string; featureCodes: string[]; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/admin-account/permissions"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; errors?: string[] } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || (body.errors ? body.errors.join(", ") : `Failed to save admin permission: ${response.status}`)));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function createAdminAccount(
  _session: FrontendSessionLike,
  payload: {
    rolePreset: string;
    adminId: string;
    adminName: string;
    password: string;
    passwordConfirm: string;
    adminEmail: string;
    phone1: string;
    phone2: string;
    phone3: string;
    deptNm: string;
    insttId: string;
    zip: string;
    adres: string;
    detailAdres: string;
    featureCodes: string[];
  }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/admin-account"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; errors?: string[] } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || (body.errors ? body.errors.join(", ") : `Failed to create admin account: ${response.status}`)));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function saveCompanyAccount(
  _session: FrontendSessionLike,
  payload: {
    insttId?: string;
    membershipType: string;
    agencyName?: string;
    representativeName?: string;
    bizRegistrationNumber?: string;
    zipCode: string;
    companyAddress: string;
    companyAddressDetail?: string;
    chargerName: string;
    chargerEmail: string;
    chargerTel: string;
    fileUploads: File[];
  }
) {
  const form = new FormData();
  if (payload.insttId) form.set("insttId", payload.insttId);
  form.set("membershipType", payload.membershipType);
  if (typeof payload.agencyName === "string") form.set("agencyName", payload.agencyName);
  if (typeof payload.representativeName === "string") form.set("representativeName", payload.representativeName);
  if (typeof payload.bizRegistrationNumber === "string") form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
  form.set("zipCode", payload.zipCode);
  form.set("companyAddress", payload.companyAddress);
  form.set("companyAddressDetail", payload.companyAddressDetail || "");
  form.set("chargerName", payload.chargerName);
  form.set("chargerEmail", payload.chargerEmail);
  form.set("chargerTel", payload.chargerTel);
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));

  const headers = await buildResilientCsrfHeaders({
    "X-Requested-With": "XMLHttpRequest"
  });
  delete headers["Content-Type"];
  const response = await fetch(buildAdminApiPath("/api/admin/member/company-account"), {
    method: "POST",
    credentials: "include",
    headers,
    body: form
  });
  const body = await readJsonResponse<SaveCompanyAccountResponse>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || (body.errors ? body.errors.join(", ") : `Failed to save company account: ${response.status}`)));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitMemberApproveAction(
  session: FrontendSessionLike,
  payload: { action: string; memberId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to approve member: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitCompanyApproveAction(
  session: FrontendSessionLike,
  payload: { action: string; insttId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/member/company-approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to approve company: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitCertificateApproveAction(
  session: FrontendSessionLike,
  payload: { action: string; certificateId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/certificate/approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to approve certificate: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitTradeRejectAction(
  session: FrontendSessionLike,
  payload: { tradeId?: string; rejectReason?: string; operatorNote?: string; }
) {
  const response = await fetch(buildAdminApiPath("/trade/reject/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to submit trade reject action: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}

export async function submitTradeApproveAction(
  session: FrontendSessionLike,
  payload: { action: string; tradeId?: string; selectedIds?: string[]; rejectReason?: string; }
) {
  const response = await fetch(buildAdminApiPath("/api/admin/trade/approve/action"), {
    method: "POST",
    credentials: "include",
    headers: buildJsonHeaders(session),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(String(body.message || `Failed to approve trade: ${response.status}`));
  }
  invalidateAdminPageCaches();
  return body;
}
