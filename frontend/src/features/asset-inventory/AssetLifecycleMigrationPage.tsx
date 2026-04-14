import { useEffect, useMemo, useState } from "react";
import { getCurrentRuntimeSearch } from "../../app/routes/runtime";
import { logGovernanceScope } from "../../app/policy/debug";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { CollectionResultPanel, DiagnosticCard, GridToolbar, KeyValueGridPanel, MemberLinkButton, PageStatusNotice, SummaryMetricCard } from "../admin-ui/common";
import { AdminWorkspacePageFrame } from "../admin-ui/pageFrames";

type LifecycleStage = "create" | "publish" | "deprecate" | "retire";

const LIFECYCLE_STAGES: Array<{ key: LifecycleStage; labelKo: string; labelEn: string }> = [
  { key: "create", labelKo: "생성/등록", labelEn: "Create / Register" },
  { key: "publish", labelKo: "배포/반영", labelEn: "Publish / Bind" },
  { key: "deprecate", labelKo: "축소/폐기예고", labelEn: "Deprecate" },
  { key: "retire", labelKo: "폐기/삭제", labelEn: "Retire / Delete" }
];

function getLifecycleStage() {
  const value = new URLSearchParams(getCurrentRuntimeSearch()).get("stage") || "";
  return (LIFECYCLE_STAGES.some((item) => item.key === value) ? value : "create") as LifecycleStage;
}

function buildAssetLifecycleHref(stage = "") {
  const query = stage ? `?stage=${encodeURIComponent(stage)}` : "";
  return buildLocalizedPath(`/admin/system/asset-lifecycle${query}`, `/en/admin/system/asset-lifecycle${query}`);
}

export function AssetLifecycleMigrationPage() {
  const en = isEnglish();
  const [activeStage, setActiveStage] = useState<LifecycleStage>(getLifecycleStage());

  const stageConfig = useMemo(() => {
    const configs: Record<LifecycleStage, {
      titleKo: string;
      titleEn: string;
      summaryKo: string;
      summaryEn: string;
      checklistKo: string[];
      checklistEn: string[];
      itemsKo: Array<{ label: string; value: string }>;
      itemsEn: Array<{ label: string; value: string }>;
      links: Array<{ labelKo: string; labelEn: string; href: string }>;
    }> = {
      create: {
        titleKo: "자산 생성/등록",
        titleEn: "Asset Create / Register",
        summaryKo: "새 자산은 식별자, 소유자, 메뉴/라우트 바인딩, 권한, 백업 기준이 함께 등록되어야 합니다.",
        summaryEn: "New assets must register identity, owner, menu or route binding, authority, and backup baseline together.",
        checklistKo: ["자산 식별자 발급", "소유자/운영부서 지정", "메뉴 및 route 바인딩", "기본 VIEW 권한 생성"],
        checklistEn: ["Issue asset identity", "Assign owner and operator", "Bind menu and route", "Create default VIEW authority"],
        itemsKo: [
          { label: "핵심 체인", value: "inventory -> detail -> feature -> owner" },
          { label: "현재 원본", value: "environment-management / menu-management" },
          { label: "보강 필요", value: "백업/보안 기본정책 자동 연결" }
        ],
        itemsEn: [
          { label: "Main chain", value: "inventory -> detail -> feature -> owner" },
          { label: "Current source", value: "environment-management / menu-management" },
          { label: "Gap", value: "Auto-bind backup and security baseline" }
        ],
        links: [
          { labelKo: "자산 인벤토리", labelEn: "Asset Inventory", href: buildLocalizedPath("/admin/system/asset-inventory", "/en/admin/system/asset-inventory") },
          { labelKo: "환경 관리", labelEn: "Environment", href: buildLocalizedPath("/admin/system/environment-management", "/en/admin/system/environment-management") }
        ]
      },
      publish: {
        titleKo: "자산 배포/반영",
        titleEn: "Asset Publish / Bind",
        summaryKo: "배포 전후 기준으로 runtime compare, backup anchor, 영향도, 승인 증적을 같이 묶어야 합니다.",
        summaryEn: "Before and after deployment, runtime compare, backup anchor, impact, and approval evidence should stay together.",
        checklistKo: ["배포 대상 식별", "compare 기준선 확보", "rollback anchor 확보", "검증 URL 확인"],
        checklistEn: ["Identify deploy target", "Capture compare baseline", "Capture rollback anchor", "Verify target route"],
        itemsKo: [
          { label: "핵심 체인", value: "publish -> compare -> verify -> rollback" },
          { label: "현재 원본", value: "current-runtime-compare / repair-workbench" },
          { label: "보강 필요", value: "자산 단위 승인 로그" }
        ],
        itemsEn: [
          { label: "Main chain", value: "publish -> compare -> verify -> rollback" },
          { label: "Current source", value: "current-runtime-compare / repair-workbench" },
          { label: "Gap", value: "Asset-level approval log" }
        ],
        links: [
          { labelKo: "자산 영향도", labelEn: "Asset Impact", href: buildLocalizedPath("/admin/system/asset-impact?mode=runtime", "/en/admin/system/asset-impact?mode=runtime") },
          { labelKo: "런타임 비교", labelEn: "Runtime Compare", href: buildLocalizedPath("/admin/system/current-runtime-compare", "/en/admin/system/current-runtime-compare") }
        ]
      },
      deprecate: {
        titleKo: "자산 축소/폐기예고",
        titleEn: "Asset Deprecate",
        summaryKo: "폐기예고 단계에서는 대체 경로, 잔존 호출, 권한 잔존, 외부연계 영향도를 먼저 닫아야 합니다.",
        summaryEn: "Deprecation should first close alternate paths, remaining calls, leftover authority, and integration impact.",
        checklistKo: ["대체 자산 지정", "잔존 메뉴/링크 정리", "권한 회수 계획", "연계 재전송 정리"],
        checklistEn: ["Assign replacement asset", "Clean remaining menu and links", "Plan authority removal", "Clean integration replay"],
        itemsKo: [
          { label: "핵심 체인", value: "impact -> replacement -> authority cleanup -> notice" },
          { label: "현재 원본", value: "screen-flow / screen-menu-assignment / external-monitoring" },
          { label: "보강 필요", value: "폐기예고 상태값 공통화" }
        ],
        itemsEn: [
          { label: "Main chain", value: "impact -> replacement -> authority cleanup -> notice" },
          { label: "Current source", value: "screen-flow / screen-menu-assignment / external-monitoring" },
          { label: "Gap", value: "Common deprecation status" }
        ],
        links: [
          { labelKo: "화면 흐름 관리", labelEn: "Screen Flow", href: buildLocalizedPath("/admin/system/screen-flow-management", "/en/admin/system/screen-flow-management") },
          { labelKo: "메뉴 배정 관리", labelEn: "Screen Menu Assignment", href: buildLocalizedPath("/admin/system/screen-menu-assignment-management", "/en/admin/system/screen-menu-assignment-management") }
        ]
      },
      retire: {
        titleKo: "자산 폐기/삭제",
        titleEn: "Asset Retire / Delete",
        summaryKo: "삭제는 단순 제거가 아니라 owner 확인, 영향도, 백업 보존, 감사 증적, 복구 경로까지 포함해야 합니다.",
        summaryEn: "Deletion is not simple removal. It must include owner confirmation, impact, backup retention, audit evidence, and recovery path.",
        checklistKo: ["owner 승인", "삭제 영향도 검토", "백업 보존기간 확인", "복구 경로 기록"],
        checklistEn: ["Owner approval", "Review delete impact", "Check backup retention", "Record recovery path"],
        itemsKo: [
          { label: "핵심 체인", value: "retire plan -> impact -> backup retention -> delete evidence" },
          { label: "현재 원본", value: "backup-config / observability / environment-management" },
          { label: "보강 필요", value: "자산별 삭제 승인 워크플로우" }
        ],
        itemsEn: [
          { label: "Main chain", value: "retire plan -> impact -> backup retention -> delete evidence" },
          { label: "Current source", value: "backup-config / observability / environment-management" },
          { label: "Gap", value: "Per-asset deletion approval workflow" }
        ],
        links: [
          { labelKo: "백업 설정", labelEn: "Backup Config", href: buildLocalizedPath("/admin/system/backup_config", "/en/admin/system/backup_config") },
          { labelKo: "관측성", labelEn: "Observability", href: buildLocalizedPath("/admin/system/observability", "/en/admin/system/observability") }
        ]
      }
    };
    return configs[activeStage];
  }, [activeStage]);

  useEffect(() => {
    logGovernanceScope("PAGE", "asset-lifecycle", {
      language: en ? "en" : "ko",
      stage: activeStage
    });
    logGovernanceScope("COMPONENT", "asset-lifecycle-stage", {
      stage: activeStage
    });
  }, [activeStage, en]);

  return (
    <AdminPageShell
      title={en ? "Asset Lifecycle Console" : "자산 생명주기 콘솔"}
      subtitle={en ? "Govern create, publish, deprecate, retire, and rollback paths for managed assets." : "자산의 생성, 반영, 축소, 폐기, 롤백 경로를 한 화면에서 관리합니다."}
      breadcrumbs={[
        { label: en ? "Asset Inventory" : "자산 인벤토리", href: buildLocalizedPath("/admin/system/asset-inventory", "/en/admin/system/asset-inventory") },
        { label: en ? "Asset Lifecycle" : "자산 생명주기" }
      ]}
    >
      <AdminWorkspacePageFrame>
        <PageStatusNotice tone="info">
          {en
            ? "This first version organizes lifecycle checkpoints. The next step is binding it to real approval, backup, authority, and delete-evidence data."
            : "이번 1차 버전은 생명주기 점검 지점을 정리한 것입니다. 다음 단계는 실제 승인, 백업, 권한, 삭제 증적 데이터와 연결하는 것입니다."}
        </PageStatusNotice>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" data-help-id="asset-lifecycle-summary">
          <SummaryMetricCard title={en ? "Stages" : "단계 수"} value={`${LIFECYCLE_STAGES.length}`} />
          <SummaryMetricCard title={en ? "Linked Consoles" : "연결 콘솔"} value={`${stageConfig.links.length}`} />
          <SummaryMetricCard title={en ? "Checks" : "점검 항목"} value={`${stageConfig.checklistKo.length}`} />
          <SummaryMetricCard title={en ? "Current Stage" : "현재 단계"} value={en ? stageConfig.titleEn : stageConfig.titleKo} />
        </section>

        <section className="gov-card" data-help-id="asset-lifecycle-stages">
          <GridToolbar title={en ? "Lifecycle stages" : "생명주기 단계"} />
          <div aria-label={en ? "Asset lifecycle stages" : "자산 생명주기 단계"} className="flex flex-wrap gap-2" role="tablist">
            {LIFECYCLE_STAGES.map((stage) => {
              const selected = activeStage === stage.key;
              return (
                <button
                  aria-selected={selected}
                  className={`rounded border px-4 py-2 text-sm font-bold ${selected ? "border-[var(--kr-gov-blue)] bg-[var(--kr-gov-blue)] text-white" : "border-slate-200 bg-white text-[var(--kr-gov-text-primary)]"}`}
                  key={stage.key}
                  onClick={() => setActiveStage(stage.key)}
                  role="tab"
                  type="button"
                >
                  {en ? stage.labelEn : stage.labelKo}
                </button>
              );
            })}
          </div>
        </section>

        <DiagnosticCard
          data-help-id="asset-lifecycle-overview"
          title={en ? stageConfig.titleEn : stageConfig.titleKo}
          status={en ? "Lifecycle governance shell" : "생명주기 거버넌스 쉘"}
          statusTone="warning"
          description={en ? stageConfig.summaryEn : stageConfig.summaryKo}
          actions={(
            <>
              <MemberLinkButton href={buildAssetLifecycleHref("create")} size="sm" variant="secondary">
                {en ? "Create Stage" : "생성 단계"}
              </MemberLinkButton>
              <MemberLinkButton href={buildAssetLifecycleHref("retire")} size="sm" variant="secondary">
                {en ? "Retire Stage" : "폐기 단계"}
              </MemberLinkButton>
            </>
          )}
        />

        <section className="grid gap-6 xl:grid-cols-2" data-help-id="asset-lifecycle-checklist">
          <KeyValueGridPanel
            className="gov-card"
            description={en ? stageConfig.summaryEn : stageConfig.summaryKo}
            items={en ? stageConfig.itemsEn : stageConfig.itemsKo}
            title={en ? "Current baseline" : "현재 기준선"}
          />

          <CollectionResultPanel
            title={en ? "Stage checklist" : "단계 체크리스트"}
            description={en
              ? "These are the minimum lifecycle checkpoints the platform should prove before moving this asset to the next state."
              : "이 자산을 다음 상태로 넘기기 전에 플랫폼이 증명해야 하는 최소 생명주기 점검 항목입니다."}
          >
            <div className="space-y-2">
              {(en ? stageConfig.checklistEn : stageConfig.checklistKo).map((item) => (
                <div className="rounded-[var(--kr-gov-radius)] border border-slate-200 bg-slate-50 px-4 py-3 text-sm" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </CollectionResultPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-2" data-help-id="asset-lifecycle-links">
          <CollectionResultPanel
            title={en ? "Linked consoles" : "연결 콘솔"}
            description={en
              ? "Existing screens already own parts of lifecycle evidence. This console should orchestrate them instead of replacing them."
              : "기존 화면들이 이미 생명주기 증적 일부를 소유하고 있습니다. 이 콘솔은 그것들을 대체하지 않고 묶어야 합니다."}
          >
            <div className="flex flex-wrap gap-2">
              {stageConfig.links.map((link) => (
                <MemberLinkButton href={link.href} key={link.href} size="sm" variant="secondary">
                  {en ? link.labelEn : link.labelKo}
                </MemberLinkButton>
              ))}
            </div>
          </CollectionResultPanel>

          <CollectionResultPanel
            title={en ? "Operator note" : "운영자 메모"}
            description={en
              ? "Lifecycle control should remain explicit. Retirement and delete approval should not stay hidden inside low-level menu or page delete actions."
              : "생명주기 통제는 드러나 있어야 합니다. 폐기와 삭제 승인은 하위 메뉴 삭제나 페이지 삭제 안에 숨기면 안 됩니다."}
          >
            <div className="space-y-2 text-sm text-[var(--kr-gov-text-secondary)]">
              <p>{en ? "The next implementation step is a real plan record with owner, due date, approval state, and rollback evidence." : "다음 구현 단계는 owner, 예정일, 승인상태, 롤백 증적을 가진 실제 계획 레코드입니다."}</p>
              <p>{en ? "This first shell gives the lifecycle checkpoints and the source consoles already present in the repository." : "이번 1차 쉘은 생명주기 점검축과 현재 저장소에 이미 있는 원본 콘솔을 먼저 정리합니다."}</p>
            </div>
          </CollectionResultPanel>
        </section>
      </AdminWorkspacePageFrame>
    </AdminPageShell>
  );
}
