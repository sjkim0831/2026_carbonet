import { useEffect, useMemo, useState } from "react";
import { getCurrentRuntimeSearch } from "../../app/routes/runtime";
import { logGovernanceScope } from "../../app/policy/debug";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, DiagnosticCard, GridToolbar, KeyValueGridPanel, MemberLinkButton, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";

type ImpactMode = "page" | "feature" | "runtime" | "integration";

const IMPACT_MODES: Array<{ key: ImpactMode; labelKo: string; labelEn: string }> = [
  { key: "page", labelKo: "페이지 영향", labelEn: "Page Impact" },
  { key: "feature", labelKo: "기능 영향", labelEn: "Feature Impact" },
  { key: "runtime", labelKo: "런타임 영향", labelEn: "Runtime Impact" },
  { key: "integration", labelKo: "연계 영향", labelEn: "Integration Impact" }
];

function getImpactMode() {
  const value = new URLSearchParams(getCurrentRuntimeSearch()).get("mode") || "";
  return (IMPACT_MODES.some((item) => item.key === value) ? value : "page") as ImpactMode;
}

function buildAssetImpactHref(mode = "") {
  const query = mode ? `?mode=${encodeURIComponent(mode)}` : "";
  return buildLocalizedPath(`/admin/system/asset-impact${query}`, `/en/admin/system/asset-impact${query}`);
}

export function AssetImpactMigrationPage() {
  const en = isEnglish();
  const [activeMode, setActiveMode] = useState<ImpactMode>(getImpactMode());

  const modeConfig = useMemo(() => {
    const configs: Record<ImpactMode, {
      titleKo: string;
      titleEn: string;
      summaryKo: string;
      summaryEn: string;
      linkedConsoleKo: string[];
      linkedConsoleEn: string[];
      checksKo: string[];
      checksEn: string[];
      itemsKo: Array<{ label: string; value: string }>;
      itemsEn: Array<{ label: string; value: string }>;
      links: Array<{ labelKo: string; labelEn: string; href: string }>;
    }> = {
      page: {
        titleKo: "페이지 영향도",
        titleEn: "Page Impact",
        summaryKo: "메뉴, pageId, 기본 VIEW 기능, 숨김 화면 active 메뉴, 삭제 영향도를 함께 검토합니다.",
        summaryEn: "Review menu, pageId, default VIEW feature, hidden-screen active menu rules, and delete impact together.",
        linkedConsoleKo: ["환경 관리", "메뉴 관리", "화면 흐름 관리"],
        linkedConsoleEn: ["Environment", "Menu Management", "Screen Flow"],
        checksKo: ["기본 VIEW 기능 정리 여부", "권한 매핑 정리 여부", "숨김 화면 active 메뉴 유지 여부"],
        checksEn: ["Default VIEW cleanup", "Authority mapping cleanup", "Hidden-screen active-menu continuity"],
        itemsKo: [
          { label: "주요 체인", value: "menu -> page -> VIEW feature -> hidden routes" },
          { label: "현재 소스", value: "environment-management page-impact API" },
          { label: "보강 필요", value: "다운로드/도움말/첨부 영향도 통합" }
        ],
        itemsEn: [
          { label: "Main chain", value: "menu -> page -> VIEW feature -> hidden routes" },
          { label: "Current source", value: "environment-management page-impact API" },
          { label: "Gap", value: "Unify download/help/attachment impact" }
        ],
        links: [
          { labelKo: "환경 관리", labelEn: "Environment", href: buildLocalizedPath("/admin/system/environment-management", "/en/admin/system/environment-management") },
          { labelKo: "화면 흐름 관리", labelEn: "Screen Flow", href: buildLocalizedPath("/admin/system/screen-flow-management", "/en/admin/system/screen-flow-management") }
        ]
      },
      feature: {
        titleKo: "기능 영향도",
        titleEn: "Feature Impact",
        summaryKo: "featureCode 삭제 또는 수정 전에 역할 매핑, 사용자 override, 실행 버튼 노출을 함께 검토합니다.",
        summaryEn: "Before deleting or changing a featureCode, review role mappings, user overrides, and execution-button exposure together.",
        linkedConsoleKo: ["환경 관리", "기능 관리", "권한 화면"],
        linkedConsoleEn: ["Environment", "Feature Management", "Authority screens"],
        checksKo: ["역할 매핑 건수", "사용자 override 건수", "실행 버튼 노출 차단 여부"],
        checksEn: ["Role-mapping count", "User override count", "Execution-button exposure blocks"],
        itemsKo: [
          { label: "주요 체인", value: "feature -> role -> user override -> action button" },
          { label: "현재 소스", value: "environment-management feature-impact API" },
          { label: "보강 필요", value: "화면별 action scope 미세 연결" }
        ],
        itemsEn: [
          { label: "Main chain", value: "feature -> role -> user override -> action button" },
          { label: "Current source", value: "environment-management feature-impact API" },
          { label: "Gap", value: "Finer page-to-action-scope mapping" }
        ],
        links: [
          { labelKo: "기능 관리", labelEn: "Feature Management", href: buildLocalizedPath("/admin/system/feature-management", "/en/admin/system/feature-management") },
          { labelKo: "보안 정책", labelEn: "Security Policy", href: buildLocalizedPath("/admin/system/security-policy", "/en/admin/system/security-policy") }
        ]
      },
      runtime: {
        titleKo: "런타임 영향도",
        titleEn: "Runtime Impact",
        summaryKo: "배포 전후 기준으로 published runtime, compare, repair, backup/restore 영향을 함께 검토합니다.",
        summaryEn: "Review published runtime, compare, repair, and backup/restore impacts together before and after deployment.",
        linkedConsoleKo: ["런타임 비교", "리페어 워크벤치", "백업 설정"],
        linkedConsoleEn: ["Runtime Compare", "Repair Workbench", "Backup Config"],
        checksKo: ["runtime package identity", "rollback anchor", "backup/restore evidence"],
        checksEn: ["runtime package identity", "rollback anchor", "backup/restore evidence"],
        itemsKo: [
          { label: "주요 체인", value: "publish -> compare -> repair -> rollback" },
          { label: "현재 소스", value: "current-runtime-compare / repair-workbench" },
          { label: "보강 필요", value: "운영자산 단위 증적 묶음" }
        ],
        itemsEn: [
          { label: "Main chain", value: "publish -> compare -> repair -> rollback" },
          { label: "Current source", value: "current-runtime-compare / repair-workbench" },
          { label: "Gap", value: "Asset-level runtime evidence packet" }
        ],
        links: [
          { labelKo: "런타임 비교", labelEn: "Runtime Compare", href: buildLocalizedPath("/admin/system/current-runtime-compare", "/en/admin/system/current-runtime-compare") },
          { labelKo: "리페어 워크벤치", labelEn: "Repair Workbench", href: buildLocalizedPath("/admin/system/repair-workbench", "/en/admin/system/repair-workbench") }
        ]
      },
      integration: {
        titleKo: "연계 영향도",
        titleEn: "Integration Impact",
        summaryKo: "점검, 재시도, 웹훅, 스키마, 키 회전이 외부연계 실행에 미치는 영향을 함께 검토합니다.",
        summaryEn: "Review how maintenance, retry, webhooks, schema, and key rotation affect external integration execution.",
        linkedConsoleKo: ["연계 모니터링", "재시도 관리", "점검 관리"],
        linkedConsoleEn: ["External Monitoring", "Retry Management", "Maintenance"],
        checksKo: ["재전송 backlog", "fallback route", "schema publish / key rotation 영향"],
        checksEn: ["Replay backlog", "fallback route", "schema publish / key rotation impact"],
        itemsKo: [
          { label: "주요 체인", value: "connection -> schema/key -> webhook/sync -> retry/maintenance" },
          { label: "현재 소스", value: "external-monitoring / external-maintenance" },
          { label: "보강 필요", value: "연계별 영향도 승인 흐름" }
        ],
        itemsEn: [
          { label: "Main chain", value: "connection -> schema/key -> webhook/sync -> retry/maintenance" },
          { label: "Current source", value: "external-monitoring / external-maintenance" },
          { label: "Gap", value: "Per-integration impact approval flow" }
        ],
        links: [
          { labelKo: "연계 모니터링", labelEn: "External Monitoring", href: buildLocalizedPath("/admin/external/monitoring", "/en/admin/external/monitoring") },
          { labelKo: "점검 관리", labelEn: "Maintenance", href: buildLocalizedPath("/admin/external/maintenance", "/en/admin/external/maintenance") }
        ]
      }
    };
    return configs[activeMode];
  }, [activeMode]);

  useEffect(() => {
    logGovernanceScope("PAGE", "asset-impact", {
      language: en ? "en" : "ko",
      mode: activeMode
    });
    logGovernanceScope("COMPONENT", "asset-impact-mode", {
      mode: activeMode
    });
  }, [activeMode, en]);

  return (
    <AdminPageShell
      title={en ? "Asset Impact Console" : "자산 영향도 콘솔"}
      subtitle={en
        ? "Bring page, feature, runtime, and integration impact checks into one governed entry."
        : "페이지, 기능, 런타임, 연계 영향 검토를 하나의 거버넌스 진입점으로 묶습니다."}
      breadcrumbs={[
        { label: en ? "Asset Inventory" : "자산 인벤토리", href: buildLocalizedPath("/admin/system/asset-inventory", "/en/admin/system/asset-inventory") },
        { label: en ? "Asset Impact" : "자산 영향도" }
      ]}
    >
      <AdminWorkspacePageFrame>
        <PageStatusNotice tone="info">
          {en
            ? "This first version consolidates existing impact checks. The next step is binding it to real selected menu, feature, runtime package, and integration identifiers."
            : "이번 1차 버전은 기존 영향도 점검 소스를 모아둔 것입니다. 다음 단계는 실제 메뉴, 기능, 런타임 패키지, 연계 식별자를 바인딩하는 것입니다."}
        </PageStatusNotice>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-help-id="asset-impact-summary">
          <SummaryMetricCard title={en ? "Impact Modes" : "영향 모드"} value={`${IMPACT_MODES.length}`} />
          <SummaryMetricCard title={en ? "Linked Consoles" : "연결 콘솔"} value={`${modeConfig.links.length}`} />
          <SummaryMetricCard title={en ? "Check Items" : "점검 항목"} value={`${modeConfig.checksKo.length}`} />
          <SummaryMetricCard title={en ? "Current Mode" : "현재 모드"} value={en ? modeConfig.titleEn : modeConfig.titleKo} />
        </section>

        <section className="gov-card" data-help-id="asset-impact-modes">
          <GridToolbar title={en ? "Impact modes" : "영향도 모드"} />
          <div aria-label={en ? "Asset impact modes" : "자산 영향도 모드"} className="flex flex-wrap gap-2" role="tablist">
            {IMPACT_MODES.map((mode) => {
              const selected = activeMode === mode.key;
              return (
                <button
                  aria-selected={selected}
                  className={`rounded border px-4 py-2 text-sm font-bold ${selected ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white" : "border-slate-200 bg-white text-[var(--kr-gov-text-primary)]"}`}
                  key={mode.key}
                  onClick={() => setActiveMode(mode.key)}
                  role="tab"
                  type="button"
                >
                  {en ? mode.labelEn : mode.labelKo}
                </button>
              );
            })}
          </div>
        </section>

        <DiagnosticCard
          data-help-id="asset-impact-overview"
          title={en ? modeConfig.titleEn : modeConfig.titleKo}
          status={en ? "Governed impact shell" : "거버넌스 영향 쉘"}
          statusTone="warning"
          description={en ? modeConfig.summaryEn : modeConfig.summaryKo}
          actions={(
            <>
              <MemberLinkButton href={buildAssetImpactHref("page")} size="sm" variant="secondary">
                {en ? "Page Impact" : "페이지 영향"}
              </MemberLinkButton>
              <MemberLinkButton href={buildAssetImpactHref("runtime")} size="sm" variant="secondary">
                {en ? "Runtime Impact" : "런타임 영향"}
              </MemberLinkButton>
            </>
          )}
        />

        <section className="grid gap-6 xl:grid-cols-2" data-help-id="asset-impact-details">
          <KeyValueGridPanel
            className="gov-card"
            description={en ? modeConfig.summaryEn : modeConfig.summaryKo}
            items={(en ? modeConfig.itemsEn : modeConfig.itemsKo)}
            title={en ? "Current baseline" : "현재 기준선"}
          />

          <CollectionResultPanel
            title={en ? "Checklist" : "체크리스트"}
            description={en
              ? "These are the minimum checks this impact mode should show before an operator approves a change."
              : "운영자가 변경을 승인하기 전에 이 영향 모드에서 보여야 하는 최소 점검 항목입니다."}
          >
            <div className="space-y-2">
              {(en ? modeConfig.checksEn : modeConfig.checksKo).map((item) => (
                <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </CollectionResultPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2" data-help-id="asset-impact-links">
          <CollectionResultPanel
            title={en ? "Linked consoles" : "연결 콘솔"}
            description={en
              ? "These existing screens already own real impact evidence and should remain the source of truth."
              : "이 기존 화면들은 이미 실제 영향도 증적을 가지고 있으며 계속 원본 역할을 해야 합니다."}
          >
            <div className="flex flex-wrap gap-2">
              {modeConfig.links.map((link) => (
                <MemberLinkButton href={link.href} key={link.href} size="sm" variant="secondary">
                  {en ? link.labelEn : link.labelKo}
                </MemberLinkButton>
              ))}
            </div>
          </CollectionResultPanel>

          <CollectionResultPanel
            title={en ? "Current source map" : "현재 소스 맵"}
            description={en
              ? "Use this map to understand where current evidence comes from before centralizing it here."
              : "이곳으로 중앙화하기 전에 현재 증적이 어디서 오는지 파악하는 용도로 사용합니다."}
          >
            <div className="space-y-2 text-sm">
              {(en ? modeConfig.linkedConsoleEn : modeConfig.linkedConsoleKo).map((item) => (
                <div className="rounded-[var(--kr-gov-radius)] border border-blue-200 bg-blue-50 px-4 py-3" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </CollectionResultPanel>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
