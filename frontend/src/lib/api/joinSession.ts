import { buildCsrfHeaders, readJsonResponse } from "./core";

type JoinSessionPayload = {
  step: number;
  joinVO: Record<string, unknown>;
  verifiedIdentity: boolean;
  requiredSessionReady: boolean;
  membershipType: string;
  canViewStep1: boolean;
  canViewStep2: boolean;
  canViewStep3: boolean;
  canViewStep4: boolean;
};

let joinSessionCache: JoinSessionPayload | null = null;
let joinSessionPromise: Promise<JoinSessionPayload> | null = null;

export function invalidateJoinSessionCache() {
  joinSessionCache = null;
  joinSessionPromise = null;
}

export async function fetchJoinSession(): Promise<JoinSessionPayload> {
  if (joinSessionCache) {
    return joinSessionCache;
  }

  if (!joinSessionPromise) {
    joinSessionPromise = fetch("/join/api/session", {
      credentials: "include"
    })
      .then(async (response: Response) => {
        if (!response.ok) throw new Error(`Failed to load join session: ${response.status}`);
        const session = await readJsonResponse<JoinSessionPayload>(response);
        joinSessionCache = session;
        return session;
      })
      .finally(() => {
        joinSessionPromise = null;
      });
  }

  if (!joinSessionPromise) {
    throw new Error("Join session promise was not initialized");
  }

  return joinSessionPromise;
}

export async function resetJoinSession() {
  invalidateJoinSessionCache();
  const response = await fetch("/join/api/reset", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders()
  });
  if (!response.ok) throw new Error(`Failed to reset join session: ${response.status}`);
  return readJsonResponse<{ success: boolean }>(response);
}

export async function saveJoinStep1(membershipType: string) {
  invalidateJoinSessionCache();
  const form = new URLSearchParams();
  form.set("membership_type", membershipType);
  const response = await fetch("/join/api/step1", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to save join step1: ${response.status}`);
  return body;
}

export async function saveJoinStep2(marketingYn: string) {
  invalidateJoinSessionCache();
  const form = new URLSearchParams();
  form.set("marketing_yn", marketingYn);
  const response = await fetch("/join/api/step2", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to save join step2: ${response.status}`);
  return body;
}

export async function saveJoinStep3(authMethod: string) {
  invalidateJoinSessionCache();
  const form = new URLSearchParams();
  form.set("auth_method", authMethod);
  const response = await fetch("/join/api/step3", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to save join step3: ${response.status}`);
  return body;
}

export async function submitJoinStep4(payload: {
  membershipType?: string;
  mberId: string;
  password: string;
  mberNm: string;
  insttNm: string;
  insttId: string;
  representativeName: string;
  bizrno: string;
  zip: string;
  adres: string;
  detailAdres?: string;
  deptNm?: string;
  moblphonNo1: string;
  moblphonNo2: string;
  moblphonNo3: string;
  applcntEmailAdres: string;
  fileUploads: File[];
}) {
  invalidateJoinSessionCache();
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "fileUploads") return;
    form.set(key, String(value ?? ""));
  });
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));
  const response = await fetch("/join/api/step4/submit", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to submit join step4: ${response.status}`);
  return body;
}

export async function submitJoinCompanyReapply(payload: {
  insttId: string;
  agencyName: string;
  representativeName: string;
  bizRegistrationNumber: string;
  zipCode: string;
  companyAddress: string;
  companyAddressDetail?: string;
  chargerName: string;
  chargerEmail: string;
  chargerTel: string;
  fileUploads: File[];
}) {
  invalidateJoinSessionCache();
  const form = new FormData();
  form.set("insttId", payload.insttId);
  form.set("agencyName", payload.agencyName);
  form.set("representativeName", payload.representativeName);
  form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
  form.set("zipCode", payload.zipCode);
  form.set("companyAddress", payload.companyAddress);
  form.set("companyAddressDetail", payload.companyAddressDetail || "");
  form.set("chargerName", payload.chargerName);
  form.set("chargerEmail", payload.chargerEmail);
  form.set("chargerTel", payload.chargerTel);
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));

  const response = await fetch("/join/api/company-reapply", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to submit company reapply: ${response.status}`);
  return body;
}
