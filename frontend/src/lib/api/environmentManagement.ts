import { buildLocalizedPath } from "../navigation/runtime";
import { apiFetch, buildResilientCsrfHeaders, readJsonResponse } from "./core";

export async function updateEnvironmentManagedPage(payload: {
  menuType: string;
  code: string;
  codeNm: string;
  codeDc: string;
  menuUrl: string;
  menuIcon: string;
  useAt: string;
}) {
  const form = new URLSearchParams();
  form.set("menuType", payload.menuType);
  form.set("code", payload.code);
  form.set("codeNm", payload.codeNm);
  form.set("codeDc", payload.codeDc);
  form.set("menuUrl", payload.menuUrl);
  form.set("menuIcon", payload.menuIcon);
  form.set("useAt", payload.useAt);
  const response = await apiFetch(buildLocalizedPath("/admin/system/environment-management/page/update", "/en/admin/system/environment-management/page/update"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; code?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to update environment managed page: ${response.status}`);
  return body;
}

export async function fetchEnvironmentManagedPageImpact(menuType: string, code: string) {
  const query = new URLSearchParams();
  query.set("menuType", menuType);
  query.set("code", code);
  const response = await apiFetch(buildLocalizedPath(`/admin/system/environment-management/page-impact?${query.toString()}`, `/en/admin/system/environment-management/page-impact?${query.toString()}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<{
    success?: boolean;
    message?: string;
    code?: string;
    defaultViewFeatureCode?: string;
    linkedFeatureCodes?: string[];
    nonDefaultFeatureCodes?: string[];
    defaultViewRoleRefCount?: number;
    defaultViewUserOverrideCount?: number;
    blocked?: boolean;
  } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load environment managed page impact: ${response.status}`);
  return body;
}

export async function deleteEnvironmentManagedPage(menuType: string, code: string) {
  const form = new URLSearchParams();
  form.set("menuType", menuType);
  form.set("code", code);
  const response = await apiFetch(buildLocalizedPath("/admin/system/environment-management/page/delete", "/en/admin/system/environment-management/page/delete"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{
    success?: boolean;
    message?: string;
    code?: string;
    nonDefaultFeatureCodes?: string[];
    defaultViewRoleRefCount?: number;
    defaultViewUserOverrideCount?: number;
  } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to delete environment managed page: ${response.status}`);
  return body;
}

export async function updateEnvironmentFeature(payload: {
  menuType: string;
  menuCode: string;
  featureCode: string;
  featureNm: string;
  featureNmEn: string;
  featureDc: string;
  useAt: string;
}) {
  const form = new URLSearchParams();
  form.set("menuType", payload.menuType);
  form.set("menuCode", payload.menuCode);
  form.set("featureCode", payload.featureCode);
  form.set("featureNm", payload.featureNm);
  form.set("featureNmEn", payload.featureNmEn);
  form.set("featureDc", payload.featureDc);
  form.set("useAt", payload.useAt);
  const response = await apiFetch(buildLocalizedPath("/admin/system/environment-management/feature/update", "/en/admin/system/environment-management/feature/update"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; featureCode?: string } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to update environment feature: ${response.status}`);
  return body;
}

export async function fetchEnvironmentFeatureImpact(featureCode: string) {
  const query = `?featureCode=${encodeURIComponent(featureCode)}`;
  const response = await apiFetch(buildLocalizedPath(`/admin/system/environment-management/feature-impact${query}`, `/en/admin/system/environment-management/feature-impact${query}`), {
    credentials: "include"
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; featureCode?: string; assignedRoleCount?: number; userOverrideCount?: number } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to load environment feature impact: ${response.status}`);
  return body;
}

export async function deleteEnvironmentFeature(featureCode: string) {
  const form = new URLSearchParams();
  form.set("featureCode", featureCode);
  const response = await apiFetch(buildLocalizedPath("/admin/system/environment-management/feature/delete", "/en/admin/system/environment-management/feature/delete"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: form
  });
  const body = await readJsonResponse<{ success?: boolean; message?: string; featureCode?: string; assignedRoleCount?: number; userOverrideCount?: number } & Record<string, unknown>>(response);
  if (!response.ok || !body.success) throw new Error(body.message || `Failed to delete environment feature: ${response.status}`);
  return body;
}
