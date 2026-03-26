import { apiFetch, buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";

export const RESONANCE_PROJECT_ID = "carbonet-main";

export type ResonanceParityCompareRow = {
  target: string;
  currentRuntime: string;
  generatedTarget: string;
  proposalBaseline: string;
  patchTarget: string;
  result: "MATCH" | "MISMATCH" | "GAP" | string;
};

export type ResonanceParityCompareResponse = {
  compareContextId: string;
  projectId: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  selectedScreenId: string;
  releaseUnitId: string;
  compareBaseline: string;
  compareTargetSet: ResonanceParityCompareRow[];
  parityScore: number;
  uniformityScore: number;
  blockerSet: string[];
  repairCandidateSet: string[];
  result: string;
  requestedBy: string;
  requestedByType: string;
  occurredAt: string;
  traceId: string;
};

export type ResonanceRepairOpenResponse = {
  repairSessionId: string;
  projectId: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  selectedScreenId: string;
  builderInput: Record<string, unknown>;
  runtimeEvidence: Record<string, unknown>;
  selectedElementSet: string[];
  compareSnapshotId: string;
  blockingGapSet: string[];
  reuseRecommendationSet: string[];
  requiredContractSet: string[];
  status: string;
  result: string;
  releaseUnitId: string;
  compareBaseline: string;
  reasonCode: string;
  requestedBy: string;
  requestedByType: string;
  requestNote: string;
  occurredAt: string;
  traceId: string;
};

export type ResonanceRepairApplyResponse = {
  repairApplyRunId: string;
  repairSessionId: string;
  guidedStateId: string;
  templateLineId: string;
  ownerLane: string;
  builderInput: Record<string, unknown>;
  runtimeEvidence: Record<string, unknown>;
  updatedAssetTraceSet: string[];
  updatedReleaseCandidateId: string;
  parityRecheckRequiredYn: boolean;
  uniformityRecheckRequiredYn: boolean;
  smokeRequiredYn: boolean;
  status: string;
  result: string;
  projectId: string;
  releaseUnitId: string;
  screenFamilyRuleId: string;
  selectedScreenId: string;
  selectedElementSet: string[];
  updatedBindingSet: string[];
  updatedThemeOrLayoutSet: string[];
  sqlDraftSet: string[];
  publishMode: string;
  requestedBy: string;
  requestedByType: string;
  changeSummary: string;
  compareBaseline: string;
  occurredAt: string;
  traceId: string;
};

export async function fetchParityCompare(params: {
  projectId: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  selectedScreenId: string;
  releaseUnitId?: string;
  compareBaseline?: string;
  requestedBy?: string;
  requestedByType?: string;
}) {
  const search = new URLSearchParams();
  search.set("projectId", params.projectId);
  search.set("guidedStateId", params.guidedStateId);
  search.set("templateLineId", params.templateLineId);
  search.set("screenFamilyRuleId", params.screenFamilyRuleId);
  search.set("ownerLane", params.ownerLane);
  search.set("selectedScreenId", params.selectedScreenId);
  if (params.releaseUnitId) search.set("releaseUnitId", params.releaseUnitId);
  if (params.compareBaseline) search.set("compareBaseline", params.compareBaseline);
  if (params.requestedBy) search.set("requestedBy", params.requestedBy);
  if (params.requestedByType) search.set("requestedByType", params.requestedByType);

  const response = await apiFetch(`${buildAdminApiPath("/api/admin/ops/parity/compare")}?${search.toString()}`, {
    credentials: "include"
  });
  const body = await readJsonResponse<ResonanceParityCompareResponse & { message?: string }>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to load parity compare: ${response.status}`));
  }
  return body as ResonanceParityCompareResponse;
}

export async function fetchRepairOpen(payload: {
  projectId: string;
  releaseUnitId: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  selectedScreenId: string;
  builderInput: Record<string, unknown>;
  runtimeEvidence: Record<string, unknown>;
  selectedElementSet: string[];
  compareBaseline: string;
  reasonCode: string;
  existingAssetReuseSet: string[];
  requestedBy: string;
  requestedByType: string;
  requestNote?: string;
}) {
  const response = await apiFetch(buildAdminApiPath("/api/admin/ops/repair/open"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<ResonanceRepairOpenResponse & { message?: string }>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to open repair session: ${response.status}`));
  }
  return body as ResonanceRepairOpenResponse;
}

export async function fetchRepairApply(payload: {
  repairSessionId: string;
  projectId: string;
  releaseUnitId: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  selectedScreenId: string;
  selectedElementSet: string[];
  compareBaseline: string;
  builderInput: Record<string, unknown>;
  runtimeEvidence: Record<string, unknown>;
  updatedAssetSet: string[];
  updatedBindingSet: string[];
  updatedThemeOrLayoutSet: string[];
  sqlDraftSet: string[];
  publishMode: string;
  requestedBy: string;
  requestedByType: string;
  changeSummary: string;
}) {
  const response = await apiFetch(buildAdminApiPath("/api/admin/ops/repair/apply"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<ResonanceRepairApplyResponse & { message?: string }>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to apply repair session: ${response.status}`));
  }
  return body as ResonanceRepairApplyResponse;
}
