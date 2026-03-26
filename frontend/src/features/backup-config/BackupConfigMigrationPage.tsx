import { useEffect, useMemo, useState } from "react";
import { useAsyncValue } from "../../app/hooks/useAsyncValue";
import { logGovernanceScope } from "../../app/policy/debug";
import { fetchBackupConfigPage, readBootstrappedBackupConfigPageData, runBackupExecution, saveBackupConfig, type BackupConfigPagePayload } from "../../lib/api/client";
import { buildLocalizedPath, isEnglish } from "../../lib/navigation/runtime";
import { AdminPageShell } from "../admin-entry/AdminPageShell";
import { AdminCheckbox, AdminInput, MemberButton, MemberPageActions, PageStatusNotice } from "../member/common";
import { stringOf } from "../admin-system/adminSystemShared";

function valueOf(form: Record<string, string>, key: string) {
  return form[key] || "";
}

function yes(form: Record<string, string>, key: string) {
  return valueOf(form, key) === "Y";
}

function BackupField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold text-[var(--kr-gov-text-primary)]">{label}</span>
      <AdminInput type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

function BackupSecretHint({ configured, masked, en }: { configured: boolean; masked: string; en: boolean }) {
  return (
    <div className="rounded-[var(--kr-gov-radius)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
      {configured
        ? (en ? `Token stored securely. Current value is hidden as ${masked || "********"}. Leave the field blank to keep it.` : `토큰이 저장되어 있습니다. 현재 값은 ${masked || "********"} 로 숨김 처리됩니다. 유지하려면 입력란을 비워 두세요.`)
        : (en ? "No token is stored. Enter a Git personal access token to enable authenticated push." : "저장된 토큰이 없습니다. 인증된 push를 위해 Git 개인 액세스 토큰을 입력하세요.")}
    </div>
  );
}

function BackupToggle({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (checked: boolean) => void; description: string }) {
  return (
    <label className="flex items-start gap-3 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-4">
      <AdminCheckbox checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="flex-1">
        <span className="block text-sm font-bold text-[var(--kr-gov-text-primary)]">{label}</span>
        <span className="mt-1 block text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{description}</span>
      </span>
    </label>
  );
}

export function BackupConfigMigrationPage() {
  const en = isEnglish();
  const pathname = typeof window === "undefined" ? "/admin/system/backup_config" : window.location.pathname;
  const initialPayload = useMemo(() => readBootstrappedBackupConfigPageData(), []);
  const pageState = useAsyncValue<BackupConfigPagePayload>(() => fetchBackupConfigPage(pathname), [pathname], {
    initialValue: initialPayload,
    skipInitialLoad: Boolean(initialPayload)
  });
  const page = pageState.value;
  const summary = (page?.backupConfigSummary || []) as Array<Record<string, string>>;
  const storages = (page?.backupStorageRows || []) as Array<Record<string, string>>;
  const executions = (page?.backupExecutionRows || []) as Array<Record<string, string>>;
  const versions = (page?.backupVersionRows || []) as Array<Record<string, string>>;
  const playbooks = (page?.backupRecoveryPlaybooks || []) as Array<Record<string, string>>;
  const gitPrecheckRows = (page?.backupGitPrecheckRows || []) as Array<Record<string, string>>;
  const currentJob = (page?.backupCurrentJob || null) as Record<string, unknown> | null;
  const backupJobActive = String(currentJob?.status || "") === "QUEUED" || String(currentJob?.status || "") === "RUNNING";
  const [form, setForm] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [runningDbBackup, setRunningDbBackup] = useState(false);
  const [runningGitExecution, setRunningGitExecution] = useState<"" | "PRECHECK" | "CLEANUP" | "BUNDLE" | "COMMIT_BASE" | "BASE" | "PUSH" | "TAG">("");

  useEffect(() => {
    setForm(((page?.backupConfigForm || {}) as Record<string, string>));
    if (page?.backupConfigMessage) {
      setMessage(String(page.backupConfigMessage));
    }
  }, [page?.backupConfigForm, page?.backupConfigMessage]);

  useEffect(() => {
    const status = String(currentJob?.status || "");
    if (!status || (status !== "QUEUED" && status !== "RUNNING") || pageState.error) {
      setRunningGitExecution("");
      setRunningDbBackup(false);
    }
  }, [currentJob, pageState.error]);

  useEffect(() => {
    const status = String(currentJob?.status || "");
    if (status !== "QUEUED" && status !== "RUNNING") {
      return;
    }
    const timer = window.setInterval(async () => {
      try {
        const next = await fetchBackupConfigPage(pathname);
        pageState.setValue(next);
      } catch {
        // Ignore transient polling failures and keep the current page state.
      }
    }, 2000);
    return () => window.clearInterval(timer);
  }, [currentJob, pageState, pathname]);

  const preset = (() => {
    if (pathname.endsWith("/admin/system/backup") || pathname.endsWith("/en/admin/system/backup")) {
      return {
        pageKey: "backup-execution",
        title: en ? "Backup Execution" : "백업 실행",
        subtitle: en ? "Review backup execution history and the current source/database backup readiness." : "백업 실행 이력과 현재 소스/DB 백업 준비 상태를 확인합니다."
      };
    }
    if (pathname.endsWith("/admin/system/restore") || pathname.endsWith("/en/admin/system/restore")) {
      return {
        pageKey: "restore-execution",
        title: en ? "Restore Execution" : "복구 실행",
        subtitle: en ? "Use the saved backup settings and playbooks to prepare restore drills and rollback actions." : "저장된 백업 설정과 플레이북을 기준으로 복구 리허설과 롤백 절차를 준비합니다."
      };
    }
    if (pathname.endsWith("/admin/system/version") || pathname.endsWith("/en/admin/system/version")) {
      return {
        pageKey: "version-management",
        title: en ? "Version Management" : "버전 관리",
        subtitle: en ? "Track saved backup configuration versions and compare what changed over time." : "저장된 백업 설정 버전과 변경 이력을 시간순으로 추적합니다."
      };
    }
    return {
      pageKey: "backup-config",
      title: en ? "Backup Settings" : "백업 설정",
      subtitle: en ? "Register folder, cron, git backup, and database backup settings used by the backup operation pages." : "백업 실행 페이지가 공통으로 사용하는 폴더, 크론, git 백업, DB 백업 설정을 등록합니다."
    };
  })();

  logGovernanceScope("PAGE", preset.pageKey, {
    language: en ? "en" : "ko",
    summaryCount: summary.length,
    storageCount: storages.length,
    executionCount: executions.length,
    versionCount: versions.length,
    gitPrecheckCount: gitPrecheckRows.length
  });

  const updateField = (key: string, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    logGovernanceScope("ACTION", "backup-config-save", { pageKey: preset.pageKey, backupRootPath: valueOf(form, "backupRootPath"), cronExpression: valueOf(form, "cronExpression") });
    try {
      const saved = await saveBackupConfig(form);
      pageState.setValue(saved);
      setMessage(String(saved.backupConfigMessage || (en ? "Backup settings have been saved." : "백업 설정이 저장되었습니다.")));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (en ? "Failed to save backup settings." : "백업 설정 저장 중 오류가 발생했습니다."));
    } finally {
      setSaving(false);
    }
  };

  const handleRunDbBackup = async () => {
    setRunningDbBackup(true);
    setMessage("");
    logGovernanceScope("ACTION", "backup-execution-db-run", { pageKey: preset.pageKey, dbEnabled: valueOf(form, "dbEnabled"), dbName: valueOf(form, "dbName") });
    try {
      const nextPage = await runBackupExecution("DB");
      pageState.setValue(nextPage);
      setMessage(String(nextPage.backupConfigMessage || (en ? "Database backup finished." : "DB 백업이 완료되었습니다.")));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (en ? "Database backup failed." : "DB 백업 실행 중 오류가 발생했습니다."));
    } finally {
      setRunningDbBackup(false);
    }
  };

  const handleRunGitExecution = async (kind: "PRECHECK" | "CLEANUP" | "BUNDLE" | "COMMIT_BASE" | "BASE" | "PUSH" | "TAG") => {
    setRunningGitExecution(kind);
    setMessage("");
    logGovernanceScope("ACTION", `backup-execution-git-${kind.toLowerCase()}`, {
      pageKey: preset.pageKey,
      gitEnabled: valueOf(form, "gitEnabled"),
      gitRepositoryPath: valueOf(form, "gitRepositoryPath"),
      gitBackupMode: valueOf(form, "gitBackupMode")
    });
    try {
      const executionType = kind === "BUNDLE"
        ? "GIT_BUNDLE"
        : kind === "PRECHECK"
          ? "GIT_PRECHECK"
        : kind === "CLEANUP"
          ? "GIT_CLEANUP_SAFE"
        : kind === "COMMIT_BASE"
          ? "GIT_COMMIT_AND_PUSH_BASE"
        : kind === "BASE"
          ? "GIT_PUSH_BASE"
          : kind === "PUSH"
            ? "GIT_PUSH_RESTORE"
            : "GIT_TAG_PUSH";
      const nextPage = await runBackupExecution(executionType);
      pageState.setValue(nextPage);
      setMessage(String(nextPage.backupConfigMessage || (
        kind === "PRECHECK"
          ? (en ? "Git push precheck finished." : "Git Push 사전 점검이 완료되었습니다.")
        : kind === "CLEANUP"
          ? (en ? "Git safe artifact cleanup finished." : "산출물 자동 정리가 완료되었습니다.")
        : kind === "BUNDLE"
          ? (en ? "Git bundle backup finished." : "Git 번들 백업이 완료되었습니다.")
          : kind === "COMMIT_BASE"
            ? (en ? "Git commit and base-branch push finished." : "Git 전체 커밋 후 기준 브랜치 Push가 완료되었습니다.")
          : kind === "BASE"
            ? (en ? "Git base-branch push finished." : "Git 기준 브랜치 Push가 완료되었습니다.")
          : kind === "PUSH"
            ? (en ? "Git restore-branch push finished." : "Git 복구 브랜치 Push가 완료되었습니다.")
            : (en ? "Git tag push finished." : "Git 태그 Push가 완료되었습니다.")
      )));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (
        kind === "PRECHECK"
          ? (en ? "Git push precheck failed." : "Git Push 사전 점검 실행 중 오류가 발생했습니다.")
        : kind === "CLEANUP"
          ? (en ? "Git safe artifact cleanup failed." : "산출물 자동 정리 실행 중 오류가 발생했습니다.")
        : kind === "BUNDLE"
          ? (en ? "Git bundle backup failed." : "Git 번들 백업 실행 중 오류가 발생했습니다.")
          : kind === "COMMIT_BASE"
            ? (en ? "Git commit and base-branch push failed." : "Git 전체 커밋 후 기준 브랜치 Push 실행 중 오류가 발생했습니다.")
          : kind === "BASE"
            ? (en ? "Git base-branch push failed." : "Git 기준 브랜치 Push 실행 중 오류가 발생했습니다.")
          : kind === "PUSH"
            ? (en ? "Git restore-branch push failed." : "Git 복구 브랜치 Push 실행 중 오류가 발생했습니다.")
            : (en ? "Git tag push failed." : "Git 태그 Push 실행 중 오류가 발생했습니다.")
      ));
    } finally {
      setRunningGitExecution("");
    }
  };

  const renderSummary = (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6" data-help-id="backup-config-summary">
      {summary.map((card, idx) => (
        <article className="gov-card" key={idx}>
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{stringOf(card, "title")}</p>
          <p className={`mt-3 text-2xl font-black ${stringOf(card, "toneClass")}`}>{stringOf(card, "value")}</p>
          <p className="mt-2 text-sm text-[var(--kr-gov-text-secondary)] leading-6">{stringOf(card, "description")}</p>
        </article>
      ))}
    </section>
  );

  const renderStorage = (
    <section className="gov-card p-0 overflow-hidden" data-help-id="backup-config-storage">
      <div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]">
        <h3 className="text-lg font-bold">{en ? "Storage Targets" : "저장 대상"}</h3>
        <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Registered folder and command targets used by backup execution." : "백업 실행이 참조하는 폴더와 명령 대상을 확인합니다."}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="gov-table-header">
              <th className="px-4 py-3">{en ? "Type" : "유형"}</th>
              <th className="px-4 py-3">{en ? "Location" : "위치"}</th>
              <th className="px-4 py-3">{en ? "Owner" : "관리 주체"}</th>
              <th className="px-4 py-3">{en ? "Note" : "비고"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {storages.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-bold">{stringOf(row, "storageType")}</td>
                <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "location")}</td>
                <td className="px-4 py-3">{stringOf(row, "owner")}</td>
                <td className="px-4 py-3">{stringOf(row, "note")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderExecutions = (
    <section className="gov-card p-0 overflow-hidden" data-help-id="backup-config-executions">
      <div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]">
        <h3 className="text-lg font-bold">{en ? "Execution History" : "실행 이력"}</h3>
        <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Recent backup and settings activity." : "최근 백업 및 설정 변경 활동입니다."}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="gov-table-header">
              <th className="px-4 py-3">{en ? "Executed At" : "실행 시각"}</th>
              <th className="px-4 py-3">{en ? "Type" : "유형"}</th>
              <th className="px-4 py-3">{en ? "Result" : "결과"}</th>
              <th className="px-4 py-3">{en ? "Duration" : "소요 시간"}</th>
              <th className="px-4 py-3">{en ? "Note" : "비고"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {executions.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3">{stringOf(row, "executedAt")}</td>
                <td className="px-4 py-3 font-bold">{stringOf(row, "profileName")}</td>
                <td className="px-4 py-3">{stringOf(row, "result")}</td>
                <td className="px-4 py-3">{stringOf(row, "duration")}</td>
                <td className="px-4 py-3">{stringOf(row, "note")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderCurrentJob = currentJob ? (
    <section className="gov-card mb-6" data-help-id="backup-config-current-job">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">{en ? "Live Backup Job" : "실시간 백업 작업"}</h3>
          <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
            {en ? "Track the current or latest backup execution and inspect each stage log." : "현재 또는 최근 백업 실행 상태와 단계별 로그를 확인합니다."}
          </p>
        </div>
        <div className="rounded-full border border-[var(--kr-gov-border-light)] bg-[var(--kr-gov-surface-subtle)] px-3 py-1 text-xs font-bold">
          {stringOf(currentJob as Record<string, string>, "status")}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Job ID" : "작업 ID"}</p>
          <p className="mt-2 font-mono text-sm">{stringOf(currentJob as Record<string, string>, "jobId")}</p>
        </article>
        <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Profile" : "프로필"}</p>
          <p className="mt-2 text-sm">{stringOf(currentJob as Record<string, string>, "profileName")}</p>
        </article>
        <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Started" : "시작 시각"}</p>
          <p className="mt-2 text-sm">{stringOf(currentJob as Record<string, string>, "startedAt")}</p>
        </article>
        <article className="rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-white px-4 py-3">
          <p className="text-xs font-bold text-[var(--kr-gov-text-secondary)]">{en ? "Duration" : "경과 시간"}</p>
          <p className="mt-2 text-sm">{stringOf(currentJob as Record<string, string>, "duration")}</p>
        </article>
      </div>
      <div className="mt-4 rounded-[var(--kr-gov-radius)] border border-slate-800 bg-slate-950 px-4 py-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">{en ? "Live Log" : "실시간 로그"}</p>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs leading-6 text-slate-100">{((currentJob.logLines as Array<string> | undefined) || []).join("\n") || (en ? "No logs yet." : "아직 로그가 없습니다.")}</pre>
      </div>
      {stringOf(currentJob as Record<string, string>, "resultMessage") ? (
        <p className="mt-3 text-sm text-[var(--kr-gov-text-secondary)]">{stringOf(currentJob as Record<string, string>, "resultMessage")}</p>
      ) : null}
    </section>
  ) : null;

  const renderVersions = (
    <section className="gov-card p-0 overflow-hidden" data-help-id="backup-config-versions">
      <div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]">
        <h3 className="text-lg font-bold">{en ? "Saved Versions" : "저장 버전"}</h3>
        <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Configuration snapshots recorded whenever backup settings are saved." : "백업 설정을 저장할 때마다 기록되는 설정 스냅샷입니다."}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="gov-table-header">
              <th className="px-4 py-3">{en ? "Version" : "버전"}</th>
              <th className="px-4 py-3">{en ? "Saved At" : "저장 시각"}</th>
              <th className="px-4 py-3">{en ? "Saved By" : "저장자"}</th>
              <th className="px-4 py-3">{en ? "Backup Root" : "백업 루트"}</th>
              <th className="px-4 py-3">{en ? "Cron" : "크론"}</th>
              <th className="px-4 py-3">{en ? "Git" : "Git"}</th>
              <th className="px-4 py-3">{en ? "DB" : "DB"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {versions.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-bold">{stringOf(row, "versionId")}</td>
                <td className="px-4 py-3">{stringOf(row, "savedAt")}</td>
                <td className="px-4 py-3">{stringOf(row, "savedBy")}</td>
                <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "backupRootPath")}</td>
                <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "cronExpression")}</td>
                <td className="px-4 py-3">{stringOf(row, "gitEnabled")}</td>
                <td className="px-4 py-3">{stringOf(row, "dbEnabled")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderGitPrecheck = (
    <section className="gov-card p-0 overflow-hidden" data-help-id="backup-config-git-precheck">
      <div className="px-6 py-5 border-b border-[var(--kr-gov-border-light)]">
        <h3 className="text-lg font-bold">{en ? "Git Push Precheck" : "Git Push 사전 점검"}</h3>
        <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">
          {en
            ? "Tracked large artifacts and generated files that can break HTTPS push are listed here."
            : "HTTPS push를 깨뜨릴 수 있는 대용량 추적 파일과 산출물 경로를 여기서 확인합니다."}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="gov-table-header">
              <th className="px-4 py-3">{en ? "Path" : "경로"}</th>
              <th className="px-4 py-3">{en ? "Size" : "크기"}</th>
              <th className="px-4 py-3">{en ? "Git Object" : "Git 오브젝트"}</th>
              <th className="px-4 py-3">{en ? "Note" : "비고"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gitPrecheckRows.length ? gitPrecheckRows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "path")}</td>
                <td className="px-4 py-3 whitespace-nowrap">{stringOf(row, "sizeLabel")}</td>
                <td className="px-4 py-3 font-mono text-[13px]">{stringOf(row, "objectId")}</td>
                <td className="px-4 py-3">{stringOf(row, "note")}</td>
              </tr>
            )) : (
              <tr>
                <td className="px-4 py-6 text-center text-[var(--kr-gov-text-secondary)]" colSpan={4}>
                  {en ? "No tracked push-risk artifacts were detected." : "추적 중인 push 위험 산출물이 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderPlaybooks = (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3" data-help-id="backup-config-playbooks">
      {playbooks.map((item, idx) => (
        <article className="gov-card" key={idx}>
          <h3 className="text-lg font-bold">{stringOf(item, "title")}</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--kr-gov-text-secondary)]">{stringOf(item, "body")}</p>
        </article>
      ))}
    </section>
  );

  return (
    <AdminPageShell
      breadcrumbs={[
        { label: en ? "Home" : "홈", href: buildLocalizedPath("/admin/", "/en/admin/") },
        { label: en ? "System" : "시스템" },
        { label: en ? "Backup" : "백업" },
        { label: preset.title }
      ]}
      title={preset.title}
      subtitle={preset.subtitle}
    >
      {pageState.loading ? (
        <PageStatusNotice tone="warning">
          {en ? "Loading backup screen data." : "백업 화면 데이터를 불러오는 중입니다."}
        </PageStatusNotice>
      ) : null}
      {pageState.error ? <PageStatusNotice tone="error">{pageState.error}</PageStatusNotice> : null}
      {message ? <PageStatusNotice tone={message.includes("오류") || message.includes("Failed") ? "error" : "success"}>{message}</PageStatusNotice> : null}

      {renderSummary}
      {renderCurrentJob}

      {preset.pageKey === "backup-config" ? (
        <>
          <section className="gov-card mb-6" data-help-id="backup-config-form">
            <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
              <h3 className="text-lg font-bold">{en ? "Backup Registration" : "백업 설정 등록"}</h3>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Register the backup folder, cron schedule, git source backup target, and database dump target used by the backup system." : "백업 시스템이 사용할 백업 폴더, 크론 스케줄, git 소스 백업 대상, DB dump 대상을 등록합니다."}</p>
            </div>
            <div className="space-y-8 px-6 py-6">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <BackupField label={en ? "Backup Root Folder" : "백업 루트 폴더"} value={valueOf(form, "backupRootPath")} onChange={(value) => updateField("backupRootPath", value)} placeholder="/opt/projects/carbonet/var/backup" />
                <BackupField label={en ? "Retention Days" : "보관 일수"} value={valueOf(form, "retentionDays")} onChange={(value) => updateField("retentionDays", value)} placeholder="35" type="number" />
                <BackupField label={en ? "Cron Expression" : "크론 표현식"} value={valueOf(form, "cronExpression")} onChange={(value) => updateField("cronExpression", value)} placeholder="0 0 2 * * *" />
              </div>
              <BackupToggle
                label={en ? "Enable Offsite Sync" : "원격 동기화 사용"}
                checked={yes(form, "offsiteSyncEnabled")}
                onChange={(checked) => updateField("offsiteSyncEnabled", checked ? "Y" : "N")}
                description={en ? "Use this when backup bundles must be copied to a remote archive after local generation." : "로컬 생성 후 백업 번들을 원격 아카이브로 복제해야 할 때 사용합니다."}
              />

              <section className="space-y-4 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 px-5 py-5">
                <div>
                  <h4 className="text-base font-bold">{en ? "Git Backup Target" : "Git 백업 대상"}</h4>
                  <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Register the repository path and branch scope to archive source changes together with operational backups." : "운영 백업과 함께 소스 변경 이력을 보관할 저장소 경로와 branch 범위를 등록합니다."}</p>
                </div>
                <BackupToggle
                  label={en ? "Enable Git Backup" : "Git 백업 사용"}
                  checked={yes(form, "gitEnabled")}
                  onChange={(checked) => updateField("gitEnabled", checked ? "Y" : "N")}
                  description={en ? "When enabled, backup execution pages can include source bundle generation." : "사용 시 백업 실행 화면에서 소스 번들 생성을 포함할 수 있습니다."}
                />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <BackupField label={en ? "Repository Path" : "저장소 경로"} value={valueOf(form, "gitRepositoryPath")} onChange={(value) => updateField("gitRepositoryPath", value)} placeholder="/opt/projects/carbonet" />
                  <BackupField label={en ? "Remote Name" : "Remote 이름"} value={valueOf(form, "gitRemoteName")} onChange={(value) => updateField("gitRemoteName", value)} placeholder="origin" />
                  <BackupField label={en ? "Remote URL" : "Remote URL"} value={valueOf(form, "gitRemoteUrl")} onChange={(value) => updateField("gitRemoteUrl", value)} placeholder="https://github.com/sjkim0831/2026_carbonet.git" />
                  <BackupField label={en ? "Git Username" : "Git 사용자명"} value={valueOf(form, "gitUsername")} onChange={(value) => updateField("gitUsername", value)} placeholder="sjkim0831" />
                  <BackupField label={en ? "Branch Pattern" : "Branch 패턴"} value={valueOf(form, "gitBranchPattern")} onChange={(value) => updateField("gitBranchPattern", value)} placeholder="main" />
                  <BackupField label={en ? "Bundle Prefix" : "번들 Prefix"} value={valueOf(form, "gitBundlePrefix")} onChange={(value) => updateField("gitBundlePrefix", value)} placeholder="carbonet-src" />
                  <BackupField label={en ? "Backup Mode" : "백업 모드"} value={valueOf(form, "gitBackupMode")} onChange={(value) => updateField("gitBackupMode", value)} placeholder="BUNDLE_AND_PUSH / PUSH_RESTORE_BRANCH / BUNDLE / TAG_PUSH" />
                  <BackupField label={en ? "Restore Branch Prefix" : "복구 브랜치 Prefix"} value={valueOf(form, "gitRestoreBranchPrefix")} onChange={(value) => updateField("gitRestoreBranchPrefix", value)} placeholder="backup/restore" />
                  <BackupField label={en ? "Tag Prefix" : "태그 Prefix"} value={valueOf(form, "gitTagPrefix")} onChange={(value) => updateField("gitTagPrefix", value)} placeholder="backup" />
                  <BackupField label={en ? "Git Token" : "Git 토큰"} value={valueOf(form, "gitAuthToken")} onChange={(value) => updateField("gitAuthToken", value)} placeholder={en ? "Paste personal access token" : "개인 액세스 토큰 붙여넣기"} type="password" />
                </div>
                <BackupSecretHint configured={yes(form, "gitAuthTokenConfigured")} masked={valueOf(form, "gitAuthTokenMasked")} en={en} />
              </section>

              <section className="space-y-4 rounded-[var(--kr-gov-radius)] border border-[var(--kr-gov-border-light)] bg-gray-50 px-5 py-5">
                <div>
                  <h4 className="text-base font-bold">{en ? "Database Backup Target" : "DB 백업 대상"}</h4>
                  <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Register the database connection target and dump command referenced by backup execution." : "백업 실행이 참조할 DB 접속 대상과 dump 명령을 등록합니다."}</p>
                </div>
                <BackupToggle
                  label={en ? "Enable Database Backup" : "DB 백업 사용"}
                  checked={yes(form, "dbEnabled")}
                  onChange={(checked) => updateField("dbEnabled", checked ? "Y" : "N")}
                  description={en ? "When enabled, execution pages can call the configured database dump command." : "사용 시 실행 화면에서 등록된 DB dump 명령을 사용할 수 있습니다."}
                />
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <BackupField label={en ? "DB Host" : "DB Host"} value={valueOf(form, "dbHost")} onChange={(value) => updateField("dbHost", value)} placeholder="127.0.0.1" />
                  <BackupField label={en ? "DB Port" : "DB Port"} value={valueOf(form, "dbPort")} onChange={(value) => updateField("dbPort", value)} placeholder="33000" />
                  <BackupField label={en ? "DB Name" : "DB 이름"} value={valueOf(form, "dbName")} onChange={(value) => updateField("dbName", value)} placeholder="carbonet" />
                  <BackupField label={en ? "DB User" : "DB 사용자"} value={valueOf(form, "dbUser")} onChange={(value) => updateField("dbUser", value)} placeholder="dba" />
                  <BackupField label={en ? "Dump Command" : "Dump 명령"} value={valueOf(form, "dbDumpCommand")} onChange={(value) => updateField("dbDumpCommand", value)} placeholder="/opt/util/cubrid/11.2/scripts/backup_sql.sh" />
                  <BackupField label={en ? "Schema Scope" : "스키마 범위"} value={valueOf(form, "dbSchemaScope")} onChange={(value) => updateField("dbSchemaScope", value)} placeholder="FULL" />
                </div>
              </section>

              <MemberPageActions>
                <MemberButton type="button" variant="primary" disabled={saving || !page?.canUseBackupConfigSave} onClick={handleSave}>
                  {saving ? (en ? "Saving..." : "저장 중...") : (en ? "Save Backup Settings" : "백업 설정 저장")}
                </MemberButton>
              </MemberPageActions>
            </div>
          </section>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr] mb-6">
            {renderStorage}
            {renderVersions}
          </div>
          {renderPlaybooks}
        </>
      ) : null}

      {preset.pageKey === "backup-execution" ? (
        <>
          <section className="gov-card mb-6" data-help-id="backup-config-run-actions">
            <div className="border-b border-[var(--kr-gov-border-light)] px-6 py-5">
              <h3 className="text-lg font-bold">{en ? "Backup Run Actions" : "백업 실행 작업"}</h3>
              <p className="mt-1 text-sm text-[var(--kr-gov-text-secondary)]">{en ? "Use the primary action below to automatically clean artifacts, commit current changes, and push the base branch." : "아래 주 작업 버튼으로 산출물 정리, 현재 변경 커밋, 기준 브랜치 Push를 한 번에 실행합니다."}</p>
            </div>
            <div className="px-6 py-6">
              <div className="mb-5 rounded-[var(--kr-gov-radius)] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                {en
                  ? `Recommended: Auto Commit And Push Base Branch (${valueOf(form, "gitBranchPattern") || "main"})`
                  : `권장 작업: 자동 커밋 후 기준 브랜치 Push (${valueOf(form, "gitBranchPattern") || "main"})`}
              </div>
              <MemberPageActions>
                <MemberButton type="button" variant="primary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("COMMIT_BASE")}>
                  {runningGitExecution === "COMMIT_BASE" ? (en ? "Auto Committing And Pushing..." : "자동 커밋 후 Push 실행 중...") : (en ? `Auto Commit And Push Base Branch (${valueOf(form, "gitBranchPattern") || "main"})` : `자동 커밋 후 기준 브랜치 Push (${valueOf(form, "gitBranchPattern") || "main"})`)}
                </MemberButton>
                <MemberButton type="button" variant="secondary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("PRECHECK")}>
                  {runningGitExecution === "PRECHECK" ? (en ? "Running Git Push Precheck..." : "Git Push 사전 점검 실행 중...") : (en ? "Run Git Push Precheck" : "Git Push 사전 점검")}
                </MemberButton>
                <MemberButton type="button" variant="secondary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("CLEANUP")}>
                  {runningGitExecution === "CLEANUP" ? (en ? "Running Safe Cleanup..." : "산출물 자동 정리 실행 중...") : (en ? "Run Safe Artifact Cleanup" : "산출물 자동 정리")}
                </MemberButton>
                <MemberButton type="button" variant="secondary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("BASE")}>
                  {runningGitExecution === "BASE" ? (en ? "Pushing Base Branch..." : "Git 기준 브랜치 Push 실행 중...") : (en ? `Push Base Branch Only (${valueOf(form, "gitBranchPattern") || "main"})` : `기준 브랜치 Push만 실행 (${valueOf(form, "gitBranchPattern") || "main"})`)}
                </MemberButton>
                <MemberButton type="button" variant="secondary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("BUNDLE")}>
                  {runningGitExecution === "BUNDLE" ? (en ? "Running Git Bundle..." : "Git 번들 백업 실행 중...") : (en ? "Run Git Bundle" : "Git 번들 백업 실행")}
                </MemberButton>
                <MemberButton type="button" variant="secondary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("PUSH")}>
                  {runningGitExecution === "PUSH" ? (en ? "Pushing Restore Branch..." : "Git 복구 브랜치 Push 실행 중...") : (en ? "Push Restore Branch" : "Git 복구 브랜치 Push 실행")}
                </MemberButton>
                <MemberButton type="button" variant="secondary" disabled={backupJobActive || Boolean(runningGitExecution) || !page?.canUseGitBackupExecution} onClick={() => handleRunGitExecution("TAG")}>
                  {runningGitExecution === "TAG" ? (en ? "Pushing Backup Tag..." : "Git 태그 Push 실행 중...") : (en ? "Push Backup Tag" : "Git 태그 Push 실행")}
                </MemberButton>
                <MemberButton type="button" variant="primary" disabled={backupJobActive || runningDbBackup || !page?.canUseDbBackupExecution} onClick={handleRunDbBackup}>
                  {runningDbBackup ? (en ? "Running DB Backup..." : "DB 백업 실행 중...") : (en ? "Run DB Backup" : "DB 백업 실행")}
                </MemberButton>
              </MemberPageActions>
            </div>
          </section>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr] mb-6">
            {renderExecutions}
            {renderStorage}
          </div>
          <div className="mb-6">{renderGitPrecheck}</div>
          {renderPlaybooks}
        </>
      ) : null}

      {preset.pageKey === "restore-execution" ? (
        <>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr] mb-6">
            {renderVersions}
            {renderExecutions}
          </div>
          {renderPlaybooks}
        </>
      ) : null}

      {preset.pageKey === "version-management" ? (
        <>
          <div className="mb-6">{renderVersions}</div>
          <div className="mb-6">{renderExecutions}</div>
          {renderPlaybooks}
        </>
      ) : null}
    </AdminPageShell>
  );
}
