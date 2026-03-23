import { apiFetch, buildAdminApiPath, readJsonResponse } from "../../lib/api/core";
import type { FrameworkAuthorityContract } from "../contracts/authorityContract";

export async function fetchFrameworkAuthorityContract(): Promise<FrameworkAuthorityContract> {
  const response = await apiFetch(buildAdminApiPath("/api/admin/framework/authority-contract"), {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error(`Failed to load framework authority contract: ${response.status}`);
  }
  return readJsonResponse<FrameworkAuthorityContract>(response);
}

