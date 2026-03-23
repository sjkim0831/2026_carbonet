import type { ContextKeyItem } from "./ContextKeyStrip";

type ContextKeyPreset = {
  guidedStateId: string;
  templateLineId: string;
  screenFamilyRuleId: string;
  ownerLane: string;
};

function toContextKeyItems(preset: ContextKeyPreset): ContextKeyItem[] {
  return [
    { label: "Guided State", value: preset.guidedStateId },
    { label: "Template Line", value: preset.templateLineId },
    { label: "Screen Family Rule", value: preset.screenFamilyRuleId },
    { label: "Owner Lane", value: preset.ownerLane }
  ];
}

export const authorDesignContextKeys = toContextKeyItems({
  guidedStateId: "guided-build-author-design",
  templateLineId: "admin-line-02",
  screenFamilyRuleId: "ADMIN_WORKSPACE_COMPOSE",
  ownerLane: "res-05-frontend"
});

export const verifyRuntimeContextKeys = toContextKeyItems({
  guidedStateId: "guided-build-verify-runtime",
  templateLineId: "admin-line-02",
  screenFamilyRuleId: "ADMIN_LIST_REVIEW",
  ownerLane: "res-09-verify"
});

export const runtimeSurfaceContextKeys = toContextKeyItems({
  guidedStateId: "guided-build-07-runtime-binding",
  templateLineId: "admin-line-02",
  screenFamilyRuleId: "ADMIN_LIST_REVIEW",
  ownerLane: "res-05-frontend"
});

export const codexWorkbenchContextKeys = toContextKeyItems({
  guidedStateId: "guided-build-prepare-plan-build",
  templateLineId: "admin-line-02",
  screenFamilyRuleId: "ADMIN_WORKBENCH_FLOW",
  ownerLane: "res-05-frontend"
});
