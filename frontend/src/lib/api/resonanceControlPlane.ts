import { apiFetch, buildAdminApiPath, buildResilientCsrfHeaders, readJsonResponse } from "./core";

export const RESONANCE_PROJECT_ID = "carbonet-main";
const RESONANCE_PROJECT_PARAM_KEYS = ["resonanceProjectId", "projectId"];

function readProjectIdFromSearch() {
  if (typeof window === "undefined") {
    return "";
  }
  const search = new URLSearchParams(window.location.search);
  for (const key of RESONANCE_PROJECT_PARAM_KEYS) {
    const value = (search.get(key) || "").trim();
    if (value) {
      return value;
    }
  }
  return "";
}

export function resolveResonanceProjectId(explicitProjectId?: string) {
  const candidate = (explicitProjectId || "").trim();
  return candidate || readProjectIdFromSearch() || RESONANCE_PROJECT_ID;
}

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
  deployTraceId?: string;
  deployContract?: ResonanceDeployContract;
  serverStateSet?: ResonancePipelineServerState[];
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
  candidateRuntimePackageId?: string;
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
  deployTraceId?: string;
  deployContract?: ResonanceDeployContract;
  serverStateSet?: ResonancePipelineServerState[];
  requestedBy: string;
  requestedByType: string;
  changeSummary: string;
  compareBaseline: string;
  occurredAt: string;
  traceId: string;
};

export type ResonanceDeploymentRoute = {
  serverId: string;
  serverRole: string;
  promotionState: string;
};

export type ResonancePipelineServerState = {
  serverId: string;
  serverRole: string;
  projectId?: string;
  activeReleaseUnitId: string;
  deployTraceId: string;
  deployedAt: string;
  healthStatus: string;
  promotionState: string;
};

export type ResonanceDeployContract = {
  artifactTargetSystem: string;
  deploymentTarget: string;
  deploymentRouteSet?: ResonanceDeploymentRoute[];
  deploymentMode: string;
  versionTrackingYn: boolean;
  releaseFamilyId: string;
  releaseUnitId?: string;
};

export type ResonanceProjectPipelineResponse = {
  pipelineRunId: string;
  traceId: string;
  projectId: string;
  scenarioId: string;
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
  menuRoot: string;
  runtimeClass: string;
  menuScope: string;
  artifactTargetSystem: string;
  deploymentTarget: string;
  releaseUnitId: string;
  runtimePackageId: string;
  deployTraceId: string;
  commonArtifactSet: string[];
  projectAdapterArtifactSet: string[];
  installableArtifactSet: string[];
  installableProduct: Record<string, unknown>;
  boundarySummary: Record<string, unknown>;
  validatorCheckSet: Array<Record<string, unknown>>;
  validatorPassCount: number;
  validatorTotalCount: number;
  stageSet: Array<Record<string, unknown>>;
  artifactVersionSet: Record<string, unknown>;
  artifactLineage: Record<string, unknown>;
  artifactRegistryEntrySet: Array<Record<string, unknown>>;
  deployContract: ResonanceDeployContract;
  serverStateSet?: ResonancePipelineServerState[];
  rollbackPlan: Record<string, unknown>;
  operator: string;
  result: string;
  occurredAt: string;
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

  const response = await apiFetch(`${buildAdminApiPath("/api/platform/runtime/parity/compare")}?${search.toString()}`, {
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
  const response = await apiFetch(buildAdminApiPath("/api/platform/runtime/repair/open"), {
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
  const response = await apiFetch(buildAdminApiPath("/api/platform/runtime/repair/apply"), {
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

export async function runProjectPipeline(payload: {
  projectId: string;
  scenarioId?: string;
  guidedStateId?: string;
  templateLineId?: string;
  screenFamilyRuleId?: string;
  ownerLane?: string;
  menuRoot: string;
  runtimeClass: string;
  menuScope: string;
  releaseUnitId?: string;
  runtimePackageId?: string;
  releaseUnitPrefix: string;
  runtimePackagePrefix: string;
  artifactTargetSystem?: string;
  deploymentTarget?: string;
  operator?: string;
}) {
  const response = await apiFetch(buildAdminApiPath("/api/platform/runtime/project-pipeline/run"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<ResonanceProjectPipelineResponse & { message?: string }>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to run project pipeline: ${response.status}`));
  }
  return body as ResonanceProjectPipelineResponse;
}

export async function fetchProjectPipelineStatus(payload: {
  projectId: string;
  pipelineRunId?: string;
  releaseUnitId?: string;
}) {
  const response = await apiFetch(buildAdminApiPath("/api/platform/runtime/project-pipeline/status"), {
    method: "POST",
    credentials: "include",
    headers: await buildResilientCsrfHeaders({
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    }),
    body: JSON.stringify(payload)
  });
  const body = await readJsonResponse<ResonanceProjectPipelineResponse & { message?: string }>(response);
  if (!response.ok) {
    throw new Error(String(body.message || `Failed to load project pipeline status: ${response.status}`));
  }
  return body as ResonanceProjectPipelineResponse;
}
