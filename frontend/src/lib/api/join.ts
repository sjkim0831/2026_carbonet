import { buildCsrfHeaders, readJsonResponse } from "./core";
import { invalidateJoinSessionCache } from "./joinSession";

type CompanySearchPayload = {
  list: Array<{
    insttId: string;
    cmpnyNm: string;
    bizrno: string;
    cxfc: string;
    joinStat: string;
    entrprsSeCode: string;
  }>;
  totalCnt: number;
  page: number;
  size: number;
  totalPages: number;
};

type JoinCompanyRegisterPagePayload = Record<string, unknown> & {
  membershipType?: string;
  canViewCompanyRegister?: boolean;
  canUseCompanyRegister?: boolean;
};

type JoinCompanyStatusDetailPayload = {
  success: boolean;
  message?: string;
  result?: Record<string, unknown>;
  insttFiles?: Array<Record<string, unknown>>;
};

type JoinCompanyReapplyPagePayload = {
  success: boolean;
  message?: string;
  result?: Record<string, unknown>;
  insttFiles?: Array<Record<string, unknown>>;
};

type DuplicateFlagResponse = {
  isDuplicated?: boolean;
  duplicated?: boolean;
};

async function fetchDuplicateFlag(url: string, fallbackMessage: string): Promise<boolean> {
  const response = await fetch(url, {
    credentials: "include"
  });
  const body = await readJsonResponse<DuplicateFlagResponse>(response);
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.status}`);
  }
  return Boolean(body.isDuplicated ?? body.duplicated);
}

async function fetchNumericDuplicateFlag(url: string, fallbackMessage: string): Promise<boolean> {
  const response = await fetch(url, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.status}`);
  }
  const body = await response.text();
  return Number(body) > 0;
}

async function searchCompanyDirectory(
  url: string,
  fallbackMessage: string
): Promise<CompanySearchPayload> {
  const response = await fetch(url, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`${fallbackMessage}: ${response.status}`);
  }
  return response.json() as Promise<CompanySearchPayload>;
}

export async function searchJoinCompanies(params: {
  keyword: string;
  page?: number;
  size?: number;
  status?: string;
  membershipType?: string;
}) {
  const search = new URLSearchParams();
  search.set("keyword", params.keyword);
  if (params.page) search.set("page", String(params.page));
  if (params.size) search.set("size", String(params.size));
  if (params.status) search.set("status", params.status);
  if (params.membershipType) search.set("membershipType", params.membershipType);
  return searchCompanyDirectory(
    `/join/searchCompany?${search.toString()}`,
    "Failed to search join companies"
  );
}

export async function checkJoinMemberId(mberId: string) {
  return {
    isDuplicated: await fetchDuplicateFlag(
      `/join/checkId?mberId=${encodeURIComponent(mberId)}`,
      "Failed to check join member ID"
    )
  };
}

export async function checkJoinEmail(email: string) {
  return {
    isDuplicated: await fetchDuplicateFlag(
      `/join/checkEmail?email=${encodeURIComponent(email)}`,
      "Failed to check join email"
    )
  };
}

export async function fetchJoinCompanyRegisterPage() {
  const response = await fetch("/join/api/company-register/page", {
    credentials: "include"
  });
  if (!response.ok) throw new Error(`Failed to load join company register page: ${response.status}`);
  return response.json() as Promise<JoinCompanyRegisterPagePayload>;
}

export async function checkCompanyNameDuplicate(agencyName: string) {
  return fetchNumericDuplicateFlag(
    `/join/checkCompanyNameDplct?agencyName=${encodeURIComponent(agencyName)}`,
    "Failed to check company name"
  );
}

export async function fetchJoinCompanyStatusDetail(params: { bizNo?: string; appNo?: string; repName: string; }) {
  const search = new URLSearchParams();
  if (params.bizNo) search.set("bizNo", params.bizNo);
  if (params.appNo) search.set("appNo", params.appNo);
  search.set("repName", params.repName);
  const response = await fetch(`/join/api/company-status/detail?${search.toString()}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load company status detail: ${response.status}`);
  return body as JoinCompanyStatusDetailPayload;
}

export async function fetchJoinCompanyReapplyPage(params: { bizNo: string; repName: string; }) {
  const search = new URLSearchParams();
  search.set("bizNo", params.bizNo);
  search.set("repName", params.repName);
  const response = await fetch(`/join/api/company-reapply/page?${search.toString()}`, {
    credentials: "include"
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load company reapply page: ${response.status}`);
  return body as JoinCompanyReapplyPagePayload;
}

export async function submitJoinCompanyRegister(payload: {
  membershipType: string;
  agencyName: string;
  representativeName: string;
  bizRegistrationNumber: string;
  zipCode: string;
  companyAddress: string;
  companyAddressDetail?: string;
  chargerName: string;
  chargerEmail: string;
  chargerTel: string;
  lang?: string;
  fileUploads: File[];
}) {
  invalidateJoinSessionCache();
  const form = new FormData();
  form.set("membershipType", payload.membershipType);
  form.set("agencyName", payload.agencyName);
  form.set("representativeName", payload.representativeName);
  form.set("bizRegistrationNumber", payload.bizRegistrationNumber);
  form.set("zipCode", payload.zipCode);
  form.set("companyAddress", payload.companyAddress);
  form.set("companyAddressDetail", payload.companyAddressDetail || "");
  form.set("chargerName", payload.chargerName);
  form.set("chargerEmail", payload.chargerEmail);
  form.set("chargerTel", payload.chargerTel);
  form.set("lang", payload.lang || "ko");
  payload.fileUploads.forEach((file) => form.append("fileUploads", file));

  const response = await fetch("/join/api/company-register", {
    method: "POST",
    credentials: "include",
    headers: buildCsrfHeaders(),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.message || `Failed to submit company register: ${response.status}`);
  }
  return body;
}
